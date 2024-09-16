// src/components/Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaBars } from 'react-icons/fa';

const SidebarContainer = styled.div`
  width: ${(props) => (props.isOpen ? '250px' : '0')};
  background-color: #fff;
  color: black;
  padding: ${(props) => (props.isOpen ? '20px' : '0')};
  position: fixed;
  height: 100vh;
  overflow-x: hidden;
  transition: 0.3s;
  border-right: ${(props) => (props.isOpen ? '1px solid #eaeaea' : 'none')};
  z-index: 1000;

  @media (max-width: 768px) {
    width: ${(props) => (props.isOpen ? '200px' : '0')};
  }
`;

const MainContent = styled.div`
  margin-left: ${(props) => (props.isSidebarOpen ? '250px' : '0')};
  transition: margin-left 0.3s;
  padding: 20px;
`;

const ToggleButton = styled.button`
  position: fixed;
  left: ${(props) => (props.isOpen ? '250px' : '0')};
  top: 10px;
  background-color: #007BFF;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 1100;
  transition: left 0.3s;

  @media (max-width: 768px) {
    left: ${(props) => (props.isOpen ? '200px' : '0')};
  }
`;

const LanguageSwitcher = styled.div`
  margin-bottom: 20px;
`;

const Sidebar = ({ isOpen, toggleSidebar, language, setLanguage, children }) => {

    const texts = {
        en: {
            topPage: "Top Page",
            docs: "Docs",
            home: "Home",
            gettingStarted: "Getting Started",
            upload: "Upload",
            purchase: "Purchase",
            download: "Download",
            language: "Language",
            switchToEnglish: "English",
            switchToJapanese: "日本語"
        },
        ja: {
            topPage: "トップページ",
            docs: "ドキュメント",
            home: "ホーム",
            gettingStarted: "はじめに",
            upload: "Upload",
            purchase: "Purchase",
            download: "Download",
            language: "言語",
            switchToEnglish: "English",
            switchToJapanese: "日本語"
        }
    };

    const t = texts[language];

    return (
        <>
            <ToggleButton onClick={toggleSidebar} isOpen={isOpen}>
                <FaBars />
            </ToggleButton>
            <SidebarContainer isOpen={isOpen}>
                <div style={{ marginBottom: '20px' }}>
                    <Link to="/" style={styles.link}>{t.topPage}</Link>
                </div>
                <LanguageSwitcher>
                    <h3>{t.language}</h3>
                    <button onClick={() => setLanguage('en')} style={{ marginRight: '10px' }}>{t.switchToEnglish}</button>
                    <button onClick={() => setLanguage('ja')}>{t.switchToJapanese}</button>
                </LanguageSwitcher>
                <h2>{t.docs}</h2>
                <ul style={styles.ul}>
                    <li><Link to="/docs" style={styles.link}>{t.home}</Link></li>
                    <li><Link to="/docs/getting-started" style={styles.link}>{t.gettingStarted}</Link></li>
                    <li><Link to="/docs/upload" style={styles.link}>{t.upload}</Link></li>
                    <li><Link to="/docs/purchase" style={styles.link}>{t.purchase}</Link></li>
                    <li><Link to="/docs/download" style={styles.link}>{t.download}</Link></li>
                </ul>
            </SidebarContainer>
            <MainContent isSidebarOpen={isOpen}>
                {children}
            </MainContent>
        </>
    );
};

const styles = {
    ul: {
        listStyleType: 'none',
        padding: 0,
    },
    link: {
        textDecoration: 'underline',
        fontSize: '18px',
        color: '#0000EE',
        display: 'inline-block',
        transition: 'color 0.2s ease',
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
    },
    subLink: {
        textDecoration: 'underline',
        fontSize: '18px',
        color: '#0000EE',
        display: 'inline-block',
        marginLeft: '20px', // サブタイトルをわかりやすくするためのスペース
        transition: 'color 0.2s ease',
        background: 'none',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
    },
};

export default Sidebar;
