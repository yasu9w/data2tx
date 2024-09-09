// src/pages/APIReference.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Welcome to Solana Docs
This is the APIReference page for the Solana documentation.
`,
    ja: `
# ソラナドキュメントへようこそ
これはソラナのドキュメントのホームページです。
`
};

const APIReference = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default APIReference;