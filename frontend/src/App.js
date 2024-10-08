import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DocsMain from './docs/App';
import PurchaseMain from './purchase/App';
import DownloadMain from './download/App';
import UploadMobileMain from './uploadMobile/App';
import UploadMain from './upload/App';
import SOL2WSOLMain from './sol2wsol/App';
import logoImage from './images/logo.png'; 

function Navigation() {
    const location = useLocation();

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (location.pathname !== '/') {
        return null;
    }

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <img src={logoImage} alt="logo" style={isMobile ? styles.imageMobile : styles.imagePC} />
            </div>
            <nav style={styles.nav}>
                <ul style={styles.ul}>
                    {/* <li style={styles.li}>
                        <Link to="/docs" style={styles.link}>Docs</Link>
                    </li>　*/}
                    <li style={styles.li}>
                        <Link to="/upload" style={styles.link}>
                            {isMobile ? "Upload Mobile" : "Upload"}
                        </Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/purchase" style={styles.link}>Purchase</Link>
                    </li>
                    <li style={styles.li}>
                        <Link to="/download" style={styles.link}>Download</Link>
                    </li>
                    {/* <li style={styles.li}>
                        <Link to="/sol2wsol" style={styles.link}>SOL2WSOL</Link>
                    </li> */}
                </ul>
            </nav>
        </div>
    );
}

function Footer() {
    const location = useLocation();

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
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    return (
        <Router>
            <div style={styles.appContainer}>
                <Routes>
                    <Route path="/" element={<><Navigation /><Footer /></>} />
                    {/* <Route path="/docs/*" element={<DocsMain />} />　*/}
                    <Route 
                        path="/upload" 
                        element={isMobile ? <UploadMobileMain /> : <UploadMain />}
                    />
                    <Route path="/purchase" element={<PurchaseMain />} />
                    <Route path="/download" element={<DownloadMain />} />
                    {/*<Route path="/sol2wsol" element={<SOL2WSOLMain />} />*/}
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
        backgroundColor: '#ffffff',
        fontFamily: 'Arial, sans-serif',
        fontSize: '16px', 
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
        fontWeight: 'bold',
        fontSize: '16px',
    },
    imageMobile: {
        maxWidth: '80%',
        height: 'auto',
    },
    imagePC: {
        maxWidth: '300px',
        height: 'auto',
    },
    nav: {
        marginTop: '20px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ul: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    li: {
        marginBottom: '10px',
        textAlign: 'left',
        width: '100%',
    },
    link: {
        textDecoration: 'underline',
        color: '#0000EE',
        display: 'inline-block',
        transition: 'color 0.2s ease',
        fontSize: '16px', 
    },
    disabledLink: {
        pointerEvents: 'none',
        color: 'gray',
        textDecoration: 'none',
    },
    footer: {
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#fff',
        marginTop: 'auto',
        borderTop: '1px solid #eaeaea',
    },
    warningMessage: {
        color: 'red',
        fontWeight: 'bold',
        marginTop: '10px',
    },

    // Styles for mobile
    '@media (max-width: 600px)': {
        nav: {
            flexDirection: 'column',
        },
        ul: {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
        li: {
            marginBottom: '15px',
            textAlign: 'center',
            width: '100%',
        },
        link: {
            fontSize: '18px',
        },
        image: {
            width: '80%',
        },
    },

    // Styles for PC
    '@media (min-width: 601px)': {
        nav: {
            flexDirection: 'row',
        },
        ul: {
            flexDirection: 'row',
            justifyContent: 'center',
        },
        li: {
            marginBottom: 0,
            marginRight: '20px',
            textAlign: 'center',
            width: 'auto',
        },
    },
};

export default App;