import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import WalletContextProvider from './WalletContextProvider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    Connection,
    Transaction,
    TransactionInstruction,
    PublicKey,
    SendTransactionError,
    SystemProgram,
    ComputeBudgetProgram
} from "@solana/web3.js";
import { Buffer } from 'buffer';
import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token';

const DEBUG = true;
const SOLANA_DEVNET_ENDPOINT = process.env.REACT_APP_QUICKNODE_RPC;
//const SOLANA_DEVNET_ENDPOINT = 'https://api.devnet.solana.com';

const PROGRAM_ID_CONVERT = new PublicKey("BVyaTTKdj2XG1ptN2fYYmfbkQZitseN4nqDQBGvovnA2");
const PROGRAM_ID_CLOSE = new PublicKey("Cj4DVtFabsYmEJkhe4Dpa69x1RLC3FRBCqtJQYgaCxed");

const SOL2WSOLMain = () => (
    <WalletContextProvider>
        <SOL2WSOLApp />
    </WalletContextProvider>
);

const Header = React.memo(() => {

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'white',
            zIndex: 1000,
            borderBottom: '1px solid #ddd'
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>
                <h1 style={{ textTransform: 'uppercase', margin: 0 }}>
                    SOL-WSOL CONVERTER
                </h1>
                <div>
                    <WalletMultiButton />
                </div>
            </div>
        </div>
    );
});

function SOL2WSOLApp() {
    const { publicKey, signAllTransactions } = useWallet();
    const [status, setStatus] = useState('');
    const [isWalletReady, setIsWalletReady] = useState(false);

    useEffect(() => {
        if (publicKey) {
            setIsWalletReady(true);
            setStatus('Wallet is connected.');
        } else {
            setIsWalletReady(false);
            setStatus('Wallet is not connected. Please connect your wallet.');
        }
    }, [publicKey]);

    const checkConnection = async (connection) => {
        try {
            await connection.getLatestBlockhash();
            return true;
        } catch (error) {
            console.error("Connection check error:", error);
            return false;
        }
    };

    const handleConvert = async () => {
        await executeTransaction(PROGRAM_ID_CONVERT);
    };

    const handleClose = async () => {
        await executeTransaction(PROGRAM_ID_CLOSE);
    };

    const executeTransaction = async (programId) => {
        if (!publicKey) {
            setStatus('Wallet is not connected.');
            return;
        }

        setStatus('Preparing transaction...');

        try {
            let connection = null;
            try {
                const QUICKNODE_RPC = process.env.REACT_APP_QUICKNODE_RPC;
                connection = new Connection(QUICKNODE_RPC);
            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to connect to Solana RPC: ", error);
                }
                return;
            }

            const isConnected = await checkConnection(connection);

            if (!isConnected) {
                setStatus('Failed to establish connection.');
                return;
            }

            const [associatedTokenAddress, seed] = await PublicKey.findProgramAddressSync(
                [
                    publicKey.toBuffer(),
                    new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA").toBuffer(),
                    new PublicKey("So11111111111111111111111111111111111111112").toBuffer(),
                ],
                new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
            );

            let existsFlag = 0;
            try {
                const accountInfo = await connection.getAccountInfo(associatedTokenAddress);
                if (accountInfo !== null) {
                    existsFlag = 1;
                }
            } catch (error) {
                console.error("Account check error:", error);
            }
            let ix_data = [seed, existsFlag];

            const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
                units: 1400000
            });

            const transaction = new Transaction()
                .add(modifyComputeUnits);

            await transaction.add(
                new TransactionInstruction({
                    keys: [
                        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                        { pubkey: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
                        { pubkey: new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'), isSigner: false, isWritable: false },
                        { pubkey: publicKey, isSigner: true, isWritable: true },
                        { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
                        { pubkey: new PublicKey('So11111111111111111111111111111111111111112'), isSigner: false, isWritable: false }
                    ],
                    programId: programId,
                    data: Buffer.from(ix_data),
                })
            );

            transaction.feePayer = publicKey;

            try {
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to get RecentBlockhash: ", error);
                }
                return;
            }

            let signedTransactions = null;

            try {
                signedTransactions = await signAllTransactions([transaction]);
            } catch (error) {
                if (DEBUG) {
                    console.error("Transaction was cancelled: ", error);
                }
                return;
            }

            let signature = null;
            try {
                signature = await connection.sendRawTransaction(signedTransactions[0].serialize(), { skipPreflight: true });
            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to send transaction: ", error);
                }
                return;
            }

            setStatus(`Transaction sent successfully. Transaction signature: ${signature}`);
        } catch (error) {
            if (error instanceof SendTransactionError) {
                console.error("Transaction error:", error);
            }
            setStatus(`Error: ${error.message}`);
        }
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto',
            marginTop: '0px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        }}>
            <Header />
            <div style={{ marginTop: '80px' }}></div>
            <h3>Convert SOL to wSOL (fixed at 1SOL)</h3>
            <button onClick={handleConvert} disabled={!isWalletReady}>Convert</button>
            <h3>Convert wSOL to SOL (close wSOL account)</h3>
            <button onClick={handleClose} disabled={!isWalletReady}>Close</button>
            {status && <p>{status}</p>}
        </div>
    );
}

export default SOL2WSOLMain;