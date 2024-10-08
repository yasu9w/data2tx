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

//const PROGRAM_ID_CONVERT = new PublicKey("BVyaTTKdj2XG1ptN2fYYmfbkQZitseN4nqDQBGvovnA2");
const PROGRAM_ID_CONVERT = new PublicKey("G5A9EjLns77zKhCzPLqoTfjr3i1pJJ7QxRFd3ap9YWMK");
const PROGRAM_ID_CLOSE = new PublicKey("Cj4DVtFabsYmEJkhe4Dpa69x1RLC3FRBCqtJQYgaCxed");

const SOL2WSOLMain = () => (
    <WalletContextProvider>
        <SOL2WSOLApp />
    </WalletContextProvider>
);

const Header = React.memo(() => {

    const isMobile = window.innerWidth <= 600;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'white',
            zIndex: 1000,
            borderBottom: '1px solid #ddd',
            fontFamily: 'Arial, sans-serif',
        }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 20px',
                maxWidth: '1200px',
                margin: '0 auto'
            }}>                
                <h1 style={{ 
                    textTransform: 'uppercase', 
                    margin: 0,
                    fontSize: isMobile ? '16px' : '24px'
                }}>
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

            const [associatedTokenAddress] = await PublicKey.findProgramAddressSync(
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
            let ix_data = [existsFlag];

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
            maxWidth: '100%',
            margin: '0 auto',
            marginTop: '0px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif',
        }}>
            <Header />
            <div style={{ marginTop: '80px' }}></div>

            <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '20px 0 10px 0',
                textAlign: 'center',
            }}>
                Airdrop (Link to Solana Faucet)
            </h3>
            <button 
                onClick={() => window.open("https://faucet.solana.com/", "_blank")} 
                style={{ 
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    fontSize: '16px',
                }}
            >
                Airdrop SOL
            </button>

            <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '20px 0 10px 0',
                textAlign: 'center',
            }}>
                Convert SOL to wSOL
            </h3>
            <button 
                onClick={handleConvert} 
                disabled={!isWalletReady}
                style={{ 
                    padding: '10px 20px',
                    backgroundColor: isWalletReady ? '#007bff' : '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isWalletReady ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                }}
            >
                SOL &rarr; wSOL
            </button>

            <h3 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                margin: '20px 0 10px 0',
                textAlign: 'center',
            }}>
                Convert wSOL to SOL
            </h3>
            <button 
                onClick={handleClose} 
                disabled={!isWalletReady}
                style={{ 
                    padding: '10px 20px',
                    backgroundColor: isWalletReady ? '#007bff' : '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isWalletReady ? 'pointer' : 'not-allowed',
                    fontSize: '16px',
                }}
            >
                wSOL &rarr; SOL
            </button>

            {status && (
            <p style={{
                wordWrap: 'break-word',
                maxWidth: '100%',
                overflowWrap: 'break-word',
                textAlign: 'center',
                whiteSpace: 'normal',
                overflowX: 'hidden',
                fontSize: '14px',
                color: '#333',
                marginTop: '20px',
            }}>
                {status}
            </p>
        )}
        </div>
    );
}

export default SOL2WSOLMain;