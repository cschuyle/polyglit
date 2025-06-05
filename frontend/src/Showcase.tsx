import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import pdfIcon from "./images/pdf.png"
import documentIcon from "./images/document.png"
import coverIcon from "./images/lp-cover.jpg"
import audibookIcon from "./images/audiobook.png"
import lpfoundIcon from "./images/lp-found-fox.png"
import tintenfassIcon from "./images/tinten.png"

import {FormControlLabel, Grid, MenuItem, Select, TextField, Tooltip, withStyles} from "@material-ui/core";

interface TroveItemDetails {
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

interface TroveItem {
    littlePrinceItem: TroveItemDetails
}

function compareTroveItem(a: TroveItem, b: TroveItem) {
    if (a.littlePrinceItem.language >= b.littlePrinceItem.language) {
        return 1
    }
    return -1
}

interface Trove {
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
    FocusItemCount: number
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
            FocusItemCount: 0
        }
    }

    componentDidMount() {
        this.fetchTrove().then(trove => {
            console.log(`Got ${trove.items.length} Trove items`)

            this.setState({
                troveItems: trove.items
                    .map(item => {
                        item.littlePrinceItem.lumpOfText = this.searchableText(item)
                        // console.log("LUMP OF TEXT " + item.littlePrinceItem.lumpOfText)
                        return item
                    })
                    .sort(compareTroveItem)
            });
            this.setFocus(this.props.focusState)
            this.search("", this.props.focusState)
        })
    }

    fetchTrove() {
        return fetch(this.props.troveUrl)
            .then(res => {
                return res.json() as Promise<Trove>
            })
    }

    render() {
        return (
            <div id="main_content_wrap" className="outer">
                <div id="main_content" className="inner">
                    {/*<h1>{this.props.pageHeader}</h1>*/}
                    {/*<p>{this.props.pageSubtitle}</p>*/}

                    <span>
                        {this.state.focusState === FocusState.OWNED &&
                            <p>These are editions that I own. Use the dropdown and the search box to filter differently!</p>}
                        {this.state.focusState === FocusState.WANTED &&
                            <p>These are editions that I DO NOT HAVE. I'm looking for them. If you want to trade (or sell!), or just want to
                                help me find them, please get in
                                touch! <a href="mailto:carl@dragnon.com">carl@dragnon.com</a></p>}
                        {this.state.focusState === FocusState.DUPLICATES &&
                            <p>These are editions that I have EXTRAS to trade or sell. If you're interested, please
                                get in
                                touch! <a href="mailto:carl@dragnon.com">carl@dragnon.com</a></p>}
                        {this.state.focusState === FocusState.ALL &&
                            <p><b>NOTE:</b> These include editions that I own, as well as ones that I'm looking for.</p>}

                        <div>
                            <div style={{display: "flex"}}>
                                <div style={{width: "90%"}}>
                                    <TextField label="Search keywords"
                                               type="search" variant="outlined"
                                               style={{width: "100%"}}
                                               value={this.state.searchText}
                                               onChange={e => this.onSearchTextChanged(e)}
                                               placeholder="language, country, title, script, format ..."
                                    />
                                </div>
                                {this.props.showWantedCheckboxes &&
                                    <div style={{marginLeft: "20px"}}>
                                        <div style={{float: "left"}}>
                                            <FormControlLabel
                                                label=""
                                                control={
                                                    <Select
                                                        value={this.state.focusState}

                                                        onChange={(e: any) => this.onFocusStateChanged(e)}
                                                        color="primary"
                                                    >

                                                        <MenuItem value={FocusState.OWNED}>I have these</MenuItem>
                                                        <MenuItem value={FocusState.WANTED}>I want these</MenuItem>
                                                        <MenuItem value={FocusState.DUPLICATES}>To trade!</MenuItem>
                                                        <MenuItem value={FocusState.ALL}>All</MenuItem>
                                                    </Select>
                                                }
                                            />
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                        <p/>
                        <section>
                            Showing {this.state.displayedTroveItems.length} of {this.state.FocusItemCount} editions of {this.props.collectionTitle}.
                        </section>
                        <p/>
                        <section className="column">
                            {
                                this.state.displayedTroveItems.map((troveItem, index) => {
                                    return this.renderTroveItem(troveItem, index)
                                })
                            }
                        </section>
                    </span>
                </div>
            </div>
        );
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

    private setFocus(focusState: FocusState | undefined) {
        let focusFilteredItems = this.state.troveItems.filter(this.troveItemMatchesFocusPredicate(focusState));
        this.setState({
            focusItems: focusFilteredItems,
            FocusItemCount: focusFilteredItems.length
        })
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

        // Return the last condition in the accumulation above
        return pred3
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
                <a target="_blank" href={troveItem.littlePrinceItem.largeImageUrl}>
                    <div style={{position: "relative"}}>
                        <img width="150" height={"100%"}
                             src={troveItem.littlePrinceItem.smallImageUrl}
                            // title={troveItem.littlePrinceItem.title}
                             alt={troveItem.littlePrinceItem.title}
                        />
                    </div>
                </a>
                <div className="caption">{troveItem.littlePrinceItem.language}</div>
            </div>
        </BigWhiteTooltip>
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
                case 'language':
                    return createRow("Language", this.constructLanguage(troveItem))
                case 'translation-title':
                    return createRow("Title in translation", this.constructTranslationTitle(troveItem.littlePrinceItem))
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
                    <p/>{
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

    private isPresent(value: any | null | undefined): value is null | undefined {
        return !(value === null || value === undefined || value === '');
    }

    private constructTranslationTitle(troveItem: TroveItemDetails) {
        let translationTitle = troveItem['translation-title'];
        let transliterated = troveItem['translation-title-transliterated'];

        if (this.isPresent(translationTitle) && this.isPresent(transliterated)) {
            return `${translationTitle} [${transliterated}]`;
        }
        if (this.isPresent(transliterated)) {
            return `${transliterated}`;
        }
        if (this.isPresent(translationTitle)) {
            return `${translationTitle}`;
        }
        return null;
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
