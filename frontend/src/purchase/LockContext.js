import React, { createContext, useState, useContext } from 'react';

const LockContext = createContext();

export const LockProvider = ({ children }) => {
    const [isLocked, setIsLocked] = useState(false);
    const [hasIncompleteTransactions, setHasIncompleteTransactions] = useState(false);
    const [isSendCompleted, setIsSendCompleted] = useState(false);
    const [sendingMessage, setSendingMessage] = useState('');
    const [useJSMapAPI, setUseJSMapAPI] = useState(false);

    return (
        <LockContext.Provider value={{ isLocked, setIsLocked, sendingMessage, setSendingMessage, isSendCompleted, setIsSendCompleted, hasIncompleteTransactions, setHasIncompleteTransactions, useJSMapAPI, setUseJSMapAPI }}>
            {children}
        </LockContext.Provider>
    );
};

export const useLock = () => {
    return useContext(LockContext);
};