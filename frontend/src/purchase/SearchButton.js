//import React from 'react';
import React, { useEffect, useState } from 'react';
import { storage_preview } from "./firebase";

import * as geofire from 'geofire-common';
import { useWallet } from '@solana/wallet-adapter-react';
import { useLock } from './LockContext';


const DEBUG = true;


//画像IDページのURL作成
function createUrlitemID(params) {
    const origin = window.location.origin;

    const queryParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        queryParams.set(key, value);
    }

    const newUrl = `${origin}/purchase/?${queryParams.toString()}`;

    return newUrl;
}

//publickeyページのURL作成
function createUrlpublicKey(params) {

    const queryParams = new URLSearchParams(
        Object.entries(params).filter(([key, value]) => value !== null && value !== '')
    );

    for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== '') {
            queryParams.set(key, value);
        }
    }
    const newUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;
    return newUrl;
}

function stringToDateTimeStart(startDate, startTime) {
    // startTimeがnullの場合、"00:00"を代入
    if (!startTime) {
        startTime = "00:00";
    }

    // startDateがnullの場合、現在の日付をISO 8601形式の日付文字列に変換
    if (!startDate) {
        return new Date();
    }

    // startDateとstartTimeを組み合わせる
    const dateTimeString = `${startDate}T${startTime}`;

    // Dateオブジェクトを作成
    const dateTime = new Date(dateTimeString);

    // Dateオブジェクトが無効な場合（組み合わせが無効な日時の場合）、現在の日時を返す
    if (isNaN(dateTime.getTime())) {
        return new Date();
    } else {
        // 有効な日時の場合、そのDateオブジェクトを返す
        return dateTime;
    }
}

function stringToDateTimeEnd(endDate, endTime) {
    // startTimeがnullの場合、"23:59"を代入
    if (!endTime) {
        endTime = "23:59";
    }

    // endDateがnullの場合、現在の日付をISO 8601形式の日付文字列に変換
    if (!endDate) {
        return new Date();
    }

    // endDateとendTimeを組み合わせる
    const dateTimeString = `${endDate}T${endTime}`;

    // Dateオブジェクトを作成
    const dateTime = new Date(dateTimeString);

    // Dateオブジェクトが無効な場合（組み合わせが無効な日時の場合）、現在の日時を返す
    if (isNaN(dateTime.getTime())) {
        return new Date();
    } else {
        // 有効な日時の場合、そのDateオブジェクトを返す
        return dateTime;
    }
}

function getGeoHashLength(zoom, CenterLat, CenterLng, NElat, NElng, SWlat, SWlng) {

    let center = [CenterLat, CenterLng];

    if (zoom <= 2) {
        NElng = 180
        SWlng = -180
    }

    if (NElat > 90) {
        NElat = 90
    }

    if (SWlat < -90) {
        SWlat = -90
    }

    let NE = [0.9 * (NElat - center[0]) + center[0], 0.9 * (NElng - center[1]) + center[1]];
    let NW = [0.9 * (NElat - center[0]) + center[0], 0.9 * (SWlng - center[1]) + center[1]];
    let SE = [0.9 * (SWlat - center[0]) + center[0], 0.9 * (NElng - center[1]) + center[1]];
    let SW = [0.9 * (SWlat - center[0]) + center[0], 0.9 * (SWlng - center[1]) + center[1]];

    console.log("NE:", NE)
    console.log("NW:", NW)
    console.log("SE:", SE)
    console.log("SW:", SW)

    let hashCenter = geofire.geohashForLocation(center);
    let hashNE = geofire.geohashForLocation(NE);
    let hashNW = geofire.geohashForLocation(NW);
    let hashSE = geofire.geohashForLocation(SE);
    let hashSW = geofire.geohashForLocation(SW);
    let geoHashLength = null;

    const zoomLevels = [
        { maxZoom: 3, geoHashLength: 'geohash0', hashLength: 0 },
        { maxZoom: 6, geoHashLength: 'geohash1', hashLength: 1 },
        { maxZoom: 8, geoHashLength: 'geohash2', hashLength: 2 },
        { maxZoom: 11, geoHashLength: 'geohash3', hashLength: 3 },
        { maxZoom: 13, geoHashLength: 'geohash4', hashLength: 4 },
        { maxZoom: 16, geoHashLength: 'geohash5', hashLength: 5 },
        { maxZoom: 18, geoHashLength: 'geohash6', hashLength: 6 },
        { maxZoom: 22, geoHashLength: 'geohash7', hashLength: 7 },
    ];

    for (const level of zoomLevels) {
        if (zoom <= level.maxZoom) {
            geoHashLength = level.geoHashLength;
            if (level.hashLength > 0) {
                hashCenter = hashCenter.substring(0, level.hashLength);
                hashNE = hashNE.substring(0, level.hashLength);
                hashNW = hashNW.substring(0, level.hashLength);
                hashSE = hashSE.substring(0, level.hashLength);
                hashSW = hashSW.substring(0, level.hashLength);
            } else {
                hashCenter = null;
                hashNE = null;
                hashNW = null;
                hashSE = null;
                hashSW = null;
            }
            break;
        }
    }

    // 22より大きい場合はすべてnullに設定
    if (zoom > 22) {
        geoHashLength = 'null';
        hashCenter = null;
        hashNE = null;
        hashNW = null;
        hashSE = null;
        hashSW = null;
    }

    const arrayHashQuery = [hashCenter, hashNE, hashNW, hashSE, hashSW];
    const uniqueArrayHashQuery = [...new Set(arrayHashQuery)];


    if (DEBUG) {
        console.log("arrayHashQuery:", arrayHashQuery);
        console.log("uniqueArrayHashQuery:", uniqueArrayHashQuery);
    }

    return [geoHashLength, uniqueArrayHashQuery];

}

