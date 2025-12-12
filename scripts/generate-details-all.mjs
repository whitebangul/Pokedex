// Run: node scripts/generate-details-all.mjs

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const BASICS_PATH = path.join(ROOT, "src", "data", "basicsGen1.json");
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
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
  const map = new Map(pokemonJson.stats.map((s) => [s.stat.name, s.base_stat]));

  return {
    hp: map.get("hp") ?? null,
    atk: map.get("attack") ?? null,
    def: map.get("defense") ?? null,
    spAtk: map.get("special-attack") ?? null,
    spDef: map.get("special-defense") ?? null,
    speed: map.get("speed") ?? null,
  };
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

      const abilityNames = pokemon.abilities
        .map((a) => a.ability?.name)
        .filter(Boolean);

      const abilities = [];
      for (const name of abilityNames) {
        abilities.push(await getAbilityLocalized(name));
      }

      out[key] = { stats, abilities };
    } catch (e) {
      console.error(`Failed Pokémon ID ${id}:`, e.message);
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
