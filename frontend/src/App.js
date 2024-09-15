import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DocsMain from './docs/App';
import PurchaseMain from './purchase/App';
import DownloadMain from './download/App';
import UploadMain from './upload/App';
import SOL2WSOLMain from './sol2wsol/App';
import logoImage from './images/logo.png'; 

function Navigation() {
    const location = useLocation();

    // トップページ('/')のみにナビゲーションバーを表示
    if (location.pathname !== '/') {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <img src={logoImage} alt="logo" style={styles.image} /> 
            </div>
            <nav style={styles.nav}>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        <Link to="/docs" style={styles.link}>Docs</Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/upload" style={styles.link}>Upload</Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/purchase" style={styles.link}>Purchase</Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/download" style={styles.link}>Download</Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/sol2wsol" style={styles.link}>SOL2WSOL</Link>
                    </li>
                </ul>
            </nav>
        </div>
    );
}

function Footer() {
    const location = useLocation();

    // トップページ('/')のみにフッターを表示
    if (location.pathname !== '/') {
        return null;
    }

    return (
        <footer style={styles.footer}>
            <p>© 2024 DATA2TX. All rights reserved.</p>
        </footer>
    );
}

function App() {
    return (
        <Router>
            <div style={styles.appContainer}>
                <Routes>
                    <Route path="/" element={<><Navigation /><Footer /></>} />
                    <Route path="/docs/*" element={<DocsMain />} />
                    <Route path="/upload" element={<UploadMain />} />
                    <Route path="/purchase" element={<PurchaseMain />} />
                    <Route path="/download" element={<DownloadMain />} />
                    <Route path="/sol2wsol" element={<SOL2WSOLMain />} />
                </Routes>
            </div>
        </Router>
    );
}

const styles = {
    appContainer: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    container: {
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
    },
    content: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
    },
    image: {
        width: '1000px',
        height: 'auto',
        marginTop: '20px',
    },
    nav: {
        marginTop: '20px',
    },
    ul: {
        listStyleType: 'none',
        padding: 0,
    },
    li: {
        marginBottom: '10px',
        textAlign: 'left',
    },
    link: {
        textDecoration: 'underline', // アンダーバーを追加
        fontSize: '20px',
        color: '#0000EE', // リンクを青文字に変更
        display: 'inline-block',
        transition: 'color 0.2s ease',
    },
    footer: {
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#fff',
        marginTop: 'auto',
        borderTop: '1px solid #eaeaea',
    },
};

export default App;