// Run: node scripts/add-evolution-to-details.mjs
// Adds "evolution" field to an existing Alldetails.json

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

const BASICS_PATH = path.join(ROOT, "src", "data", "Allbasics.json");
const DETAILS_PATH = path.join(ROOT, "src", "data", "Alldetails.json");

const API = "https://pokeapi.co/api/v2";

const REQUEST_DELAY_MS = 80;
const RETRY_DELAY_MS = 400;
const MAX_RETRIES = 4;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------- fetch helpers ---------------- */

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

function idFromUrl(url) {
  const m = String(url).match(/\/(\d+)\/?$/);
  return m ? Number(m[1]) : null;
}

/* ---------------- evolution helpers ---------------- */

const speciesCache = new Map();
const evoChainCache = new Map();
const evoListCache = new Map();

async function getSpecies(id) {
  if (speciesCache.has(id)) return speciesCache.get(id);
  const sp = await fetchJson(`${API}/pokemon-species/${id}`);
  await sleep(REQUEST_DELAY_MS);
  speciesCache.set(id, sp);
  return sp;
}

async function getEvolutionChain(url) {
  if (evoChainCache.has(url)) return evoChainCache.get(url);
  const chain = await fetchJson(url);
  await sleep(REQUEST_DELAY_MS);
  evoChainCache.set(url, chain);
  return chain;
}

function extractEvolutionMethod(details = {}) {
  if (details.min_level != null) return "level-up";
  if (details.item?.name) return `use-item:${details.item.name}`;
  if (details.trigger?.name === "trade") return "trade";
  if (details.min_happiness != null) return "friendship";
  if (details.time_of_day) return `level-up:${details.time_of_day}`;
  if (details.location?.name) return `location:${details.location.name}`;
  return details.trigger?.name ?? "unknown";
}

function collectAllSpeciesIds(node, set) {
  const id = idFromUrl(node?.species?.url);
  if (id != null) set.add(id);
  for (const child of node?.evolves_to ?? []) {
    collectAllSpeciesIds(child, set);
  }
}

function collectEvolutionsFromRoot(root) {
  const out = [];

  const rootId = idFromUrl(root?.species?.url);
  if (rootId != null) out.push({ id: rootId, level: null, method: null });

  const dfs = (node) => {
    for (const child of node?.evolves_to ?? []) {
      const id = idFromUrl(child?.species?.url);
      const d = (child?.evolution_details ?? [])[0] ?? {};

      if (id != null) {
        out.push({
          id,
          level: d.min_level ?? null,
          method: extractEvolutionMethod(d),
        });
      }

      dfs(child);
    }
  };

  dfs(root);
  return out;
}

async function getEvolutionForPokemonId(id) {
  const species = await getSpecies(id);
  const evoUrl = species?.evolution_chain?.url;
  if (!evoUrl) return [];

  if (evoListCache.has(evoUrl)) return evoListCache.get(evoUrl);

  const chain = await getEvolutionChain(evoUrl);
  const root = chain?.chain;
  if (!root) return [];

  const ids = new Set();
  collectAllSpeciesIds(root, ids);
  const evolution = collectEvolutionsFromRoot(root);

  // cache once per chain
  evoListCache.set(evoUrl, evolution);

  return ids.has(id) ? evolution : [];
}

/* ---------------- main ---------------- */

async function main() {
  const basics = JSON.parse(await fs.readFile(BASICS_PATH, "utf-8"));
  const details = JSON.parse(await fs.readFile(DETAILS_PATH, "utf-8"));

  for (const { id } of basics) {
    const key = String(id);

    if (!details[key]) details[key] = {};

    console.log(`Adding evolution for #${id}`);
    try {
      details[key].evolution = await getEvolutionForPokemonId(id);
    } catch (e) {
      console.error(`Evolution failed for ${id}`, e.message);
    }
  }

  await fs.writeFile(DETAILS_PATH, JSON.stringify(details, null, 2), "utf-8");
  console.log("Evolution chains added to Alldetails.json");
}

main().catch(console.error);
