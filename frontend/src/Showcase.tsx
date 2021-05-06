import React from 'react';

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
    }
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

}

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
            this.setState({troveItems: trove.items});
            this.search("", false)
        })
    }

    fetchTrove() {
        return fetch(`https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince`)
            .then(res => {
                return res.json() as Promise<Trove>
            })
    }

    render() {
        return (
            <span>
                <div>
                    <div style={{display: "flex"}}>
                        <div style={{width: "60%"}}>
                            <input
                                style={{width: "100%"}}
                                value={this.state.searchText}
                                onChange={e => this.onSearchTextChanged(e)}
                                placeholder="Search by language, country, or title"
                            />
                        </div>
                        <div style={{marginLeft: "20px"}}>
                            <div style={{float: "left"}}>
                                <input type="checkbox"
                                       onChange={e => this.onOnlyDuplicatesChanged(e)}
                                       checked={this.state.onlyDuplicates}>
                                </input>
                            </div>
                            <label>Show only copies for which I have duplicates (want to make a deal?)</label>
                        </div>
                    </div>
                </div>

                <section>
                    Showing {this.state.displayedTroveItems.length} of {this.state.troveItems.length} editions of The Little Prince
                </section>
                <section className="column">
                    {
                        this.state.displayedTroveItems.map((troveItem, index) => {
                            return this.renderTroveItem(troveItem, index)
                        })
                    }
                </section>
            </span>
        );
    }

    private onSearchTextChanged(e: React.ChangeEvent<HTMLInputElement>) {
        this.setState({
            searchText: e.target.value
        });
        this.search(e.currentTarget.value, this.state.onlyDuplicates);
    }

    private onOnlyDuplicatesChanged(e: React.ChangeEvent<HTMLInputElement>) {
        console.log(`only duplicates value is ${e.target.checked}`)
        this.setState({
            searchText: this.state.searchText,
            onlyDuplicates: e.target.checked
        });
        this.search(this.state.searchText, e.target.checked);
    }

    private search(searchText: string, onlyDuplicates: boolean) {
        this.setState({
            displayedTroveItems: searchText
                ? this.state.troveItems.filter(this.troveItemMatches(searchText, onlyDuplicates))
                : this.state.troveItems
        })
    }

    private troveItemMatches(searchText: string, onlyDuplicates: boolean) {
        if (onlyDuplicates) {
            return (troveItem: TroveItem) =>
                (troveItem.littlePrinceItem.language.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem.title.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["publication-country"]?.toLowerCase().includes(searchText.toLowerCase()) ||
                    troveItem.littlePrinceItem["publication-location"]?.toLowerCase().includes(searchText.toLowerCase()))
                && (troveItem.littlePrinceItem.quantity ?? 1) > 1
        }
        return (troveItem: TroveItem) =>
            troveItem.littlePrinceItem.language.toLowerCase().includes(searchText.toLowerCase()) ||
            troveItem.littlePrinceItem.title.toLowerCase().includes(searchText.toLowerCase()) ||
            troveItem.littlePrinceItem["publication-country"]?.toLowerCase().includes(searchText.toLowerCase()) ||
            troveItem.littlePrinceItem["publication-location"]?.toLowerCase().includes(searchText.toLowerCase())
            ;
    }

    private renderTroveItem(troveItem: TroveItem, key: any) {
        return <div className="thumbnail" key={key}>
            <a href={troveItem.littlePrinceItem.largeImageUrl}>
                <div style={{position: "relative"}}>
                    <img width="150"
                         src={troveItem.littlePrinceItem.smallImageUrl}
                         title={troveItem.littlePrinceItem.title}
                         alt={troveItem.littlePrinceItem.title}
                    />
                    <div className="caption">{troveItem.littlePrinceItem.language}</div>
                </div>
            </a>
        </div>
    }
}

export default Showcase;
