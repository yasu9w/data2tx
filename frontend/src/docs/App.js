// src/App.js (DocsMain)
import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import GettingStarted from './pages/GettingStarted';
import APIReference from './pages/APIReference';
import Tutorials from './pages/Tutorials';
import './App.css';

function DocsMain() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [language, setLanguage] = useState('en'); // デフォルトは英語

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div style={{ display: 'flex' }}>
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                language={language}
                setLanguage={setLanguage}
            />
            <div style={{ flex: 1 }}>
                <Routes>
                    <Route path="/" element={<Home language={language} sidebarOpen={isSidebarOpen} />} />
                    <Route path="getting-started" element={<GettingStarted language={language} sidebarOpen={isSidebarOpen} />} />
                    <Route path="api-reference" element={<APIReference language={language} sidebarOpen={isSidebarOpen} />} />
                    <Route path="tutorials" element={<Tutorials language={language} sidebarOpen={isSidebarOpen} />} />
                </Routes>
            </div>
        </div>
    );
}

export default DocsMain;