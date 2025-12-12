// Run: node scripts/generate-basics-all.mjs

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const OUT_PATH = path.join(ROOT, "src", "data", "basicsAll.json");

const API = "https://pokeapi.co/api/v2";

// Keep it gentle on the API.
const REQUEST_DELAY_MS = 80;
const RETRY_DELAY_MS = 400;
const MAX_RETRIES = 4;

// Concurrency limit without external libs.
const CONCURRENCY = 6;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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
  const hit = names?.find((n) => n.language?.name === lang)?.name;
  if (hit) return hit;
  return names?.find((n) => n.language?.name === fallbackLang)?.name ?? null;
}

function pickGenus(genera, lang, fallbackLang = "en") {
  const hit = genera?.find((g) => g.language?.name === lang)?.genus;
  if (hit) return hit;
  return genera?.find((g) => g.language?.name === fallbackLang)?.genus ?? null;
}

function toTitleCase(s) {
  // "special-attack" -> "Special Attack" (not used for types, but handy)
  return s
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function normalizeTypeName(typeName) {
  // Your app expects type strings like "Grass", "Poison" etc.
  // PokeAPI returns lowercase like "grass". We'll TitleCase it.
  return typeName ? typeName[0].toUpperCase() + typeName.slice(1) : typeName;
}

function getOfficialArtwork(pokemonJson) {
  // Best quality image for your UI.
  return (
    pokemonJson?.sprites?.other?.["official-artwork"]?.front_default ||
    pokemonJson?.sprites?.front_default ||
    null
  );
}

async function getCountForSpecies() {
  // List endpoints are paginated and include "count". :contentReference[oaicite:1]{index=1}
  const first = await fetchJson(`${API}/pokemon-species?limit=1&offset=0`);
  return first.count;
}

async function fetchAllSpeciesRefs(count) {
  // Fetch all in one shot using limit=count (works with PokeAPI pagination model). :contentReference[oaicite:2]{index=2}
  const data = await fetchJson(
    `${API}/pokemon-species?limit=${count}&offset=0`
  );
  return data.results; // [{ name, url }, ...]
}

async function buildOneEntry(speciesUrl) {
  // speciesUrl looks like: https://pokeapi.co/api/v2/pokemon-species/1/
  const species = await fetchJson(speciesUrl);
  await sleep(REQUEST_DELAY_MS);

  const id = species.id;

  const koName = pickLocalizedName(species.names, "ko") ?? species.name;
  const enName = pickLocalizedName(species.names, "en") ?? species.name;

  // genus is the "category" / "분류" field in localized languages.
  // KO example: "씨앗포켓몬" style strings. (Stored as categoryKo)
  const categoryKo = pickGenus(species.genera, "ko") ?? "";

  // Pull types + image from /pokemon/{id}
  const pokemon = await fetchJson(`${API}/pokemon/${id}`);
  await sleep(REQUEST_DELAY_MS);

  const types = (pokemon.types ?? [])
    .slice()
    .sort((a, b) => (a.slot ?? 0) - (b.slot ?? 0))
    .map((t) => normalizeTypeName(t.type?.name))
    .filter(Boolean);

  const imageUrl = getOfficialArtwork(pokemon) ?? "";

  return { id, koName, enName, types, categoryKo, imageUrl };
}

async function mapWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function runOne() {
    while (true) {
      const i = nextIndex++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  const runners = Array.from({ length: concurrency }, () => runOne());
  await Promise.all(runners);
  return results;
}

async function main() {
  console.log("🔎 Getting total Pokémon species count...");
  const count = await getCountForSpecies();
  console.log(`Total species: ${count}`);

  console.log("📦 Fetching species reference list...");
  const refs = await fetchAllSpeciesRefs(count);

  console.log("🛠 Building basicsAll.json entries (this takes a bit)...");
  const basics = await mapWithConcurrency(
    refs,
    async (ref, i) => {
      const n = i + 1;
      if (n % 50 === 0) console.log(`...progress: ${n}/${refs.length}`);
      try {
        return await buildOneEntry(ref.url);
      } catch (e) {
        console.error(`Failed at ${ref.url}:`, e?.message ?? e);
        // Keep placeholder so the run completes; you can re-run later.
        return null;
      }
    },
    CONCURRENCY
  );

  // Remove nulls, then sort by id just in case.
  const cleaned = basics.filter(Boolean).sort((a, b) => a.id - b.id);

  await fs.mkdir(path.dirname(OUT_PATH), { recursive: true });
  await fs.writeFile(OUT_PATH, JSON.stringify(cleaned, null, 2), "utf-8");

  console.log(`Wrote ${OUT_PATH}`);
  console.log(`Entries written: ${cleaned.length} (out of ${refs.length})`);
  if (cleaned.length !== refs.length) {
    console.log("ℹ️ Some entries failed; re-run to fill in missing ones.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
