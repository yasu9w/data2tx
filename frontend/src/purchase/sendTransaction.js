import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, Transaction, TransactionInstruction, PublicKey, ComputeBudgetProgram } from "@solana/web3.js";
import React, { useState } from 'react';
import { Buffer } from 'buffer';
import { db } from "./firebase";
import firebase from "firebase/compat/app";
import { useLock } from './LockContext';

const DEBUG = true;

const MyComponent = ({ selectedImagesHandle }) => {
    const { setIsLocked, setSendingMessage, setIsSendCompleted, setHasIncompleteTransactions } = useLock();

    if (DEBUG) {
        console.log("Buy selected items:");
        selectedImagesHandle.forEach(element => {
            console.log(`ID: ${element[0]}, PublicKey: ${element[1]}`);
        });
    }

    const { wallet, publicKey, signAllTransactions } = useWallet();

    const settingTokenAddress = process.env.REACT_APP_TOKEN_ADDRESS;
    const settingComponyAddress = process.env.REACT_APP_COMPANY_ADDRESS;
    const settingSmartContract = process.env.REACT_APP_SMART_CONTRACT;

    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = async () => {

        setIsProcessing(true);
        setIsLocked(true);
        setHasIncompleteTransactions(false);
        setSendingMessage(`Starting transaction processing...`);

        //****************************************************//
        // Confirm public key and connect to RPC node
        //****************************************************//
        if (!publicKey) {
            if (DEBUG) {
                console.error('No public key available.');
            }
            setSendingMessage(`Public key not found`);
            return;
        } else {
            if (DEBUG) {
                console.error('publicKey:', publicKey);
            }
        }

        let connection = null;
        try {
            //const QUICKNODE_RPC = 'https://api.devnet.solana.com';
            const QUICKNODE_RPC = process.env.REACT_APP_QUICKNODE_RPC;
            connection = new Connection(QUICKNODE_RPC);

        } catch (error) {
            if (DEBUG) {
                console.error("Failed to connect to Solana RPC: ", error);
            }
            setSendingMessage(`Failed to connect to Solana RPC`);
            return;
        }



        //****************************************************//
        // Define transaction
        //****************************************************//
        // Generate an array of public keys from selectedImagesHandle
        const publickeys = selectedImagesHandle.map(item => new PublicKey(item[1]));
        const publickeys_str = selectedImagesHandle.map(item => item[1]);

        // Generate an array of filenames from selectedImagesHandle
        const filenames = selectedImagesHandle.map(item => {
            const nameWithoutExtension = item[0].split('.')[0];
            return Number(nameWithoutExtension.slice(0, -10));
        });

        const systemProgram = new PublicKey("11111111111111111111111111111111");
        const tokenProgram = new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
        const associatedTokenProgram = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL");
        const mintPubkey = new PublicKey(settingTokenAddress);

        const pubkey00 = publicKey;
        const pubkey01 = new PublicKey(settingComponyAddress);


        let pubkey_list0 = [pubkey00, pubkey01];
        let pubkey_list0_str = ["0", "1"];
        let filename_list0_ = [0, 0];

        let pubkey_list = pubkey_list0.concat(publickeys);
        let pubkey_list_str = pubkey_list0_str.concat(publickeys_str);
        let filename_list_ = filename_list0_.concat(filenames);
        //const filename_list = filename_list_.map(number => BigInt(number));
        const filename_list = filename_list_.map(number => Number(number));

        if (DEBUG) {
            console.log("pubkey_list", pubkey_list);
            console.log("pubkey_list_str", pubkey_list_str);
            console.log("filename_list_", filename_list_);
        }


        //****************************************************//
        // Check for the existence of the Associated Token Account; 
        //if it doesn't exist, set flag_list to 1; if it exists, set it to 0
        //****************************************************//
        let pda_list = [];
        let bump_list = [];
        let flag_list = null;

        try {

            let flagPromises = pubkey_list.map(async (pubkey) => {
                if (typeof pubkey !== 'undefined') {
                    const [pda, bump] = await PublicKey.findProgramAddress(
                        [pubkey.toBuffer(), tokenProgram.toBuffer(), mintPubkey.toBuffer()],
                        associatedTokenProgram
                    );

                    if (DEBUG) {
                        console.log("pubkey:", pubkey.toString());
                        console.log("bump:", bump);
                        console.log("pda:", pda.toString());
                    }
                    pda_list.push(pda);
                    bump_list.push(bump)
                    const accountInfo = await connection.getAccountInfo(pda);
                    return accountInfo == null ? 1 : 0; //1 account no exists, 0 account exist
                }
                return null;
            });

            flag_list = await Promise.all(flagPromises);

            if (DEBUG) {
                console.log("flag_list before", flag_list);
            }

            for (let i = 0; i < pubkey_list_str.length; i++) {
                if (pubkey_list_str.slice(0, i).includes(pubkey_list_str[i])) {
                    flag_list[i] = 0;
                }
            }
            if (DEBUG) {
                console.log("flag_list after", flag_list);
            }

        } catch (error) {
            if (DEBUG) {
                console.error("Failed to get the Associated Token Account: ", error);
            }
            setSendingMessage(`Failed to get the Associated Token Account`);
            return;
        }


        //****************************************************//
        // Split transaction
        //****************************************************//
        let flagChunks = [];
        let pubkeyChunks = [];
        let pdaChunks = [];
        let bumpChunks = [];
        let filenameChunks = [];
        let tempArrayFlag = [];
        let tempArrayPubkey = [];
        let tempArrayPda = [];
        let tempArrayBump = [];
        let tempArrayFilename = [];
        let firstElementFlag = flag_list[0];
        let firstElementPubkey = pubkey_list[0];
        let firstElementPda = pda_list[0];
        let firstElementBump = bump_list[0];
        let firstElementFilename = filename_list[0];
        let secondElementFlag = flag_list[1];
        let secondElementPubkey = pubkey_list[1];
        let secondElementPda = pda_list[1];
        let secondElementBump = bump_list[1];
        let secondElementFilename = filename_list[1];
        let countOnes = 0;
        let countTotal = 0;

        let filenameChunksStr = [];
        let tempArrayFilenameStr = [];

        for (let i = 2; i < flag_list.length; i++) {
            countOnes = flag_list[i] === 1 ? countOnes + 1 : countOnes;
            countTotal++;
            if (countOnes > 5 || countTotal > 10) {
                flagChunks.push([firstElementFlag, secondElementFlag].concat(tempArrayFlag));
                pubkeyChunks.push([firstElementPubkey, secondElementPubkey].concat(tempArrayPubkey));
                pdaChunks.push([firstElementPda, secondElementPda].concat(tempArrayPda));
                bumpChunks.push([firstElementBump, secondElementBump].concat(tempArrayBump));
                filenameChunks.push([firstElementFilename, secondElementFilename].concat(tempArrayFilename));
                filenameChunksStr.push(["empty", "empty"].concat(tempArrayFilenameStr));

                countOnes = flag_list[i] === 1 ? 1 : 0;
                countTotal = 1;
                tempArrayFlag = [];
                tempArrayPubkey = [];
                tempArrayPda = [];
                tempArrayBump = [];
                tempArrayFilename = [];
                tempArrayFilenameStr = [];
            }
            tempArrayFlag.push(flag_list[i]);
            tempArrayPubkey.push(pubkey_list[i]);
            tempArrayPda.push(pda_list[i]);
            tempArrayBump.push(bump_list[i]);
            tempArrayFilename.push(filename_list[i]);
            tempArrayFilenameStr.push(selectedImagesHandle[i - 2]);
        }

        // If there are remaining elements
        if (tempArrayFlag.length > 0) {
            flagChunks.push([firstElementFlag, secondElementFlag].concat(tempArrayFlag));
            pubkeyChunks.push([firstElementPubkey, secondElementPubkey].concat(tempArrayPubkey));
            pdaChunks.push([firstElementPda, secondElementPda].concat(tempArrayPda));
            bumpChunks.push([firstElementBump, secondElementBump].concat(tempArrayBump));
            filenameChunks.push([firstElementFilename, secondElementFilename].concat(tempArrayFilename));
            filenameChunksStr.push(["empty", "empty"].concat(tempArrayFilenameStr));
        }


        //****************************************************//
        // Send the split transactions in order
        //****************************************************//

        setSendingMessage(`Send Transaciton... 0 / ${flagChunks.length}`);

        for (let i = 0; i < flagChunks.length; i++) {

            let flag_list_ = flagChunks[i];
            let pubkey_list_ = pubkeyChunks[i];
            let pda_list_ = pdaChunks[i];
            let bump_list_ = bumpChunks[i];
            let filename_list_ = filenameChunks[i];
            let filename_str_list_ = filenameChunksStr[i];

            let keys_ = [
                { pubkey: systemProgram, isSigner: false, isWritable: false },
                { pubkey: tokenProgram, isSigner: false, isWritable: false },
                { pubkey: associatedTokenProgram, isSigner: false, isWritable: false },
                { pubkey: mintPubkey, isSigner: false, isWritable: false },
            ];

            for (let j = 0; j < pubkey_list_.length; j++) { //
                if (j === 0) {
                    keys_.push({ pubkey: pubkey_list_[j], isSigner: true, isWritable: true });
                    keys_.push({ pubkey: pda_list_[j], isSigner: false, isWritable: true });
                } else {
                    keys_.push({ pubkey: pubkey_list_[j], isSigner: false, isWritable: true });
                    keys_.push({ pubkey: pda_list_[j], isSigner: false, isWritable: true });
                }
            }

            //ix_data format
            /*
            00 : number of accounts (0: one account, 2 or more pictures, 1: one account, one picture, 2: two accounts, two pictures, ...)
            01 : number of purchase pictures
            02 : bump of pubkey //Removed
            03 : flag account 01  0:account exists, 1:no account exists
            04 : flag account 02  0:account exists, 1:no account exists
            05 : flag account 03  0:account exists, 1:no account exists
            06 : flag account 04  0:account exists, 1:no account exists
            07 : flag account 05  0:account exists, 1:no account exists
            08 : flag account 06  0:account exists, 1:no account exists
            09 : flag account 07  0:account exists, 1:no account exists
            10 : flag account 08  0:account exists, 1:no account exists
            11 : flag account 09  0:account exists, 1:no account exists
            */

            //let ix_data = [pubkey_list_.length, pubkey_list_.length, bump_list_[0]];
            let ix_data = [pubkey_list_.length, pubkey_list_.length, 0]; //Temporary handling for removed bump seed 

            ix_data.push(...flag_list_);

            /*
            for (let j = 2; j < filename_list_.length; j++) { //
                const buffer_ = new ArrayBuffer(8);
                const view = new DataView(buffer_);
                view.setBigUint64(0, filename_list_[j], true); // true for little endian
                const numberAsUint8Array = new Uint8Array(buffer_);

                ix_data.push(...numberAsUint8Array);
            }
            */

            for (let j = 2; j < filename_list_.length; j++) {
                const buffer_ = new ArrayBuffer(8);
                const view = new DataView(buffer_);

                // Set the 14-digit number as a 64-bit integer
                const num = filename_list_[j];
                view.setUint32(0, num & 0xFFFFFFFF, true); // Lower 32 bits
                view.setUint32(4, Math.floor(num / 0x100000000), true); // Upper 32 bits

                const numberAsUint8Array = new Uint8Array(buffer_);
                ix_data.push(...numberAsUint8Array);
            }

            const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
                units: 1400000
            });

            const transaction = new Transaction()
                .add(modifyComputeUnits);

            await transaction.add(
                new TransactionInstruction({
                    keys: keys_,
                    data: Buffer.from(ix_data),
                    programId: new PublicKey(settingSmartContract),
                })
            );

            transaction.feePayer = publicKey;

            //****************************************************//
            // Retrieve RecentBlockhash
            //****************************************************//
            try {
                transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to get RecentBlockhash: ", error);
                }
                setSendingMessage(`Failed to get RecentBlockhash`);
                return;
            }

            if (wallet && signAllTransactions) {

                const dbSellbuyCollection = process.env.REACT_APP_DB_SELLBUY;
                const dbPublicKeysCollection = process.env.REACT_APP_DB_PUBLICKEYS;


                //****************************************************//
                // Sign the transaction, linked with wallet UI
                //****************************************************//

                let signedTransactions = null;

                try {
                    signedTransactions = await signAllTransactions([transaction]);

                } catch (error) {
                    if (DEBUG) {
                        console.error("Transaction was cancelled: ", error);
                    }
                    setSendingMessage(``);
                    setIsProcessing(false);
                    setIsLocked(false);
                    // If multiple transactions are interrupted midway, reload because some have already been purchased
                    if (i > 0) {
                        setHasIncompleteTransactions(true);
                    }
                    return;
                }

                //****************************************************//
                // Add to sellbuy database, register with status = 0
                //****************************************************//

                for (let j = 2; j < filename_list_.length; j++) {
                    let id = publicKey.toString().substring(0, 10) + filename_str_list_[j][0].substring(0, 14) + pubkey_list_[j].toBase58().substring(0, 10);

                    const docRef = db.collection(dbSellbuyCollection).doc(id);

                    docRef.set({
                        buyPublicKey: publicKey.toString(),
                        sellPublicKey: pubkey_list_[j].toBase58(),
                        filename: filename_str_list_[j][0],
                        date0: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 0,
                        flag: flag_list_[j]

                    }).then(() => {
                        if (DEBUG) {
                            console.log("Update status to transaction ready: ", docRef.id);
                        }
                        setSendingMessage(`Update status to transaction ready... ${j - 2 + 1} / ${filename_list_.length - 2}images, ${i + 1} / ${flagChunks.length}transactions`);

                    }).catch((error) => {
                        if (DEBUG) {
                            console.log("Failed to update status to transaction ready: ", docRef.id);
                        }
                        setSendingMessage(`Failed to update status to transaction ready... ${j - 2 + 1} / ${filename_list_.length - 2}images, ${i + 1} / ${flagChunks.length}transactions`);
                        return;
                    });

                }

                //****************************************************//
                // Send transaction
                //****************************************************//

                let signature = null;
                try {
                    signature = await connection.sendRawTransaction(signedTransactions[0].serialize(),{skipPreflight: true});

                } catch (error) {
                    if (DEBUG) {
                        console.error("Failed to send transaciton: ", error);
                    }
                    setSendingMessage(`Failed to send transaciton... ${i + 1} / ${flagChunks.length}`);
                    return;
                }

                //****************************************************//
                // Update sellbuy database, set status = 1 and register signature
                //****************************************************//
                for (let j = 2; j < filename_list_.length; j++) {
                    let id = publicKey.toString().substring(0, 10) + filename_str_list_[j][0].substring(0, 14) + pubkey_list_[j].toBase58().substring(0, 10);

                    const docRef = db.collection(dbSellbuyCollection).doc(id);

                    docRef.update({
                        date1: firebase.firestore.FieldValue.serverTimestamp(),
                        status: 1,
                        signature: signature,
                    }).then(() => {
                        if (DEBUG) {
                            console.log("Update status to transaction sent: ", docRef.id);
                        }
                        setSendingMessage(`Update status to transaction sent... ${j - 2 + 1} / ${filename_list_.length - 2}images, ${i + 1} / ${flagChunks.length}transactions`);
                    }).catch((error) => {
                        setSendingMessage(`Failed to update status to transaction sent... ${j - 2 + 1} / ${filename_list_.length - 2}images, ${i + 1} / ${flagChunks.length}transactions`);
                        return;
                    });

                }

                //****************************************************//
                // Update mapApiPoint
                //****************************************************//

                let collectionRefPublicKeys = db.collection(dbPublicKeysCollection);
                let publicKey10 = publicKey.toString().substring(0, 10);
                const docRef = collectionRefPublicKeys.doc(publicKey10);

                const doc = await docRef.get();
                const pointsPerImage = 5;
                docRef.set({
                    mapApiPoint: doc.data().mapApiPoint + pointsPerImage * (filename_list_.length - 2),
                }, { merge: true })
                    .then(() => {
                        if (DEBUG) {
                            console.log("Granted map API points: ", pointsPerImage * (filename_list_.length - 2));
                        }
                    })
                    .catch((error) => {
                        setSendingMessage(`Failed to grant map API points.`);
                        return;
                    });

                if (DEBUG) {
                    console.log('Transaction sent:', signature);
                }

                setSendingMessage(`Transaction sent successfully... ${i + 1} / ${flagChunks.length}`);

            } else {

                if (!wallet && !signAllTransactions) {
                    if (DEBUG) {
                        console.log("Failed to connect to wallet and sign transactions.");
                    }
                    setSendingMessage(`Failed to connect to wallet and sign transactions.`);

                } else if (!wallet) {
                    if (DEBUG) {
                        console.log("Failed to connect to wallet.");
                    }
                    setSendingMessage(`Failed to connect to wallet.`);

                } else {
                    if (DEBUG) {
                        console.log("Failed to sign transactions.");
                    }
                    setSendingMessage(`Failed to sign transactions.`);

                }
                return;
            }


        }

        setIsProcessing(false);
        setIsLocked(false);
        setIsSendCompleted(true);
        setSendingMessage('');

    };

    return (
        <div>
            <button
                onClick={handleClick}
                disabled={isProcessing}
                style={{
                    backgroundColor: '#512da8',
                    color: 'white',
                    border: 'none',
                    padding: '12px 37px',
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s',
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#1a1f2e')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#512da8')}
            >
                {isProcessing ? 'Processing...' : 'Purchase'}
            </button>
        </div>
    );
}

export const SendTransaction = ({ selectedImagesHandle }) => {
    return <MyComponent selectedImagesHandle={selectedImagesHandle} />;
};
