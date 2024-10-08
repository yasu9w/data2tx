import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import DocsMain from './docs/App';
import PurchaseMain from './purchase/App';
import DownloadMain from './download/App';
import UploadMobileMain from './uploadMobile/App';
import UploadMain from './upload/App';
import SOL2WSOLMain from './sol2wsol/App';
import logoImage from './images/logo.png'; 

function Navigation() {
    const location = useLocation();
    const navigate = useNavigate();
    const [address, setAddress] = useState('');
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (location.pathname !== '/') {
        return null;
    }

    const handleAddressSubmit = () => {
        if (address) {
            const targetUrl = `https://www.data2tx.io/purchase?key=${address}&zoom=0&lat=35.68286&lng=139.76908000000003&NElat=125.68286&NElng=319.76908&SWlat=-54.31714&SWlng=-40.23092`;
            window.open(targetUrl, '_blank');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <img src={logoImage} alt="logo" style={isMobile ? styles.imageMobile : styles.imagePC} />
            </div>
            <nav style={styles.nav}>
                <ul style={styles.ul}>
                    <li style={styles.li}>
                        <a href="https://youtu.be/S23UncbOrpw" style={styles.link} target="_blank" rel="noopener noreferrer">
                            Tutorial
                        </a>
                    </li>
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
                    <li style={styles.li}>
                        <a href="https://faucet.solana.com/" style={styles.link} target="_blank" rel="noopener noreferrer">Airdrop</a>
                    </li>
                </ul>
            </nav>

            <div style={styles.addressForm}>
                <input 
                    type="text" 
                    placeholder="Your Publickey"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)} 
                    style={styles.input}
                />
                <button onClick={handleAddressSubmit} style={styles.button}>Check Your Photos</button>
            </div>
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
                    <Route 
                        path="/upload" 
                        element={isMobile ? <UploadMobileMain /> : <UploadMain />}
                    />
                    <Route path="/purchase" element={<PurchaseMain />} />
                    <Route path="/download" element={<DownloadMain />} />
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
    footer: {
        textAlign: 'center',
        padding: '10px 0',
        backgroundColor: '#fff',
        marginTop: 'auto',
        borderTop: '1px solid #eaeaea',
    },
    addressForm: {
        marginTop: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        marginBottom: '10px',
        width: '200px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    button: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        width: '200px',
        textAlign: 'center',
    },
};

export default App;
