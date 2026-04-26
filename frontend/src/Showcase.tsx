import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import pdfIcon from "./images/pdf.png"
import documentIcon from "./images/document.png"
import coverIcon from "./images/lp-cover.jpg"
import audibookIcon from "./images/audiobook.png"
import lpfoundIcon from "./images/lp-found-fox.png"
import tintenfassIcon from "./images/tinten.png"

import {
    FormControl,
    FormControlLabel,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Tooltip,
    withStyles,
} from "@material-ui/core";
import ViewList from "@material-ui/icons/ViewList";
import ViewModule from "@material-ui/icons/ViewModule";
import {LangIsoMaps, LangPair, nameFor6391, nameFor6393} from "./langIsoLookup";
import {ensurePolyglitDataPreloaded, getCachedLangIsoMaps, getCachedTrove} from "./polyglitJsonCache";

enum CaptionMode {
    TITLES = "titles",
    LANGUAGES = "languages"
}

enum ViewMode {
    GALLERY = "gallery",
    LIST = "list"
}

/** Gallery sort: language uses resolved 639-3 name (same as group labels); date added is newest first. */
type GallerySortBy = "language" | "title" | "year" | "dateAdded";

/** Gallery/list section grouping. */
type GroupByOption = "none" | "language" | "year" | "script";

/** List table columns that support client-side sort. */
type ListSortColumn =
    | "thumbnail"
    | "title"
    | "year"
    | "dateAdded"
    | "languageString"
    | "lang6393"
    | "lang6391"
    | "langTag"
    | "lpid";

export interface TroveItemDetails {
    "acquired-from"?: string,
    "comments"?: string[],
    "date-added"?: string,
    "language-spoken-in"?: string,
    "publication-country"?: string,
    "publication-location"?: string,
    "script"?: string,
    "script-family"?: string,
    "search-words"?: string
    "tags"?: string[],
    "translation-title"?: string,
    "translation-title-transliterated"?: string,
    author?: string,
    asin?: string,
    files?: string[],
    format?: string,
    illustrator?: string,
    isbn13?: string,
    isbn10?: string,
    langPairs?: LangPair[],
    language: string,
    largeImageUrl: string,
    lpid?: string,
    lumpOfText?: string,
    narrator?: string,
    owned?: string,
    publisher?: string,
    "publisher-series"?: string,
    quantity?: number,
    smallImageUrl: string,
    tintenfassId?: string
    title: string,
    translator?: string,
    year?: string,
}

export interface TroveItem {
    littlePrinceItem: TroveItemDetails,
    /** Stable table row identity (duplicate lpids / image URLs exist in data). */
    polyglitStableRowKey?: string,
}

function compareTroveItem(a: TroveItem, b: TroveItem) {
    if (a.littlePrinceItem.language >= b.littlePrinceItem.language) {
        return 1
    }
    return -1
}

export interface Trove {
    id: string,
    name: string,
    shortName: string,
    items: TroveItem[]
}


export enum FocusState {
    ALL,
    WANTED,
    OWNED,
    DUPLICATES
}

interface ShowcaseState {
    troveItems: TroveItem[],
    searchText: string,
    displayedTroveItems: TroveItem[],
    focusState?: FocusState
    focusItems: TroveItem[],
    FocusItemCount: number,
    langIsoMaps: LangIsoMaps | null,
    captionMode: CaptionMode,
    viewMode: ViewMode,
    gallerySortBy: GallerySortBy,
    listSortColumn: ListSortColumn | null,
    listSortAsc: boolean,
    /** When true, list/gallery only editions with more than one distinct lang or lang2 code in langPairs. */
    onlyMultilingualEditions: boolean,
    /** Split results into sections by language, year, or script (none = flat). */
    groupBy: GroupByOption,
}

export interface ShowcaseProps {
    // pageHeader: string,
    // pageSubtitle: string,
    troveUrl: string,
    collectionTitle: string,
    showWantedCheckboxes: boolean,
    focusState?: FocusState
}

const BigWhiteTooltip = withStyles({
    arrow: {
        "&:before": {
            border: "1px solid #444444"
        },
        color: "white"
    },
    tooltip: {
        fontSize: "1em",
        backgroundColor: "white",
        border: "1px solid #444444",
        color: "#444444",
        borderRadius: ".2em",
        boxShadow: "0 0 0.5em 0.5em #f2f2f2",
        maxWidth: "none", // TODO this is not a good solution to the problem of the icons showing up after the rest of the text
    }
})(Tooltip);

const SmallTooltip = withStyles({
    tooltip: {
        fontSize: "1em",
        backgroundColor: "lightyellow",
        color: "darkslategray",
        border: "1px solid black",
    }
})(Tooltip);


class Showcase extends React.Component<ShowcaseProps, ShowcaseState> {

    constructor(props: ShowcaseProps) {
        super(props)
        this.state = {
            troveItems: [],
            displayedTroveItems: [],
            focusItems: [],
            searchText: "",
            focusState: (props.showWantedCheckboxes ? FocusState.OWNED : FocusState.ALL),
            FocusItemCount: 0,
            langIsoMaps: null,
            captionMode: CaptionMode.TITLES,
            viewMode: ViewMode.GALLERY,
            gallerySortBy: "title",
            listSortColumn: null,
            listSortAsc: true,
            onlyMultilingualEditions: false,
            groupBy: "none",
        }
    }

    componentDidMount() {
        ensurePolyglitDataPreloaded().then(() => {
            const trove = getCachedTrove(this.props.troveUrl);
            const langIsoMaps = getCachedLangIsoMaps(this.props.troveUrl) ?? null;
            if (!trove?.items) {
                console.error(`No cached trove for ${this.props.troveUrl}`);
                return;
            }
            console.log(`Got ${trove.items.length} Trove items (from cache)`);

            const troveItems = trove.items
                .map((item, idx) => {
                    if (item.polyglitStableRowKey == null) {
                        item.polyglitStableRowKey = `${trove.shortName || trove.id}#${idx}`;
                    }
                    item.littlePrinceItem.lumpOfText = this.searchableText(item);
                    return item;
                })
                .sort(compareTroveItem);
            const pred = this.troveItemMatchesPredicate("", this.props.focusState);
            const displayedTroveItems = troveItems.filter(pred);
            this.setState({
                troveItems,
                displayedTroveItems,
                langIsoMaps,
            });
            this.setFocus(this.props.focusState, troveItems);
        });
    }

