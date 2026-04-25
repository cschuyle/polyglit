import type {Trove} from "./Showcase";
import type {Iso6391Row, Iso6393Row, LangIsoMaps} from "./langIsoLookup";
import {langIsoMapsFromRows, languageJsonUrlsFromTroveUrl} from "./langIsoLookup";
import {trovePublicJson} from "./troveUrls";

/** Every trove JSON used by the app router (loaded once at startup, kept in memory). */
const TROVE_FILENAMES = [
    "little-prince.json",
    "hobbit.json",
    "alice-in-wonderland.json",
    "books.json",
] as const;

function allTroveUrls(): string[] {
    return TROVE_FILENAMES.map((f) => trovePublicJson(f));
}

const troveByUrl = new Map<string, Trove>();
const langIsoByUrl = new Map<string, LangIsoMaps | null>();

/** One in-flight or completed JSON fetch per URL (trove + ISO files dedupe across troves). */
const jsonFetchByUrl = new Map<string, Promise<unknown>>();

function fetchJsonOnce<T>(url: string): Promise<T> {
    let p = jsonFetchByUrl.get(url) as Promise<T> | undefined;
    if (p == null) {
        p = fetch(url)
            .then((r) => {
                if (!r.ok) {
                    throw new Error(`HTTP ${r.status} for ${url}`);
                }
                return r.json() as Promise<T>;
            }) as Promise<T>;
        jsonFetchByUrl.set(url, p);
    }
    return p;
}

let preloadPromise: Promise<void> | null = null;

async function loadOneTroveBundle(troveUrl: string): Promise<void> {
    const {iso6393, iso6391} = languageJsonUrlsFromTroveUrl(troveUrl);

    const troveP = fetchJsonOnce<Trove>(troveUrl)
        .then((trove) => {
            troveByUrl.set(troveUrl, trove);
        })
        .catch((err) => {
            console.error(`[polyglitJsonCache] trove failed: ${troveUrl}`, err);
            troveByUrl.set(troveUrl, {id: "", name: "", shortName: "", items: []});
        });

    const langP = Promise.all([fetchJsonOnce<Iso6393Row[]>(iso6393), fetchJsonOnce<Iso6391Row[]>(iso6391)])
        .then(([j3, j1]) => {
            langIsoByUrl.set(troveUrl, langIsoMapsFromRows(j3, j1));
        })
        .catch((err) => {
            console.error(`[polyglitJsonCache] language ISO failed for trove ${troveUrl}`, err);
            langIsoByUrl.set(troveUrl, null);
        });

    await Promise.all([troveP, langP]);
}

/**
 * Fetches all trove and language-list JSON once and caches them in memory.
 * Safe to call from multiple places; subsequent calls return the same promise.
 */
export function ensurePolyglitDataPreloaded(): Promise<void> {
    if (preloadPromise == null) {
        preloadPromise = (async () => {
            const urls = allTroveUrls();
            await Promise.all(urls.map((u) => loadOneTroveBundle(u)));
        })();
    }
    return preloadPromise;
}

export function getCachedTrove(troveUrl: string): Trove | undefined {
    return troveByUrl.get(troveUrl);
}

export function getCachedLangIsoMaps(troveUrl: string): LangIsoMaps | null | undefined {
    return langIsoByUrl.get(troveUrl);
}
