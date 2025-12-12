// Run: node scripts/generate-details-all.mjs

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const BASICS_PATH = path.join(ROOT, "src", "data", "Allbasics.json");
const OUT_PATH = path.join(ROOT, "src", "data", "detailsAll.json");

const API = "https://pokeapi.co/api/v2";

const REQUEST_DELAY_MS = 80;
const RETRY_DELAY_MS = 400;
const MAX_RETRIES = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ----------------------- helpers ----------------------- */

async function fetchJson(url, attempt = 0) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
  } catch (err) {
    if (attempt >= MAX_RETRIES) throw err;
    await sleep(RETRY_DELAY_MS * (attempt + 1));
    return fetchJson(url, attempt + 1);
  }
}

function pickLocalizedName(names, lang, fallbackLang = "en") {
  return (
    names?.find((n) => n.language?.name === lang)?.name ??
    names?.find((n) => n.language?.name === fallbackLang)?.name ??
    null
  );
}

function pickFlavorText(entries, lang, fallbackLang = "en") {
  const text =
    entries?.find((e) => e.language?.name === lang)?.flavor_text ??
    entries?.find((e) => e.language?.name === fallbackLang)?.flavor_text ??
    "";

  return text
    .replace(/\f/g, " ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function mapStats(pokemonJson) {
  const map = new Map(
    (pokemonJson.stats ?? []).map((s) => [s.stat?.name, s.base_stat])
  );

  return {
    hp: map.get("hp") ?? null,
    atk: map.get("attack") ?? null,
    def: map.get("defense") ?? null,
    spAtk: map.get("special-attack") ?? null,
    spDef: map.get("special-defense") ?? null,
    speed: map.get("speed") ?? null,
  };
}

function idFromUrl(url) {
  // e.g. "https://pokeapi.co/api/v2/pokemon-species/2/" -> 2
  const m = String(url).match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

/* ---------------- ability fetch ---------------- */

async function getAbilityLocalized(abilityName) {
  const ability = await fetchJson(`${API}/ability/${abilityName}`);
  await sleep(REQUEST_DELAY_MS);

  const name =
    pickLocalizedName(ability.names, "ko") ??
    pickLocalizedName(ability.names, "en") ??
    abilityName;

  const description =
    pickFlavorText(ability.flavor_text_entries, "ko") ||
    pickFlavorText(ability.flavor_text_entries, "en");

  return { name, description };
}

/* ---------------- evolution chain parsing ---------------- */

// Cache: evolution_chain.url -> { ids: Set<number>, evolutionList: Array<{id, level, method}> }
const evoListCache = new Map();
function extractEvolutionMethod(details = {}) {
  if (details.min_level != null) {
    return "level-up";
  }

  if (details.item?.name) {
    return `use-item:${details.item.name}`;
  }

  if (details.trigger?.name === "trade") {
    if (details.held_item?.name) {
      return `trade-holding:${details.held_item.name}`;
    }
    return "trade";
  }

  if (details.min_happiness != null) {
    return "friendship";
  }

  if (details.time_of_day) {
    return `level-up:${details.time_of_day}`;
  }

  if (details.known_move?.name) {
    return `knows-move:${details.known_move.name}`;
  }

  if (details.known_move_type?.name) {
    return `knows-move-type:${details.known_move_type.name}`;
  }

  if (details.location?.name) {
    return `location:${details.location.name}`;
  }

  return details.trigger?.name ?? "unknown";
}
// ---- species + evolution-chain caches ----
const speciesCache = new Map(); // id -> species json
const evoChainCache = new Map(); // evoUrl -> evolution-chain json

async function getSpecies(id) {
  if (speciesCache.has(id)) return speciesCache.get(id);
  const sp = await fetchJson(`${API}/pokemon-species/${id}`);
  await sleep(REQUEST_DELAY_MS);
  speciesCache.set(id, sp);
  return sp;
}

async function getEvolutionChain(evoUrl) {
  if (evoChainCache.has(evoUrl)) return evoChainCache.get(evoUrl);
  const chain = await fetchJson(evoUrl);
  await sleep(REQUEST_DELAY_MS);
  evoChainCache.set(evoUrl, chain);
  return chain;
}

function collectAllSpeciesIds(node, set) {
  const nodeId = idFromUrl(node?.species?.url);
  if (nodeId != null) set.add(nodeId);
  for (const child of node?.evolves_to ?? []) {
    collectAllSpeciesIds(child, set);
  }
}

function collectEvolutionsFromRoot(rootNode) {
  // Produces a flat list of ALL descendants from the base.
  // Each entry describes how that descendant is reached from its direct parent.
  const out = [];

  const dfs = (n) => {
    for (const child of n?.evolves_to ?? []) {
      const childId = idFromUrl(child?.species?.url);

      const evoDetails = (child?.evolution_details ?? [])[0] ?? {};
      const level = evoDetails.min_level ?? null;
      const method = extractEvolutionMethod(evoDetails);

      if (childId != null) out.push({ id: childId, level, method });

      dfs(child);
    }
  };

  dfs(rootNode);
  return out;
}

async function getEvolutionListForChainUrl(evoUrl) {
  if (evoListCache.has(evoUrl)) return evoListCache.get(evoUrl);

  const evoChain = await getEvolutionChain(evoUrl);
  const root = evoChain?.chain;
  if (!root) {
    const empty = { ids: new Set(), evolutionList: [] };
    evoListCache.set(evoUrl, empty);
    return empty;
  }

  const ids = new Set();
  collectAllSpeciesIds(root, ids);

  const evolutionList = collectEvolutionsFromRoot(root);

  const packed = { ids, evolutionList };
  evoListCache.set(evoUrl, packed);
  return packed;
}

async function getEvolutionForPokemonId(id) {
  const species = await getSpecies(id);
  const evoUrl = species?.evolution_chain?.url;
  if (!evoUrl) return [];

  const { ids, evolutionList } = await getEvolutionListForChainUrl(evoUrl);

  // Safety: only return if this Pokémon is actually in that chain
  if (!ids.has(id)) return [];

  // Same chain for base + all evolved forms
  return evolutionList;
}

/* ---------------- main ---------------- */

async function main() {
  const basics = JSON.parse(await fs.readFile(BASICS_PATH, "utf-8"));
  const out = {};

  for (let i = 0; i < basics.length; i++) {
    const { id } = basics[i];
    const key = String(id);

    console.log(`⚙️  Fetching details for #${id} (${i + 1}/${basics.length})`);

    try {
      const pokemon = await fetchJson(`${API}/pokemon/${id}`);
      await sleep(REQUEST_DELAY_MS);

      const stats = mapStats(pokemon);

      const abilityNames = (pokemon.abilities ?? [])
        .map((a) => a.ability?.name)
        .filter(Boolean);

      const abilities = [];
      for (const name of abilityNames) {
        abilities.push(await getAbilityLocalized(name));
      }

      const evolution = await getEvolutionForPokemonId(id);

      out[key] = { stats, abilities, evolution };
    } catch (e) {
      console.error(`Failed Pokémon ID ${id}:`, e?.message ?? e);
    }
  }

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(out, null, 2), "utf-8");

  console.log(`detailsAll.json generated (${Object.keys(out).length} entries)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
