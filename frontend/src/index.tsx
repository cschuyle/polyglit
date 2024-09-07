import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/style.css';
import './css/image-grid.css';
import './css/polyglit.css';
import './css/Showcase.css';

import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import Showcase, {FocusState} from './Showcase';
import HomePage from './HomePage';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <div id="header_wrap" className="outer">
            <header className="inner">
                <h1 id="project_title">polyglit</h1>
                <h2 id="project_tagline">A collection of literary works in Lots of Languages</h2>
            </header>
        </div>

        <Router basename={process.env.PUBLIC_URL}>
            <Switch>
                <Route path="/" exact component={() => <HomePage/>}/>
                <Route path={["/the-little-prince", "/little-prince", "/littleprince"]} exact component={() =>
                    <Showcase
                        pageHeader="The Little Prince (Le Petit Prince) by Antoine de Saint-Exupéry"
                        pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince"
                        collectionTitle="The Little Prince"
                        // showDupsCheckbox={true}
                        showWantedCheckboxes={true}
                        focusState={FocusState.OWNED}
                    />}
                />
                <Route path={["/the-hobbit", "/hobbit", "/thehobbit"]} exact component={() =>
                    <Showcase
                        pageHeader="The Hobbit, or There and Back Again - by J.R.R. Tolkien"
                        pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/hobbit"
                        collectionTitle = "The Hobbit"
                        // showDupsCheckbox={true}
                        showWantedCheckboxes={false}
                    />}
                />
                <Route path={["/alice-in-wonderland", "/alice", "aliceinwonderland"]} exact component={() =>
                    <Showcase
                        pageHeader="Alice's Adventures in Wonderland, by Lewis Carroll"
                        pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/alice-in-wonderland"
                        collectionTitle = "Alice in Wonderland"
                        // showDupsCheckbox={true}
                        showWantedCheckboxes={false}
                    />}
                />
                <Route path={["/other-titles", "/other", "/othertitles"]} exact component={() =>
                    <Showcase
                        pageHeader="Collection: Not originally in English"
                        pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/books"
                        collectionTitle = "opportunistically-acquired titles, either translated from, or in the original non-English text"
                        // showDupsCheckbox={true}
                        showWantedCheckboxes={false}
                    />}
                />
                <Route path={["/the-little-prince-wanted", "/little-prince-wanted", "/littleprincewanted"]} exact component={() =>
                    <Showcase
                        pageHeader="The Little Prince (Le Petit Prince) by Antoine de Saint-Exupéry"
                        pageSubtitle="Editions of The Little Prince which I am looking for"
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince-wanted"
                        collectionTitle="The Little Prince - Wanted Items"
                        // showDupsCheckbox={false}
                        showWantedCheckboxes={false}
                    />}
                />
            </Switch>
        </Router>

        <div id="footer_wrap" className="outer">
            <footer className="inner">
                <p style={{textAlign: "center"}}>polyglit maintained by <a href="https://dragnon.com">Carlton
                    Schuyler</a></p>
            </footer>
        </div>

    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
