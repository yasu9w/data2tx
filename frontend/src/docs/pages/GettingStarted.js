// src/pages/GettingStarted.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Welcome to Solana Docs
This is the GettingStarted page for the Solana documentation.
`,
    ja: `
# ソラナドキュメントへようこそ
これはソラナのドキュメントのホームページです。
`
};

const GettingStarted = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default GettingStarted;