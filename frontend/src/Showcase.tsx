import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import pdfIcon from "./images/pdf.png"
import documentIcon from "./images/document.png"
import coverIcon from "./images/lp-cover.jpg"
import audibookIcon from "./images/audiobook.png"

import {Checkbox, FormControlLabel, Grid, TextField, Tooltip, withStyles} from "@material-ui/core";

interface TroveItem {
    littlePrinceItem: {
        title: string,
        author?: string,
        largeImageUrl: string,
        language: string,
        smallImageUrl: string,
        format?: string,
        illustrator?: string,
        isbn13?: string,
        narrator?: string,
        "publication-country"?: string,
        "publication-location"?: string,
        publisher?: string,
        quantity?: number,
        translator?: string,
        year?: string,
        files?: string[],
        "translation-title"?: string,
        "translation-title-transliterated"?: string,
        "language-spoken-in"?: string,
        "script"?: string,
        "script-family"?: string,
        "tags"?: string[],
        "comments"?: string,
        "date-acquired"?: string,
        "acquired-from"?: string,
        "search-words"?: string
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

interface ShowcaseState {
    troveItems: TroveItem[],
    displayedTroveItems: TroveItem[],
    searchText: string
    onlyDuplicates: boolean
}

interface ShowcaseProps {
    pageHeader: string
    troveUrl: string
    collectionTitle: string
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
            searchText: "",
            onlyDuplicates: false
        }
    }

    componentDidMount() {
        this.fetchTrove().then(trove => {
            console.log(`Got ${trove.items.length} Trove items`)
            this.setState({troveItems: trove.items.sort(compareTroveItem)});
            this.search("", false)
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
                    <p>My collection, painstakingly acquired over the years.</p>

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
                                <div style={{marginLeft: "20px"}}>
                                    <div style={{float: "left"}}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.onlyDuplicates}
                                                    onChange={e => this.onOnlyDuplicatesChanged(e)}
                                                    color="default"
                                                />
                                            }
                                            label={
                                                <BigWhiteTooltip
                                                    title={<section>Send me an email at <a
                                                        href="mailto:carl@dragnon.com">carl@dragnon.com</a></section>}
                                                    arrow
                                                    interactive
                                                    placement="bottom-start">
                                                    <div>Show only copies for which I have duplicates <i><strong>(want
                                                        to make a
                                                        deal?)</strong></i>
                                                    </div>
                                                </BigWhiteTooltip>
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p/>
                        <section>
                            Showing {this.state.displayedTroveItems.length} of {this.state.troveItems.length} editions of {this.props.collectionTitle}
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
        this.search(e.currentTarget.value, this.state.onlyDuplicates);
    }

    private onOnlyDuplicatesChanged(e: React.ChangeEvent<HTMLInputElement>) {
        console.log(`only duplicates value is ${e.currentTarget.checked}`)
        this.setState({
            searchText: this.state.searchText,
            onlyDuplicates: e.target.checked
        });
        this.search(this.state.searchText, e.currentTarget.checked);
    }

    private search(searchText: string, onlyDuplicates: boolean) {
        this.setState({
            displayedTroveItems: this.state.troveItems.filter(this.troveItemMatches(searchText, onlyDuplicates))
        })
    }

    private troveItemMatches(searchText: string, onlyDuplicates: boolean) {

        let searchByText = (_: TroveItem) => {
            return true
        }

        if (searchText) {
            searchByText = (troveItem) => {
                return (
                    troveItem.littlePrinceItem.language.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.author?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.script?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.format?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.translator?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.narrator?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.illustrator?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["script-family"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["tags"]?.join("/").toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["translation-title"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["translation-title-transliterated"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["language-spoken-in"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["search-words"]?.toLowerCase().includes(searchText.toLowerCase())
                ) || false
            }
        }

        let searchByDuplicates = searchByText

        if (onlyDuplicates) {
            searchByDuplicates = troveItem => {
                return searchByText(troveItem) && (troveItem.littlePrinceItem.quantity ?? 1) > 1
            }
        }

        return searchByDuplicates
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
                case 'translation-title-transliterated':
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
            return `${translationTitle} [${transliterated}]`;
        }
        return troveItem.littlePrinceItem['translation-title'];
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

    private constructPublicationBlurb(item: { title: string; largeImageUrl: string; language: string; smallImageUrl: string; format?: string; illustrator?: string; isbn13?: string; narrator?: string; "publication-country"?: string; "publication-location"?: string; publisher?: string; quantity?: number; translator?: string; year?: string; files?: string[]; "translation-title"?: string; "translation-title-transliterated"?: string; "language-spoken-in"?: string; script?: string; tags?: string[]; comments?: string }) {
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
    private constructAquisitionBlurb(item: { "acquired-from"?: string, "date-acquired"?: string }) {
        let acquiredFrom = item["acquired-from"]
        let dateAcquired = item["date-acquired"]
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

    private constructTagsBlurb(tags: string[] | undefined): string | null {
        if (!this.isPresent(tags)) {
            return null
        }
        return tags!!.join(", ")
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
