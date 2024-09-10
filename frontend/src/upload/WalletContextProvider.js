import React from "react";
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContextProvider = ({ children }) => {
    const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];

    const QUICKNODE_RPC = process.env.REACT_APP_QUICKNODE_RPC;

    return (
        <ConnectionProvider endpoint={QUICKNODE_RPC}>
            <WalletProvider wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export default WalletContextProvider;