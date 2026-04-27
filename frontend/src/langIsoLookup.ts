export interface LangPair {
    lang: string;
    lang2: string | null;
    langTag?: string;
}

export interface LangIsoMaps {
    names6393: Map<string, string>;
    names6391: Map<string, string>;
    names15924: Map<string, string>;
}

export interface Iso6393Row {
    lang: string;
    name: string;
}

export interface Iso6391Row {
    lang2: string;
    name: string;
}

export interface Iso15924Row {
    code: string;
    name_en: string;
}

export function languageJsonUrlsFromTroveUrl(troveUrl: string): { iso6393: string; iso6391: string; iso15924: string } {
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
        iso6393: `${base}/languages.iso639-3-augmented.json`,
        iso6391: `${base}/languages.iso639-1.json`,
        iso15924: `${base}/iso15924.json`,
    };
}

function buildMaps(rows3: Iso6393Row[], rows1: Iso6391Row[], rows15924: Iso15924Row[]): LangIsoMaps {
    const names6393 = new Map<string, string>();
    for (const row of rows3) {
        names6393.set(row.lang.toLowerCase(), row.name);
    }
    const names6391 = new Map<string, string>();
    for (const row of rows1) {
        names6391.set(row.lang2.toLowerCase(), row.name);
    }
    const names15924 = new Map<string, string>();
    for (const row of rows15924) {
        names15924.set(row.code.toLowerCase(), row.name_en);
    }
    return { names6393, names6391, names15924 };
}

/** Build lookup maps from already-fetched ISO JSON rows (used by the startup JSON cache). */
export function langIsoMapsFromRows(rows3: Iso6393Row[], rows1: Iso6391Row[], rows15924: Iso15924Row[]): LangIsoMaps {
    return buildMaps(rows3, rows1, rows15924);
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

export function nameFor15924(code: string, maps: LangIsoMaps | null): string {
    if (!maps) {
        return code;
    }
    return maps.names15924.get(code.toLowerCase()) ?? code;
}

/** Human-readable list for ISO 15924 script subtags (e.g. Cyrl → "Cyrillic"). */
export function displayForIso15924Scripts(
    scriptCodes: string[] | undefined,
    maps: LangIsoMaps | null,
): string {
    if (scriptCodes == null || scriptCodes.length === 0) {
        return "";
    }
    return scriptCodes
        .map((c) => (String(c).trim() === "" ? null : nameFor15924(String(c).trim(), maps)))
        .filter((s): s is string => s != null && s !== "")
        .join(", ");
}