    render() {
        return (
            <div id="main_content_wrap" className="outer">
                <div id="main_content" className="inner">
                    {/*<h1>{this.props.pageHeader}</h1>*/}
                    {/*<p>{this.props.pageSubtitle}</p>*/}

                    <div style={{width: "100%"}}>
                        {this.props.showWantedCheckboxes ? (
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    gap: "16px",
                                }}
                            >
                                {this.renderFocusStateSelect()}
                                {this.renderMultilingualFilterToggle()}
                            </div>
                        ) : (
                            <>
                                {this.state.focusState === FocusState.OWNED && (
                                    <p>
                                        These are books that I own. Use the dropdown and the search box to filter
                                        differently!
                                    </p>
                                )}
                                {this.state.focusState === FocusState.WANTED && (
                                    <p>
                                        These are books that I DO NOT HAVE. I&apos;m looking for them. If you want to
                                        trade (or sell!), or just want to help me find them, please get in touch!{" "}
                                        <a href="mailto:carl@dragnon.com">carl@dragnon.com</a>
                                    </p>
                                )}
                                {this.state.focusState === FocusState.DUPLICATES && (
                                    <p>
                                        These are books that I have EXTRAS to trade or sell. If you&apos;re
                                        interested, please get in touch!{" "}
                                        <a href="mailto:carl@dragnon.com">carl@dragnon.com</a>
                                    </p>
                                )}
                                {this.state.focusState === FocusState.ALL && (
                                    <p>
                                        <b>NOTE:</b> These include books that I own, and ones that I&apos;m looking for.
                                    </p>
                                )}
                            </>
                        )}

