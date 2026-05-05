import React from 'react';
import ReactDOM from 'react-dom';

import './css/index.css';
import './css/style.css';
import './css/image-grid.css';
import './css/polyglit.css';
import './css/Showcase.css';

import {BrowserRouter as Router, useLocation} from "react-router-dom";

import Showcase, {FocusState} from './Showcase';
import {ensurePolyglitDataPreloaded} from './polyglitJsonCache';
import {trovePublicJson} from './troveUrls';
import {configuredTroveIds, multiTrovesEnabled, TroveId, troveIdOverride} from './featureFlags';
// import HomePage from './HomePage';
import reportWebVitals from './reportWebVitals';

type TroveConfig = {
    filename: string;
    collectionTitle: string;
    showWantedCheckboxes: boolean;
    tabLabel: string;
    header: {
        title: string;
        subtitle: React.ReactNode;
        tagline?: string;
    };
};

const TROVE_CONFIGS: Record<TroveId, TroveConfig> = {
    'little-prince': {
        filename: 'little-prince.json',
        collectionTitle: 'Le Petit Prince, by Antoine de Saint-Exupéry',
        showWantedCheckboxes: true,
        tabLabel: 'Le Petit Prince',
        header: {
            title: 'Le Petit Prince',
            subtitle: <>or, <em>The Little Prince</em>, by Antoine de Saint-Exupéry</>,
            tagline: '... in Lots of Languages',
        },
    },
    'hobbit': {
        filename: 'hobbit.json',
        collectionTitle: 'The Hobbit',
        showWantedCheckboxes: false,
        tabLabel: 'The Hobbit',
        header: {
            title: 'The Hobbit',
            subtitle: <>or, <em>There and Back Again</em>, by J.R.R. Tolkien</>,
            tagline: '... in Lots of Languages',
        },
    },
    'alice-in-wonderland': {
        filename: 'alice-in-wonderland.json',
        collectionTitle: 'Alice in Wonderland',
        showWantedCheckboxes: false,
        tabLabel: 'Alice in Wonderland',
        header: {
            title: "Alice's Adventures in Wonderland",
            subtitle: <>by Lewis Carroll</>,
            tagline: '... in Lots of Languages',
        },
    },
    'books': {
        filename: 'books.json',
        collectionTitle: 'opportunistically-acquired titles, either translated from, or in the original non-English text',
        showWantedCheckboxes: false,
        tabLabel: 'Books',
        header: {
            title: 'A sundry collection of books in many languages,',
            subtitle: <>or translated from one</>,
        },
    },
};

const ROOT_TROVE_IDS = configuredTroveIds();
const DEFAULT_ROOT_TROVE_ID = troveIdOverride() ?? (Object.keys(TROVE_CONFIGS)[0] as TroveId);

function rootTabsEnabled(): boolean {
    return multiTrovesEnabled() && ROOT_TROVE_IDS.length > 1;
}

function pathMatchesConfiguredTroveId(pathname: string): boolean {
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    return normalizedPath !== '' && ROOT_TROVE_IDS.includes(normalizedPath as TroveId);
}

function troveIdForPath(pathname: string, rootTroveId: TroveId): TroveId {
    if (pathname === '/' || pathname === '') {
        return rootTroveId;
    }
    const normalizedPath = pathname.replace(/^\/+|\/+$/g, '');
    if (normalizedPath === '') {
        return rootTroveId;
    }
    if (ROOT_TROVE_IDS.includes(normalizedPath as TroveId)) {
        return normalizedPath as TroveId;
    }
    return rootTroveId;
}

function RootTroveTabs(props: {
    activeTroveId: TroveId;
    troveIds: TroveId[];
    onSelect: (troveId: TroveId) => void;
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
            {props.troveIds.map((troveId) => {
                const isActive = props.activeTroveId === troveId;
                return (
                    <button
                        key={troveId}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => props.onSelect(troveId)}
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
                        {TROVE_CONFIGS[troveId].tabLabel}
                    </button>
                );
            })}
        </div>
    );
}

function AppShell() {
    const [activeRootTroveId, setActiveRootTroveId] = React.useState<TroveId>(DEFAULT_ROOT_TROVE_ID);
    const location = useLocation();
    const currentTroveId = troveIdForPath(location.pathname, activeRootTroveId);
    const currentTrove = TROVE_CONFIGS[currentTroveId];
    const showRootTabs = rootTabsEnabled() && !pathMatchesConfiguredTroveId(location.pathname);

    return (
        <>
            <div id="header_wrap" className="outer">
                <header className="inner">
                    {showRootTabs && (
                        <RootTroveTabs
                            activeTroveId={activeRootTroveId}
                            troveIds={ROOT_TROVE_IDS}
                            onSelect={setActiveRootTroveId}
                        />
                    )}
                    <h1 id="project_title">{currentTrove.header.title}</h1>
                    <h2 id="project_tagline">{currentTrove.header.subtitle}</h2>
                    {currentTrove.header.tagline && <h3 id="project_tagline2">{currentTrove.header.tagline}</h3>}
                </header>
            </div>

            <Showcase
                troveUrl={trovePublicJson(currentTrove.filename)}
                collectionTitle={currentTrove.collectionTitle}
                showWantedCheckboxes={currentTrove.showWantedCheckboxes}
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

ensurePolyglitDataPreloaded();

ReactDOM.render(
    <React.StrictMode>
        <Router basename={process.env.PUBLIC_URL}>
            <AppShell />
        </Router>

    </React.StrictMode>,
    document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
