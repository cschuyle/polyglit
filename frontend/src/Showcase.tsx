import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import pdfIcon from "./images/pdf.png"
import documentIcon from "./images/document.png"
import coverIcon from "./images/lp-cover.jpg"
import audibookIcon from "./images/audiobook.png"
import lpfoundIcon from "./images/lp-found-fox.png"
import tintenfassIcon from "./images/tinten.png"

import {
    CircularProgress,
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
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import {groupByEnabled, sortNavEnabled} from "./featureFlags";
import {displayForIso15924Scripts, LangIsoMaps, LangPair, nameFor15924, nameFor6391, nameFor6393} from "./langIsoLookup";
import {ensurePolyglitDataPreloaded, getCachedLangIsoMaps, getCachedTrove} from "./polyglitJsonCache";

const GROUP_BY_ENABLED = groupByEnabled();
const SORT_NAV_ENABLED = sortNavEnabled();

enum CaptionMode {
    TITLES = "titles",
    LANGUAGES = "languages"
}

enum ViewMode {
    GALLERY = "gallery",
    LIST = "list"
}

/**
 * Gallery sort: each dimension has ascending (↑) and descending (↓).
 * Ascending date-added is oldest first; descending is newest first.
 */
type GallerySortBy =
    | "languageAsc"
    | "languageDesc"
    | "titleAsc"
    | "titleDesc"
    | "yearAsc"
    | "yearDesc"
    | "dateAddedAsc"
    | "dateAddedDesc";

/** Gallery/list section grouping. */
type GroupByOption = "none" | "language" | "year" | "script" | "owned";

interface GroupNavMarker {
    label: string;
    documentTop: number;
}


interface LightboxLink {
    label: string,
    url: string,
    opensInLightbox?: boolean,
}
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
    /** ISO 15924 script subtags (e.g. Cyrl, Latn). */
    scripts?: string[],
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
    /** Split results into sections by language, year, script, or owned (none = flat). */
    groupBy: GroupByOption,
    /** User toggle: show/hide right-hand navigator in gallery. */
    showGroupNavigator: boolean,
    groupNavMarkers: GroupNavMarker[],
    activeGroupNavLabel: string | null,
    groupNavProgress: number,
    /** Brief scroll / image-decode feedback so the viewport does not read as “empty”. */
    resultsScrollCatchUp: boolean,
    /** Bottom floating affordance once the results section has been scrolled down. */
    showResultsScrollTopButton: boolean,
    /** Reveals the floating scroll-to-top affordance only when pointer is close. */
    resultsScrollTopButtonPointerNear: boolean,
    /** Global tooltip visibility toggle controlled from fixed footer. */
    tooltipsEnabled: boolean,
    /** Bumps to remount tooltip components and dismiss visible tooltips. */
    tooltipDismissNonce: number,
    /** After ESC, keep this image tooltip suppressed until pointer leaves that image. */
    tooltipHoverLockedImageKey: string | null,
    /** Hover-show delay for image tooltips in ms. Default 600; range 0–1800. */
    tooltipDelayMs: number,
    /** Active large image shown in the lightbox, if any. */
    lightboxImage: { url: string; title: string; links: LightboxLink[]; troveItem: TroveItem | null } | null,
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

const SCROLL_CATCH_UP_SHOW_DELAY_MS = 1500;
const SCROLL_CATCH_UP_SETTLE_DEBOUNCE_MS = 320;


class Showcase extends React.Component<ShowcaseProps, ShowcaseState> {
    private groupSectionRefs = new Map<string, HTMLElement>();
    private groupNavButtonRefs = new Map<string, HTMLButtonElement>();
    private groupNavBodyRef = React.createRef<HTMLDivElement>();
    private renderedGroupLabels: string[] = [];
    private groupMeasureRafId: number | null = null;
    private groupMeasureTimeoutId: number | null = null;
    private scrollRafId: number | null = null;
    private searchResultsRef = React.createRef<HTMLDivElement>();
    private resultsScrollTopDockRef = React.createRef<HTMLDivElement>();
    private scrollCatchGen = 0;
    private scrollCatchDebounceId: number | null = null;
    private scrollCatchShowDelayId: number | null = null;
    private resultsScrollCatchSpinnerActive = false;
    private lastPointerClientPos: {x: number; y: number} | null = null;
    private currentHoveredImageTooltipKey: string | null = null;

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
            gallerySortBy: "titleAsc",
            listSortColumn: null,
            listSortAsc: true,
            onlyMultilingualEditions: false,
            groupBy: "none",
            showGroupNavigator: true,
            groupNavMarkers: [],
            activeGroupNavLabel: null,
            groupNavProgress: 0,
            resultsScrollCatchUp: false,
            showResultsScrollTopButton: false,
            resultsScrollTopButtonPointerNear: false,
            tooltipsEnabled: false,
            tooltipDismissNonce: 0,
            tooltipHoverLockedImageKey: null,
            tooltipDelayMs: 500,
            lightboxImage: null,
        }
    }

    componentDidMount() {
        window.addEventListener("scroll", this.onWindowScroll, {passive: true});
        window.addEventListener("resize", this.onWindowResize);
        window.addEventListener("mousemove", this.onWindowMouseMove, {passive: true});
        window.addEventListener("keydown", this.onWindowKeyDown);
        this.updateResultsScrollTopButtonVisibility();
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
                    item.littlePrinceItem.lumpOfText = this.searchableText(item, langIsoMaps);
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

    componentDidUpdate(prevProps: ShowcaseProps, prevState: ShowcaseState) {
        if (
            prevState.displayedTroveItems !== this.state.displayedTroveItems ||
            prevState.viewMode !== this.state.viewMode
        ) {
            this.updateResultsScrollTopButtonVisibility();
        }

        const navRelevantChange =
            prevState.displayedTroveItems !== this.state.displayedTroveItems ||
            prevState.groupBy !== this.state.groupBy ||
            prevState.viewMode !== this.state.viewMode ||
            prevState.gallerySortBy !== this.state.gallerySortBy ||
            prevState.showGroupNavigator !== this.state.showGroupNavigator;

        if (navRelevantChange) {
            if (this.isGroupNavigatorEnabled()) {
                this.scheduleGroupNavigatorMeasure();
            } else if (
                this.state.groupNavMarkers.length > 0 ||
                this.state.activeGroupNavLabel != null ||
                this.state.groupNavProgress !== 0
            ) {
                this.groupNavButtonRefs.clear();
                this.setState({
                    groupNavMarkers: [],
                    activeGroupNavLabel: null,
                    groupNavProgress: 0,
                });
            }
        }

        if (
            this.isGroupNavigatorEnabled() &&
            this.state.activeGroupNavLabel != null &&
            prevState.activeGroupNavLabel !== this.state.activeGroupNavLabel
        ) {
            const label = this.state.activeGroupNavLabel;
            window.requestAnimationFrame(() => this.maybeScrollActiveNavItemIntoView(label));
        }
    }

    /** Keep the active label visible inside the scrollable nav column without fighting the user. */
    private maybeScrollActiveNavItemIntoView(label: string) {
        const btn = this.groupNavButtonRefs.get(label);
        if (btn == null) {
            return;
        }
        const body = this.groupNavBodyRef.current;
        if (body == null) {
            btn.scrollIntoView({block: "nearest", inline: "nearest"});
            return;
        }
        const br = body.getBoundingClientRect();
        const r = btn.getBoundingClientRect();
        if (r.top < br.top || r.bottom > br.bottom) {
            btn.scrollIntoView({block: "nearest", inline: "nearest"});
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onWindowScroll);
        window.removeEventListener("resize", this.onWindowResize);
        window.removeEventListener("mousemove", this.onWindowMouseMove);
        window.removeEventListener("keydown", this.onWindowKeyDown);
        if (this.groupMeasureRafId != null) {
            window.cancelAnimationFrame(this.groupMeasureRafId);
            this.groupMeasureRafId = null;
        }
        if (this.groupMeasureTimeoutId != null) {
            window.clearTimeout(this.groupMeasureTimeoutId);
            this.groupMeasureTimeoutId = null;
        }
        if (this.scrollRafId != null) {
            window.cancelAnimationFrame(this.scrollRafId);
            this.scrollRafId = null;
        }
        if (this.scrollCatchDebounceId != null) {
            window.clearTimeout(this.scrollCatchDebounceId);
            this.scrollCatchDebounceId = null;
        }
        if (this.scrollCatchShowDelayId != null) {
            window.clearTimeout(this.scrollCatchShowDelayId);
            this.scrollCatchShowDelayId = null;
        }
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

                        <div ref={this.searchResultsRef} className="search-results" style={{width: "100%"}}>
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
                                {GROUP_BY_ENABLED && this.renderGroupBySelect()}
                                {this.state.viewMode === ViewMode.GALLERY && this.renderGallerySortSelect()}
                                {this.renderViewModeToggle()}
                                {this.state.viewMode === ViewMode.GALLERY && this.renderGroupNavToggle()}
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
                    {this.renderScrollCatchUpOverlay()}
                </div>
                {this.renderTooltipToggleFooter()}
                {this.renderLightbox()}
            </div>
        );
    }

    private renderTooltipToggleFooter() {
        const enabled = this.state.tooltipsEnabled;
        const footerVisible = this.state.resultsScrollTopButtonPointerNear;
        return (
            <footer className={`showcase-tooltip-footer${footerVisible ? " is-visible" : ""}`} aria-label="Results controls">
                <div className="showcase-tooltip-footer__inner">
                    <div className="showcase-tooltip-controls">
                        <button
                            type="button"
                            className="showcase-tooltip-footer__button"
                            onClick={() => this.toggleTooltipsEnabled()}
                            aria-pressed={!enabled}
                            title={enabled ? "Disable tooltips" : "Enable tooltips"}
                        >
                            {enabled ? "Disable tooltips" : "Enable tooltips"}
                        </button>
                        {enabled && (
                            <label className="showcase-tooltip-delay-label">
                                <span>Delay</span>
                                <input
                                    type="range"
                                    className="showcase-tooltip-delay-slider"
                                    min={0}
                                    max={1000}
                                    step={50}
                                    value={this.state.tooltipDelayMs}
                                    onChange={(e) => this.setState({tooltipDelayMs: Number(e.target.value)})}
                                    aria-label="Tooltip delay"
                                />
                                <span className="showcase-tooltip-delay-value">{this.state.tooltipDelayMs}ms</span>
                            </label>
                        )}
                    </div>
                    {this.renderResultsScrollTopButton(true)}
                </div>
            </footer>
        );
    }

    private renderLightbox() {
        const image = this.state.lightboxImage;
        if (image == null) {
            return null;
        }
        return (
            <div
                className="showcase-lightbox"
                role="dialog"
                aria-modal="true"
                aria-label={image.title ? `Large image: ${image.title}` : "Large image"}
                onClick={() => this.closeLightbox()}
            >
                <div className="showcase-lightbox__chrome">
                    <button
                        type="button"
                        className="showcase-lightbox__close"
                        onClick={(event) => {
                            event.stopPropagation();
                            this.closeLightbox();
                        }}
                        aria-label="Close large image"
                        title="Close"
                    >
                        ×
                    </button>
                </div>
                <div
                    className="showcase-lightbox__content"
                    onClick={(event) => event.stopPropagation()}
                >
                    <div className="showcase-lightbox__media-column">
                        <img
                            className="showcase-lightbox__image"
                            src={image.url}
                            alt={image.title}
                        />
                        {image.links.length > 0 && (
                            <div className="showcase-lightbox__links">
                                {image.links.map((link) =>
                                    link.opensInLightbox ? (
                                        <button
                                            key={`${image.url}-${link.label}-${link.url}`}
                                            type="button"
                                            className="showcase-lightbox__link-button"
                                            onClick={() => this.openLightbox(link.url, link.label, image.links, image.troveItem)}
                                        >
                                            {link.label}
                                        </button>
                                    ) : (
                                        <a
                                            key={`${image.url}-${link.label}-${link.url}`}
                                            className="showcase-lightbox__link-button"
                                            href={link.url}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            {link.label}
                                        </a>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                    {image.troveItem != null && (
                        <div className="showcase-lightbox__details">
                            {this.renderTroveItemTextDetails(image.troveItem)}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    private openLightbox(url: string, title: string, links: LightboxLink[] = [], troveItem: TroveItem | null = null) {
        this.setState({lightboxImage: {url, title, links, troveItem}});
    }

    private closeLightbox() {
        if (this.state.lightboxImage == null) {
            return;
        }
        this.setState({lightboxImage: null});
    }

    /** Returns tooltip enter-transition duration (ms), logarithmically scaled with delay.
     *  delay=0 → 0ms (instant); delay=1800 → ~225ms (MUI Grow default). */
    private tooltipTransitionTimeout(): number {
        const delay = this.state.tooltipDelayMs;
        if (delay === 0) return 0;
        return Math.round(225 * Math.log(1 + delay) / Math.log(1 + 1000));
    }

    private toggleTooltipsEnabled() {
        this.setState((prev) => {
            const nextEnabled = !prev.tooltipsEnabled;
            return {
                tooltipsEnabled: nextEnabled,
                tooltipDismissNonce: prev.tooltipDismissNonce + (nextEnabled ? 0 : 1),
                tooltipHoverLockedImageKey: null,
            };
        });
    }

    private updateResultsScrollTopButtonVisibility() {
        const root = this.searchResultsRef.current;
        let show = false;
        if (root != null && this.state.displayedTroveItems.length > 0) {
            const rect = root.getBoundingClientRect();
            const scrolledPastResultsTop = rect.top < -24;
            const resultsStillOnScreen = rect.bottom > window.innerHeight * 0.2;
            show = scrolledPastResultsTop && resultsStillOnScreen;
        }
        if (show !== this.state.showResultsScrollTopButton) {
            this.setState({ showResultsScrollTopButton: show });
        }
    }

    private updateResultsScrollTopButtonPointerProximity(_clientX: number, clientY: number) {
        const near = clientY >= window.innerHeight - 100;
        if (near !== this.state.resultsScrollTopButtonPointerNear) {
            this.setState({resultsScrollTopButtonPointerNear: near});
        }
    }

    private scrollResultsToTop() {
        const root = this.searchResultsRef.current;
        if (root == null) {
            return;
        }
        const top = Math.max(0, window.scrollY + root.getBoundingClientRect().top - 10);
        window.scrollTo({top, behavior: "smooth"});
    }

    private renderResultsScrollTopButton(inFooter = false) {
        if (!this.state.showResultsScrollTopButton) {
            return null;
        }
        const visible = this.state.resultsScrollTopButtonPointerNear;
        const dockClass = inFooter
            ? `results-scroll-top-dock in-footer${visible ? " is-visible" : ""}`
            : `results-scroll-top-dock${visible ? " is-visible" : ""}`;
        return (
            <div
                ref={this.resultsScrollTopDockRef}
                className={dockClass}
            >
                <button
                    type="button"
                    className="results-scroll-top-button"
                    onClick={() => this.scrollResultsToTop()}
                    aria-label="Scroll result set to top"
                    title="Back to top"
                    tabIndex={visible ? 0 : -1}
                    aria-hidden={!visible}
                >
                    <KeyboardArrowUp fontSize="small" />
                </button>
            </div>
        );
    }

    private onWindowMouseMove = (event: MouseEvent) => {
        this.lastPointerClientPos = {x: event.clientX, y: event.clientY};
        this.updateResultsScrollTopButtonPointerProximity(event.clientX, event.clientY);
    };

    private onWindowKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") {
            return;
        }
        if (this.state.lightboxImage != null) {
            this.closeLightbox();
            return;
        }
        this.setState((prev) => ({
            tooltipDismissNonce: prev.tooltipDismissNonce + 1,
            tooltipHoverLockedImageKey: this.currentHoveredImageTooltipKey,
        }));
    };

    private onImageTooltipMouseEnter(imageKey: string) {
        this.currentHoveredImageTooltipKey = imageKey;
    }

    private onImageTooltipMouseLeave(imageKey: string) {
        if (this.currentHoveredImageTooltipKey === imageKey) {
            this.currentHoveredImageTooltipKey = null;
        }
        if (this.state.tooltipHoverLockedImageKey === imageKey) {
            this.setState({tooltipHoverLockedImageKey: null});
        }
    }

    private noteScrollCatchUpActivity() {
        if (this.state.displayedTroveItems.length === 0) {
            return;
        }
        this.scrollCatchGen++;
        const scheduledFor = this.scrollCatchGen;
        if (!this.resultsScrollCatchSpinnerActive && this.scrollCatchShowDelayId == null) {
            this.scrollCatchShowDelayId = window.setTimeout(() => {
                this.scrollCatchShowDelayId = null;
                if (scheduledFor !== this.scrollCatchGen || this.resultsScrollCatchSpinnerActive) {
                    return;
                }
                this.resultsScrollCatchSpinnerActive = true;
                this.setState({resultsScrollCatchUp: true});
            }, SCROLL_CATCH_UP_SHOW_DELAY_MS);
        }
        if (this.scrollCatchDebounceId != null) {
            window.clearTimeout(this.scrollCatchDebounceId);
        }
        this.scrollCatchDebounceId = window.setTimeout(() => {
            this.scrollCatchDebounceId = null;
            if (scheduledFor !== this.scrollCatchGen) {
                return;
            }
            void this.whenVisibleImagesSettled().then(() => {
                if (scheduledFor !== this.scrollCatchGen) {
                    return;
                }
                if (this.scrollCatchShowDelayId != null) {
                    window.clearTimeout(this.scrollCatchShowDelayId);
                    this.scrollCatchShowDelayId = null;
                }
                this.resultsScrollCatchSpinnerActive = false;
                if (this.state.resultsScrollCatchUp) {
                    this.setState({resultsScrollCatchUp: false});
                }
            });
        }, SCROLL_CATCH_UP_SETTLE_DEBOUNCE_MS);
    }

    private whenVisibleImagesSettled(): Promise<void> {
        const root = this.searchResultsRef.current;
        if (root == null) {
            return Promise.resolve();
        }
        const imgs = Array.from(root.querySelectorAll<HTMLImageElement>("img"));
        const margin = Math.round(window.innerHeight * 0.5);
        const vTop = -margin;
        const vBottom = window.innerHeight + margin;
        const visiblePending = imgs.filter((img) => {
            const r = img.getBoundingClientRect();
            if (r.bottom < vTop || r.top > vBottom) {
                return false;
            }
            return !img.complete;
        });
        if (visiblePending.length === 0) {
            return Promise.resolve();
        }
        return Promise.all(
            visiblePending.map(
                (img) =>
                    new Promise<void>((resolve) => {
                        const done = () => resolve();
                        img.addEventListener("load", done, {once: true});
                        img.addEventListener("error", done, {once: true});
                    }),
            ),
        ).then(() => undefined);
    }

    private renderScrollCatchUpOverlay() {
        if (!this.state.resultsScrollCatchUp) {
            return null;
        }
        return (
            <div
                className="showcase-scroll-catchup"
                style={{
                    position: "fixed",
                    left: 0,
                    right: 0,
                    bottom: 86,
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: "none",
                    zIndex: 1200,
                }}
            >
                <div
                    role="status"
                    aria-live="polite"
                    aria-label="Loading covers"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "10px 14px",
                        borderRadius: 999,
                        backgroundColor: "rgba(242, 242, 242, 0.94)",
                        boxShadow: "0 1px 6px rgba(0, 0, 0, 0.12)",
                    }}
                >
                    <CircularProgress size={26} thickness={4} color="primary" />
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
        const newFocusState = e.target.value;
        console.log(`focus is ${newFocusState}`);
        const groupByOwnedDisabled =
            newFocusState === FocusState.OWNED || newFocusState === FocusState.WANTED;
        this.setState((prev) => ({
            focusState: newFocusState,
            groupBy:
                groupByOwnedDisabled && prev.groupBy === "owned" ? "none" : prev.groupBy,
        }));
        this.setFocus(newFocusState);
        this.search(this.state.searchText, newFocusState);
    }

    private onCaptionModeChanged(e: React.ChangeEvent<{ name?: string; value: unknown }>) {
        this.setState({captionMode: e.target.value as CaptionMode});
    }

    private setViewMode(mode: ViewMode) {
        this.setState({viewMode: mode});
    }

    private gallerySortParts(by: GallerySortBy): {
        field: "language" | "title" | "year" | "dateAdded";
        asc: boolean;
    } {
        switch (by) {
            case "languageAsc":
                return {field: "language", asc: true};
            case "languageDesc":
                return {field: "language", asc: false};
            case "titleAsc":
                return {field: "title", asc: true};
            case "titleDesc":
                return {field: "title", asc: false};
            case "yearAsc":
                return {field: "year", asc: true};
            case "yearDesc":
                return {field: "year", asc: false};
            case "dateAddedAsc":
                return {field: "dateAdded", asc: true};
            case "dateAddedDesc":
                return {field: "dateAdded", asc: false};
            default:
                return {field: "title", asc: true};
        }
    }

    private renderGallerySortSelect() {
        return (
            <FormControl variant="outlined" style={{minWidth: 240, margin: 0}}>
                <InputLabel id="showcase-gallery-sort-label">Sort gallery by</InputLabel>
                <Select
                    labelId="showcase-gallery-sort-label"
                    value={this.state.gallerySortBy}
                    onChange={(e) =>
                        this.setState({gallerySortBy: e.target.value as GallerySortBy})
                    }
                    label="Sort gallery by"
                >
                    <MenuItem value="languageAsc">Language ↑</MenuItem>
                    <MenuItem value="languageDesc">Language ↓</MenuItem>
                    <MenuItem value="titleAsc">Title ↑</MenuItem>
                    <MenuItem value="titleDesc">Title ↓</MenuItem>
                    <MenuItem value="yearAsc">Year ↑</MenuItem>
                    <MenuItem value="yearDesc">Year ↓</MenuItem>
                    <MenuItem value="dateAddedAsc">Date added ↑</MenuItem>
                    <MenuItem value="dateAddedDesc">Date added ↓</MenuItem>
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
        const s = String(raw).trim();
        // Date-only strings: parse as UTC noon so ordering is consistent across browsers (Safari quirks).
        const ymd = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (ymd) {
            const t = Date.UTC(Number(ymd[1]), Number(ymd[2]) - 1, Number(ymd[3]), 12, 0, 0, 0);
            return Number.isNaN(t) ? null : t;
        }
        const t = Date.parse(s);
        return Number.isNaN(t) ? null : t;
    }

    private compareTroveItemsForGallery(a: TroveItem, b: TroveItem, by: GallerySortBy): number {
        const lpA = a.littlePrinceItem;
        const lpB = b.littlePrinceItem;
        const {field, asc} = this.gallerySortParts(by);
        let cmp = 0;
        switch (field) {
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
                    cmp = da - db;
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
        if (cmp !== 0) {
            return asc ? cmp : -cmp;
        }
        return (lpA.title ?? "").localeCompare(lpB.title ?? "", undefined, {numeric: true, sensitivity: "base"});
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
                    <MenuItem
                        value="owned"
                        disabled={
                            this.state.focusState === FocusState.OWNED ||
                            this.state.focusState === FocusState.WANTED
                        }
                    >
                        Owned
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }

    private renderGroupNavToggle() {
        // If both navigator features are disabled, don't show the toggle at all
        if (!GROUP_BY_ENABLED && !SORT_NAV_ENABLED) {
            return null;
        }
        const navCouldBeVisible = this.state.groupBy !== "none" || SORT_NAV_ENABLED;
        const shown = this.state.showGroupNavigator && navCouldBeVisible;
        const border = "1px solid rgba(0, 0, 0, 0.23)";
        const selectedBg = "rgba(63, 81, 181, 0.12)";
        const iconStyle: React.CSSProperties = {display: "block", width: 24, height: 24};
        return (
            <div
                role="group"
                aria-label="Toggle right navigator"
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
                <Tooltip
                    key={`right-nav-toggle-tooltip-${this.state.tooltipDismissNonce}`}
                    title={<span style={{fontSize: "0.98rem"}}>{shown ? "Hide Group Navigator" : "Show Group Navigator"}</span>}
                >
                    <IconButton
                        aria-label="Show right navigator"
                        aria-pressed={shown}
                        onClick={() => this.setState((prev) => ({showGroupNavigator: !prev.showGroupNavigator}))}
                        color={shown ? "primary" : "default"}
                        size="small"
                        disabled={!navCouldBeVisible}
                        style={{
                            borderRadius: 0,
                            padding: 8,
                            minWidth: 44,
                            backgroundColor: shown ? selectedBg : undefined,
                        }}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden focusable="false" style={iconStyle}>
                            <rect x="3" y="4" width="15" height="4" rx="2" fill="currentColor" />
                            <rect x="3" y="9" width="15" height="4" rx="2" fill="currentColor" />
                            <rect x="3" y="14" width="15" height="4" rx="2" fill="currentColor" />
                            <rect x="20" y="3" width="4" height="18" rx="2" fill="currentColor" />
                        </svg>
                    </IconButton>
                </Tooltip>
            </div>
        );
    }

    private isGroupNavigatorEnabled(): boolean {
        if (this.state.viewMode !== ViewMode.GALLERY) return false;
        if (!this.state.showGroupNavigator) return false;
        if (this.state.groupBy !== "none") return true;
        return SORT_NAV_ENABLED;
    }

    private sortNavGroupsForCurrentView(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        const {field} = this.gallerySortParts(this.state.gallerySortBy);
        const getLabel = (item: TroveItem): string => {
            const lp = item.littlePrinceItem;
            if (field === "language") {
                const label = this.effectiveLanguageLabel(item).trim();
                return label || "(unknown language)";
            }
            if (field === "title") {
                const first = (lp.title ?? "").trim().charAt(0).toUpperCase();
                return first || "#";
            }
            if (field === "year") {
                const raw = lp.year;
                return raw != null && String(raw).trim() !== "" ? String(raw).trim() : "(no year)";
            }
            // dateAdded — take the 4-digit year prefix
            const raw = lp["date-added"];
            return raw != null && String(raw).trim() !== ""
                ? String(raw).trim().substring(0, 4)
                : "(no date)";
        };
        const groups = new Map<string, TroveItem[]>();
        for (const item of items) {
            const label = getLabel(item);
            const existing = groups.get(label);
            if (existing) existing.push(item);
            else groups.set(label, [item]);
        }
        // Preserve order of first appearance (items are already sorted)
        const seen = new Set<string>();
        const result: Array<{label: string; items: TroveItem[]}> = [];
        for (const item of items) {
            const label = getLabel(item);
            if (!seen.has(label)) {
                seen.add(label);
                result.push({label, items: groups.get(label)!});
            }
        }
        return result;
    }

    private setGroupSectionRef = (label: string, el: HTMLElement | null) => {
        if (el == null) {
            this.groupSectionRefs.delete(label);
            return;
        }
        this.groupSectionRefs.set(label, el);
    };

    private setGroupNavButtonRef = (label: string, el: HTMLButtonElement | null) => {
        if (el == null) {
            this.groupNavButtonRefs.delete(label);
            return;
        }
        this.groupNavButtonRefs.set(label, el);
    };

    /** Live layout (e.g. images loading) moves section tops; keep scroll math in sync. */
    private refreshGroupNavMarkerTops(markers: GroupNavMarker[]): GroupNavMarker[] {
        const next = markers.map((m) => {
            const el = this.groupSectionRefs.get(m.label);
            if (el == null) {
                return m;
            }
            return {
                label: m.label,
                documentTop: window.scrollY + el.getBoundingClientRect().top,
            };
        });
        return next.slice().sort((a, b) => a.documentTop - b.documentTop);
    }

    private onWindowResize = () => {
        this.updateResultsScrollTopButtonVisibility();
        if (!this.isGroupNavigatorEnabled()) {
            return;
        }
        this.scheduleGroupNavigatorMeasure();
    };

    private onWindowScroll = () => {
        this.updateResultsScrollTopButtonVisibility();
        this.noteScrollCatchUpActivity();
        if (!this.isGroupNavigatorEnabled()) {
            return;
        }
        if (this.scrollRafId != null) {
            return;
        }
        this.scrollRafId = window.requestAnimationFrame(() => {
            this.scrollRafId = null;
            this.updateNavigatorFromScroll();
        });
    };

    private scheduleGroupNavigatorMeasure() {
        if (this.groupMeasureRafId != null) {
            window.cancelAnimationFrame(this.groupMeasureRafId);
        }
        this.groupMeasureRafId = window.requestAnimationFrame(() => {
            this.groupMeasureRafId = null;
            this.measureGroupNavigator();
        });
        if (this.groupMeasureTimeoutId != null) {
            window.clearTimeout(this.groupMeasureTimeoutId);
        }
        // Late pass catches image load reflow so marker spacing stays accurate.
        this.groupMeasureTimeoutId = window.setTimeout(() => {
            this.groupMeasureTimeoutId = null;
            this.measureGroupNavigator();
        }, 250);
    }

    /** Section anchors in document order (scroll position), used to pick the active label. */
    private buildGroupNavMarkersFromRefs(): GroupNavMarker[] {
        const measured: GroupNavMarker[] = this.renderedGroupLabels
            .map((label) => {
                const el = this.groupSectionRefs.get(label);
                if (el == null) {
                    return null;
                }
                return {
                    label,
                    documentTop: window.scrollY + el.getBoundingClientRect().top,
                };
            })
            .filter((m): m is GroupNavMarker => m != null);
        measured.sort((a, b) => a.documentTop - b.documentTop);
        return measured;
    }

    /** Which section header is at or above the focal line (~upper third of the viewport). */
    private computeActiveGroupLabelFromMarkers(markers: GroupNavMarker[]): string | null {
        if (markers.length === 0) {
            return null;
        }
        const focusLine = window.scrollY + window.innerHeight * 0.35;
        let activeLabel = markers[0].label;
        for (const marker of markers) {
            if (marker.documentTop <= focusLine) {
                activeLabel = marker.label;
            } else {
                break;
            }
        }
        return activeLabel;
    }

    /**
     * Rail dot position along the sidebar: match the active label's index in the nav list.
     * (Using scroll distance in the main document made the dot drift away from the letter
     * buttons, which are evenly spaced in the rail column.)
     */
    private progressForActiveLabel(activeLabel: string | null): number {
        const labels = this.renderedGroupLabels;
        if (activeLabel == null || labels.length === 0) {
            return 0;
        }
        if (labels.length === 1) {
            return 0;
        }
        const idx = labels.indexOf(activeLabel);
        if (idx < 0) {
            return 0;
        }
        return idx / (labels.length - 1);
    }

    private updateNavigatorFromScroll() {
        if (!this.isGroupNavigatorEnabled() || this.renderedGroupLabels.length === 0) {
            return;
        }
        const markers = this.buildGroupNavMarkersFromRefs();
        if (markers.length === 0) {
            return;
        }
        const fresh = this.refreshGroupNavMarkerTops(markers);
        const activeGroupNavLabel = this.computeActiveGroupLabelFromMarkers(fresh);
        const groupNavProgress = this.progressForActiveLabel(activeGroupNavLabel);
        if (
            activeGroupNavLabel !== this.state.activeGroupNavLabel ||
            Math.abs(groupNavProgress - this.state.groupNavProgress) > 0.01
        ) {
            this.setState({activeGroupNavLabel, groupNavProgress});
        }
    }

    private measureGroupNavigator() {
        if (!this.isGroupNavigatorEnabled() || this.renderedGroupLabels.length === 0) {
            if (this.state.groupNavMarkers.length > 0 || this.state.activeGroupNavLabel != null) {
                this.setState({
                    groupNavMarkers: [],
                    activeGroupNavLabel: null,
                    groupNavProgress: 0,
                });
            }
            return;
        }

        const measured = this.buildGroupNavMarkersFromRefs();

        if (measured.length === 0) {
            return;
        }

        const activeGroupNavLabel = this.computeActiveGroupLabelFromMarkers(measured);
        const groupNavProgress = this.progressForActiveLabel(activeGroupNavLabel);
        this.setState({groupNavMarkers: measured, activeGroupNavLabel, groupNavProgress});
    }

    private scrollToGroup(label: string) {
        const el = this.groupSectionRefs.get(label);
        if (el == null) {
            return;
        }
        const top = window.scrollY + el.getBoundingClientRect().top - 12;
        window.scrollTo({top, behavior: "smooth"});
        this.setState({
            activeGroupNavLabel: label,
            groupNavProgress: this.progressForActiveLabel(label),
        });
    }

    private renderGroupMarginNavigator(grouped: Array<{label: string; items: TroveItem[]}>) {
        if (!this.isGroupNavigatorEnabled() || grouped.length === 0) {
            return null;
        }
        
        // Compute the maximum width needed to fit the longest label + count without wrapping
        // Estimate: ~5.2px per character at 0.84rem font-size (empirical)
        const maxLabelWidth = Math.max(
            ...grouped.map((group) => {
                const renderedText = `${group.label} (${group.items.length})`;
                return renderedText.length * 5.2 + 12; // +12 for padding/margin buffer
            })
        );
        const navBodyStyle: React.CSSProperties = {
            maxWidth: `min(${maxLabelWidth}px, 300px)`,
        };
        
        return (
            <aside className="group-margin-nav" aria-label="Group navigator">
                <div className="group-margin-nav__shell">
                    <div className="group-margin-nav__rail-column" aria-hidden>
                        <div className="group-margin-nav__rail" />
                        <div
                            className="group-margin-nav__progress"
                            style={{top: `${this.state.groupNavProgress * 100}%`}}
                        />
                    </div>
                    <div ref={this.groupNavBodyRef} className="group-margin-nav__body" style={navBodyStyle}>
                        {grouped.map((group) => {
                            const isActive = this.state.activeGroupNavLabel === group.label;
                            return (
                                <button
                                    key={`group-nav-${group.label}`}
                                    ref={(el) => this.setGroupNavButtonRef(group.label, el)}
                                    type="button"
                                    className={`group-margin-nav__item${isActive ? " is-active" : ""}`}
                                    onClick={() => this.scrollToGroup(group.label)}
                                    title={`Jump to ${group.label}`}
                                    aria-label={`Jump to ${group.label}`}
                                >
                                    <span>{group.label}</span>{" "}
                                    <span className="group-margin-nav__count">({group.items.length})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </aside>
        );
    }

    /** Count of distinct non-empty 639-3 `lang` codes across langPairs (case-insensitive). */
    /**
     * Collection semantics:
     * - missing/empty `owned` defaults to true (Owned)
     * - explicit `false` (string/boolean) is not owned (Looking For)
     */
    private editionOwnedDefaultTrue(lp: Pick<TroveItemDetails, "owned">): boolean {
        if (lp.owned == null) {
            return true;
        }
        const owned = String(lp.owned).trim();
        return (owned === "" || owned === "true");
    }

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

    private scriptGroupOrDetailLabel(
        littlePrinceItem: TroveItemDetails,
        maps: LangIsoMaps | null,
    ): string {
        const s = littlePrinceItem.scripts;
        if (s != null && s.length > 0) {
            const fromIso = displayForIso15924Scripts(s, maps);
            if (fromIso.trim() !== "") {
                return fromIso;
            }
        }
        const raw = littlePrinceItem.script;
        return raw != null && String(raw).trim() !== "" ? String(raw).trim() : "(script N/A)";
    }

    private scriptGroupLabelsForItem(
        littlePrinceItem: TroveItemDetails,
        maps: LangIsoMaps | null,
    ): string[] {
        const scripts = littlePrinceItem.scripts
            ?.map((s) => String(s ?? "").trim())
            .filter((s) => s !== "") ?? [];
        const labels: string[] = [];
        const seen = new Set<string>();
        const pushLabel = (label: string | null | undefined) => {
            if (label == null) {
                return;
            }
            const trimmed = String(label).trim();
            if (trimmed === "" || seen.has(trimmed)) {
                return;
            }
            seen.add(trimmed);
            labels.push(trimmed);
        };

        // Rule: if there are several `scripts[]` entries, group only by each script code display label.
        if (scripts.length > 1) {
            for (const code of scripts) {
                pushLabel(nameFor15924(code, maps));
            }
        } else {
            // Rule: otherwise group by `script`, plus any `scripts[]` display label if present.
            pushLabel(littlePrinceItem.script);
            if (scripts.length === 1) {
                pushLabel(nameFor15924(scripts[0], maps));
            }
        }

        if (labels.length === 0) {
            return ["(script N/A)"];
        }
        return labels;
    }

    private groupItemsByScript(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        const maps = this.state.langIsoMaps;
        const groups = new Map<string, TroveItem[]>();
        for (const item of items) {
            const labels = this.scriptGroupLabelsForItem(item.littlePrinceItem, maps);
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

    private groupItemsByOwned(items: TroveItem[]): Array<{label: string; items: TroveItem[]}> {
        const ownedGroup: TroveItem[] = [];
        const lookingGroup: TroveItem[] = [];
        for (const item of items) {
            if (this.editionOwnedDefaultTrue(item.littlePrinceItem)) {
                ownedGroup.push(item);
            } else {
                lookingGroup.push(item);
            }
        }
        const out: Array<{label: string; items: TroveItem[]}> = [];
        if (ownedGroup.length > 0) {
            out.push({label: "Owned", items: ownedGroup});
        }
        if (lookingGroup.length > 0) {
            out.push({label: "Looking For", items: lookingGroup});
        }
        return out;
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
            case "owned":
                return this.groupItemsByOwned(items);
            default:
                return [{label: "", items}];
        }
    }

    private renderGalleryView() {
        const items = this.sortItemsForGallery(this.state.displayedTroveItems);
        this.renderedGroupLabels = [];
        if (this.state.groupBy === "none") {
            if (!SORT_NAV_ENABLED || !this.state.showGroupNavigator) {
                return (
                    <section className="gallery-grid">
                        {items.map((troveItem, index) =>
                            this.renderTroveItem(troveItem, this.stableTroveItemListKey(troveItem, index)),
                        )}
                    </section>
                );
            }
            const sortGroups = this.sortNavGroupsForCurrentView(items);
            if (sortGroups.length <= 1) {
                return (
                    <section className="gallery-grid">
                        {items.map((troveItem, index) =>
                            this.renderTroveItem(troveItem, this.stableTroveItemListKey(troveItem, index)),
                        )}
                    </section>
                );
            }
            this.renderedGroupLabels = sortGroups.map((g) => g.label);
            return (
                <div className="grouped-gallery-layout">
                    <div className="grouped-gallery-content">
                        <section className="gallery-grid">
                            {sortGroups.map((group) =>
                                group.items.map((troveItem, index) => {
                                    const key = `${group.label}::${this.stableTroveItemListKey(troveItem, index)}`;
                                    const rendered = this.renderTroveItem(troveItem, key);
                                    if (index === 0) {
                                        return (
                                            <div
                                                key={key}
                                                ref={(el) => this.setGroupSectionRef(group.label, el)}
                                            >
                                                {rendered}
                                            </div>
                                        );
                                    }
                                    return <React.Fragment key={key}>{rendered}</React.Fragment>;
                                })
                            )}
                        </section>
                    </div>
                    {this.renderGroupMarginNavigator(sortGroups)}
                </div>
            );
        }
        const grouped = this.groupItemsForView(this.state.displayedTroveItems).map((group) => ({
            label: group.label,
            items: this.sortItemsForGallery(group.items),
        }));
        this.renderedGroupLabels = grouped.map((group) => group.label);
        return (
            <div className="grouped-gallery-layout">
                <div className="grouped-gallery-content">
                {grouped.map((group) => (
                    <section
                        key={group.label}
                        style={{marginBottom: "16px"}}
                        ref={(el) => this.setGroupSectionRef(group.label, el)}
                    >
                        <h3 style={{margin: "6px 0 8px 0"}}>{group.label}</h3>
                        <section className="gallery-grid">
                            {group.items.map((troveItem, index) =>
                                this.renderTroveItem(
                                    troveItem,
                                    `${group.label}::${this.stableTroveItemListKey(troveItem, index)}`,
                                ),
                            )}
                        </section>
                    </section>
                ))}
                </div>
                {this.renderGroupMarginNavigator(grouped)}
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
                <Tooltip
                    key={`gallery-view-tooltip-${this.state.tooltipDismissNonce}`}
                    title={<span style={{fontSize: "0.98rem"}}>Gallery view</span>}
                >
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
                <Tooltip
                    key={`list-view-tooltip-${this.state.tooltipDismissNonce}`}
                    title={<span style={{fontSize: "0.98rem"}}>List view</span>}
                >
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
                pred2 = (troveItem) =>
                    pred1(troveItem) && this.editionOwnedDefaultTrue(troveItem.littlePrinceItem);
                break;

            case FocusState.WANTED:
                // console.log("WANTED")
                pred2 = (troveItem) =>
                    pred1(troveItem) && !this.editionOwnedDefaultTrue(troveItem.littlePrinceItem);
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
                pred2 = (troveItem) =>
                    pred1(troveItem) && this.editionOwnedDefaultTrue(troveItem.littlePrinceItem);
                break;

            case FocusState.WANTED:
                // console.log("WANTED")
                pred2 = (troveItem) =>
                    pred1(troveItem) && !this.editionOwnedDefaultTrue(troveItem.littlePrinceItem);
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

    private stableTroveItemListKey(troveItem: TroveItem, indexFallback: number): string {
        const lp = troveItem.littlePrinceItem;
        return (
            troveItem.polyglitStableRowKey ??
            (lp.lpid != null && String(lp.lpid) !== "" ? String(lp.lpid) : null) ??
            (lp.smallImageUrl != null && String(lp.smallImageUrl) !== "" ? String(lp.smallImageUrl) : null) ??
            `${lp.title ?? "item"}-${indexFallback}`
        );
    }

    private renderTroveItem(troveItem: TroveItem, reactListKey: string) {
        const hoverLocked = this.state.tooltipHoverLockedImageKey === reactListKey;
        return (
            <BigWhiteTooltip
                key={`${reactListKey}::tooltip-${this.state.tooltipDismissNonce}`}
                title={this.troveItemTooltipContents(troveItem)}
                disableHoverListener={!this.state.tooltipsEnabled || this.state.resultsScrollTopButtonPointerNear || hoverLocked}
                disableFocusListener={!this.state.tooltipsEnabled}
                disableTouchListener={!this.state.tooltipsEnabled}
                arrow
                interactive
                placement="right-start"
                enterDelay={this.state.tooltipDelayMs}
                enterNextDelay={this.state.tooltipDelayMs}
                TransitionProps={{timeout: this.tooltipTransitionTimeout()}}
            >
            <div
                className="thumbnail"
                onMouseEnter={() => this.onImageTooltipMouseEnter(reactListKey)}
                onMouseLeave={() => this.onImageTooltipMouseLeave(reactListKey)}
            >
                <button
                    type="button"
                    className="showcase-lightbox-trigger"
                    onClick={() => this.openLightbox(
                        troveItem.littlePrinceItem.largeImageUrl,
                        troveItem.littlePrinceItem.title,
                        this.lightboxLinksForTroveItem(troveItem),
                        troveItem,
                    )}
                    aria-label={`Open large image for ${troveItem.littlePrinceItem.title}`}
                >
                    <div style={{position: "relative"}}>
                        <img width="150" height={"100%"}
                             src={troveItem.littlePrinceItem.smallImageUrl}
                            // title={troveItem.littlePrinceItem.title}
                             alt={troveItem.littlePrinceItem.title}
                        />
                    </div>
                </button>
                {this.renderThumbnailCaption(troveItem)}
            </div>
        </BigWhiteTooltip>
        );
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
     * Letter runs in `s`, lowercased (for caption word matching). ASCII + Latin-1 supplement +
     * Latin extended-A/B + Cyrillic (no `u` / `\p{}` regex flag so ES5 TS target stays valid).
     */
    private captionLetterTokens(s: string): string[] {
        const m = s
            .toLowerCase()
            .match(/[a-z\u00c0-\u024f\u0400-\u04ff]+/g);
        return m ?? [];
    }

    /**
     * True when every language word (length ≥ 2 letters) appears as a whole word in `title`
     * (case-insensitive), e.g. "The Little Prince in Mongolian" + "Mongolian".
     */
    private titleCaptionIncludesAllLanguageWords(title: string, language: string): boolean {
        const langWords = this.captionLetterTokens(language).filter((w) => w.length >= 2);
        if (langWords.length === 0) {
            return false;
        }
        const titleWords = new Set(this.captionLetterTokens(title));
        return langWords.every((w) => titleWords.has(w));
    }

    /**
     * Gallery when `translation-title` is absent and captions are titles: plain `title` if it
     * already names the language; otherwise *title*, line break, then `language`.
     */
    private renderGalleryNoTranslationTitleCaption(troveItem: TroveItem) {
        const lp = troveItem.littlePrinceItem;
        const title = lp.title ?? "";
        const language = lp.language ?? "";
        if (!this.isPresent(language) || this.titleCaptionIncludesAllLanguageWords(title, language)) {
            return <div className="caption">{title}</div>;
        }
        return (
            <div className="caption">
                <em>{title}</em>
                <br />
                {language}
            </div>
        );
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
        if (this.state.viewMode === ViewMode.GALLERY && this.state.captionMode === CaptionMode.TITLES) {
            return this.renderGalleryNoTranslationTitleCaption(troveItem);
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
                                    const hoverLocked = this.state.tooltipHoverLockedImageKey === rowKey;
                                    return (
                                        <tr key={rowKey}>
                                            <td style={cellStyle}>
                                                <BigWhiteTooltip
                                                    key={`${rowKey}::tooltip-${this.state.tooltipDismissNonce}`}
                                                    title={this.troveItemTooltipContents(troveItem)}
                                                    disableHoverListener={
                                                        !this.state.tooltipsEnabled ||
                                                        this.state.resultsScrollTopButtonPointerNear ||
                                                        hoverLocked
                                                    }
                                                    disableFocusListener={!this.state.tooltipsEnabled}
                                                    disableTouchListener={!this.state.tooltipsEnabled}
                                                    arrow
                                                    interactive
                                                    placement="right-start"
                                                    enterDelay={this.state.tooltipDelayMs}
                                                    enterNextDelay={this.state.tooltipDelayMs}
                                                    TransitionProps={{timeout: this.tooltipTransitionTimeout()}}
                                                >
                                                    <button
                                                        type="button"
                                                        className="showcase-lightbox-trigger"
                                                        onClick={() => this.openLightbox(
                                                            lp.largeImageUrl,
                                                            lp.title,
                                                            this.lightboxLinksForTroveItem(troveItem),
                                                            troveItem,
                                                        )}
                                                        aria-label={`Open large image for ${lp.title}`}
                                                        onMouseEnter={() => this.onImageTooltipMouseEnter(rowKey)}
                                                        onMouseLeave={() => this.onImageTooltipMouseLeave(rowKey)}
                                                    >
                                                        <img
                                                            width="80"
                                                            height="100%"
                                                            src={lp.smallImageUrl}
                                                            alt={lp.title}
                                                            style={{display: "block"}}
                                                        />
                                                    </button>
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

        const rows = this.troveItemDetailRowsForTooltip(troveItem, fieldsInOrder);

        return <Grid container direction={"row"} spacing={2}>
            <Grid item container direction={"column"} justify={"center"}>
                {
                    <Grid item>
                        {this.renderPrimaryImageLink(troveItem)}
                    </Grid>
                }
                {
                    troveItem.littlePrinceItem.files?.map((filename, idx) => {
                        return <Grid item key={idx}>
                            {this.renderDocumentLink(filename, troveItem)}
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
                {this.renderTroveItemTooltipTextDetails(troveItem, rows)}
            </Grid>
        </Grid>
    }

    private troveItemDetailRowsForTooltip(troveItem: TroveItem, fieldsInOrder: string[]) {
        const createRow = (field: string | null, value: any) => ({field, value});

        return fieldsInOrder.map(field => {
            switch (field) {
                case 'language': {
                    const languageLine = this.constructLanguage(troveItem);
                    return createRow("Language", languageLine);
                }
                case 'translation-title':
                    return createRow("Title in translation", troveItem.littlePrinceItem["translation-title"])
                case "translation-title-transliterated":
                    return createRow(
                        "Title transliterated",
                        troveItem.littlePrinceItem["translation-title-transliterated"],
                    );
                case "script": {
                    const maps = this.state.langIsoMaps;
                    const lp = troveItem.littlePrinceItem;
                    const v = this.scriptGroupOrDetailLabel(lp, maps);
                    return v === "(script N/A)" ? null : createRow("Script", v);
                }
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
                case "lumpOfText":
                    return null;
                default:
                    return null;
            }
        }).filter(e => e != null && this.isPresent(e.value));
    }

    private troveItemDetailRows(troveItem: TroveItem, fieldsInOrder: string[]) {
        const createRow = (field: string | null, value: any) => ({field, value});

        return fieldsInOrder.map(field => {
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
                case "script": {
                    const maps = this.state.langIsoMaps;
                    const lp = troveItem.littlePrinceItem;
                    const v = this.scriptGroupOrDetailLabel(lp, maps);
                    return v === "(script N/A)" ? null : createRow("Script", v);
                }
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
                case "lumpOfText":
                    return null;
                default:
                    return null;
            }
        }).filter(e => e != null && this.isPresent(e.value));
    }

    private linkifyText(text: string): React.ReactNode {
        const parts = text.split(/(https?:\/\/[^\s<>"]+)/);
        if (parts.length === 1) return text;
        return parts.map((part, i) =>
            i % 2 === 1
                ? <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part}</a>
                : part
        );
    }

    private linkifyValue(value: React.ReactNode): React.ReactNode {
        return typeof value === 'string' ? this.linkifyText(value) : value;
    }

    private renderTroveItemTooltipTextDetails(troveItem: TroveItem, rows = this.troveItemDetailRowsForTooltip(troveItem, [
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
        "lumpOfText",
    ])) {
        return <div>
            <strong><i>{troveItem.littlePrinceItem.title}</i></strong>
            <p />
            {
            rows.map((row, rowIdx) => {
                    if (row?.field != null) return <span key={rowIdx}>
                        <strong>{row?.field}:</strong> {this.linkifyValue(row?.value)}<p/></span>
                    if (Array.isArray(row?.value)) {
                        return row?.value.map((word, idx) => {
                            return <span key={`${rowIdx}-${idx}`}>{this.linkifyValue(word)}<p/></span>;
                        });
                    }
                    return <span key={rowIdx}>{this.linkifyValue(row?.value)}</span>
                }
            )}
        </div>
    }

    private renderTroveItemTextDetails(troveItem: TroveItem, rows = this.troveItemDetailRows(troveItem, [
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
        "lumpOfText",
    ])) {
        return <div>
            <strong><i>{troveItem.littlePrinceItem.title}</i></strong>
            <p />
            {
            rows.map((row, rowIdx) => {
                    if (row?.field != null) return <span key={rowIdx}>
                        <strong>{row?.field}:</strong> {this.linkifyValue(row?.value)}<p/></span>
                    if (Array.isArray(row?.value)) {
                        return row?.value.map((word, idx) => {
                            return <span key={`${rowIdx}-${idx}`}>{this.linkifyValue(word)}<p/></span>;
                        });
                    }
                    return <span key={rowIdx}>{this.linkifyValue(row?.value)}</span>
                }
            )}
        </div>
    }

    private lightboxLinksForTroveItem(troveItem: TroveItem): LightboxLink[] {
        const links: LightboxLink[] = [];

        troveItem.littlePrinceItem.files?.forEach((filename) => {
            const [fileType] = this.iconFor(filename);
            links.push({
                label: fileType === "cover image" ? "Additional image" : fileType,
                url: filename,
                opensInLightbox: fileType === "cover image",
            });
        });

        if (troveItem.littlePrinceItem.lpid) {
            links.push({
                label: "Little Prince Foundation link",
                url: `https://www.petit-prince-collection.com/lang/show_livre.php?lang=en&id=${this.extractLpId(troveItem.littlePrinceItem.lpid)}`,
            });
        }

        if (troveItem.littlePrinceItem.tintenfassId) {
            links.push({
                label: "Edition Tintenfaß link",
                url: `https://editiontintenfass.de/en/catalog/${troveItem.littlePrinceItem.tintenfassId}`,
            });
        }

        return links;
    }

    private renderPrimaryImageLink(troveItem: TroveItem) {
        return <button
            type="button"
            className="showcase-lightbox-trigger"
            onClick={() => this.openLightbox(
                troveItem.littlePrinceItem.largeImageUrl,
                troveItem.littlePrinceItem.title,
                this.lightboxLinksForTroveItem(troveItem),
                troveItem,
            )}
            aria-label={`Open large image for ${troveItem.littlePrinceItem.title}`}
        >
            <SmallTooltip
                key={`cover-image-${troveItem.littlePrinceItem.largeImageUrl}-tooltip-${this.state.tooltipDismissNonce}`}
                title="Open large image"
                placement="left-end"
                disableHoverListener={!this.state.tooltipsEnabled}
                disableFocusListener={!this.state.tooltipsEnabled}
                disableTouchListener={!this.state.tooltipsEnabled}
            >
                <img style={{padding: 0, margin: 0, border: 0, boxShadow: "0", filter: "grayscale(50%)"}}
                     src={coverIcon}
                     width={"32px"} height={"32px"}
                     alt="Open large image"
                />
            </SmallTooltip>
        </button>
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
            <SmallTooltip
                key={`${fileType}-${file}-tooltip-${this.state.tooltipDismissNonce}`}
                title={`Open ${fileType} in new tab`}
                placement="left-end"
                disableHoverListener={!this.state.tooltipsEnabled}
                disableFocusListener={!this.state.tooltipsEnabled}
                disableTouchListener={!this.state.tooltipsEnabled}
            >
                <img style={{'padding': 0, 'margin': 0, 'border': 0, 'boxShadow': '0', 'filter': "grayscale(50%)"}}
                     src={icon}
                     width={"32px"} height={"32px"}
                     alt="Open"
                />
            </SmallTooltip>
        </a>
    }

    private renderDocumentLink(file: string, troveItem?: TroveItem) {
        let [fileType, icon] = this.iconFor(file)
        if (fileType === "cover image") {
            return <button
                type="button"
                className="showcase-lightbox-trigger"
                onClick={() => this.openLightbox(
                    file,
                    "Large image",
                    troveItem != null ? this.lightboxLinksForTroveItem(troveItem) : [],
                    troveItem ?? null,
                )}
                aria-label="Open large image"
            >
                <SmallTooltip
                    key={`${fileType}-${file}-tooltip-${this.state.tooltipDismissNonce}`}
                    title="Open large image"
                    placement="left-end"
                    disableHoverListener={!this.state.tooltipsEnabled}
                    disableFocusListener={!this.state.tooltipsEnabled}
                    disableTouchListener={!this.state.tooltipsEnabled}
                >
                    <img style={{padding: 0, margin: 0, border: 0, boxShadow: "0", filter: "grayscale(50%)"}}
                         src={icon}
                         width={"32px"} height={"32px"}
                         alt="Open large image"
                    />
                </SmallTooltip>
            </button>
        }
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
        if (this.isPresent(acquiredFrom)) {
            return `from ${acquiredFrom}`
        }
        if (this.isPresent(dateAdded)) {
            return `on ${dateAdded}`
        }
        return null;
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
        if (this.editionOwnedDefaultTrue(littlePrinceItem)) {
            return null;
        }
        return "I am looking for this book! If you want to trade or just want to help me find it, please get in touch: carl@dragnon.com";
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

    private searchableText(item: TroveItem, maps: LangIsoMaps | null) {
        let lpItem = item.littlePrinceItem;
        const scriptsBlurb = displayForIso15924Scripts(lpItem.scripts, maps);

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
${lpItem.scripts?.join(" ")}
${scriptsBlurb}
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
