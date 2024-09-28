import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DocsMain from './docs/App';
import PurchaseMain from './purchase/App';
import DownloadMain from './download/App';
import UploadMobileMain from './uploadMobile/App';
import UploadMain from './upload/App'; // PC用のアップロードコンポーネントを追加
import SOL2WSOLMain from './sol2wsol/App';
import logoImage from './images/logo.png'; 

function Navigation() {
    const location = useLocation();

    // モバイル判定を削除して、すべてのリンクを有効化
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

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
                    {/* <li style={styles.li}>
                        <Link to="/docs" style={styles.link}>Docs</Link>
                    </li>　*/}
                    <li style={styles.li}>
                        <Link to="/upload" style={styles.link}>
                            {isMobile ? "Upload Mobile" : "Upload"} {/* モバイルとPCでテキストを変更 */}
                        </Link>
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
                        element={isMobile ? <UploadMobileMain /> : <UploadMain />} // モバイルとPCで表示コンポーネントを切り替え
                    />
                    {!isMobile && (
                        <>
                            <Route path="/purchase" element={<PurchaseMain />} />
                            <Route path="/download" element={<DownloadMain />} />
                            <Route path="/sol2wsol" element={<SOL2WSOLMain />} />
                        </>
                    )}
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
        backgroundColor: '#ffffff', // 背景を白に設定
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
        maxWidth: '100%',
        height: 'auto',
        marginTop: '20px',
    },
    nav: {
        marginTop: '20px',
        display: 'flex', // flexレイアウトに変更
        justifyContent: 'center', // 中央揃え
        alignItems: 'center', // 垂直方向に中央揃え
    },
    ul: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
        display: 'flex', // 水平方向に並べるためにflexを使用
        flexDirection: 'column', // デフォルトは縦方向
        alignItems: 'center', // 中央揃え
    },
    li: {
        marginBottom: '10px',
        textAlign: 'left',
        width: '100%', // リンク全体をクリックできるように幅を指定
    },
    link: {
        textDecoration: 'underline', // underline
        fontSize: '20px',
        color: '#0000EE', // blue link
        display: 'inline-block',
        transition: 'color 0.2s ease',
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
        fontSize: '16px',
        fontWeight: 'bold',
        marginTop: '10px',
    },

    // モバイル向けスタイルを追加
    '@media (max-width: 600px)': {
        nav: {
            flexDirection: 'column', // モバイルでは縦方向に表示
        },
        ul: {
            flexDirection: 'column', // リンクを縦に並べる
            alignItems: 'flex-start', // 左揃えにする
        },
        li: {
            marginBottom: '15px', // リンク間のスペースを広げる
            textAlign: 'center', // モバイルでは中央揃え
            width: '100%', // 横幅全体を使用
        },
        link: {
            fontSize: '18px', // フォントサイズを少し小さく
        },
        image: {
            width: '80%', // ロゴのサイズを縮小
        },
    },

    // PC向けスタイルを追加
    '@media (min-width: 601px)': {
        nav: {
            flexDirection: 'row', // PCでは横方向に表示
        },
        ul: {
            flexDirection: 'row', // リンクを横に並べる
            justifyContent: 'center', // 横方向に中央揃え
        },
        li: {
            marginBottom: 0, // スペースを詰める
            marginRight: '20px', // リンク間のスペースを広げる
            textAlign: 'center', // PCでは中央揃え
            width: 'auto', // 幅の指定を解除
        },
    },
};

export default App;