import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/style.css';
import './css/image-grid.css';
import './css/polyglit.css';
import './css/Showcase.css';

import {BrowserRouter as Router, useLocation} from "react-router-dom";

import Showcase, {FocusState} from './Showcase';
import {ensurePolyglitDataPreloaded, hasTroveLoadError} from './polyglitJsonCache';
import {trovePublicJson} from './troveUrls';
import {configuredTroveData, multiTrovesEnabled, TroveData} from './featureFlags';
// import HomePage from './HomePage';
import reportWebVitals from './reportWebVitals';

/** Converts inline Markdown (*italic*, **bold**, _italic_) to HTML. */
function md(text: string): string {
    return text
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/_(.+?)_/g, '<em>$1</em>');
}

function showNotFound() {
    document.open();
    document.write('This is not the Trove you are looking for.');
    document.close();
}

const ROOT_TROVE_DATA = configuredTroveData();
const ROOT_TROVE_IDS = ROOT_TROVE_DATA.map(d => d.troveId);
const ROOT_TROVE_URLS = ROOT_TROVE_IDS.map(id => trovePublicJson(`${id}.json`));
const DEFAULT_ROOT_TROVE_ID = ROOT_TROVE_IDS[0] ?? '';

function troveDataForId(troveId: string): TroveData | undefined {
    return ROOT_TROVE_DATA.find(d => d.troveId === troveId);
}

function rootTabsEnabled(): boolean {
    return multiTrovesEnabled() && ROOT_TROVE_DATA.length > 1;
}

function pathMatchesConfiguredTroveId(pathname: string): boolean {
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    return normalizedPath !== '' && ROOT_TROVE_IDS.includes(normalizedPath);
}

function troveIdForPath(pathname: string, rootTroveId: string): string {
    if (pathname === '/' || pathname === '') {
        return rootTroveId;
    }
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    if (normalizedPath === '') {
        return rootTroveId;
    }
    if (ROOT_TROVE_IDS.includes(normalizedPath)) {
        return normalizedPath;
    }
    return rootTroveId;
}

function RootTroveTabs(props: {
    activeTroveId: string;
    troves: TroveData[];
    onSelect: (troveId: string) => void;
}) {
    return (
        <div
            aria-label="Available troves"
            role="tablist"
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                justifyContent: 'center',
                marginBottom: 14,
            }}
        >
            {props.troves.map((trove) => {
                const isActive = props.activeTroveId === trove.troveId;
                return (
                    <button
                        key={trove.troveId}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => props.onSelect(trove.troveId)}
                        style={{
                            border: isActive ? '1px solid #154273' : '1px solid rgba(255, 255, 255, 0.45)',
                            background: isActive ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                            color: '#fff',
                            padding: '6px 12px',
                            borderRadius: 999,
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: isActive ? 700 : 500,
                        }}
                    >
                        {trove.shortName}
                    </button>
                );
            })}
        </div>
    );
}

function AppShell() {
    const [activeRootTroveId, setActiveRootTroveId] = React.useState<string>(DEFAULT_ROOT_TROVE_ID);
    const location = useLocation();
    const currentTroveId = troveIdForPath(location.pathname, activeRootTroveId);
    const currentTrove = troveDataForId(currentTroveId);
    const showRootTabs = rootTabsEnabled() && !pathMatchesConfiguredTroveId(location.pathname);

    React.useEffect(() => {
        const url = trovePublicJson(`${currentTroveId}.json`);
        ensurePolyglitDataPreloaded(ROOT_TROVE_URLS).then(() => {
            if (hasTroveLoadError(url)) showNotFound();
        });
    }, [currentTroveId]);

    if (hasTroveLoadError(trovePublicJson(`${currentTroveId}.json`))) return null;

    return (
        <>
            <div id="header_wrap" className="outer">
                <a
                    id="about_link"
                    href={`${import.meta.env.BASE_URL}about.html`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    About
                </a>
                <header className="inner">
                    {showRootTabs && (
                        <RootTroveTabs
                            activeTroveId={activeRootTroveId}
                            troves={ROOT_TROVE_DATA}
                            onSelect={setActiveRootTroveId}
                        />
                    )}
                    {currentTrove && <h1 id="project_title">{currentTrove.h1}</h1>}
                    {currentTrove && <h2 id="project_tagline" dangerouslySetInnerHTML={{ __html: md(currentTrove.h2) }} />}
                    {currentTrove?.h3 && <h3 id="project_tagline2" dangerouslySetInnerHTML={{ __html: md(currentTrove.h3) }} />}
                </header>
            </div>

            <Showcase
                troveUrl={trovePublicJson(`${currentTroveId}.json`)}
                collectionTitle={currentTrove?.h1 ?? ''}
                focusState={FocusState.OWNED}
            />

            <div id="footer_wrap" className="outer">
                <footer className="inner">
                    <p style={{textAlign: "center"}}>The Little Prince International Collection, a private collection of translations of <a href={"https://en.wikipedia.org/wiki/The_Little_Prince"} target={"blank"}>Antoine de Saint-Exupéry's novella "Le Petit Prince"</a>, originally published in 1943</p>
                </footer>
            </div>
        </>
    );
}

ensurePolyglitDataPreloaded(ROOT_TROVE_URLS);

if (ROOT_TROVE_DATA.length === 0) {
    showNotFound();
} else {
    ReactDOM.render(
        <React.StrictMode>
            <Router basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <AppShell />
            </Router>
        </React.StrictMode>,
        document.getElementById('root')
    );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
