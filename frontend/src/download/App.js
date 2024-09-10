
import { db } from "./firebase";
import React, { useState } from 'react';
import FetchButton from './FetchButton';


import WalletContextProvider from './WalletContextProvider'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';

const DEBUG = true;

const DownloadMain = () => (
    <WalletContextProvider>
        <DownloadApp />
    </WalletContextProvider>
)

function DownloadApp() {

    const { publicKey } = useWallet();

    const [results, setResults] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLocked, setIsLocked] = useState(false);
    const [processingMessage, setProcessingMessage] = useState("");

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    }

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    }

    const stringToStartDate = (dateString) => {
        if (!dateString) {
            return new Date();
        }

        const date = new Date(dateString);
        if (isNaN(date)) {
            return new Date();
        } else {
            date.setHours(0, 0, 0, 0); // 当日の開始時間に設定
            return date;
        }
    }

    const stringToEndDate = (dateString) => {
        if (!dateString) {
            return new Date();
        }

        const date = new Date(dateString);
        if (isNaN(date)) {
            return new Date();
        } else {
            date.setHours(23, 59, 59, 999); // 当日の終了時間に設定
            return date;
        }
    }

    function downloadFile(filename, url, urlJson) {
        fetch(url, {
            method: 'GET',
        }).then(response => {
            response.blob().then(blob => {
                let url = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = url;
                a.download = filename;
                a.click();
            });
        });
        fetch(urlJson, {
            method: 'GET',
        }).then(response => {
            response.blob().then(blob => {
                let urlJson = window.URL.createObjectURL(blob);
                let a = document.createElement('a');
                a.href = urlJson;
                a.download = filename.split('.')[0] + '.json';
                a.click();
            });
        });
    }

    const downloadFiles = (results) => {
        results
            .filter(result => result.url && result.urlJson)
            .forEach((result) => {
                downloadFile(result.filename, result.url, result.urlJson);
            });
    };

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
                        DOWNLOAD PAGE
                    </h1>
                    <div>
                        <WalletMultiButton
                            style={isLocked ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                        />
                    </div>
                </div>
            </div>
        );
    });

    const Overlay = () => {
        return isLocked ? (
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '24px',
                pointerEvents: 'auto'  // オーバーレイ上のイベントを有効化
            }}>
                {processingMessage}
            </div>
        ) : null;
    };

    return (
        <div>

            <Overlay />
            <Header />


            <div style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                marginTop: '60px', // ヘッダーの高さ分の余白を確保
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px' // 要素間のスペースを追加
            }}>

                {!publicKey &&
                    <div>
                        <h2>Connect your wallet to start...</h2>
                    </div>
                }

                {publicKey &&
                    <div style={{
                        padding: '20px',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px' // 要素間のスペースを追加
                    }}>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '50px' }}>
                                <label>Purchase Date</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ minWidth: '50px' }}>FROM:</label>
                                <input type="date" value={startDate} onChange={handleStartDateChange} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ minWidth: '50px' }}>TO:</label>
                                <input type="date" value={endDate} onChange={handleEndDateChange} />
                            </div>
                        </div>

                        <FetchButton
                            db={db}
                            startDate={stringToStartDate(startDate)}
                            endDate={stringToEndDate(endDate)}
                            onDownload={setResults}
                            setIsLocked={setIsLocked}
                            setProcessingMessage={setProcessingMessage}
                        />

                    </div>
                }

                {results &&
                    <div style={{
                        padding: '20px',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginBottom: '100px', 
                        gap: '20px' // 要素間のスペースを追加
                    }}>
                        <button onClick={() => downloadFiles(results)}>Download All</button>
                        <div style={{ marginBottom: '10px' }}></div>

                        <span><strong>Purchase Date / Filename / Image / Json </strong></span>

                        {results.map((result, index) => (
                            result && result.url && result.urlJson ? (
                                <div key={index} style={{ display: 'flex', alignItems: 'center'}}>
                                    <span style={{ width: '100px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.date1}</span>
                                    <span style={{ marginLeft: '10px' }}><strong>{result.filename}</strong></span>
                                    <span style={{ marginLeft: '10px' }}><a href={result.url} target="_blank" rel="noopener noreferrer">image</a></span>
                                    <span style={{ marginLeft: '10px' }}><a href={result.urlJson} target="_blank" rel="noopener noreferrer">json</a></span>
                                </div>
                            ) : null
                        ))}
                    </div>
                }
            </div>

        </div>
    );
}

export default DownloadMain;