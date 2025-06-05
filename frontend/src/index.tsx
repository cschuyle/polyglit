import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/style.css';
import './css/image-grid.css';
import './css/polyglit.css';
import './css/Showcase.css';

import {BrowserRouter as Router, Route, Switch} from "react-router-dom";

import Showcase, {FocusState} from './Showcase';
// import HomePage from './HomePage';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
    <React.StrictMode>
        <div id="header_wrap" className="outer">
            <header className="inner">
                <h1 id="project_title">Le Petit Prince</h1>
                <h2 id="project_tagline">or, <em>The Little Prince</em>, by Antoine de Saint-Exupéry</h2>
                <h3 id="project_tagline2">... in Lots of Languages</h3>
            </header>
        </div>

        <Router basename={process.env.PUBLIC_URL}>
            <Switch>
                {/*<Route path="/" exact component={() => <HomePage/>}/>*/}
                <Route path={["/"]} exact component={() =>
                    <Showcase
                        // pageHeader="The Little Prince (Le Petit Prince) by Antoine de Saint-Exupéry"
                        // pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince.json"
                        collectionTitle="Le Petit Prince, by Antoine de Saint-Exupéry"
                        showWantedCheckboxes={true}
                        focusState={FocusState.OWNED}
                    />}
                />
                <Route path={["/the-hobbit", "/hobbit", "/thehobbit"]} exact component={() =>
                    <Showcase
                        // pageHeader="The Hobbit, or There and Back Again - by J.R.R. Tolkien"
                        // pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/hobbit.json"
                        collectionTitle = "The Hobbit"
                        showWantedCheckboxes={false}
                        focusState={FocusState.OWNED}
                    />}
                />
                <Route path={["/alice-in-wonderland", "/alice", "aliceinwonderland"]} exact component={() =>
                    <Showcase
                        // pageHeader="Alice's Adventures in Wonderland, by Lewis Carroll"
                        // pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/alice-in-wonderland.json"
                        collectionTitle = "Alice in Wonderland"
                        showWantedCheckboxes={false}
                        focusState={FocusState.OWNED}
                    />}
                />
                <Route path={["/other-titles", "/other", "/othertitles"]} exact component={() =>
                    <Showcase
                        // pageHeader="Collection: Not originally in English"
                        // pageSubtitle="My collection, painstakingly acquired over the years."
                        troveUrl="https://moocho-test.s3-us-west-2.amazonaws.com/public/books.json"
                        collectionTitle = "opportunistically-acquired titles, either translated from, or in the original non-English text"
                        showWantedCheckboxes={false}
                        focusState={FocusState.OWNED}
                    />}
                />
            </Switch>
        </Router>

        <div id="footer_wrap" className="outer">
            <footer className="inner">
                <p style={{textAlign: "center"}}>The Little Prince International Collection, a private collection of translations of <a href={"https://en.wikipedia.org/wiki/The_Little_Prince"} target={"blank"}>Antoine de Saint-Exupéry's novella "Le Petit Prince"</a>, originally published in 1943</p>
            </footer>
        </div>

    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
