import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/style.css';
import './css/image-grid.css';
import './css/polyglit.css';
import './css/Showcase.css';

import {BrowserRouter, Route, Switch} from "react-router-dom";

import Showcase from './Showcase';
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

        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Switch>
                <Route path="/" exact component={() => <HomePage/>}/>
                <Route path="/the-little-prince" exact component={() =>
                    <Showcase
                        pageHeader="The Little Prince"
                        troveUrl={"https://moocho-test.s3-us-west-2.amazonaws.com/public/little-prince"}
                    />}
                />
                <Route path="/the-hobbit" exact component={() =>
                    <Showcase
                        pageHeader="The Hobbit"
                        troveUrl={"https://moocho-test.s3-us-west-2.amazonaws.com/public/hobbit"}
                    />}
                />
                <Route path="/alice-in-wonderland" exact component={() =>
                    <Showcase
                        pageHeader="Alice in Wonderland"
                        troveUrl={"https://moocho-test.s3-us-west-2.amazonaws.com/public/alice-in-wonderland"}
                    />}
                />
            </Switch>
        </BrowserRouter>

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
