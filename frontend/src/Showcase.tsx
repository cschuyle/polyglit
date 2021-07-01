import React from 'react';
import popoutFlat from "./images/popout-flat.png"
import {Checkbox, FormControlLabel, TextField, Tooltip, withStyles} from "@material-ui/core";

interface TroveItem {
    littlePrinceItem: {
        title: string,
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
        "tags"?: string[],
        "comments"?: string
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
    onlyPdfs: boolean
}

interface ShowcaseProps {
    pageHeader: string
    troveUrl: string
    collectionTitle: string
}

const BigWhiteTooltip = withStyles({
    arrow: {
        "&:before": {
            border: "1px solid #E6E8ED"
        },
        color: "white"
    },
    tooltip: {
        fontSize: "1em",
        backgroundColor: "white",
        border: "1px solid #E6E8ED",
        color: "gray"
    }
})(Tooltip);


class Showcase extends React.Component<ShowcaseProps, ShowcaseState> {

    constructor(props: ShowcaseProps) {
        super(props)
        this.state = {
            troveItems: [],
            displayedTroveItems: [],
            searchText: "",
            onlyDuplicates: false,
            onlyPdfs: false
        }
    }

    componentDidMount() {
        this.fetchTrove().then(trove => {
            console.log(`Got ${trove.items.length} Trove items`)
            this.setState({troveItems: trove.items.sort(compareTroveItem)});
            this.search("", false, false)
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
                                    <TextField label="Search by language, country, or title"
                                               type="search" variant="outlined"
                                               style={{width: "100%"}}
                                               value={this.state.searchText}
                                               onChange={e => this.onSearchTextChanged(e)}
                                               placeholder="Search by language, country, or title"
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
                                                    <div>Show only copies for which I have duplicates
                                                        <i><strong> (want to make a deal?)</strong></i>
                                                    </div>
                                                </BigWhiteTooltip>
                                            }
                                        />
                                    </div>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={this.state.onlyPdfs}
                                                    onChange={e => this.onOnlyPdfsChanged(e)}
                                                    color="default"
                                                />
                                            }
                                            label="Show only PDFs"
                                        />
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
        this.search(e.currentTarget.value, this.state.onlyDuplicates, this.state.onlyPdfs);
    }

    private onOnlyDuplicatesChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            onlyDuplicates: e.target.checked
        });
        this.search(this.state.searchText, e.currentTarget.checked, this.state.onlyPdfs);
    }

    private onOnlyPdfsChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            onlyPdfs: e.target.checked
        });
        this.search(this.state.searchText, this.state.onlyDuplicates, e.currentTarget.checked);
    }

    private search(searchText: string, onlyDuplicates: boolean, onlyPdfs: boolean) {
        this.setState({
            displayedTroveItems: this.state.troveItems.filter(this.troveItemMatches(searchText, onlyDuplicates, onlyPdfs))
        })
    }

    private troveItemMatches(searchText: string, onlyDuplicates: boolean, onlyPdfs: boolean) {

        let searchByText = (_: TroveItem) => {
            return true
        }

        if (searchText) {
            searchByText = (troveItem) => {
                return (
                    troveItem.littlePrinceItem.language.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["publication-country"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["publication-location"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["tags"]?.join("/").toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["translation-title"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["translation-title-transliterated"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["language-spoken-in"]?.toLowerCase().includes(searchText.toLowerCase())
                ) || false
            }
        }

        let searchByDuplicates = searchByText

        if (onlyDuplicates) {
            searchByDuplicates = troveItem => {
                return searchByText(troveItem) && (troveItem.littlePrinceItem.quantity ?? 1) > 1
            }
        }

        let searchByPdf = searchByDuplicates

        if (onlyPdfs) {
            searchByPdf = troveItem => {
                return searchByDuplicates(troveItem) &&
                    (troveItem.littlePrinceItem.files != null && troveItem.littlePrinceItem.files.filter(file => file.toLowerCase().includes(".pdf")).length > 0)
            }
        }

        return searchByPdf
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
                <a href={troveItem.littlePrinceItem.largeImageUrl}>
                    <div style={{position: "relative"}}>
                        <img width="150"
                             src={troveItem.littlePrinceItem.smallImageUrl}
                            // title={troveItem.littlePrinceItem.title}
                             alt={troveItem.littlePrinceItem.title}
                        />
                        <div className="caption">{troveItem.littlePrinceItem.language}</div>
                        {
                            troveItem.littlePrinceItem.files?.map(file => {
                                return this.renderExtraFile(file)
                            })
                        }
                    </div>
                </a>
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
                case 'comments':
                    return createRow(null, troveItem.littlePrinceItem.comments)
                case 'tags':
                    return createRow("Tags", this.constructTagsBlurb(troveItem.littlePrinceItem.tags))
            }
        }).filter(e => e != null && this.isPresent(e.value))

        return <div>
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
    }

    private isPresent(value: any | null | undefined): value is null | undefined {
        return !(value === null || value === undefined || value === '');
    }

    private constructTranslationTitle(troveItem: TroveItem) {
        let translationTitle = troveItem.littlePrinceItem['translation-title'];
        let transliterated = troveItem.littlePrinceItem['translation-title-transliterated'];
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

    private renderExtraFile(file: string) {
        return <div style={{
            position: "absolute",
            right: "0px",
            margin: "-0.8em 1em 0px"
        }}>

            <span style={{bottom: "0px", right: "0px"}}>
            <a href={file}
               target="_blank"
               rel="noreferrer">
            <img src={popoutFlat}
                 title={`Open in new tab: ${file}`}
                 alt="Open"
                 style={{
                     height: "1.3em",
                     width: "1.3em",
                     padding: "0.2em",
                     marginTop: "0.2em",
                     float: "left",
                     opacity: "0.6"
                 }}
            />
            </a>
            </span>
        </div>
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
        if (this.isPresent(publisher) && !this.isPresent(publicationCountry)) {
            return `by ${publisher} in ${publicationLocation}`
        }
        if (this.isPresent(publisher) && !this.isPresent(publicationLocation)) {
            return `by ${publisher} in ${publicationCountry}`
        }
        return `by ${publisher} in ${publicationLocation}, ${publicationCountry}`
    }

    private constructTagsBlurb(tags: string[] | undefined): string | null {
        if (!this.isPresent(tags)) {
            return null
        }
        return tags!!.join(", ")
    }
}

export default Showcase;
