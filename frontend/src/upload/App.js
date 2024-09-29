
import firebase from "firebase/compat/app";
import { storage_original, storage_preview, db } from "./firebase";

import WalletContextProvider from './WalletContextProvider'

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './App.css';

import exifr from 'exifr';

import * as geofire from 'geofire-common';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { sign } from 'tweetnacl';

const DEBUG = true;

const UploadMain = () => (
    <WalletContextProvider>
        <UploadApp />
    </WalletContextProvider>
)

function UploadApp() {

    const { disconnect, publicKey } = useWallet();

    const [isLocked, setIsLocked] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [uploadingMessage, setUploadingMessage] = useState("");

    const [image, setImage] = useState("");
    const [uploadedImage, setUploadedImage] = useState(null);
    const imgRef = useRef();
    const imgRef_protected = useRef();

    const [exifInfo, setExifInfo] = useState({
        DateTimeOriginal: '',
        GPSLatitude: '',
        GPSLatitudeRef: '',
        GPSLongitude: '',
        GPSLongitudeRef: '',
        ExifImageHeight: '',
        ExifImageWidth: '',
        Orientation: '',
        LensMake: '',
        LensModel: '',
        Make: '',
        Model: '',
        Latitude: '',
        Longitude: ''
    });

    const [annotations, setAnnotations] = useState([]);
    const [currentAnnotation, setCurrentAnnotation] = useState(null); //マウス操作で新規追加するBBOXのパラメータ

    const [annotations_protected, setAnnotations_protected] = useState([]);
    const [currentAnnotation_protected, setCurrentAnnotation_protected] = useState(null); //マウス操作で新規追加するBBOXのパラメータ

    const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
    const [imageDimensionsProtected, setImageDimensionsProtected] = useState({ width: 0, height: 0 });

    const [isButtonDisabled, setButtonDisabled] = useState(true);


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// 画像読み込みに関する処理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const handleImage = async (event) => {
        const selectedImage = event.target.files[0];
        setImage(selectedImage);
        if (DEBUG) {
            console.log("selectedImage", selectedImage);
            console.log("image", image);
        }

        setAnnotations([]);
        setAnnotations_protected([]);

        try {
            let output = await exifr.parse(selectedImage);

            if (output !== undefined) {
                if (DEBUG) {
                    console.log(output);
                }
                let DateTimeOriginal = output.DateTimeOriginal ? output.DateTimeOriginal.toString() : '';
                let GPSLatitude = output.GPSLatitude || '';
                let GPSLatitudeRef = output.GPSLatitudeRef || '';
                let GPSLongitude = output.GPSLongitude || '';
                let GPSLongitudeRef = output.GPSLongitudeRef || '';
                let ExifImageHeight = output.ExifImageHeight || '';
                let ExifImageWidth = output.ExifImageWidth || '';
                let Orientation = output.Orientation || '';
                let LensMake = output.LensMake || '';
                let LensModel = output.LensModel || '';
                let Make = output.Make || '';
                let Model = output.Model || '';


                let Latitude = output.GPSLatitude[0] + output.GPSLatitude[1] / 60 + output.GPSLatitude[2] / 3600 || '';
                let Longitude = output.GPSLongitude[0] + output.GPSLongitude[1] / 60 + output.GPSLongitude[2] / 3600 || '';

                if (GPSLatitudeRef === 'N') {
                    Latitude = Latitude * (+1);
                } else if (GPSLatitudeRef === 'S') {
                    Latitude = Latitude * (-1);
                } else {
                    Latitude = '';
                }

                if (GPSLongitudeRef === 'E') {
                    Longitude = Longitude * (+1);
                } else if (GPSLongitudeRef === 'W') {
                    Longitude = Longitude * (-1);
                } else {
                    Longitude = '';
                }

                setExifInfo({
                    DateTimeOriginal,
                    GPSLatitude,
                    GPSLatitudeRef,
                    GPSLongitude,
                    GPSLongitudeRef,
                    ExifImageHeight,
                    ExifImageWidth,
                    Orientation,
                    LensMake,
                    LensModel,
                    Make,
                    Model,
                    Latitude,
                    Longitude
                });

                await searchImages(DateTimeOriginal, Latitude, Longitude);

            } else {
                // Exif情報が存在しない場合の処理
                setExifInfo({
                    DateTimeOriginal: '',
                    GPSLatitude: '',
                    GPSLatitudeRef: '',
                    GPSLongitude: '',
                    GPSLongitudeRef: '',
                    ExifImageHeight: '',
                    ExifImageWidth: '',
                    Orientation: '',
                    LensMake: '',
                    LensModel: '',
                    Latitude: '',
                    Longitude: ''
                });
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result);

                const img = new Image();
                img.onload = function () {
                    let width, height;
                    if (this.width > this.height) {
                        const aspectRatio = this.width / this.height;
                        width = 720;
                        height = 720 / aspectRatio;
                    } else {
                        const aspectRatio = this.height / this.width;
                        height = 720;
                        width = 720 / aspectRatio;
                    }
                    setImageDimensions({ width, height });
                    setImageDimensionsProtected({ width, height });
                }
                img.src = reader.result;

            }
            reader.readAsDataURL(selectedImage);
        } catch (error) {
            // do a proper action on failure cases
            setExifInfo({
                DateTimeOriginal: '',
                GPSLatitude: '',
                GPSLatitudeRef: '',
                GPSLongitude: '',
                GPSLongitudeRef: '',
                ExifImageHeight: '',
                ExifImageWidth: '',
                Orientation: '',
                LensMake: '',
                LensModel: '',
                Make: '',
                Model: '',
                Latitude: '',
                Longitude: ''
            });
        }

    };


    const searchImages = async (DateTimeOriginal, Latitude, Longitude) => {

        const dbImagesCollection = process.env.REACT_APP_DB_IMAGES;
        let collectionRefImages = db.collection(dbImagesCollection);

        const DateTimeOriginal_firebase = firebase.firestore.Timestamp.fromDate(getUTCDateTimeByDate(DateTimeOriginal));
        const query = collectionRefImages
            .where('dateOriginal', '==', DateTimeOriginal_firebase)
            .where('latitude', '==', Latitude)
            .where('longitude', '==', Longitude);

        let snapshot = null;

        try {
            snapshot = await query.get();
        } catch (error) {
            if (DEBUG) {
                console.error("Verification of the registered image failed: ", error);
            }
            setIsLocked(true);
            setUploadingMessage("Verification of the registered image failed, please reload.");
        }

        if (snapshot.empty) {
            if (DEBUG) {
                console.log("No matching documents.");
            }
        } else {
            if (DEBUG) {
                console.log("NThis image has already been uploaded for the specified date and location.");
            }
            setIsLocked(true);
            setUploadingMessage("This image has already been uploaded for the specified date and location.");
        }
    };

    const checkPublickey = async () => {

        const dbPublicKeysCollection = process.env.REACT_APP_DB_PUBLICKEYS;
        let collectionRefPublicKeys = db.collection(dbPublicKeysCollection);

        let publicKey10 = publicKey.toString().substring(0, 10);
        const docRef = collectionRefPublicKeys.doc(publicKey10);

        let doc = null;

        try {
            doc = await docRef.get();
        } catch (error) {
            if (DEBUG) {
                console.log("Public key verification failed.");
            }
            setIsLocked(true);
            setUploadingMessage("Public key verification failed, please reload.");
        }

        if (doc.exists) {
            if (doc.data().publicKey === publicKey.toString()) {
                if (DEBUG) {
                    console.log("The public key is already registered.");
                }

            } else {
                if (DEBUG) {
                    console.log("The first 10 characters of the public key are already registered.");
                }
                setIsLocked(true);
                setUploadingMessage("The first 10 characters of the public key are already registered. Please use a different public key.");
            }

        } else {
            if (DEBUG) {
                console.log("The public key is not registered, proceeding with new registration.");
            }

            const docRef = collectionRefPublicKeys.doc(publicKey10);

            try {
                await docRef.set({
                    publicKey: publicKey.toString(),
                });

            } catch (error) {
                if (DEBUG) {
                    console.log("Public key registration failed.");
                }
                setIsLocked(true);
                setUploadingMessage("Public key registration failed, please reload.");
            }
        }

    };

    useEffect(() => {
        if (publicKey) {
            checkPublickey();
        }
    }, [publicKey]);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// アノテーション付与に関する処理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const MIN_WIDTH = 20;  // 最小幅を設定します。
    const MIN_HEIGHT = 20;  // 最小高さを設定します。
    const [draggingIndex, setDraggingIndex] = useState(null);
    const [draggingIndex_protected, setDraggingIndex_protected] = useState(null);
    const [draggingOffset, setDraggingOffset] = useState({ x: 0, y: 0 });
    const [draggingOffset_protected, setDraggingOffset_protected] = useState({ x: 0, y: 0 });
    const [resizingIndex, setResizingIndex] = useState(null);
    const [resizingIndex_protected, setResizingIndex_protected] = useState(null);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isMouseDown_protected, setIsMouseDown_protected] = useState(false);



    /////////////////////////////////////////////////////////////
    ////// 新規BBOX追加　anntation
    /////////////////////////////////////////////////////////////

    //マウス押下されたら新規BBOXを設置
    const handleMouseDown = (e) => {
        const offsetX = e.nativeEvent.offsetX;
        const offsetY = e.nativeEvent.offsetY;

        setCurrentAnnotation({ x: offsetX, y: offsetY, width: 0, height: 0 });
    };

    //マウス押下状態でマウスが移動したらBBOXの大きさを更新
    const handleMouseMove = (e) => {
        if (!currentAnnotation) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef.current.getBoundingClientRect();
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;

        const validX = Math.max(0, Math.min(offsetX, imageWidth));
        const validY = Math.max(0, Math.min(offsetY, imageHeight));

        setCurrentAnnotation((prevAnnotation) => ({
            ...prevAnnotation,
            width: validX - prevAnnotation.x,
            height: Math.floor(validY - prevAnnotation.y),
        }));
    };

    //マウス押下状態が解除されたらcurrentAnnotationをAnnotationsに追加、currentAnnotationは初期化
    const handleMouseUp = () => {
        if (currentAnnotation) {
            const { width, height } = currentAnnotation;
            if (width >= MIN_WIDTH && height >= MIN_HEIGHT) {
                setAnnotations((annotations) => [...annotations, { ...currentAnnotation, text: '' }]);
            }
        }
        setCurrentAnnotation(null);
    };

    /////////////////////////////////////////////////////////////
    ////// 新規BBOX追加　anntation protected
    /////////////////////////////////////////////////////////////

    const handleMouseDown_protected = (e) => {
        const offsetX = e.nativeEvent.offsetX;
        const offsetY = e.nativeEvent.offsetY;

        setCurrentAnnotation_protected({ x: offsetX, y: offsetY, width: 0, height: 0 });
    };

    const handleMouseMove_protected = (e) => {
        if (!currentAnnotation_protected) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef_protected.current.getBoundingClientRect();
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;

        const validX = Math.max(0, Math.min(offsetX, imageWidth));
        const validY = Math.max(0, Math.min(offsetY, imageHeight));

        setCurrentAnnotation_protected((prevAnnotation) => ({
            ...prevAnnotation,
            width: validX - prevAnnotation.x,
            height: Math.floor(validY - prevAnnotation.y),
        }));
    };

    const handleMouseUp_protected = () => {
        if (currentAnnotation_protected) {
            const { width, height } = currentAnnotation_protected;
            if (width >= MIN_WIDTH && height >= MIN_HEIGHT) {
                setAnnotations_protected((annotations_protected) => [...annotations_protected, { ...currentAnnotation_protected, text: '' }]);
            }
        }
        setCurrentAnnotation_protected(null);
    };



    /////////////////////////////////////////////////////////////
    ////// 追加済みBBOXの移動　anntation
    /////////////////////////////////////////////////////////////

    //BBOXを削除
    const deleteAnnotation = (index) => {
        setAnnotations(annotations.filter((_, i) => i !== index));
    };

    //BBOXにテキスト入力
    const updateAnnotationText = (index, text) => {
        setAnnotations(annotations.map((ann, i) => i === index ? { ...ann, text } : ann));
    };

    //BBOXをマウス押下で選択
    const handleAnnotationMouseDown = (index, e) => {
        e.stopPropagation();
        const { left, top } = imgRef.current.getBoundingClientRect();
        const offsetX = e.clientX + window.scrollX - left - annotations[index].x;
        const offsetY = e.clientY + window.scrollY - top - annotations[index].y;
        setDraggingIndex(index);
        setDraggingOffset({ x: offsetX, y: offsetY });
    };

    //BBOXをマウス押下、マウス移動でBBOXを移動
    const handleAnnotationMouseMove = (e) => {
        if (draggingIndex === null) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef.current.getBoundingClientRect();
        const offsetX = e.clientX + window.scrollX - left - draggingOffset.x;
        const offsetY = e.clientY + window.scrollY - top - draggingOffset.y;

        const annotation = annotations[draggingIndex];
        const validX = Math.floor(Math.max(0, Math.min(offsetX, imageWidth - annotation.width)));
        const validY = Math.floor(Math.max(0, Math.min(offsetY, imageHeight - annotation.height)));

        setAnnotations(annotations.map((ann, i) => i === draggingIndex ? {
            ...ann,
            x: validX,
            y: validY
        } : ann));
    };

    //マウス押下解除で、BBOX選択を解除
    const handleAnnotationMouseUp = () => {
        setDraggingIndex(null);
    };

    /////////////////////////////////////////////////////////////
    ////// 追加済みBBOXの移動　anntation protected
    /////////////////////////////////////////////////////////////

    const deleteAnnotation_protected = (index) => {
        setAnnotations_protected(annotations_protected.filter((_, i) => i !== index));
    };

    const updateAnnotationText_protected = (index, text) => {
        setAnnotations_protected(annotations_protected.map((ann, i) => i === index ? { ...ann, text } : ann));
    };

    const handleAnnotationMouseDown_protected = (index, e) => {
        e.stopPropagation();
        const { left, top } = imgRef_protected.current.getBoundingClientRect();
        const offsetX = e.clientX + window.scrollX - left - annotations_protected[index].x;
        const offsetY = e.clientY + window.scrollY - top - annotations_protected[index].y;
        setDraggingIndex_protected(index);
        setDraggingOffset_protected({ x: offsetX, y: offsetY });
    };

    const handleAnnotationMouseMove_protected = (e) => {
        if (draggingIndex_protected === null) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef_protected.current.getBoundingClientRect();
        const offsetX = e.clientX + window.scrollX - left - draggingOffset_protected.x;
        const offsetY = e.clientY + window.scrollY - top - draggingOffset_protected.y;

        const annotation_protected = annotations_protected[draggingIndex_protected];
        const validX = Math.floor(Math.max(0, Math.min(offsetX, imageWidth - annotation_protected.width)));
        const validY = Math.floor(Math.max(0, Math.min(offsetY, imageHeight - annotation_protected.height)));

        setAnnotations_protected(annotations_protected.map((ann, i) => i === draggingIndex_protected ? {
            ...ann,
            x: validX,
            y: validY
        } : ann));
    };

    const handleAnnotationMouseUp_protected = () => {
        setDraggingIndex_protected(null);
    };



    /////////////////////////////////////////////////////////////
    ////// 追加済みBBOXのリサイズ　anntation
    /////////////////////////////////////////////////////////////

    //リサイザーをマウス押下で選択
    const handleResizerMouseDown = (index, e) => {
        e.stopPropagation();
        setResizingIndex(index);
        setIsMouseDown(true);
    };

    //リサイザーをマウス押下、マウス移動でBBOXサイズを変更
    const handleResizerMouseMove = (e) => {
        if (resizingIndex === null || !isMouseDown) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef.current.getBoundingClientRect();
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;
        const maxWidth = imageWidth - annotations[resizingIndex].x;
        const maxHeight = imageHeight - annotations[resizingIndex].y;

        setAnnotations(annotations.map((ann, i) => i === resizingIndex ? {
            ...ann,
            width: Math.floor(Math.min(maxWidth, Math.max(0, offsetX - ann.x))),
            height: Math.floor(Math.min(maxHeight, Math.max(0, offsetY - ann.y)))
        } : ann));
    };

    //マウス押下解除で、リサイザー選択を解除
    const handleResizerMouseUp = () => {
        setResizingIndex(null);
        setIsMouseDown(false);
    };

    //リサイザー処理で設定したisMouseDownに応じて、リスナー
    useEffect(() => {
        if (isMouseDown) {
            window.addEventListener('mousemove', handleResizerMouseMove);
            window.addEventListener('mouseup', handleResizerMouseUp);
        } else {
            window.removeEventListener('mousemove', handleResizerMouseMove);
            window.removeEventListener('mouseup', handleResizerMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleResizerMouseMove);
            window.removeEventListener('mouseup', handleResizerMouseUp);
        };
    }, [isMouseDown]);

    /////////////////////////////////////////////////////////////
    ////// 追加済みBBOXのリサイズ　anntation protected
    /////////////////////////////////////////////////////////////

    const handleResizerMouseDown_protected = (index, e) => {
        e.stopPropagation();
        setResizingIndex_protected(index);
        setIsMouseDown_protected(true);
    };

    const handleResizerMouseMove_protected = (e) => {
        if (resizingIndex_protected === null || !isMouseDown_protected) return;
        const { left, top, width: imageWidth, height: imageHeight } = imgRef_protected.current.getBoundingClientRect();
        const offsetX = e.clientX - left;
        const offsetY = e.clientY - top;
        const maxWidth = imageWidth - annotations_protected[resizingIndex_protected].x;
        const maxHeight = imageHeight - annotations_protected[resizingIndex_protected].y;

        setAnnotations_protected(annotations_protected.map((ann, i) => i === resizingIndex_protected ? {
            ...ann,
            width: Math.floor(Math.min(maxWidth, Math.max(0, offsetX - ann.x))),
            height: Math.floor(Math.min(maxHeight, Math.max(0, offsetY - ann.y)))
        } : ann));
    };

    const handleResizerMouseUp_protected = () => {
        setResizingIndex_protected(null);
        setIsMouseDown_protected(false);
    };

    useEffect(() => {
        if (isMouseDown_protected) {
            window.addEventListener('mousemove', handleResizerMouseMove_protected);
            window.addEventListener('mouseup', handleResizerMouseUp_protected);
        } else {
            window.removeEventListener('mousemove', handleResizerMouseMove_protected);
            window.removeEventListener('mouseup', handleResizerMouseUp_protected);
        }

        return () => {
            window.removeEventListener('mousemove', handleResizerMouseMove_protected);
            window.removeEventListener('mouseup', handleResizerMouseUp_protected);
        };
    }, [isMouseDown_protected]);



    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// sign、uploadに関する処理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    const { wallet, signMessage } = useWallet();

    let filenameOnlynameStr = '';
    let filenameFormatStr = '';
    let agreementStr = '';
    let signatureStr = '';

    /////////////////////////////////////////////////////////////
    ////// 画像のリサイズ、アノテーション番号を画像内に描画
    /////////////////////////////////////////////////////////////

    // 画像をリサイズする関数
    function resizeImage(file, maxWidth, maxHeight) {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            img.onload = function () {
                let width = img.width;
                let height = img.height;

                // 縦横比を保ちつつ指定のサイズに収まるようにリサイズ
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    blob.name = file.name;
                    resolve(blob);
                }, file.type);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    function resizeAndAnnotateImage(file, maxWidth, maxHeight, annotations, annotations_protected) {
        return new Promise((resolve, reject) => {
            const img = document.createElement("img");
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            img.onload = function () {
                let width = img.width;
                let height = img.height;

                // 縦横比を保ちつつ指定のサイズに収まるようにリサイズ
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                ctx.drawImage(img, 0, 0, width, height);

                // テキストのスタイルを設定
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '18px sans-serif';
                ctx.fillStyle = 'black';

                // アノテーションを描画
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 5;
                annotations.forEach((annotation, index) => {
                    ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);

                    // テキストを描画する背景を白色で描画
                    const textHeight = 24; // テキストの高さを24に設定
                    const textWidth = 24; // テキストの高さを24に設定
                    ctx.fillStyle = 'white';
                    if (annotation.y - textHeight < 0) {
                        if (annotation.y + annotation.height + textHeight > height) {
                            ctx.fillRect(annotation.x, annotation.y, textWidth, textHeight);
                        } else {
                            ctx.fillRect(annotation.x, annotation.y + annotation.height, textWidth, textHeight);
                        }
                    } else {
                        ctx.fillRect(annotation.x, annotation.y - textHeight, textWidth, textHeight);
                    }

                    // テキストを左端に寄せて描画
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    if (index + 1 < 10) {
                        if (annotation.y - textHeight < 0) {
                            if (annotation.y + annotation.height + textHeight > height) {
                                ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y + textHeight / 2);
                            } else {
                                ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y + annotation.height + textHeight / 2);
                            }
                        } else {
                            ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y - textHeight / 2);
                        }
                    } else {
                        if (annotation.y - textHeight < 0) {
                            if (annotation.y + annotation.height + textHeight > height) {
                                ctx.fillText(index + 1, annotation.x, annotation.y + textHeight / 2);
                            } else {
                                ctx.fillText(index + 1, annotation.x, annotation.y + annotation.height + textHeight / 2);
                            }
                        } else {
                            ctx.fillText(index + 1, annotation.x, annotation.y - textHeight / 2);
                        }
                    }
                });

                // annotations_protectedをグレー色で描画と塗りつぶし
                annotations_protected.forEach((annotation, index) => {
                    ctx.fillStyle = 'rgba(128, 128, 128, 0.8)'; // 80%透過のグレー
                    ctx.fillRect(annotation.x, annotation.y, annotation.width, annotation.height);
                    ctx.strokeStyle = 'gray';
                    ctx.lineWidth = 5;
                    ctx.strokeRect(annotation.x, annotation.y, annotation.width, annotation.height);

                    // テキストを描画する背景を白色で描画
                    const textHeight = 24; // テキストの高さを24に設定
                    const textWidth = 24; // テキストの高さを24に設定
                    ctx.fillStyle = 'white';
                    if (annotation.y - textHeight < 0) {
                        if (annotation.y + annotation.height + textHeight > height) {
                            ctx.fillRect(annotation.x, annotation.y, textWidth, textHeight);
                        } else {
                            ctx.fillRect(annotation.x, annotation.y + annotation.height, textWidth, textHeight);
                        }
                    } else {
                        ctx.fillRect(annotation.x, annotation.y - textHeight, textWidth, textHeight);
                    }

                    // テキストを左端に寄せて描画
                    ctx.fillStyle = 'black';
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'middle';
                    if (index + 1 < 10) {
                        if (annotation.y - textHeight < 0) {
                            if (annotation.y + annotation.height + textHeight > height) {
                                ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y + textHeight / 2);
                            } else {
                                ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y + annotation.height + textHeight / 2);
                            }
                        } else {
                            ctx.fillText(index + 1, annotation.x + textHeight / 4, annotation.y - textHeight / 2);
                        }
                    } else {
                        if (annotation.y - textHeight < 0) {
                            if (annotation.y + annotation.height + textHeight > height) {
                                ctx.fillText(index + 1, annotation.x, annotation.y + textHeight / 2);
                            } else {
                                ctx.fillText(index + 1, annotation.x, annotation.y + annotation.height + textHeight / 2);
                            }
                        } else {
                            ctx.fillText(index + 1, annotation.x, annotation.y - textHeight / 2);
                        }
                    }
                });

                canvas.toBlob((blob) => {
                    blob.name = file.name;
                    resolve(blob);
                }, file.type);
            };

            img.src = URL.createObjectURL(file);
        });
    }

    /////////////////////////////////////////////////////////////
    ////// sign signature
    /////////////////////////////////////////////////////////////

    const extractAfterLastDot = async (input) => {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }

        const lastIndex = input.lastIndexOf('.');
        if (lastIndex === -1 || lastIndex === input.length - 1) {
            throw new Error('No dot found or dot is at the end of the string');
        }

        return input.substring(lastIndex + 1);
    }

    function extractString(input, count) {
        if (typeof input !== 'string') {
            throw new Error('Input must be a string');
        }

        if (count <= 0) {
            throw new Error('Count must be a positive number');
        }

        return input.substring(0, count);
    }

    const getFilename = async (dateTimeString, publicKeyStr, message) => {
        const dateTime = new Date(dateTimeString);

        const year = dateTime.getUTCFullYear();
        const month = dateTime.getUTCMonth() + 1; // 月は0から始まるため、+1する
        const day = dateTime.getUTCDate();
        const hours = dateTime.getUTCHours();
        const minutes = dateTime.getUTCMinutes();
        const seconds = dateTime.getUTCSeconds();

        return `${year}${padZero(month)}${padZero(day)}${padZero(hours)}${padZero(minutes)}${padZero(seconds)}${extractString(publicKeyStr, 10)}`;
    }

    const signSignature = async () => {

        if (!wallet) {
            setUploadingMessage("Wallet not available, please reload.");
            if (DEBUG) {
                console.log("Wallet not available.");
            }
            throw new Error("Wallet not available.");
        }

        const currentTime = new Date();
        const publicKeyStr = publicKey.toString();
        const timeStr = currentTime.toUTCString();
        const filenameOnlyname = await getFilename(timeStr, publicKeyStr, image.name);
        const fileFormat = await extractAfterLastDot(image.name);
        const filename_ = filenameOnlyname + '.' + fileFormat;

        const agreement1 = 'Agree to the terms (ver1.00). / IMG: ';
        const agreement2 = ' / PUBLICKEY: ';
        const agreement3 = ' / TIME: ';

        const agreement = agreement1 + filename_ + agreement2 + publicKey.toString() + agreement3 + currentTime.toUTCString();

        setUploadingMessage("Sign the agreement");
        let agreementBytes = null;
        let signature = null;
        try {
            agreementBytes = new TextEncoder().encode(agreement);
            signature = await signMessage(agreementBytes);
        } catch (error) {
            setUploadingMessage("Signature verification failed.");
            if (DEBUG) {
                console.error('Signature verification failed:', error);
            }
            throw error;
        }
        const signatureString = signature.join(',');

        if (DEBUG) {
            console.log('agreement:', agreement);
            console.log('signature to agreement:', signatureString);
            console.log('Signature verification result:', sign.detached.verify(agreementBytes, signature, publicKey.toBytes()));
        }

        if (!sign.detached.verify(agreementBytes, signature, publicKey.toBytes())) {
            setUploadingMessage("Signature verification failed.");
            throw new Error("Signature verification failed.");
        }

        filenameOnlynameStr = filenameOnlyname;
        filenameFormatStr = fileFormat;
        agreementStr = agreement;
        signatureStr = signatureString;

    }

    /////////////////////////////////////////////////////////////
    ////// upload処理（関数内でsign signatureを実行）、ボタンクリックで発動
    /////////////////////////////////////////////////////////////

    const onSignUpload = async (event) => {

        setIsLocked(true);

        try {
            await signSignature();
        } catch (error) {
            if (DEBUG) {
                console.log("signSignature failed.", error)
            }
            setUploadingMessage("");
            setIsLocked(false);
            return;
        }

        event.preventDefault();
        if (image === "") {
            setUploadingMessage("No file selected.");
            if (DEBUG) {
                console.log("No file selected.")
            }
            return;
        }

        const storageRefs = createStorageReferences();

        try {
            await uploadOriginalImage(storageRefs.imagesRef);
            setUploadingMessage("Upload original image completed.")

        } catch (error) {
            setUploadingMessage("Upload original image failed.");
            if (DEBUG) {
                console.log("Upload original image failed.")
            }
            return;
        }

        try {
            const resizedImage = await resizeAndAnnotateImage(image, 720, 720, annotations, annotations_protected);
            const resizedImageSmall = await resizeImage(resizedImage, 360, 360);
            await uploadResizedImageSmall(storageRefs.resizedImagesRefSmall, resizedImageSmall);
            setUploadingMessage("Upload thumbnail image completed.")

        } catch (error) {
            setUploadingMessage("Upload thumbnail image failed.");
            if (DEBUG) {
                console.log("Upload thumbnail image failed.");
            }
            return;
        }

        try {
            await uploadAnnotationData(storageRefs.storageRefOriginal);
            setUploadingMessage("Upload annotation completed.");
            setIsCompleted(true);
            setUploadingMessage("Upload completed.")

        } catch (error) {
            setUploadingMessage("Upload annotation failed.");
            if (DEBUG) {
                console.log("Upload annotation failed.")
            }
            return;
        }

    };

    const createStorageReferences = () => {
        const storagePath = process.env.REACT_APP_STORAGE_PATH;
        const storageRefOriginal = storage_original.ref(storagePath);
        const storageRefPreview = storage_preview.ref(storagePath);
        return {
            imagesRef: storageRefOriginal.child(`${filenameOnlynameStr}.${filenameFormatStr}`),
            resizedImagesRef: storageRefPreview.child(`${filenameOnlynameStr}_resized.${filenameFormatStr}`),
            resizedImagesRefSmall: storageRefPreview.child(`${filenameOnlynameStr}_resized_small.${filenameFormatStr}`),
            storageRefOriginal
        };
    };


    /////////////////////////////////////////////////////////////
    ////// 画像アップロード
    /////////////////////////////////////////////////////////////

    const uploadOriginalImage = (imagesRef) => {
        return new Promise((resolve, reject) => {
            const upLoadTask = imagesRef.put(image);
            upLoadTask.on(
                "state_changed",
                (snapshot) => {
                    const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (DEBUG) {
                        console.log(percent.toFixed(1) + "% done");
                    }
                    setUploadingMessage("Upload original image: " + percent.toFixed(1) + "% done");
                },
                (error) => {
                    if (DEBUG) {
                        console.error("Error uploading original image:", error);
                    }
                    reject(error);
                },
                resolve
            );
        });
    };

    const uploadResizedImageSmall = (resizedImagesRefSmall, resizedImageSmall) => {
        return new Promise((resolve, reject) => {
            const upLoadResizedTaskSmall = resizedImagesRefSmall.put(resizedImageSmall);
            upLoadResizedTaskSmall.on(
                "state_changed",
                (snapshot) => {
                    const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (DEBUG) {
                        console.log(percent.toFixed(1) + "% done");
                    }
                    setUploadingMessage("Upload thumbnail image: " + percent.toFixed(1) + "% done");
                },
                (error) => {
                    if (DEBUG) {
                        console.error("Error uploading small resized image:", error);
                    }
                    reject(error);
                },
                resolve
            );
        });
    };


    /////////////////////////////////////////////////////////////
    ////// annotationアップロード
    /////////////////////////////////////////////////////////////

    const uploadAnnotationData = async (storageRefOriginal) => {
        try {
            const dataToSave = createDataToSave();
            const blob = createBlob(dataToSave);
            const dataRef = storageRefOriginal.child(`${filenameOnlynameStr}.json`);

            await uploadToStorage(dataRef, blob);
            await saveToDatabase();

            if (DEBUG) {
                console.log("Document written successfully.");
            }
        } catch (error) {
            if (DEBUG) {
                console.error("Error in uploadAnnotationData:", error);
            }
            throw error;
        }
    };

    const createDataToSave = () => ({
        publicKey: publicKey.toString(),
        exifInfo: exifInfo,
        annotations: annotations,
        annotations_protected: annotations_protected,
        agreement: agreementStr,
        signature: signatureStr
    });

    const createBlob = (data) => {
        const jsonData = JSON.stringify(data);
        return new Blob([jsonData], { type: 'application/json' });
    };

    const uploadToStorage = async (dataRef, blob) => {
        const snapshot = await dataRef.put(blob);
        const percent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadingMessage(`Upload annotation: ${percent.toFixed(1)}% done`);
    };

    const saveToDatabase = async () => {
        const dbImagesCollection = process.env.REACT_APP_DB_IMAGES;
        const docRef = db.collection(dbImagesCollection).doc(`${filenameOnlynameStr}.${filenameFormatStr}`);
        const geoPoint = new firebase.firestore.GeoPoint(exifInfo.Latitude, exifInfo.Longitude);
        const hash = geofire.geohashForLocation([exifInfo.Latitude, exifInfo.Longitude]);
        const geohashLevels = generateGeohashLevels(hash);
        const dateOriginal = firebase.firestore.Timestamp.fromDate(getUTCDateTimeByDate(exifInfo.DateTimeOriginal));

        const annotations_label = annotations.map((annotation, index) => `${index + 1}:${annotation.text}`).join(", ");
        const annotations_protected_label = annotations_protected.map((annotations_protected, index) => `${index + 1}:${annotations_protected.text}`).join(", ");

        await docRef.set({
            filename: `${filenameOnlynameStr}.${filenameFormatStr}`,
            publicKey: publicKey.toString(),
            location: geoPoint,
            geohash: hash,
            geohash1: geohashLevels[0],
            geohash2: geohashLevels[1],
            geohash3: geohashLevels[2],
            geohash4: geohashLevels[3],
            geohash5: geohashLevels[4],
            geohash6: geohashLevels[5],
            geohash7: geohashLevels[6],
            latitude: exifInfo.Latitude,
            longitude: exifInfo.Longitude,
            dateOriginal: dateOriginal,
            dateUpload: firebase.firestore.FieldValue.serverTimestamp(),
            make: exifInfo.Make,
            model: exifInfo.Model,
            lensMake: exifInfo.LensMake,
            lensModel: exifInfo.LensModel,
            imageHeight: exifInfo.ExifImageHeight,
            imageWidth: exifInfo.ExifImageWidth,
            annotations: annotations_label,
            annotationsProtected: annotations_protected_label,
        });
    };

    const generateGeohashLevels = (hash) =>
        Array.from({ length: 7 }, (_, i) => hash.substring(0, i + 1));


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// パラメータチェック、表示フラグ管理
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function padZero(number) {
        return number.toString().padStart(2, '0');
    }

    function getUTCDateTime(dateTimeString) {
        const dateTime = new Date(dateTimeString);

        const year = dateTime.getUTCFullYear();
        const month = dateTime.getUTCMonth() + 1; // 月は0から始まるため、+1する
        const day = dateTime.getUTCDate();
        const hours = dateTime.getUTCHours();
        const minutes = dateTime.getUTCMinutes();
        const seconds = dateTime.getUTCSeconds();

        return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
    }

    function getUTCDateTimeByDate(dateTimeString) {
        const dateTime = new Date(dateTimeString);

        const year = dateTime.getUTCFullYear();
        const month = dateTime.getUTCMonth();
        const day = dateTime.getUTCDate();
        const hours = dateTime.getUTCHours();
        const minutes = dateTime.getUTCMinutes();
        const seconds = dateTime.getUTCSeconds();

        const date = new Date(Date.UTC(year, month, day, hours, minutes, seconds));

        return date;
    }

    function checkDateTime(dateTimeString) {
        const exifDateTime = new Date(dateTimeString);
        const now = new Date();
        const diffInMilliseconds = Math.abs(now - exifDateTime);
        if (diffInMilliseconds > 12 * 60 * 60 * 1000 * 1000) return false;

        return true;
    }

    function checkLatitude(latitude) {
        if (latitude[0] === 0 && latitude[1] === 0 && latitude[2] === 0) return false;

        if (latitude[0] === '' || latitude[1] === '' || latitude[2] === '') return false;

        if (latitude[0] === undefined || latitude[1] === undefined || latitude[2] === undefined) return false;
        return true;
    }

    function checkLongitude(longitude) {
        if (longitude[0] === 0 && longitude[1] === 0 && longitude[2] === 0) return false;

        if (longitude[0] === '' || longitude[1] === '' || longitude[2] === '') return false;

        if (longitude[0] === undefined || longitude[1] === undefined || longitude[2] === undefined) return false;
        return true;
    }

    function hasAnyAnnotationsAndAllHaveText(annotations1, annotations2) {
        if (annotations1.length > 0 || annotations2.length > 0) {
            return (
                annotations1.every(annotation => annotation.text.trim() !== '' && annotation.text.length <= 50) &&
                annotations2.every(annotation => annotation.text.trim() !== '' && annotation.text.length <= 50)
            );
        } else {
            return false;
        }
    }

    const condition_STEP4 = uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && hasAnyAnnotationsAndAllHaveText(annotations, annotations_protected);
    const condition_AppBar = !isButtonDisabled && uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && hasAnyAnnotationsAndAllHaveText(annotations, annotations_protected)


    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////// ページ表示
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
                {uploadingMessage}
            </div>
        ) : null;
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
                        UPLOAD PAGE
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

    const ShowExif = React.memo(() => {

        return (

            <div>
                {exifInfo.DateTimeOriginal && (
                    <h3>EXIF</h3>
                )}
                <div>
                    {uploadedImage && !exifInfo.DateTimeOriginal && (
                        <p>
                            <span style={{ color: 'red' }}> No EXIF information available.</span>
                        </p>
                    )}
                    {checkDateTime(exifInfo.DateTimeOriginal) && exifInfo.DateTimeOriginal && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>DateTimeOriginal(UTC):</span>
                            {getUTCDateTime(exifInfo.DateTimeOriginal)}
                        </p>
                    )}
                    {!checkDateTime(exifInfo.DateTimeOriginal) && exifInfo.DateTimeOriginal && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px', color: 'red' }}>DateTimeOriginal(UTC):</span>
                            <span style={{ color: 'red' }}>{getUTCDateTime(exifInfo.DateTimeOriginal)}</span>
                        </p>
                    )}
                    {!checkDateTime(exifInfo.DateTimeOriginal) && exifInfo.DateTimeOriginal && (
                        <p>
                            <span style={{ color: 'red' }}> ERROR: It has been more than 12 hours since the capture time.</span>
                        </p>
                    )}
                    {checkLatitude(exifInfo.GPSLatitude) && exifInfo.GPSLatitude && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>GPSLatitude:</span>
                            [{exifInfo.GPSLatitude[0]}, {exifInfo.GPSLatitude[1]}, {exifInfo.GPSLatitude[2]}]
                        </p>
                    )}
                    {!checkLatitude(exifInfo.GPSLatitude) && exifInfo.GPSLatitude && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px', color: 'red' }}>GPSLatitude:</span>
                            <span style={{ color: 'red' }}>[{exifInfo.GPSLatitude[0]}, {exifInfo.GPSLatitude[1]}, {exifInfo.GPSLatitude[2]}]</span>
                        </p>
                    )}
                    {!checkLatitude(exifInfo.GPSLatitude) && exifInfo.GPSLatitude && (
                        <p>
                            <span style={{ color: 'red' }}> ERROR: No GPS information available.</span>
                        </p>
                    )}
                    {exifInfo.GPSLatitudeRef && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>GPSLatitudeRef:</span>
                            {exifInfo.GPSLatitudeRef}
                        </p>
                    )}
                    {checkLongitude(exifInfo.GPSLongitude) && exifInfo.GPSLongitude && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>GPSLongitude:</span>
                            [{exifInfo.GPSLongitude[0]}, {exifInfo.GPSLongitude[1]}, {exifInfo.GPSLongitude[2]}]
                        </p>
                    )}
                    {!checkLongitude(exifInfo.GPSLongitude) && exifInfo.GPSLongitude && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px', color: 'red' }}>GPSLongitude:</span>
                            <span style={{ color: 'red' }}>[{exifInfo.GPSLongitude[0]}, {exifInfo.GPSLongitude[1]}, {exifInfo.GPSLongitude[2]}]</span>
                        </p>
                    )}
                    {!checkLongitude(exifInfo.GPSLongitude) && exifInfo.GPSLongitude && (
                        <p>
                            <span style={{ color: 'red' }}> ERROR: No GPS information available.</span>
                        </p>
                    )}
                    {exifInfo.GPSLongitudeRef && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>GPSLongitudeRef:</span>
                            {exifInfo.GPSLongitudeRef}
                        </p>
                    )}
                    {exifInfo.ExifImageHeight && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>ExifImageHeight:</span>
                            {exifInfo.ExifImageHeight}
                        </p>
                    )}
                    {exifInfo.ExifImageWidth && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>ExifImageWidth:</span>
                            {exifInfo.ExifImageWidth}
                        </p>
                    )}
                    {exifInfo.Orientation && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>Orientation:</span>
                            {exifInfo.Orientation}
                        </p>
                    )}
                    {exifInfo.LensMake && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>LensMake:</span>
                            {exifInfo.LensMake}
                        </p>
                    )}
                    {exifInfo.LensModel && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>LensModel:</span>
                            {exifInfo.LensModel}
                        </p>
                    )}
                    {exifInfo.Make && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>Make:</span>
                            {exifInfo.Make}
                        </p>
                    )}
                    {exifInfo.Model && (
                        <p>
                            <span style={{ display: 'inline-block', minWidth: '250px' }}>Model:</span>
                            {exifInfo.Model}
                        </p>
                    )}
                </div>
            </div>
        );
    });


    const Footer = React.memo(() => {

        const handleAgreementLinkClick = useCallback((event) => {
            if (isLocked) {
                event.preventDefault();
                event.stopPropagation();
            }
            setButtonDisabled(false);
        }, []);

        return (
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(245, 245, 245, 0.9)', // 白に近い灰色で少し透過
                zIndex: 1000,
                borderTop: '1px solid #ddd', // ボーダーを薄いグレー
                padding: '10px',
                textAlign: 'center',
                fontSize: '16px'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 20px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}>
                    <div style={{ padding: '10px' }}>
                        <p style={{ margin: '0' }}>
                            <a
                                href={process.env.REACT_APP_SELLER_AGREEMENT_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleAgreementLinkClick}
                                style={isLocked ? { pointerEvents: 'none', color: 'grey' } : {}}
                            >
                                link to terms of service
                            </a>
                        </p>
                    </div>
                    {condition_AppBar && (
                        <div>
                            <button
                                onClick={onSignUpload}
                                disabled={isLocked}
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
                                {isLocked ? (isCompleted ? 'Completed' : 'Processing...') : 'Upload'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    });

    //walletが接続パブリックキーが読み込まれたor切断された場合に再読み込みを実行
    useEffect(() => {
        if (true) {
            console.log("useEffect , [publicKey, disconnect]");
        }
        if (publicKey || disconnect) {
            setIsLocked(false);
            setUploadingMessage("");
            setImage("");
            setUploadedImage(null)
            setExifInfo({
                DateTimeOriginal: '',
                GPSLatitude: '',
                GPSLatitudeRef: '',
                GPSLongitude: '',
                GPSLongitudeRef: '',
                ExifImageHeight: '',
                ExifImageWidth: '',
                Orientation: '',
                LensMake: '',
                LensModel: '',
                Make: '',
                Model: '',
                Latitude: '',
                Longitude: ''
            });
            setAnnotations([]);
            setAnnotations_protected([]);
            setCurrentAnnotation(null);
            setCurrentAnnotation_protected(null);
            setImageDimensions({ width: 0, height: 0 });
            setImageDimensionsProtected({ width: 0, height: 0 });
            setButtonDisabled(true);

        }
    }, [publicKey, disconnect]);


    return (
        <div>

            <Overlay />
            <Header />
            {condition_STEP4 && <Footer />}

            <div style={{
                padding: '20px',
                width: '100%',
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
                <div>
                    <h2>STEP1: Load Image</h2>

                    <div>
                        <form>
                            <input type="file" onChange={handleImage} />
                        </form>
                    </div>
                </div>
                }

                <ShowExif />


                {uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && (
                    <h2>STEP2: Annotation</h2>
                )}
                <div
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                >
                    {uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && (
                        <img
                            ref={imgRef}
                            src={uploadedImage}
                            alt=""
                            draggable="false"
                            style={{ width: imageDimensions.width, height: imageDimensions.height }}
                        />
                    )}
                    {annotations.map((ann, index) => (
                        <Annotation
                            key={index}
                            annotation={ann}
                            onDelete={() => deleteAnnotation(index)}
                            onUpdateText={(text) => updateAnnotationText(index, text)}
                            onMouseDown={(e) => handleAnnotationMouseDown(index, e)}
                            onMouseMove={handleAnnotationMouseMove}
                            onMouseUp={handleAnnotationMouseUp}
                            onResizerMouseDown={(e) => handleResizerMouseDown(index, e)}
                        />
                    ))}
                    {currentAnnotation && (
                        <div
                            className="annotation"
                            style={{
                                left: currentAnnotation.x,
                                top: currentAnnotation.y,
                                width: currentAnnotation.width,
                                height: currentAnnotation.height
                            }}
                        />
                    )}
                </div><br />

                <div>
                    {annotations[0] && (
                        <h3>Results</h3>
                    )}
                    {annotations.map((annotation, index) => (
                        <div key={index}>
                            <p>Idx: {index + 1}, x: {annotation.x}, y: {annotation.y}, width: {annotation.width}, height: {annotation.height}, text: {annotation.text}</p>
                            {annotation.text === "" && <p style={{ color: 'red' }}>Error: Text is empty.</p>}
                            {annotation.text.length > 50 && <p style={{ color: 'red' }}>Warning: Text is too long (over 50 characters).</p>}
                        </div>
                    ))}
                </div>

                {/*
                {uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && (
                    <h2>STEP3: Annotation (Subjects to be protected)</h2>
                )}
                <div
                    style={{ position: 'relative', display: 'inline-block' }}
                    onMouseDown={handleMouseDown_protected}
                    onMouseMove={handleMouseMove_protected}
                    onMouseUp={handleMouseUp_protected}
                >
                    {uploadedImage && checkDateTime(exifInfo.DateTimeOriginal) && checkLatitude(exifInfo.GPSLatitude) && checkLatitude(exifInfo.GPSLongitude) && (
                        <img
                            ref={imgRef_protected}
                            src={uploadedImage}
                            alt=""
                            draggable="false"
                            style={{ width: imageDimensionsProtected.width, height: imageDimensionsProtected.height }}
                        />
                    )}
                    {annotations_protected.map((ann, index) => (
                        <AnnotationProtected
                            key={index}
                            annotation={ann}
                            onDelete={() => deleteAnnotation_protected(index)}
                            onUpdateText={(text) => updateAnnotationText_protected(index, text)}
                            onMouseDown={(e) => handleAnnotationMouseDown_protected(index, e)}
                            onMouseMove={handleAnnotationMouseMove_protected}
                            onMouseUp={handleAnnotationMouseUp_protected}
                            onResizerMouseDown={(e) => handleResizerMouseDown_protected(index, e)}
                        />
                    ))}
                    {currentAnnotation_protected && (
                        <div
                            className="annotation"
                            style={{
                                left: currentAnnotation_protected.x,
                                top: currentAnnotation_protected.y,
                                width: currentAnnotation_protected.width,
                                height: currentAnnotation_protected.height,
                                border: '2px solid gray',
                                backgroundColor: 'rgba(128, 128, 128, 0.8)'
                            }}
                        />
                    )}
                </div><br />

                <div style={{ marginBottom: '100px' }}>
                    {annotations_protected[0] && (
                        <h3>Results</h3>
                    )}
                    {annotations_protected.map((annotation, index) => (
                        <div key={index}>
                            <p>Idx: {index + 1}, x: {annotation.x}, y: {annotation.y}, width: {annotation.width}, height: {annotation.height}, text: {annotation.text}</p>
                            {annotation.text === "" && <p style={{ color: 'red' }}>Error: Text is empty.</p>}
                            {annotation.text.length > 50 && <p style={{ color: 'red' }}>Error: Text is too long (over 50 characters).</p>}
                        </div>
                    ))}
                </div>
                */}




            </div>




        </div>


    );
}

function Annotation({ annotation, onDelete, onUpdateText, onMouseDown, onMouseMove, onMouseUp, onResizerMouseDown }) {
    const handleClick = (e) => {
        e.stopPropagation();
        onDelete();
    };

    const handleTextMouseDown = (e) => {
        e.stopPropagation();  // テキストボックス上でのイベントの伝播を止めます。
    };

    const handleTextChange = (e) => {
        onUpdateText(e.target.value);
    };

    return (
        <div
            className="annotation"
            style={{
                left: annotation.x,
                top: annotation.y,
                width: annotation.width,
                height: annotation.height
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <button
                style={{ position: 'absolute', right: -10, top: -10 }}
                onMouseDown={handleClick}
            >
                X
            </button>
            <input
                type="text"
                value={annotation.text}
                onChange={handleTextChange}
                onMouseDown={handleTextMouseDown}
                style={{
                    position: 'absolute',
                    bottom: -20,
                    width: `${Math.max(100, annotation.text.length * 8)}px` // テキストの長さに基づいて幅を調整します。
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: -5,
                    bottom: -5,
                    width: 10,
                    height: 10,
                    cursor: 'se-resize'
                }}
                onMouseDown={onResizerMouseDown}
            />
        </div>
    );
}

function AnnotationProtected({ annotation, onDelete, onUpdateText, onMouseDown, onMouseMove, onMouseUp, onResizerMouseDown }) {
    const handleClick = (e) => {
        e.stopPropagation();
        onDelete();
    };

    const handleTextMouseDown = (e) => {
        e.stopPropagation();  // テキストボックス上でのイベントの伝播を止めます。
    };

    const handleTextChange = (e) => {
        onUpdateText(e.target.value);
    };

    return (
        <div
            className="annotation-protected"
            style={{
                left: annotation.x,
                top: annotation.y,
                width: annotation.width,
                height: annotation.height
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
        >
            <button
                style={{ position: 'absolute', right: -10, top: -10 }}
                onMouseDown={handleClick}
            >
                X
            </button>
            <input
                type="text"
                value={annotation.text}
                onChange={handleTextChange}
                onMouseDown={handleTextMouseDown}
                style={{
                    position: 'absolute',
                    bottom: -20,
                    width: `${Math.max(100, annotation.text.length * 8)}px` // テキストの長さに基づいて幅を調整します。
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    right: -5,
                    bottom: -5,
                    width: 10,
                    height: 10,
                    cursor: 'se-resize'
                }}
                onMouseDown={onResizerMouseDown}
            />
        </div>
    );
}


export default UploadMain;
