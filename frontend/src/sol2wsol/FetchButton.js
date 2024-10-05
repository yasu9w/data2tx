import React from 'react';

//import * as geofire from 'geofire-common';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Connection } from "@solana/web3.js";

const DEBUG = true;

function FetchButton({ db, startDate, endDate, onDownload, publickeyStr, setIsLocked, setProcessingMessage }) {

    const { wallet, signMessage } = useWallet();
    const { publicKey } = useWallet();

    //const QUICKNODE_RPC = 'https://api.devnet.solana.com';
    const QUICKNODE_RPC = process.env.REACT_APP_QUICKNODE_RPC;
    const connection = new Connection(QUICKNODE_RPC);

    const downloadLink = async () => {

        setIsLocked(true);

        if (!publicKey) {
            setIsLocked(false);
            setProcessingMessage(``);
            if (DEBUG) {
                console.error('公開鍵がありません');
            }
            onDownload([]);
            return;
        } else {
            if (DEBUG) {
                console.error('publicKey:', publicKey);
            }
        }

        let currentDatetime = new Date();
        let currentDatetimeString = currentDatetime.toString();
        let message = publicKey.toString() + '.' + currentDatetimeString;
        //const messageBytes = new TextEncoder().encode(message);
        //const signature = await signMessage(messageBytes);

        let messageBytes = null;
        let signature = null;
        try {
            messageBytes = new TextEncoder().encode(message);
            signature = await signMessage(messageBytes);
        } catch (error) {
            setIsLocked(false);
            setProcessingMessage(``);
            if (DEBUG) {
                console.error('Signature failed:', error);
            }
            return;
        }

        let signatureBase64Str = btoa(String.fromCharCode.apply(null, signature));
        let publicKeyStr = publicKey.toString();

        const dbSellbuyCollection = process.env.REACT_APP_DB_SELLBUY;
        let collectionRefSellbuy = db.collection(dbSellbuyCollection);
        let query = collectionRefSellbuy
            .where('buyPublicKey', '==', publicKey.toString())
            .where('date1', '>=', startDate)
            .where('date1', '<=', endDate)
            .orderBy('date1', 'desc');

        //const snapshot = await query.get();
        let snapshot = null;
        try {
            snapshot = await query.get();
        } catch (error) {
            if (DEBUG) {
                console.error("Failed to get sellbuy list: ", error);
            }
            return;
        }

        let checkedOkSignature = []; //Signatures confirmed as OK using getConfirmedTransaction
        let checkedErrSignature = []; //Signatures confirmed as Err using getConfirmedTransaction

        let completedCount = 0;
        let promises = snapshot.docs.map(async (doc, index) => {

            const data = doc.data();
            if (DEBUG) {
                console.log("data: ", data);
            }

            // Initialize
            let verified = false; // Returns true if the purchase was successfully verified
            let updateFlag = false; // Returns true if an update to the sellbuy DB is required

            if (DEBUG) {
                console.log("data.status: ", data.status);
            }

            if (data.status === 1) { // Transaction approved status
                console.log("data.status === 1");
                if (checkedOkSignature.includes(data.signature)) { // Case where the signature has already been confirmed as OK using getConfirmedTransaction
                    updateFlag = true;

                } else if (checkedErrSignature.includes(data.signature)) { // Case where the signature has already been confirmed as NG using getConfirmedTransaction
                    verified = false;

                } else { // getConfirmedTransaction has not been executed, so verification is required

                    const MAX_RETRIES = 3;
                    let transactionStatus = null;

                    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
                        try {
                            transactionStatus = await connection.getTransaction(data.signature, {
                                maxSupportedTransactionVersion: 0,
                                commitment: 'finalized',
                              });
                            break;

                        } catch (error) {
                            if (attempt < MAX_RETRIES - 1) {
                                if (DEBUG) {
                                    console.log(`getConfirmedTransaction failed. Retrying... (${attempt + 1}/${MAX_RETRIES})`);
                                }
                            } else {
                                if (DEBUG) {
                                    console.log("getConfirmedTransaction failed after multiple attempts.");
                                }
                            }
                        }
                    }

                    if (transactionStatus.meta.status.Ok !== undefined) { // If the transaction status is OK
                        checkedOkSignature.push(data.signature);
                        updateFlag = true;

                    } else if (transactionStatus.meta.status.Err !== undefined) { // If the transaction status is Err
                        checkedErrSignature.push(data.signature);
                        verified = false;

                    } else {
                        verified = false;
                        if (DEBUG) {
                            console.log("Transaction status is unknown.");
                        }
                    }
                }

            } else if (data.status === 2) { // Transaction completed status
                verified = true;
            }

            if (updateFlag) { // There is a difference from the current state in the sellbuy DB

                const docRef = db.collection(dbSellbuyCollection).doc(doc.id);

                try {
                    await docRef.update({
                        status: 2,
                    }).then(() => {
                        verified = true;
                        if (DEBUG) {
                            console.log("Document written with ID: ", docRef.id);
                        }
                    }).catch((error) => {
                        verified = false;
                        if (DEBUG) {
                            console.error("Error adding document: ", error);
                        }
                    });

                } catch (error) {
                    if (DEBUG) {
                        console.log(`Agreement signing failed. Retrying... `);
                    }
                }
            }

            if (verified) {
                //let url = 'https://asia-northeast1-aifoods3.cloudfunctions.net/nodejs-get-img-url';
                let url = process.env.REACT_APP_CLOUD_FUNCTIONS;
                //console.log("data.filename:", data.filename);
                //console.error('message:', message);
                //console.error('publicKeyStr:', publicKeyStr);
                let query = {
                    fileName: data.filename,
                    message: message,
                    signature: signatureBase64Str,
                    publickeyStr: publicKeyStr
                }
                //console.log("query", query);

                try {
                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(query),
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    } else {
                        completedCount++;
                        setProcessingMessage(`Retrieving Image URL: ${completedCount} / ${snapshot.docs.length}`);
                        const json = await response.json();
                        console.log(json);
                        const date1 = data.date1.toDate();
                        const date1String = date1.toLocaleString();
                        return {
                            filename: data.filename,
                            date1: date1String,
                            ...json
                        };
                    }
                } catch (error) {
                    if (DEBUG) {
                        console.error('Error:', error);
                    }
                }
            }


        });

        let results = null;
        try {
            results = await Promise.all(promises);
        } catch (error) {
            if (DEBUG) {
                console.error('Error:', error);
            }
        }
        if (DEBUG) {
            console.log("results: ", results);
        }

        // Once the download is complete, send the result to the parent component using onDownload
        onDownload(results);
        setIsLocked(false);
        setProcessingMessage(``);

    }

    return <button onClick={downloadLink}>Search</button>;
}

export default FetchButton;