                        <div className="search-results" style={{width: "100%"}}>
                        <div style={{width: "100%", marginTop: "12px"}}>
                            <div style={{position: "relative", width: "100%"}}>
                                <TextField
                                    label="Search keywords"
                                    type="text"
                                    variant="outlined"
                                    fullWidth
                                    value={this.state.searchText}
                                    onChange={(e) => this.onSearchTextChanged(e)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Escape") {
                                            e.preventDefault();
                                            this.clearSearch();
                                        }
                                    }}
                                    placeholder="language, country, title, script, format ..."
                                    InputProps={{
                                        style: this.state.searchText
                                            ? {paddingRight: 40}
                                            : undefined,
                                    }}
                                />
                                {this.state.searchText ? (
                                    <IconButton
                                        type="button"
                                        aria-label="Clear search"
                                        size="small"
                                        onMouseDown={(ev) => ev.preventDefault()}
                                        onClick={() => this.clearSearch()}
                                        style={{
                                            position: "absolute",
                                            right: 10,
                                            bottom: 17,
                                            zIndex: 2,
                                            padding: 4,
                                            color: "rgba(0, 0, 0, 0.38)",
                                        }}
                                    >
                                        <span
                                            aria-hidden
                                            style={{
                                                fontWeight: 700,
                                                fontSize: "1.05rem",
                                                lineHeight: 1,
                                                color: "rgba(0, 0, 0, 0.38)",
                                            }}
                                        >
                                            ×
                                        </span>
                                    </IconButton>
                                ) : null}
                            </div>
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                alignItems: "center",
                                gap: "12px",
                                marginTop: "12px",
                                width: "100%",
                            }}
                        >
                            <section style={{margin: 0, flex: "0 1 auto", minWidth: 0}}>
                                Showing {this.state.displayedTroveItems.length} of {this.state.FocusItemCount} editions
                                of {this.props.collectionTitle}.
                            </section>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    gap: "12px",
                                    flexShrink: 0,
                                    marginLeft: "auto",
                                }}
                            >
                                {!this.props.showWantedCheckboxes && this.renderMultilingualFilterToggle()}
                                {this.renderGroupBySelect()}
                                {this.state.viewMode === ViewMode.GALLERY && this.renderGallerySortSelect()}
                                {this.renderViewModeToggle()}
                            </div>
                        </div>
                        <p/>
                        {this.state.viewMode === ViewMode.GALLERY ? (
                            this.renderGalleryView()
                        ) : (
                            this.renderListView()
                        )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    private clearSearch() {
        this.setState({searchText: ""});
        this.search("", this.state.focusState);
    }

    private onSearchTextChanged(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        this.setState({
            searchText: e.target.value
        });
        this.search(e.currentTarget.value, this.state.focusState);
    }

    private onFocusStateChanged(e: React.ChangeEvent<{ name?: string; value: FocusState }>) {
        let newFocusState = e.target.value;
        console.log(`focus is ${newFocusState}`)
        this.setState({
            focusState: newFocusState
        });
        this.setFocus(newFocusState);
        this.search(this.state.searchText, newFocusState)
    }

    private onCaptionModeChanged(e: React.ChangeEvent<{ name?: string; value: unknown }>) {
        this.setState({captionMode: e.target.value as CaptionMode});
    }

    private setViewMode(mode: ViewMode) {
        this.setState({viewMode: mode});
    }

    private renderGallerySortSelect() {
        return (
            <FormControl variant="outlined" style={{minWidth: 200, margin: 0}}>
                <InputLabel id="showcase-gallery-sort-label">Sort gallery by</InputLabel>
                <Select
                    labelId="showcase-gallery-sort-label"
                    value={this.state.gallerySortBy}
                    onChange={(e) =>
                        this.setState({gallerySortBy: e.target.value as GallerySortBy})
                    }
                    label="Sort gallery by"
                >
                    <MenuItem value="language">Language</MenuItem>
                    <MenuItem value="title">Title</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                    <MenuItem value="dateAdded">Date added</MenuItem>
                </Select>
            </FormControl>
        );
    }

    private parseYearForSort(y: string | undefined): number | null {
        if (y == null) {
            return null;
        }
        const m = String(y).match(/\d{1,4}/);
        if (m) {
            const n = parseInt(m[0], 10);
            if (!Number.isNaN(n)) {
                return n;
            }
        }
        return null;
    }

    /** Milliseconds since epoch, or null if missing or unparseable. */
    private parseDateAddedMs(raw: string | undefined): number | null {
        if (raw == null || !String(raw).trim()) {
            return null;
        }
        const t = Date.parse(raw);
        return Number.isNaN(t) ? null : t;
    }

    private compareTroveItemsForGallery(a: TroveItem, b: TroveItem, by: GallerySortBy): number {
        const lpA = a.littlePrinceItem;
        const lpB = b.littlePrinceItem;
        let cmp = 0;
        switch (by) {
            case "language":
                cmp = this.effectiveLanguageLabel(a).localeCompare(this.effectiveLanguageLabel(b), undefined, {
                    numeric: true,
                    sensitivity: "base",
                });
                break;
            case "title":
                cmp = (lpA.title ?? "").localeCompare(lpB.title ?? "", undefined, {
                    numeric: true,
                    sensitivity: "base",
                });
                break;
            case "year": {
                const na = this.parseYearForSort(lpA.year);
                const nb = this.parseYearForSort(lpB.year);
                if (na != null && nb != null) {
                    cmp = na - nb;
                } else if (na == null && nb == null) {
                    cmp = 0;
                } else {
                    cmp = na == null ? 1 : -1;
                }
                break;
            }
            case "dateAdded": {
                const da = this.parseDateAddedMs(lpA["date-added"]);
                const db = this.parseDateAddedMs(lpB["date-added"]);
                if (da != null && db != null) {
                    cmp = db - da;
                } else if (da == null && db == null) {
                    cmp = 0;
                } else {
                    cmp = da == null ? 1 : -1;
                }
                break;
            }
            default:
                break;
        }
        if (cmp === 0) {
            return (lpA.title ?? "").localeCompare(lpB.title ?? "", undefined, {numeric: true, sensitivity: "base"});
        }
        return cmp;
    }

    private sortItemsForGallery(items: TroveItem[]): TroveItem[] {
        const by = this.state.gallerySortBy;
        return items.slice().sort((a, b) => this.compareTroveItemsForGallery(a, b, by));
    }

    private renderCaptionModeSelect() {
        return (
            <FormControlLabel
                style={{margin: 0}}
                label=""
                control={
                    <Select
                        value={this.state.captionMode}
                        onChange={(e: any) => this.onCaptionModeChanged(e)}
                        color="primary"
                    >
                        <MenuItem value={CaptionMode.TITLES}>Show Titles</MenuItem>
                        <MenuItem value={CaptionMode.LANGUAGES}>Show Languages</MenuItem>
                    </Select>
                }
            />
        );
    }

    private renderFocusStateSelect() {
        return (
            <FormControlLabel
                style={{margin: 0}}
                label=""
                control={
                    <Select
                        value={this.state.focusState}
                        onChange={(e: any) => this.onFocusStateChanged(e)}
                        color="primary"
                    >
                        <MenuItem value={FocusState.OWNED}>Show editions that I own</MenuItem>
                        <MenuItem value={FocusState.WANTED}>Show editions that I&apos;m looking for</MenuItem>
                        <MenuItem value={FocusState.DUPLICATES}>
                            Show editions of which I have extras to trade or sell
                        </MenuItem>
                        <MenuItem value={FocusState.ALL}>
                            Show all editions — the ones I own as well as I&apos;m explicitly looking for
                        </MenuItem>
                    </Select>
                }
            />
        );
    }

    private renderMultilingualFilterToggle() {
        return (
            <FormControlLabel
                style={{margin: 0}}
                control={
                    <Switch
                        checked={this.state.onlyMultilingualEditions}
                        onChange={(_, checked) => this.onOnlyMultilingualEditionsChanged(checked)}
                        color="primary"
                    />
                }
                label="Only show multilingual editions"
            />
        );
    }

    private onOnlyMultilingualEditionsChanged(checked: boolean) {
        this.setState({onlyMultilingualEditions: checked}, () => {
            this.search(this.state.searchText, this.state.focusState);
        });
    }

    private renderGroupBySelect() {
        return (
            <FormControl variant="outlined" style={{minWidth: 160, margin: 0}}>
                <InputLabel id="showcase-group-by-label">Group by</InputLabel>
                <Select
                    labelId="showcase-group-by-label"
                    value={this.state.groupBy}
                    onChange={(e) => this.setState({groupBy: e.target.value as GroupByOption})}
                    label="Group by"
                >
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="language">Language</MenuItem>
                    <MenuItem value="year">Year</MenuItem>
                    <MenuItem value="script">Script</MenuItem>
                </Select>
            </FormControl>
        );
    }

    /** Count of distinct non-empty 639-3 `lang` codes across langPairs (case-insensitive). */
    private distinctLangPairCodeCount(lp: TroveItemDetails): number {
        const pairs = lp.langPairs;
        if (!pairs?.length) {
            return 0;
        }
        const codes = new Set<string>();
        for (const p of pairs) {
            if (p.lang != null && String(p.lang).trim() !== "") {
                codes.add(String(p.lang).trim().toLowerCase());
            }
        }
        return codes.size;
    }

    private isMultilingualEdition(troveItem: TroveItem): boolean {
        return this.distinctLangPairCodeCount(troveItem.littlePrinceItem) > 1;
    }

    private effectiveLanguageLabel(troveItem: TroveItem): string {
        const pairs = troveItem.littlePrinceItem.langPairs;
        const maps = this.state.langIsoMaps;
        let firstLangCode: string | null = null;
        if (pairs?.length) {
            for (const pair of pairs) {
                if (pair.lang != null && String(pair.lang).trim() !== "") {
                    const code = String(pair.lang).trim().toLowerCase();
                    if (firstLangCode == null) {
                        firstLangCode = code;
                    }
                    const resolved = maps?.names6393.get(code);
                    if (resolved != null && resolved !== "") {
                        return resolved;
                    }
                }
            }
        }
        return troveItem.littlePrinceItem.language || firstLangCode || "(unknown language)";
    }

    private effectiveLanguageLabelsForItem(troveItem: TroveItem): string[] {
        const pairs = troveItem.littlePrinceItem.langPairs;
        if (pairs?.length) {
            const codes = new Set<string>();
            for (const pair of pairs) {
                if (pair.lang != null && String(pair.lang).trim() !== "") {
                    codes.add(String(pair.lang).trim().toLowerCase());
                }
            }
            if (codes.size > 0) {
                const labels: string[] = [];
                const seen = new Set<string>();
                for (const code of Array.from(codes)) {
                    const resolved = this.state.langIsoMaps?.names6393.get(code);
                    if (resolved != null && resolved !== "" && !seen.has(resolved)) {
                        seen.add(resolved);
                        labels.push(resolved);
                    }
                }
                if (labels.length > 0) {
                    return labels;
                }
                return ["(unknown language)"];
            }
        }
        return [troveItem.littlePrinceItem.language || "(unknown language)"];
    }

    private groupItemsByEffectiveLanguage(items: TroveItem[]): Array<{ label: string; items: TroveItem[] }> {
        const groups = new Map<string, TroveItem[]>();
        for (const item of items) {
            const labels = this.effectiveLanguageLabelsForItem(item);
            for (const label of labels) {
                const existing = groups.get(label);
                if (existing) {
                    existing.push(item);
                } else {
                    groups.set(label, [item]);
                }
            }
        }
        const labels = Array.from(groups.keys()).sort((a, b) =>
            a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"}),
        );
        return labels.map((label) => ({label, items: groups.get(label)!}));
    }

    private groupItemsByYear(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        const groups = new Map<string, TroveItem[]>();
        for (const item of items) {
            const raw = item.littlePrinceItem.year;
            const label =
                raw != null && String(raw).trim() !== "" ? String(raw).trim() : "(year N/A)";
            const existing = groups.get(label);
            if (existing) {
                existing.push(item);
            } else {
                groups.set(label, [item]);
            }
        }
        const labels = Array.from(groups.keys()).sort((a, b) => {
            if (a === "(year N/A)") {
                return 1;
            }
            if (b === "(year N/A)") {
                return -1;
            }
            return a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"});
        });
        return labels.map((label) => ({label, items: groups.get(label)!}));
    }

    private groupItemsByScript(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        const groups = new Map<string, TroveItem[]>();
        for (const item of items) {
            const raw = item.littlePrinceItem.script;
            const label =
                raw != null && String(raw).trim() !== "" ? String(raw).trim() : "(script N/A)";
            const existing = groups.get(label);
            if (existing) {
                existing.push(item);
            } else {
                groups.set(label, [item]);
            }
        }
        const labels = Array.from(groups.keys()).sort((a, b) =>
            a.localeCompare(b, undefined, {numeric: true, sensitivity: "base"}),
        );
        return labels.map((label) => ({label, items: groups.get(label)!}));
    }

    private groupItemsForView(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        switch (this.state.groupBy) {
            case "none":
                return [{label: "", items}];
            case "language":
                return this.groupItemsByEffectiveLanguage(items);
            case "year":
                return this.groupItemsByYear(items);
            case "script":
                return this.groupItemsByScript(items);
            default:
                return [{label: "", items}];
        }
    }

    private renderGalleryView() {
        const items = this.sortItemsForGallery(this.state.displayedTroveItems);
        if (this.state.groupBy === "none") {
            return (
                <section className="gallery-grid">
                    {items.map((troveItem, index) => this.renderTroveItem(troveItem, index))}
                </section>
            );
        }
        const grouped = this.groupItemsForView(this.state.displayedTroveItems).map((group) => ({
            label: group.label,
            items: this.sortItemsForGallery(group.items),
        }));
        return (
            <div>
                {grouped.map((group) => (
                    <section key={group.label} style={{marginBottom: "16px"}}>
                        <h3 style={{margin: "6px 0 8px 0"}}>{group.label}</h3>
                        <section className="gallery-grid">
                            {group.items.map((troveItem, index) => this.renderTroveItem(troveItem, `${group.label}-${index}`))}
                        </section>
                    </section>
                ))}
            </div>
        );
    }

    private renderViewModeToggle() {
        const isGallery = this.state.viewMode === ViewMode.GALLERY;
        const border = "1px solid rgba(0, 0, 0, 0.23)";
        const selectedBg = "rgba(63, 81, 181, 0.12)";
        const btnSx: React.CSSProperties = {
            borderRadius: 0,
            padding: 8,
            minWidth: 44,
        };
        return (
            <div
                role="group"
                aria-label="Layout: gallery or list"
                style={{
                    display: "flex",
                    flexDirection: "row",
                    border,
                    borderRadius: 4,
                    overflow: "hidden",
                    width: "fit-content",
                    flexShrink: 0,
                }}
            >
                <Tooltip title="Gallery view">
                    <IconButton
                        aria-label="Gallery view"
                        aria-pressed={isGallery}
                        onClick={() => this.setViewMode(ViewMode.GALLERY)}
                        color={isGallery ? "primary" : "default"}
                        size="small"
                        style={{
                            ...btnSx,
                            backgroundColor: isGallery ? selectedBg : undefined,
                        }}
                    >
                        <ViewModule />
                    </IconButton>
                </Tooltip>
                <div style={{width: 1, flexShrink: 0, backgroundColor: "rgba(0, 0, 0, 0.12)"}} />
                <Tooltip title="List view">
                    <IconButton
                        aria-label="List view"
                        aria-pressed={!isGallery}
                        onClick={() => this.setViewMode(ViewMode.LIST)}
                        color={!isGallery ? "primary" : "default"}
                        size="small"
                        style={{
                            ...btnSx,
                            backgroundColor: !isGallery ? selectedBg : undefined,
                        }}
                    >
                        <ViewList />
                    </IconButton>
                </Tooltip>
            </div>
        );
    }

    private setFocus(focusState: FocusState | undefined, troveItems?: TroveItem[]) {
        const items = troveItems ?? this.state.troveItems;
        const focusFilteredItems = items.filter(this.troveItemMatchesFocusPredicate(focusState));
        this.setState({
            focusItems: focusFilteredItems,
            FocusItemCount: focusFilteredItems.length,
        });
    }

    private search(searchText: string, focusState: FocusState | undefined) {
        this.setState({
            displayedTroveItems: this.state.troveItems
                .filter(this.troveItemMatchesPredicate(searchText, focusState))
        })
    }

    private troveItemMatchesFocusPredicate(focusState: FocusState | undefined) {

        let pred1 = (_: TroveItem) => {
            return true
        }

        let pred2 = pred1

        // Condition: focus state - all, wanted, owned, duplicates (assuming duplicates only happens for owned)
        switch (focusState) {
            case FocusState.OWNED:
                // console.log("OWNED")
                pred2 = troveItem => {
                    let isOwned = troveItem.littlePrinceItem.owned ?? "true";
                    return pred1(troveItem) && isOwned === "true"
                }
                break;

            case FocusState.WANTED:
                // console.log("WANTED")
                pred2 = troveItem => {
                    let isOwned = troveItem.littlePrinceItem.owned ?? "true";
                    return pred1(troveItem) && isOwned !== "true"
                }
                break;

            case FocusState.DUPLICATES:
                // console.log("DUPLICATES")
                pred2 = troveItem => {
                    return pred1(troveItem) && (troveItem.littlePrinceItem.quantity ?? 1) > 1
                }
                break;

            default:
        }
        return pred2;
    }

    private troveItemMatchesPredicate(searchText: string,
                                      focusState: FocusState | undefined) {

        const pred1 = (_: TroveItem) => true

        let pred2 = pred1

        // Condition: focus state - all, wanted, owned, duplicates (assuming duplicates only happens for owned)
        switch (focusState) {
            case FocusState.OWNED:
                // console.log("OWNED")
                pred2 = troveItem => {
                    let isOwned = troveItem.littlePrinceItem?.owned ?? "true";
                    return pred1(troveItem)
                        && isOwned === "true"
                }
                break;

            case FocusState.WANTED:
                // console.log("WANTED")
                pred2 = troveItem => {
                    let isOwned = troveItem.littlePrinceItem?.owned ?? "true";
                    return pred1(troveItem)
                        && isOwned !== "true"
                }
                break;

            case FocusState.DUPLICATES:
                // console.log("DUPLICATES")
                pred2 = troveItem => {
                    return pred1(troveItem)
                        && (troveItem.littlePrinceItem?.quantity ?? 1) > 1
                }
                break;

            default:
        }

        let pred3 = pred2

        const all = true
        // Condition: text search
        if (searchText) {
            const searchTokens = searchText.toLowerCase().split(new RegExp(/\s+/))

            pred3 = (troveItem) => {
                let lpItem = troveItem.littlePrinceItem;
                if (!lpItem) {
                    return false
                }
                let response = false
                if (all) {
                    response = pred2(troveItem)
                        && searchTokens.every(searchToken => {
                            // console.log("SEARCHING FOR " + searchToken)
                            return troveItem.littlePrinceItem.lumpOfText!.includes(searchToken)
                        })
                } else {
                    response = pred2(troveItem)
                        && searchTokens.some(searchToken => {
                            // console.log("SEARCHING FOR " + searchToken)
                            return troveItem.littlePrinceItem.lumpOfText!.includes(searchToken)
                        })
                }

                // console.log(`SEARCH TEXT ${searchText} LANGUAGE ${lpItem.language.toLowerCase()} MATCH? ${response}`)
                return response
            }
        }

        let predFinal = pred3;
        if (this.state.onlyMultilingualEditions) {
            predFinal = (troveItem: TroveItem) => pred3(troveItem) && this.isMultilingualEdition(troveItem);
        }

        return predFinal;
    }

    private renderTroveItem(troveItem: TroveItem, key: any) {
        return <BigWhiteTooltip
            title={this.troveItemTooltipContents(troveItem)}
            arrow
            interactive
            placement="right-start"
            enterDelay={300}
            enterNextDelay={300}
        >

            <div className="thumbnail" key={key}>
                <a target="_blank" rel="noreferrer" href={troveItem.littlePrinceItem.largeImageUrl}>
                    <div style={{position: "relative"}}>
                        <img width="150" height={"100%"}
                             src={troveItem.littlePrinceItem.smallImageUrl}
                            // title={troveItem.littlePrinceItem.title}
                             alt={troveItem.littlePrinceItem.title}
                        />
                    </div>
                </a>
                {this.renderThumbnailCaption(troveItem)}
            </div>
        </BigWhiteTooltip>
    }

    /** One caption line: avoids "English · English" when 639-3 and 639-1 resolve to the same label. Lang tags are omitted (see list column langTag). */
    private formatLangPairCaptionLine(pair: LangPair, maps: LangIsoMaps | null): string {
        const n3 = nameFor6393(pair.lang, maps);
        const n1 = pair.lang2 != null ? nameFor6391(pair.lang2, maps) : null;
        const core = n1 != null && n1 !== n3 ? `${n3} · ${n1}` : n3;
        return core;
    }

    /** Ordered unique caption lines (duplicate pairs or duplicate resolved text shown once). */
    private uniqueLangPairCaptionLines(pairs: LangPair[], maps: LangIsoMaps | null): string[] {
        const seen = new Set<string>();
        const lines: string[] = [];
        for (const p of pairs) {
            const line = this.formatLangPairCaptionLine(p, maps);
            if (seen.has(line)) {
                continue;
            }
            seen.add(line);
            lines.push(line);
        }
        return lines;
    }

    /**
     * Gallery caption when `translation-title` is set: *title*, optional [transliteration], line break, then
     * (ISO lang lines) and/or (language field) using parentheses; see code for substring / dedupe rules.
     */
    private renderGalleryTranslationTitleCaption(troveItem: TroveItem) {
        const lp = troveItem.littlePrinceItem;
        const maps = this.state.langIsoMaps;
        const pairs = lp.langPairs;
        const langFromPairs =
            pairs?.length && pairs.some((p) => this.isPresent(p.lang))
                ? this.uniqueLangPairCaptionLines(pairs, maps).join("; ")
                : "";
        const hasLang = this.isPresent(langFromPairs);
        const languageField = lp.language ?? "";
        const hasLanguageField = this.isPresent(languageField);
        const title = lp["translation-title"]!;
        const transliterated = lp["translation-title-transliterated"];
        const showTransliterated = this.isPresent(transliterated);

        let parenPart = "";
        let bracketSuffix = "";
        if (hasLang && hasLanguageField) {
            const langTrim = langFromPairs.trim();
            const languageTrim = languageField.trim();
            const langContainedInLanguage =
                langTrim.length > 0 && languageTrim.includes(langTrim);
            if (langContainedInLanguage) {
                bracketSuffix = `(${languageField})`;
            } else {
                parenPart = langFromPairs;
                const sameAsLangDisplay = languageTrim === langTrim;
                if (!sameAsLangDisplay) {
                    bracketSuffix = `(${languageField})`;
                }
            }
        } else if (hasLang) {
            parenPart = langFromPairs;
        } else if (hasLanguageField) {
            parenPart = languageField;
        }

        const showSuffix = parenPart !== "" || bracketSuffix !== "";
        return (
            <div className="caption">
                <em>{title}</em>
                {showTransliterated && <> [{transliterated}]</>}
                {showSuffix && (
                    <>
                        <br />
                        {parenPart !== "" ? `(${parenPart})` : ""}
                        {bracketSuffix !== "" ? (parenPart !== "" ? " " : "") + bracketSuffix : ""}
                    </>
                )}
            </div>
        );
    }

    private renderThumbnailCaption(troveItem: TroveItem) {
        const lp = troveItem.littlePrinceItem;
        if (this.state.viewMode === ViewMode.GALLERY && this.isPresent(lp["translation-title"])) {
            return this.renderGalleryTranslationTitleCaption(troveItem);
        }
        if (this.state.captionMode === CaptionMode.TITLES) {
            return <div className="caption">{lp.language}</div>;
        }
        const maps = this.state.langIsoMaps;
        const pairs = lp.langPairs;
        const lines = pairs?.length ? this.uniqueLangPairCaptionLines(pairs, maps) : [];
        return (
            <div className="caption" style={{textAlign: "left"}}>
                {lines.length > 0 && (
                    <ul style={{margin: 0, paddingLeft: "1.1em", fontSize: "0.9em"}}>
                        {lines.map((line, idx) => (
                            <li key={idx}>{line}</li>
                        ))}
                    </ul>
                )}
            </div>
        );
    }

    private listViewLangNames6393(troveItem: TroveItem): string {
        const pairs = troveItem.littlePrinceItem.langPairs;
        if (!pairs?.length) {
            return "";
        }
        const maps = this.state.langIsoMaps;
        return Array.from(new Set(pairs.map((p) => nameFor6393(p.lang, maps))))
            .filter((s) => s !== "")
            .join("; ");
    }

    private listViewLangNames6391(troveItem: TroveItem): string {
        const pairs = troveItem.littlePrinceItem.langPairs;
        if (!pairs?.length) {
            return "";
        }
        const maps = this.state.langIsoMaps;
        return Array.from(
            new Set(pairs.map((p) => (p.lang2 != null ? nameFor6391(p.lang2, maps) : ""))),
        )
            .filter((s) => s !== "")
            .join("; ");
    }

    private listViewLangTags(troveItem: TroveItem): string {
        const pairs = troveItem.littlePrinceItem.langPairs;
        if (!pairs?.length) {
            return "";
        }
        return Array.from(
            new Set(pairs.map((p) => (p.langTag != null && p.langTag !== "" ? p.langTag : ""))),
        )
            .filter((s) => s !== "")
            .join("; ");
    }

    private toggleListSort(column: ListSortColumn) {
        this.setState((prev) => {
            if (prev.listSortColumn === column) {
                return {listSortColumn: column, listSortAsc: !prev.listSortAsc};
            }
            return {listSortColumn: column, listSortAsc: true};
        });
    }

    private listSortValue(troveItem: TroveItem, column: ListSortColumn): string {
        const lp = troveItem.littlePrinceItem;
        switch (column) {
            case "thumbnail":
                return lp.smallImageUrl ?? "";
            case "title":
                return lp.title ?? "";
            case "year":
                return lp.year ?? "";
            case "dateAdded":
                return lp["date-added"] ?? "";
            case "languageString":
                return this.constructLanguage(troveItem) ?? "";
            case "lang6393":
                return this.listViewLangNames6393(troveItem);
            case "lang6391":
                return this.listViewLangNames6391(troveItem);
            case "langTag":
                return this.listViewLangTags(troveItem);
            case "lpid":
                return lp.lpid ?? "";
            default:
                return "";
        }
    }

    private compareTroveItemsForList(a: TroveItem, b: TroveItem, column: ListSortColumn, asc: boolean): number {
        const tieTitle = () => {
            const ta = a.littlePrinceItem.title ?? "";
            const tb = b.littlePrinceItem.title ?? "";
            return ta.localeCompare(tb, undefined, {numeric: true, sensitivity: "base"});
        };
        if (column === "year") {
            const na = this.parseYearForSort(a.littlePrinceItem.year);
            const nb = this.parseYearForSort(b.littlePrinceItem.year);
            let cmp = 0;
            if (na != null && nb != null) {
                cmp = na - nb;
            } else if (na == null && nb == null) {
                cmp = 0;
            } else {
                cmp = na == null ? 1 : -1;
            }
            if (cmp === 0) {
                cmp = tieTitle();
            }
            return asc ? cmp : -cmp;
        }
        if (column === "dateAdded") {
            const da = this.parseDateAddedMs(a.littlePrinceItem["date-added"]);
            const db = this.parseDateAddedMs(b.littlePrinceItem["date-added"]);
            let cmp = 0;
            if (da != null && db != null) {
                cmp = da - db;
            } else if (da == null && db == null) {
                cmp = 0;
            } else {
                cmp = da == null ? 1 : -1;
            }
            if (cmp === 0) {
                cmp = tieTitle();
            }
            return asc ? cmp : -cmp;
        }
        const va = String(this.listSortValue(a, column) ?? "");
        const vb = String(this.listSortValue(b, column) ?? "");
        let cmp = va.localeCompare(vb, undefined, {numeric: true, sensitivity: "base"});
        if (cmp === 0) {
            cmp = tieTitle();
        }
        return asc ? cmp : -cmp;
    }

    private listViewSortedItems(): TroveItem[] {
        const items = this.state.displayedTroveItems;
        const col = this.state.listSortColumn;
        if (col == null) {
            return items;
        }
        const asc = this.state.listSortAsc;
        return items.slice().sort((a, b) => this.compareTroveItemsForList(a, b, col, asc));
    }

    private renderListSortHeader(thStyle: React.CSSProperties, column: ListSortColumn, label: string) {
        const active = this.state.listSortColumn === column;
        const arrow = active ? (this.state.listSortAsc ? " ▲" : " ▼") : "";
        return (
            <th
                style={{...thStyle, cursor: "pointer", userSelect: "none"}}
                onClick={() => this.toggleListSort(column)}
                scope="col"
                aria-sort={active ? (this.state.listSortAsc ? "ascending" : "descending") : undefined}
            >
                {label}
                {arrow}
            </th>
        );
    }

    private renderListView() {
        const tableStyle: React.CSSProperties = {
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "0.9em",
        };
        const cellStyle: React.CSSProperties = {
            border: "1px solid #ccc",
            padding: "6px 8px",
            verticalAlign: "top",
        };
        const thStyle: React.CSSProperties = {
            ...cellStyle,
            backgroundColor: "#f5f5f5",
            textAlign: "left",
            color: "#000",
        };
        const grouped = this.groupItemsForView(this.listViewSortedItems());
        const listColumnCount = 9;
        return (
            <div style={{overflowX: "auto", width: "100%"}}>
                <table style={tableStyle}>
                    <thead>
                        <tr>
                            {this.renderListSortHeader(thStyle, "thumbnail", "Thumbnail")}
                            {this.renderListSortHeader(thStyle, "title", "Title")}
                            {this.renderListSortHeader(thStyle, "year", "Year")}
                            {this.renderListSortHeader(thStyle, "dateAdded", "Date added")}
                            {this.renderListSortHeader(thStyle, "languageString", "Language Description")}
                            {this.renderListSortHeader(thStyle, "lang6393", "lang")}
                            {this.renderListSortHeader(thStyle, "lang6391", "lang2")}
                            {this.renderListSortHeader(thStyle, "langTag", "langTag")}
                            {this.renderListSortHeader(thStyle, "lpid", "lpid")}
                        </tr>
                    </thead>
                    <tbody>
                        {grouped.map((group) => (
                            <React.Fragment key={group.label || "ungrouped"}>
                                {this.state.groupBy !== "none" && (
                                    <tr>
                                        <td
                                            style={{...thStyle, fontWeight: 700, backgroundColor: "#efefef"}}
                                            colSpan={listColumnCount}
                                        >
                                            {group.label}
                                        </td>
                                    </tr>
                                )}
                                {group.items.map((troveItem, index) => {
                                    const lp = troveItem.littlePrinceItem;
                                    const langTagsText = this.listViewLangTags(troveItem);
                                    const rowKey =
                                        troveItem.polyglitStableRowKey ??
                                        `${lp.lpid ?? "noid"}-${lp.smallImageUrl}-${lp.title}-${index}`;
                                    return (
                                        <tr key={rowKey}>
                                            <td style={cellStyle}>
                                                <BigWhiteTooltip
                                                    title={this.troveItemTooltipContents(troveItem)}
                                                    arrow
                                                    interactive
                                                    placement="right-start"
                                                    enterDelay={300}
                                                    enterNextDelay={300}
                                                >
                                                    <a href={lp.largeImageUrl} target="_blank" rel="noreferrer">
                                                        <img
                                                            width="80"
                                                            height="100%"
                                                            src={lp.smallImageUrl}
                                                            alt={lp.title}
                                                            style={{display: "block"}}
                                                        />
                                                    </a>
                                                </BigWhiteTooltip>
                                            </td>
                                            <td style={cellStyle}>{lp.title}</td>
                                            <td style={cellStyle}>{lp.year ?? ""}</td>
                                            <td style={cellStyle}>{lp["date-added"] ?? ""}</td>
                                            <td style={cellStyle}>{this.constructLanguage(troveItem)}</td>
                                            <td style={cellStyle}>{this.listViewLangNames6393(troveItem)}</td>
                                            <td style={cellStyle}>{this.listViewLangNames6391(troveItem)}</td>
                                            <td style={cellStyle}>
                                                {langTagsText.trim() !== "" ? (
                                                    <code style={{fontSize: "0.9em", whiteSpace: "pre-wrap"}}>{langTagsText}</code>
                                                ) : null}
                                            </td>
                                            <td style={cellStyle}>{lp.lpid ?? ""}</td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    /** ISO / tag lines for each lang pair; one bullet per pair (shown under the Language row). */
    private renderLangPairTooltipBlocks(item: TroveItemDetails): React.ReactNode {
        const pairs = item.langPairs;
        if (!pairs?.length) {
            return null;
        }
        const maps = this.state.langIsoMaps;
        return (
            <ul
                style={{
                    margin: "8px 0 0 0",
                    paddingLeft: "1.35em",
                    listStylePosition: "outside",
                }}
            >
                {pairs.map((pair, idx) => (
                    <li key={idx} style={{marginTop: idx > 0 ? 10 : 0}}>
                        <div style={{paddingLeft: "0.35em"}}>
                            <div>
                                <strong>ISO 639-3</strong> ({pair.lang}): {nameFor6393(pair.lang, maps)}
                            </div>
                            {pair.lang2 != null && pair.lang2 !== "" && (
                                <div style={{marginTop: 4}}>
                                    <strong>ISO 639-1</strong> ({pair.lang2}): {nameFor6391(pair.lang2, maps)}
                                </div>
                            )}
                            {this.isPresent(pair.langTag) && (
                                <div style={{marginTop: 4}}>
                                    <strong>Language tag</strong>: {pair.langTag}
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        );
    }

    private troveItemTooltipContents(troveItem: TroveItem) {

        let fieldsInOrder: string[] = [
            "wanted-message",
            "trade-message",
            "translation-title",
            "translation-title-transliterated",
            'language',
            "script",
            'translator',
            'illustrator',
            'narrator',
            'isbn13',
            'format',
            'year',
            'publisher',
            'publication-country',
            'publication-location',
            'acquisition-blurb',
            "tags",
            "comments",
            "lumpOfText"
        ]

        let createRow = (field: string | null, value: any) => ({field, value})

        let rows = fieldsInOrder.map(field => {
            switch (field) {
                case 'language': {
                    const languageLine = this.constructLanguage(troveItem);
                    const pairBlock = this.renderLangPairTooltipBlocks(troveItem.littlePrinceItem);
                    return createRow(
                        "Language",
                        pairBlock != null ? (
                            <>
                                {languageLine}
                                {pairBlock}
                            </>
                        ) : (
                            languageLine
                        ),
                    );
                }
                case 'translation-title':
                    return createRow("Title in translation", troveItem.littlePrinceItem["translation-title"])
                case "translation-title-transliterated":
                    return createRow(
                        "Title transliterated",
                        troveItem.littlePrinceItem["translation-title-transliterated"],
                    );
                case 'script':
                    return createRow("Script", troveItem.littlePrinceItem.script)
                case 'translator':
                    return createRow("Translated by", troveItem.littlePrinceItem.translator)
                case 'illustrator':
                    return createRow("Illustrated by", troveItem.littlePrinceItem.illustrator)
                case 'narrator':
                    return createRow("Narrated by", troveItem.littlePrinceItem.narrator)
                case 'isbn13':
                    return createRow("ISBN-13", troveItem.littlePrinceItem.isbn13)
                case 'isbn10':
                    return createRow("ISBN-10", troveItem.littlePrinceItem.isbn10)
                case 'asin':
                    return createRow("ASIN", troveItem.littlePrinceItem.asin)
                case 'format':
                    return createRow("Format", troveItem.littlePrinceItem.format)
                case 'publisher':
                    return createRow("Published", this.constructPublicationBlurb(troveItem.littlePrinceItem))
                case 'year':
                    return createRow("Publication year", troveItem.littlePrinceItem.year)
                case 'tags':
                    return createRow("Tags", this.constructTagsBlurb(troveItem.littlePrinceItem.tags))
                case 'acquisition-blurb':
                    return createRow("Acquired", this.constructAquisitionBlurb(troveItem.littlePrinceItem))
                case 'comments':
                    return createRow(null, troveItem.littlePrinceItem.comments)
                case 'wanted-message':
                    return createRow("Note!", this.constructWantedMessage(troveItem.littlePrinceItem))
                case 'trade-message':
                    return createRow("Note!", this.constructTradeMessage(troveItem.littlePrinceItem))
                // case 'lumpOfText':
                //     return createRow("Lump Of Text", troveItem.littlePrinceItem.lumpOfText)
            }
        }).filter(e => e != null && this.isPresent(e.value))

        return <Grid container direction={"row"} spacing={2}>
            <Grid item direction={"column"} justify={"center"}>
                {
                    <Grid item>
                        {this.renderDocumentLink(troveItem.littlePrinceItem.largeImageUrl)}
                    </Grid>
                }
                {
                    troveItem.littlePrinceItem.files?.map(filename => {
                        return <Grid item>
                            {this.renderDocumentLink(filename)}
                        </Grid>
                    })
                }
                {troveItem.littlePrinceItem.lpid &&
                    <Grid item>
                        {this.renderDocumentLinkForType("Little Prince Foundation link", lpfoundIcon, `https://www.petit-prince-collection.com/lang/show_livre.php?lang=en&id=${this.extractLpId(troveItem.littlePrinceItem.lpid)}`)}
                    </Grid>
                }
                {troveItem.littlePrinceItem.tintenfassId &&
                    <Grid item>
                        {this.renderDocumentLinkForType("Edition Tintenfaß link", tintenfassIcon, `https://editiontintenfass.de/en/catalog/${troveItem.littlePrinceItem.tintenfassId}`)}
                    </Grid>
                }
            </Grid>
            <Grid item>
                <div>
                    <strong><i>{troveItem.littlePrinceItem.title}</i></strong>
                    <p />
                    {
                    rows.map((row) => {
                            if (row?.field != null) return <span>
                                <strong>{row?.field}:</strong> {row?.value}<p/></span>
                            if (Array.isArray(row?.value)) {
                                return row?.value.map((word, idx) => {
                                    return <span key={idx}>{word}<p/></span>;
                                });
                            }
                            return <span>{row?.value}</span>
                        }
                    )}
                </div>
            </Grid>
        </Grid>
    }

    private extractLpId(lpIdWithPP: string) {
        return lpIdWithPP.replace(/PP-/, '');
    }

    private isPresent(value: any): boolean {
        return !(value === null || value === undefined || value === '');
    }

    private constructLanguage(troveItem: TroveItem) {
        let language = troveItem.littlePrinceItem.language;
        let spokenIn = troveItem.littlePrinceItem['language-spoken-in'];
        if (spokenIn != null) {
            return `${language} (spoken in ${spokenIn})`
        }
        return language;
    }

    private renderDocumentLinkForType(fileType: string, icon: string, file: string) {
        return <a href={file}
                  target="_blank"
                  rel="noreferrer">
            <SmallTooltip title={`Open ${fileType} in new tab`} placement="left-end">
                <img style={{'padding': 0, 'margin': 0, 'border': 0, 'boxShadow': '0', 'filter': "grayscale(50%)"}}
                     src={icon}
                     width={"32px"} height={"32px"}
                     alt="Open"
                />
            </SmallTooltip>
        </a>
    }

    private renderDocumentLink(file: string) {
        let [fileType, icon] = this.iconFor(file)
        return this.renderDocumentLinkForType(fileType, icon, file)
    }

    private constructPublicationBlurb(item: TroveItemDetails) {
        let publisher = item.publisher
        let publicationLocation = item['publication-location']
        let publicationCountry = item['publication-country']
        let publisherSeries = item['publisher-series']
        if (this.isPresent(publisherSeries)) {
            publisherSeries = ` as part of '${publisherSeries}'`
        } else {
            publisherSeries = ''
        }
        if (!(this.isPresent(publisher) || this.isPresent(publicationLocation) || this.isPresent(publicationCountry))) {
            return null
        }

        if (!this.isPresent(publisher) && !this.isPresent(publicationLocation)) {
            return `in ${publicationCountry}${publisherSeries}`
        }
        if (!this.isPresent(publisher) && !this.isPresent(publicationCountry)) {
            return `in ${publicationLocation}${publisherSeries}`
        }
        if (!this.isPresent(publicationLocation) && !this.isPresent(publicationCountry)) {
            return `by ${publisher}${publisherSeries}`
        }

        if (!this.isPresent(publisher)) {
            return `in ${publicationLocation}, ${publicationCountry}${publisherSeries}`
        }
        if (!this.isPresent(publicationLocation)) {
            return `by ${publisher} in ${publicationCountry}${publisherSeries}`
        }
        if (!this.isPresent(publicationCountry)) {
            return `by ${publisher} in ${publicationLocation}${publisherSeries}`
        }

        return `by ${publisher} in ${publicationLocation}, ${publicationCountry}${publisherSeries}`
    }

// TODO make URLs into links, and format dates
    private constructAquisitionBlurb(item: TroveItemDetails) {
        let acquiredFrom = item["acquired-from"]
        let dateAdded = item["date-added"]
        if (!(this.isPresent(acquiredFrom) || this.isPresent(dateAdded))) {
            return null
        }
        if (this.isPresent(acquiredFrom) && this.isPresent(dateAdded)) {
            return `from ${acquiredFrom} on ${dateAdded}`
        }
        if (!this.isPresent(dateAdded)) {
            return `from ${acquiredFrom}`
        }
        if (!this.isPresent(dateAdded)) {
            return `on ${dateAdded}`
        }
    }

    private constructTagsBlurb(items: string[] | undefined): string | null {
        if (!this.isPresent(items)) {
            return null
        }
        return items!!.join(", ")
    }

    private constructWantedMessage(littlePrinceItem: {
        owned?: string
    }): string | null {
        if (!this.isPresent(littlePrinceItem.owned)) {
            return null
        }
        if (littlePrinceItem.owned === "false") {
            return "I am looking for this book! If you want to trade or just want to help me find it, please get in touch: carl@dragnon.com"
        }
        return null
    }

    private constructTradeMessage(littlePrinceItem: {
        quantity?: number
    }): string | null | undefined {
        // @ts-ignore
        if (this.isPresent(littlePrinceItem.quantity) && littlePrinceItem.quantity > 1) {
            return "I can trade or sell this book. Interested? Please get in touch: carl@dragnon.com"
        }
        return null
    }

    private iconFor(filename: string) {
        filename = filename.toLowerCase();
        if (filename.endsWith(".png") || filename.endsWith(".gif") || filename.endsWith(".jpg") || filename.endsWith(".jpeg") || filename.endsWith(".webp")) {
            return ["cover image", coverIcon]
        }
        if (filename.endsWith(".pdf")) {
            return ["PDF", pdfIcon]
        }
        if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
            return ["document", documentIcon]
        }
        if (filename.endsWith(".mp3")) {
            return ["audio file", audibookIcon]
        }
        return ["file", popoutFlat]
    }

    private searchableText(item: TroveItem) {
        let lpItem = item.littlePrinceItem;

        return "" +
`
${lpItem.author}
${lpItem["acquired-from"]}
${lpItem["comments"]?.join(" || ")} 
${lpItem.format}
${lpItem.illustrator}
${this.canonicalIsbn(lpItem.isbn10)}
${this.canonicalIsbn(lpItem.isbn13)}
${lpItem.language}
${lpItem["language-spoken-in"]}
${lpItem.lpid}
${lpItem.narrator}
${lpItem.publisher}
${lpItem.script}
${lpItem["search-words"]}
${lpItem["script-family"]}
${lpItem["tags"]?.join(" || ")}
${lpItem.tintenfassId}
${lpItem.title}
${lpItem["translation-title"]}
${lpItem["translation-title-transliterated"]}
${lpItem.translator}
${lpItem.year}
`
// Problematic because of precision:
// ${lpItem["publication-location"]}
// ${lpItem["publication-country"]}

        .toLowerCase();
    }

    private canonicalIsbn(dirty: string | undefined) {
        if (!dirty) return dirty;
        return dirty.replace(/[^\d]/g, '');
    }
}

export default Showcase;
