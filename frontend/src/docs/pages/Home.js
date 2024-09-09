// src/pages/Home.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Welcome to Solana Docs
This is the home page for the Solana documentation.
`,
    ja: `
# Markdown Documentation

## Introduction

Markdown is a **lightweight markup language** that you can use to add formatting elements to plaintext text documents.
It is commonly used to format readme files, for writing messages in online discussion forums, and to create rich text using a plain text editor.

### Basic Syntax

| Left align | Right align | Center align |
|:-----------|------------:|:------------:|
| This       | This        | This         |
| column     | column      | column       |
| will       | will        | will         |
| be         | be          | be           |
| left       | right       | center       |
| aligned    | aligned     | aligned      |

`
};

const Home = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default Home;