import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import pdfIcon from "./images/pdf.png"
import documentIcon from "./images/document.png"
import coverIcon from "./images/lp-cover.jpg"
import audibookIcon from "./images/audiobook.png"

import {FormControlLabel, Grid, MenuItem, Select, TextField, Tooltip, withStyles} from "@material-ui/core";

interface TroveItem {
    littlePrinceItem: {
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
        files?: string[],
        format?: string,
        illustrator?: string,
        isbn13?: string,
        language: string,
        largeImageUrl: string,
        narrator?: string,
        publisher?: string,
        quantity?: number,
        smallImageUrl: string,
        title: string,
        translator?: string,
        year?: string,
        owned?: string
    }
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
    pageHeader: string,
    pageSubtitle: string,
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
                troveItems: trove.items.sort(compareTroveItem)
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
                    <h1>{this.props.pageHeader}</h1>
                    <p>{this.props.pageSubtitle}</p>

                    <span>
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
                            Showing {this.state.displayedTroveItems.length} of {this.state.FocusItemCount} editions of {this.props.collectionTitle}
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
            displayedTroveItems: this.state.troveItems.filter(this.troveItemMatchesPredicate(searchText, focusState))
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

        let pred1 = (_: TroveItem) => true

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

        // Condition: text search
        if (searchText) {
            searchText = searchText.toLowerCase()

            pred3 = (troveItem) => {
                let lpItem = troveItem.littlePrinceItem;
                if (!lpItem) {
                    return false
                }
                const response = pred2(troveItem)
                    && (
                        lpItem.language.toLowerCase().includes(searchText) ||
                        lpItem.title?.toLowerCase().includes(searchText) ||
                        lpItem.author?.toLowerCase().includes(searchText) ||
                        lpItem.format?.toLowerCase().includes(searchText) ||
                        lpItem.illustrator?.toLowerCase().includes(searchText) ||
                        lpItem.narrator?.toLowerCase().includes(searchText) ||
                        lpItem.publisher?.toLowerCase().includes(searchText) ||
                        lpItem.script?.toLowerCase().includes(searchText) ||
                        lpItem.translator?.toLowerCase().includes(searchText) ||

                        lpItem["language-spoken-in"]?.toLowerCase().includes(searchText) ||
                        lpItem["publication-country"]?.toLowerCase().includes(searchText) ||
                        lpItem["publication-location"]?.toLowerCase().includes(searchText) ||
                        lpItem["script-family"]?.toLowerCase().includes(searchText) ||
                        lpItem["search-words"]?.toLowerCase().includes(searchText) ||
                        lpItem["translation-title"]?.toLowerCase().includes(searchText) ||
                        lpItem["translation-title-transliterated"]?.toLowerCase().includes(searchText) ||

                        lpItem["comments"]?.join(" || ").toLowerCase().includes(searchText) ||
                        lpItem["tags"]?.join(" || ").toLowerCase().includes(searchText)
                    ) || false
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
            "comments"
        ]

        let createRow = (field: string | null, value: any) => ({field, value})

        let rows = fieldsInOrder.map(field => {
            switch (field) {
                case 'language':
                    return createRow("Language", this.constructLanguage(troveItem))
                case 'translation-title':
                    return createRow("Title in translation", this.constructTranslationTitle(troveItem))
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
            </Grid>
            <Grid item>
                <div>
                    <strong><i>{troveItem.littlePrinceItem.title}</i></strong>
                    <p/>{
                    rows.map((row) => {
                            if (row?.field != null) {
                                return <span><strong>{row?.field}:</strong> {row?.value}
                                    <p/>
                </span>
                            }
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

    private isPresent(value: any | null | undefined): value is null | undefined {
        return !(value === null || value === undefined || value === '');
    }

    private constructTranslationTitle(troveItem: TroveItem) {
        let translationTitle = troveItem.littlePrinceItem['translation-title'];
        let transliterated = troveItem.littlePrinceItem['translation-title-transliterated'];

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

    private renderDocumentLink(file: string) {
        let [fileType, icon] = this.iconFor(file)
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

    private constructPublicationBlurb(item: {
                                          title: string;
                                          largeImageUrl: string;
                                          language: string;
                                          smallImageUrl: string;
                                          format?: string;
                                          illustrator?: string;
                                          isbn13?: string;
                                          narrator?: string;
                                          "publication-country"?: string;
                                          "publication-location"?: string;
                                          publisher?: string;
                                          quantity?: number;
                                          translator?: string;
                                          year?: string;
                                          files?: string[];
                                          "translation-title"?: string;
                                          "translation-title-transliterated"?: string;
                                          "language-spoken-in"?: string;
                                          script?: string;
                                          tags?: string[];
                                      }
    ) {
        let publisher = item.publisher
        let publicationLocation = item['publication-location']
        let publicationCountry = item['publication-country']
        if (!(this.isPresent(publisher) || this.isPresent(publicationLocation) || this.isPresent(publicationCountry))) {
            return null
        }

        if (!this.isPresent(publisher) && !this.isPresent(publicationLocation)) {
            return `in ${publicationCountry}`
        }
        if (!this.isPresent(publisher) && !this.isPresent(publicationCountry)) {
            return `in ${publicationLocation}`
        }
        if (!this.isPresent(publicationLocation) && !this.isPresent(publicationCountry)) {
            return `by ${publisher}`
        }

        if (!this.isPresent(publisher)) {
            return `in ${publicationLocation}, ${publicationCountry}`
        }
        if (!this.isPresent(publicationLocation)) {
            return `by ${publisher} in ${publicationCountry}`
        }
        if (!this.isPresent(publicationCountry)) {
            return `by ${publisher} in ${publicationLocation}`
        }

        return `by ${publisher} in ${publicationLocation}, ${publicationCountry}`
    }

// TODO make URLs into links, and format dates
    private constructAquisitionBlurb(item: { "acquired-from"?: string, "date-added"?: string }) {
        let acquiredFrom = item["acquired-from"]
        let dateAcquired = item["date-added"]
        if (!(this.isPresent(acquiredFrom) || this.isPresent(dateAcquired))) {
            return null
        }
        if (this.isPresent(acquiredFrom) && this.isPresent(dateAcquired)) {
            return `from ${acquiredFrom} on ${dateAcquired}`
        }
        if (!this.isPresent(dateAcquired)) {
            return `from ${acquiredFrom}`
        }
        if (!this.isPresent(dateAcquired)) {
            return `on ${dateAcquired}`
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
            return "I am looking for this book! If you want to help me find it, please get in touch: carl@dragnon.com"
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
        if (filename.endsWith(".png") || filename.endsWith(".gif") || filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
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
}

export default Showcase;
