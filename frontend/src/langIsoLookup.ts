export interface LangPair {
    lang: string;
    lang2: string | null;
    langTag?: string;
}

export interface LangIsoMaps {
    names6393: Map<string, string>;
    names6391: Map<string, string>;
}

interface Iso6393Row {
    lang: string;
    name: string;
}

interface Iso6391Row {
    lang2: string;
    name: string;
}

export function languageJsonUrlsFromTroveUrl(troveUrl: string): { iso6393: string; iso6391: string } {
    const resolved =
        typeof window !== 'undefined'
            ? new URL(troveUrl, window.location.href)
            : new URL(troveUrl, 'http://localhost/');
    let pathname = resolved.pathname.replace(/\/[^/]+\.json$/i, '');
    if (/\/(public|private)$/.test(pathname)) {
        pathname = pathname.replace(/\/(public|private)$/, '/languages');
    } else {
        pathname = `${pathname}/languages`;
    }
    const dir = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const base = `${resolved.origin}${dir}`;
    return {
        iso6393: `${base}/languages.iso639-3.json`,
        iso6391: `${base}/languages.iso639-1.json`,
    };
}

function buildMaps(rows3: Iso6393Row[], rows1: Iso6391Row[]): LangIsoMaps {
    const names6393 = new Map<string, string>();
    for (const row of rows3) {
        names6393.set(row.lang.toLowerCase(), row.name);
    }
    const names6391 = new Map<string, string>();
    for (const row of rows1) {
        names6391.set(row.lang2.toLowerCase(), row.name);
    }
    return { names6393, names6391 };
}

export async function fetchLangIsoMaps(troveUrl: string): Promise<LangIsoMaps | null> {
    const { iso6393, iso6391 } = languageJsonUrlsFromTroveUrl(troveUrl);
    try {
        const [r3, r1] = await Promise.all([fetch(iso6393), fetch(iso6391)]);
        if (!r3.ok || !r1.ok) {
            return null;
        }
        const [j3, j1] = await Promise.all([
            r3.json() as Promise<Iso6393Row[]>,
            r1.json() as Promise<Iso6391Row[]>,
        ]);
        return buildMaps(j3, j1);
    } catch {
        return null;
    }
}

export function nameFor6393(code: string, maps: LangIsoMaps | null): string {
    if (!maps) {
        return code;
    }
    return maps.names6393.get(code.toLowerCase()) ?? code;
}

export function nameFor6391(code: string, maps: LangIsoMaps | null): string {
    if (!maps) {
        return code;
    }
    return maps.names6391.get(code.toLowerCase()) ?? code;
}