function SearchButton({
    db,
    queryKey,
    startDate,
    startTime,
    endDate,
    endTime,
    selectedSortOrder,
    zoom,
    CenterLat,
    CenterLng,
    NElat,
    NElng,
    SWlat,
    SWlng,
    imageId,
    onSearchMsg,
    onDocData,
    setSelectedImagesHandle,
    onClick,
    setSelectedImagesFlag,
    setSendButtonDisabled,
}) {
    if (DEBUG) {
        console.log("function SearchButton");
        console.log("queryKey", queryKey)
        console.log("startDate", startDate)
        console.log("startTime", startTime)
        console.log("endDate", endDate)
        console.log("endTime", endTime)
        console.log("selectedSortOrder", selectedSortOrder)
        console.log("zoom", zoom)
        console.log("CenterLat", CenterLat)
        console.log("CenterLng", CenterLng)
        console.log("NElat", NElat)
        console.log("NElng", NElng)
        let adjustedNElng = (NElng + 180) % 360 - 180;
        if (adjustedNElng < -180) {
            adjustedNElng += 360;
        }
        console.log("adjustedNElng:", adjustedNElng)
        console.log("SWlat", SWlat)
        console.log("SWlng", SWlng)
        let adjustedSWlng = (SWlng + 180) % 360 - 180;
        if (adjustedSWlng < -180) {
            adjustedSWlng += 360;
        }
        console.log("adjustedSWlng:", adjustedSWlng)
        console.log("imageId", imageId)
        console.log("onSearchMsg", onSearchMsg)
        console.log("onDocData", onDocData)
        console.log("setSelectedImagesHandle", setSelectedImagesHandle)
        console.log("setSelectedImagesFlag", setSelectedImagesFlag)
        console.log("setSendButtonDisabled", setSendButtonDisabled)
    }

    const [imageCache, setImageCache] = useState({});

    const { isLocked, setIsLocked, isSendCompleted, setIsSendCompleted, setSendingMessage, hasIncompleteTransactions, setHasIncompleteTransactions, setUseJSMapAPI } = useLock();

    const { disconnect, publicKey } = useWallet();

    const dbImagesCollection = process.env.REACT_APP_DB_IMAGES;
    let collectionRefImages = db.collection(dbImagesCollection);
    const dbSellbuyCollection = process.env.REACT_APP_DB_SELLBUY;
    let collectionRefSellbuy = db.collection(dbSellbuyCollection);

    const queryString = window.location.search;

    // URLSearchParamsオブジェクトを作成
    const queryParams = new URLSearchParams(queryString);

    // クエリパラメータが1つでも含まれているかチェック
    const hasQueryParams = queryParams.keys().next().done === false;

    //****************************************************//
    //地図情報をもとに画像検索クエリ生成
    //****************************************************//

    const searchImages = async () => {
        if (DEBUG) {
            console.log("searchImages");
        }

        let selectedImages = {};
        let selectedImagesArray = [];
        let purchasedList = [];
        let purchasedList0 = [];
        let purchasedList1 = [];
        let purchasedList2 = [];

        try {

            //////////////////////////////////////////////////////////
            //検索クエリ作成
            //////////////////////////////////////////////////////////

            const [geoHashLength, centerHash] = getGeoHashLength(zoom, CenterLat, CenterLng, NElat, NElng, SWlat, SWlng);

            let searchResultMessage = "loading...";
            onSearchMsg(searchResultMessage);

            let searchSortOrderType = null;
            if (selectedSortOrder === 'uploadDate') {
                searchSortOrderType = 'dateUpload';
            } else if (selectedSortOrder === 'captureDate') {
                searchSortOrderType = 'dateOriginal';
            }

            let query;
            if (imageId !== null) {

                query = collectionRefImages
                    .where('filename', '==', imageId);
                NElat = 90;
                NElng = 180;
                SWlat = -90;
                SWlng = -180;

            } else {

                if (queryKey) {
                    query = collectionRefImages
                        .where('publicKey', '==', queryKey);
                } else {
                    query = collectionRefImages;
                }

                if (geoHashLength && geoHashLength !== 'geohash0' && centerHash) {
                    query = query.where(geoHashLength, 'in', centerHash);
                }

                if (startDate) {
                    if (!startTime) {
                        startTime = "00:00"
                    }
                    query = query.where(searchSortOrderType, '>=', stringToDateTimeStart(startDate, startTime));
                }

                if (endDate) {
                    if (!endTime) {
                        endTime = "24:00"
                    }
                    query = query.where(searchSortOrderType, '<', stringToDateTimeEnd(endDate, endTime));
                }

                query = query.orderBy(searchSortOrderType, 'desc').limit(50);

            }

            
            //////////////////////////////////////////////////////////
            //スナップショット取得
            //////////////////////////////////////////////////////////

            let snapshot = null;

            try {
                snapshot = await query.get();
            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to get snapshot: ", error);
                }
                return;
            }

            if (setSelectedImagesFlag) {
                setSelectedImagesFlag(false);
            }

            if (setSendButtonDisabled) {
                setSendButtonDisabled(true);
            }

            
            //////////////////////////////////////////////////////////
            //購入済みリストpurchasedListを作成する　（docDataAllはこの後は参照しない）
            //////////////////////////////////////////////////////////

            const storagePath = process.env.REACT_APP_STORAGE_PATH;
            const storageRefPreview = storage_preview.ref(storagePath);

            try {

                let promises = snapshot.docs
                    .filter((doc, index) => { //地図の表示範囲のデータのみフィルタ
                        return SWlat < doc.data().latitude && doc.data().latitude < NElat && SWlng < doc.data().longitude && doc.data().longitude < NElng;
                    })
                    .map(async doc => {
                        const data = doc.data();

                        //ウォレットが接続されpublickeyがある場合は購入済みリストを作成
                        if (publicKey != null) {

                            const id_ = publicKey.toString().substring(0, 10) + doc.id.split('.')[0];
                            const filename = doc.id;

                            let docRef = collectionRefSellbuy.doc(id_);

                            await docRef.get().then((doc) => {
                                if (doc.exists) {

                                    if (DEBUG) {
                                        console.log("購入済みコンテンツ: ", doc.data());
                                    }

                                    if (doc.data().status === 0) {
                                        purchasedList0.push(filename);
                                    }
                                    if (doc.data().status === 1) {
                                        purchasedList1.push(filename);
                                    }
                                    if (doc.data().status === 2) {
                                        purchasedList2.push(filename);
                                    }

                                    purchasedList.push(filename);

                                }

                            }).catch((error) => {
                                console.error("Error getting document:", error);

                            });

                        }

                        return data;
                    });

                // Promise.allを使ってすべてのPromiseが完了するのを待つ
                await Promise.all(promises);

            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to get docDataAll: ", error);
                }
                return;
            }

            
            //////////////////////////////////////////////////////////
            //App.jsにdocDataを返す（地図上にピンを打つ用）、後述のinfoOverlayに表示する情報(combinedProperty)を生成
            //////////////////////////////////////////////////////////

            let imageUrls = null;
            try {
                const imageUrlPromises = snapshot.docs.map(doc => {
                    //let docId = doc.id.replace(".", "_resized.");
                    let docId = doc.id.replace(".", "_resized_small.");
                    let fileRef = storageRefPreview.child(docId);
                    return fileRef.getDownloadURL();
                });

                imageUrls = await Promise.all(imageUrlPromises);

            } catch (error) {
                if (DEBUG) {
                    console.error("Failed to get imageUrls: ", error);
                }
                return;
            }

            const docData = snapshot.docs
                .map((doc, index) => { //doc, imageUrlをindexで紐付け
                    return {
                        doc,
                        imageUrl: imageUrls[index],
                    };
                })
                .filter(({ doc, imageUrl }) => { //地図の表示範囲のデータのみフィルタ
                    return SWlat < doc.data().latitude && doc.data().latitude < NElat && SWlng < doc.data().longitude && doc.data().longitude < NElng;
                })
                .map(({ doc, imageUrl }) => { //画像に重畳表示するデータを渡す
                    let combinedProperty = '';

                    combinedProperty += `Image: \n`;
                    combinedProperty += `  ${doc.id}\n\n`;

                    if (doc.data().publicKey) {
                        combinedProperty += `PublicKey: ${doc.data().publicKey}\n\n`;
                    }
                    if (doc.data().annotations) {
                        combinedProperty += `Annotations: ${doc.data().annotations}\n\n`;
                    }
                    if (doc.data().annotationsProtected) {
                        combinedProperty += `Annotations Protected: ${doc.data().annotationsProtected}\n\n`;
                    }
                    if (doc.data().dateOriginal) {
                        combinedProperty += `DateTimeOriginal: \n`;
                        combinedProperty += `  ${doc.data().dateOriginal.toDate()}\n\n`;
                    }
                    if (doc.data().imageHeight && doc.data().imageWidth) {
                        combinedProperty += `ImageHeight, Width: \n`;
                        combinedProperty += `  [${doc.data().imageHeight}, ${doc.data().imageWidth}]\n\n`;
                    }
                    if (doc.data().model) {
                        combinedProperty += `Model: \n`;
                        combinedProperty += `  ${doc.data().model}\n\n`;
                    }
                    if (doc.data().lensModel) {
                        combinedProperty += `LensModel: \n`;
                        combinedProperty += `  ${doc.data().lensModel}\n\n`;
                    }

                    return {
                        id: doc.id,
                        publicKey: doc.data().publicKey,
                        data: doc.data(),
                        imageUrl: imageUrl,
                        jsonData: combinedProperty,
                    };
                });

            console.log("docData, docData, docData, docData, docData, docData, docData, docData, docData, docData, docData, docData")
            console.log("docData", docData)
            onDocData(docData);

            if (docData.length === 0) {
                searchResultMessage = "No items found.";
                onSearchMsg(searchResultMessage);
            }

            
            //////////////////////////////////////////////////////////
            //imagecontainer作成
            //////////////////////////////////////////////////////////

            const newImageCache = { ...imageCache };

            // 前回の検索結果を全て削除
            const imageContainer = document.getElementById("image-container");
            imageContainer.style.display = 'flex';
            imageContainer.style.flexWrap = 'wrap';

            while (imageContainer.firstChild) {
                imageContainer.removeChild(imageContainer.firstChild);
            }
            console.log("imageContainer.removeChild(imageContainer.firstChild)imageContainer.removeChild(imageContainer.firstChild)")

            docData.forEach((item, index) => {

                ////////////////////////////////////////////////////////////////
                /////　画像の追加
                ////////////////////////////////////////////////////////////////
                let imageDiv = document.createElement('div');
                imageDiv.style.width = "360px";  // 720pxから360pxに変更
                imageDiv.style.height = "360px"; // 720pxから360pxに変更
                imageDiv.style.display = 'flex';
                imageDiv.style.alignItems = 'center';
                imageDiv.style.justifyContent = 'center';
                imageDiv.style.marginRight = "10px";
                imageDiv.style.marginBottom = "10px";
                imageDiv.style.border = '1px solid rgb(211,211,211)'; // 枠線のスタイルを灰色の細線に変更
                imageDiv.style.position = 'relative';

                if (newImageCache[item.imageUrl]) {
                    // キャッシュから画像を再利用
                    if (DEBUG) {
                        console.log("キャッシュから再利用", item.imageUrl)
                    }

                    let img = newImageCache[item.imageUrl].cloneNode();
                    img.style.maxWidth = "100%";
                    img.style.maxHeight = "100%";
                    img.style.objectFit = "contain";

                    img.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                    });

                    imageDiv.appendChild(img);

                } else {
                    try {
                        // 画像をダウンロードし、キャッシュに保存
                        if (DEBUG) {
                            console.log("画像をダウンロードし、キャッシュに保存", item.imageUrl)
                        }
                        let img = document.createElement('img');
                        img.src = item.imageUrl;
                        img.onload = () => {
                            newImageCache[item.imageUrl] = img.cloneNode();
                            setImageCache({ ...newImageCache });
                        };

                        img.style.maxWidth = "100%";
                        img.style.maxHeight = "100%";
                        img.style.objectFit = "contain";

                        img.addEventListener('contextmenu', (e) => {
                            e.preventDefault();
                        });
                        imageDiv.appendChild(img);

                    } catch (error) {
                        if (DEBUG) {
                            console.error("Failed to download img: ", item.imageUrl);
                            console.error("Failed to download img: ", error);
                        }
                        return;
                    }
                }

                ////////////////////////////////////////////////////////////////
                /////　infoOverlayの追加
                ////////////////////////////////////////////////////////////////
                // オーバーレイ情報を作成
                let infoOverlay = document.createElement('div');
                infoOverlay.style.position = 'absolute';
                infoOverlay.style.top = '0';
                infoOverlay.style.left = '0';
                infoOverlay.style.width = '100%';
                infoOverlay.style.height = '100%';
                infoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';  // 透明度を持つ黒色
                infoOverlay.style.color = 'white';
                infoOverlay.style.display = 'none';
                infoOverlay.style.alignItems = 'center';
                infoOverlay.style.justifyContent = 'center';
                infoOverlay.style.overflow = 'auto';  // Add this line
                infoOverlay.style.maxHeight = '360px';  // Add this line
                infoOverlay.style.whiteSpace = 'pre-wrap';  // Change to 'pre-wrap'
                infoOverlay.style.textAlign = 'left';  // Add this line

                // オーバーレイを画像のDIVに追加
                imageDiv.appendChild(infoOverlay);

                ////////////////////////////////////////////////////////////////
                /////　マウスが画像上に乗った時の処理を追加
                ////////////////////////////////////////////////////////////////

                imageDiv.addEventListener('mouseover', () => {
                    if (!infoOverlay.querySelector('.text-container')) {

                        // テキストとリンクを含む新しいdivを作成
                        let textContainer = document.createElement('div');
                        textContainer.className = 'text-container';
                        textContainer.style.textAlign = 'left';
                        textContainer.style.padding = '0';
                        textContainer.style.marginTop = '0';
                        textContainer.style.paddingTop = '0';

                        //画像IDへのリンクは保留
                        let linkTextId = item.id;
                        let urlId = createUrlitemID({ "id": item.id });
                        let linkHtmlId = `<a href="${urlId}" target="_blank" rel="noopener noreferrer" class="custom-link">${linkTextId}</a>`;

                        let linkTextKey = item.publicKey;
                        let params_url = {
                            key: item.publicKey,
                            startDate: startDate,
                            startTime: startTime,
                            endDate: endDate,
                            endTime: endTime,
                            zoom: zoom,
                            lat: CenterLat,
                            lng: CenterLng,
                            NElat: NElat,
                            NElng: NElng,
                            SWlat: SWlat,
                            SWlng: SWlng
                        };
                        let urlKey = createUrlpublicKey(params_url);
                        let linkHtmlKey = `<a href="${urlKey}" target="_blank" rel="noopener noreferrer" class="custom-link">${linkTextKey}</a>`;

                        textContainer.innerHTML = item.jsonData.replace(item.id, linkHtmlId).replace(item.publicKey, linkHtmlKey);

                        // CSSを追加
                        let style = `<style>.custom-link { color: #33FF33; text-decoration: none;} .custom-link:visited { color: #33FF33; } .custom-link:hover { color: #33FF33; text-decoration: underline; }</style>`;

                        infoOverlay.innerHTML = style;
                        infoOverlay.appendChild(textContainer);
                    }

                    infoOverlay.style.display = 'block';
                    infoOverlay.scrollTop = 0;
                });

                imageDiv.addEventListener('mouseout', () => {
                    infoOverlay.style.display = 'none';
                });


                ////////////////////////////////////////////////////////////////
                /////　購入済みをグレーアウトを追加
                ////////////////////////////////////////////////////////////////
                if (purchasedList.includes(item.id)) {
                    imageDiv.style.border = '1px solid rgb(211,211,211)';
                    imageDiv.style.pointerEvents = 'none';
                    imageDiv.setAttribute('disabled', '');

                    let overlay = document.createElement('div');
                    overlay.style.position = 'absolute';
                    overlay.style.top = '0';
                    overlay.style.right = '0';
                    overlay.style.bottom = '0';
                    overlay.style.left = '0';
                    overlay.style.backgroundColor = 'rgba(128, 128, 128, 0.5)';

                    infoOverlay.style.display = 'flex';
                    if (purchasedList0.includes(item.id)) {
                        infoOverlay.innerHTML = `
                        <div style="text-align: center;">
                            <p>Purchase Requested.<br />(Transaction Ready.)</p>
                        </div>
                    `;
                    }
                    if (purchasedList1.includes(item.id)) {
                        infoOverlay.innerHTML = `
                        <div style="text-align: center;">
                            <p>Purchase Requested.<br />(Transaction Approved.)</p>
                        </div>
                    `;
                    }
                    if (purchasedList2.includes(item.id)) {
                        infoOverlay.innerHTML = `
                        <div style="text-align: center;">
                            <p>Purchase Requested.<br />(Transaction Completed.)</p>
                        </div>
                    `;
                    }
                    imageDiv.appendChild(overlay);  // オーバーレイを画像のDIVに追加
                }


                ////////////////////////////////////////////////////////////////
                /////　通報フォームを追加（ポップアップメニュー）
                ////////////////////////////////////////////////////////////////

                // チェックボックス
                let checkboxes = [
                    { id: '1', label: 'A location where photography is prohibited.' },
                    { id: '2', label: 'A location where photography is allowed, but commercial photography is prohibited.' },
                    { id: '3', label: 'I am the rights owner and my rights are being infringed.' },
                    { id: '4', label: 'I am not the rights owner but there is an infringement.' },
                    { id: '5', label: 'The image is inappropriate.' },
                    { id: '6', label: 'The annotation is inappropriate.' },
                    { id: '7', label: 'The location or time information is inappropriate.' },
                    // 他のオプションも追加可能
                ];

                //プレフィックス
                const itemIdPrefix = `item-${index}-`;

                let popupMenu = document.createElement('div');
                popupMenu.style.display = 'none';
                popupMenu.style.position = 'fixed';
                popupMenu.style.zIndex = '1000';
                popupMenu.style.backgroundColor = 'white';
                popupMenu.style.border = '1px solid #ddd';
                popupMenu.style.width = "360px";
                popupMenu.style.height = "360px";
                popupMenu.style.overflow = 'auto';

                let textDiv = document.createElement('div');
                textDiv.textContent = 'Report Post';
                popupMenu.appendChild(textDiv);

                checkboxes.forEach(function (checkbox) {
                    let label = document.createElement('label');
                    let input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = itemIdPrefix + checkbox.id;

                    // change イベントリスナーを追加
                    input.addEventListener('change', function () {
                        // 他のすべてのチェックボックスの選択を解除
                        checkboxes.forEach(function (otherCheckbox) {
                            if (otherCheckbox.id !== checkbox.id) {
                                let otherCheckboxElement = document.getElementById(itemIdPrefix + otherCheckbox.id);
                                if (otherCheckboxElement) {
                                    otherCheckboxElement.checked = false;
                                }
                            }
                        });
                    });

                    label.appendChild(input);
                    label.appendChild(document.createTextNode(' ' + checkbox.label));
                    popupMenu.appendChild(label);
                    popupMenu.appendChild(document.createElement('br'));
                });

                popupMenu.addEventListener('mouseout', (event) => {
                    // relatedTargetをチェックして、ポップアップメニュー外に移動した場合のみ非表示にする
                    if (!popupMenu.contains(event.relatedTarget)) {
                        popupMenu.style.display = 'none';

                        checkboxes.forEach(function (checkbox) {
                            let checkboxElement = document.getElementById(itemIdPrefix + checkbox.id);
                            if (checkboxElement) {
                                checkboxElement.checked = false;
                            }
                        });
                    }
                });

                // フォームの作成
                let form = document.createElement('form');

                // フォームに送信イベントのリスナーを追加
                form.addEventListener('submit', function (event) {
                    event.preventDefault(); // デフォルトの送信動作を防止

                    checkboxes.forEach(function (checkbox) {
                        let checkboxElement = document.getElementById(itemIdPrefix + checkbox.id);
                        if (checkboxElement.checked === true) {

                            if (publicKey) {
                                let id = item.id.split('.')[0] + '_' + checkbox.id + '_' + publicKey.toString().substring(0, 10);
                                const docRef = db.collection("reports").doc(id); //引数にidがあるため、ここに記述

                                docRef.set({
                                    reportId: checkbox.id,
                                    publicKey: publicKey.toString(),
                                    itemId: item.id,
                                    checked: 0,
                                    latitude: item.data.latitude,
                                    longitude: item.data.longitude,
                                }).then(() => {
                                    form.style.display = 'none';
                                    textSuccessDiv.style.display = 'block';
                                    if (DEBUG) {
                                        console.log("report by publicKey:", publicKey.toString().substring(0, 10));
                                        console.log("docRef.id: ", docRef.id);
                                        console.log("checkbox.label: ", checkbox.label);
                                    }
                                }).catch((error) => {
                                    if (DEBUG) {
                                        console.error("Error reporting violation image: ", error);
                                    }
                                });
                            }
                        }
                    });
                });

                // ボタンの作成
                let button = document.createElement('button');
                button.type = 'submit';
                button.textContent = 'Report';

                // ボタンをフォームに追加
                form.appendChild(button);

                //処理状況に関するテキストを追加
                let textSuccessDiv = document.createElement('div');
                textSuccessDiv.textContent = 'Thank you for your report.';
                textSuccessDiv.style.color = 'blue';
                textSuccessDiv.style.display = 'none';

                let textErrorDiv = document.createElement('div');
                textErrorDiv.textContent = 'Please connect to your wallet if you wish to report.';
                textErrorDiv.style.color = 'red';

                if (publicKey) {
                    popupMenu.appendChild(document.createElement('br'));
                    popupMenu.appendChild(form);
                    popupMenu.appendChild(textSuccessDiv);
                } else {
                    popupMenu.appendChild(document.createElement('br'));
                    popupMenu.appendChild(textErrorDiv);
                }

                imageDiv.appendChild(popupMenu);



                ////////////////////////////////////////////////////////////////
                /////　イベントリスナー追加（マウスの左、右クリック）
                ////////////////////////////////////////////////////////////////

                imageDiv.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });

                // 左クリックと右クリックのイベントを処理
                imageDiv.addEventListener('mousedown', function (event) {

                    if (isLocked) return; // ロックされている場合は何もしない

                    if (event.target.tagName === 'A') {
                        // リンクの場合は何もせず、デフォルトの動作を許可
                        return;
                    }
                    if (event.button === 0 & popupMenu.style.display === 'none' & publicKey !== null) { //左クリック、かつ、通報フォーム非表示

                        if (!purchasedList.includes(item.id)) { //画像が購入済みリストに入っていない場合、

                            if (selectedImages[item.id]) { //画像がすでに購入選択リストに入っていれば、購入選択リストから除外する
                                imageDiv.style.border = '1px solid rgb(211,211,211)';
                                delete selectedImages[item.id];
                                selectedImagesArray = selectedImagesArray.filter(elem => elem[0] !== item.id);

                            } else { //画像が購入選択リストに入っていなければ、購入選択リストに追加する
                                imageDiv.style.border = '2px solid blue';
                                selectedImages[item.id] = true;
                                selectedImagesArray.push([item.id, item.publicKey]);
                            }

                            setSelectedImagesHandle(selectedImagesArray); //購入選択リストを更新する

                            //選択リストが空か判定、フラグを更新
                            if (selectedImagesArray.length > 0) {
                                setSelectedImagesFlag(true);

                            } else {
                                setSelectedImagesFlag(false);
                            }

                            setSendButtonDisabled(true); //画像をクリックした時点でpurchaseボタンが表示されていた時に、一度非表示
                        }

                    } else if (event.button === 0 & popupMenu.style.display === 'block' & publicKey !== null) { //左クリック、かつ、通報フォーム表示

                    } else if (event.button === 2 & !selectedImages[item.id] & publicKey !== null) { //右クリック、かつ、画像が選択リストに入っていない

                        if (popupMenu.style.display === 'block') { //通報フォームが表示状態なら、通報フォームを非表示にする
                            popupMenu.style.display = 'none';
                        } else { //通報フォームが非表示状態なら、通報フォームを表示する
                            popupMenu.style.display = 'block';
                            popupMenu.style.position = 'absolute';
                            popupMenu.style.top = '0';
                            popupMenu.style.right = '0';
                            popupMenu.style.bottom = '0';
                            popupMenu.style.left = '0';
                        }
                        event.preventDefault(); // デフォルトのコンテキストメニューを防止
                    }
                });

                // <div>要素をページに追加
                imageContainer.appendChild(imageDiv);

            });


        } catch (error) {
            if (DEBUG) {
                console.error("Error outside server processing: ", error);
            }
        }

    }

    useEffect(() => {
        if (DEBUG) {
            console.log("useEffect , [hasQueryParams]");
        }
        if (hasQueryParams) {
            console.log("hasQueryParams");
            searchImages();
        }

    }, [hasQueryParams]);

    useEffect(() => {
        if (DEBUG) {
            console.log("useEffect , [hasIncompleteTransactions]");
        }
        if (hasIncompleteTransactions) {
            console.log("hasIncompleteTransactions");
            searchImages();
            setHasIncompleteTransactions(false);
        }

    }, [hasIncompleteTransactions]);

    useEffect(() => {
        if (DEBUG) {
            console.log("useEffect , [isSendCompleted]");
        }
        if (isSendCompleted) {
            console.log("isSendCompleted");
            setIsSendCompleted(false);
            searchImages();
        }

    }, [isSendCompleted]);

    //walletが接続パブリックキーが読み込まれたor切断された場合に再読み込みを実行
    useEffect(() => {
        if (DEBUG) {
            console.log("useEffect , [publicKey, disconnect]");
        }
        if (publicKey || disconnect) {
            console.log("publicKey || disconnect");
            const imageContainer = document.getElementById("image-container");

            if (imageContainer.firstChild) { //検索結果がある状態でwalletが接続/切断
                console.log("imageContainer.firstChild");
                searchImages();
            } else { //検索結果がない状態でwalletが接続/切断
                console.log("imageContainer.firstChild else");
                //onSearchMsg('');
            }

            while (imageContainer.firstChild) {
                console.log("while (imageContainer.firstChild)");
                imageContainer.removeChild(imageContainer.firstChild);
            }
            onDocData([]);
            setSelectedImagesHandle([]);
            setSelectedImagesFlag(false);
            setSendButtonDisabled(true);

        }
    }, [publicKey, disconnect]);
    

    const checkPublickey = async () => {

        const dbPublicKeysCollection = process.env.REACT_APP_DB_PUBLICKEYS;
        let collectionRefPublicKeys = db.collection(dbPublicKeysCollection);

        let publicKey10 = publicKey.toString().substring(0, 10);
        const docRef = collectionRefPublicKeys.doc(publicKey10);
        const doc = await docRef.get();

        if (doc.exists) {
            if (doc.data().publicKey === publicKey.toString()) {

                if (doc.data().mapApiPoint > 0) { //ポイント残っていれば
                    try {
                        await docRef.set({
                            mapApiPoint: doc.data().mapApiPoint - 1,
                        }, { merge: true });

                        setUseJSMapAPI(true)

                        if (DEBUG) {
                            console.log("Reduced one map API point.");
                            console.log("map API point: ", doc.data().mapApiPoint - 1);
                        }

                    } catch (error) {
                        if (DEBUG) {
                            console.log("Failed to reduced one map API point.");
                        }
                    }
                } else {
                    if (DEBUG) {
                        console.log("There are no remaining map API points.");
                    }
                }

                if (DEBUG) {
                    console.log("The public key is already registered.");
                }

            } else {
                if (DEBUG) {
                    console.log("The first 10 characters of the public key are already registered.");
                }
                setIsLocked(true);
                setSendingMessage("The first 10 characters of the public key are already registered. Please use a different public key.");
            }

        } else {
            if (DEBUG) {
                console.log("The public key is not registered, proceeding with new registration.");
            }

            const docRef = collectionRefPublicKeys.doc(publicKey10);

            try {
                await docRef.set({
                    publicKey: publicKey.toString(),
                    mapApiPoint: 5 - 1, //初回５ポイント付与、１ポイント利用
                });

                setUseJSMapAPI(true)

                if (DEBUG) {
                    console.log("Initial 5 map API points granted, 1 point used.");
                }

            } catch (error) {
                if (DEBUG) {
                    console.log("Public key registration failed, please reload.");
                }
                setIsLocked(true);
                setSendingMessage("Public key registration failed, please reload.");
            }
        }

    };

    useEffect(() => {
        if (DEBUG) {
            console.log("useEffect , checkPublickey");
        }
        if (publicKey) {
            console.log("publicKey");
            checkPublickey();
        } else {
            setUseJSMapAPI(false)
        }
    }, [publicKey]);

    return (
        <div>
            {!isLocked && imageId === null && (
                <button
                    onClick={searchImages}
                    style={{
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        padding: '15px 30px',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#0056b3')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#007BFF')}
                >
                    Search
                </button>
            )}
        </div>
    );

}

export default SearchButton;
