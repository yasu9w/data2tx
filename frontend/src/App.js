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
    const navigate = useNavigate(); // navigate を使ってページ遷移を実現
    const [address, setAddress] = useState(''); // 入力されたアドレスを管理するステート

    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    if (location.pathname !== '/') {
        return null;
    }

    const handleAddressSubmit = () => {
        if (address) {
            // 入力されたアドレスを使って目的のURLを生成
            const targetUrl = `https://data2tx.io/purchase?key=${address}&zoom=0&lat=35.68286&lng=139.76908&NElat=125.68286&NElng=319.76908&SWlat=-54.31714&SWlng=-40.23092`;
            // 新しいタブでURLを開く
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
                </ul>
            </nav>

            {/* アドレス入力フォームとボタンを追加 */}
            <div style={styles.addressForm}>
                <input 
                    type="text" 
                    placeholder="Enter address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)} 
                    style={styles.input}
                />
                <button onClick={handleAddressSubmit} style={styles.button}>Go to Address</button>
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
        width: '250px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
    },
};

export default App;
