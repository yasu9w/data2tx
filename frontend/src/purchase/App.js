
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

import { db } from "./firebase";
import WalletContextProvider from './WalletContextProvider'
import SearchButton from './SearchButton';
import { SendTransaction } from './sendTransaction'
import { LockProvider, useLock } from './LockContext';

import { Loader } from "@googlemaps/js-api-loader";

const DEBUG = true;

const PurchaseMain = () => (
    <WalletContextProvider>
        <LockProvider>
            <PurchaseApp />
        </LockProvider>
    </WalletContextProvider>
)

const Overlay = () => {
    const { isLocked, sendingMessage } = useLock();
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
            pointerEvents: 'auto'
        }}>
            {sendingMessage}
        </div>
    ) : null;
};

function useQuery() {
    return new URLSearchParams(window.location.search);
}

function isValidImageId(query) {
    if (query === null) {
        return false;
    }

    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const validExtensions = ['.jpeg', '.JPEG', '.jpg', '.JPG', '.heic', '.HEIC',];
    const totalLength = 24;
    const numericLength = 14;

    // Get the file extension
    let extension = query.slice(-5); // When the file extension is 5 characters long (e.g., '.jpeg', '.JPEG')
    let basePart = query.slice(0, -5);

    if (!validExtensions.includes(extension)) {
        // Check for a 4-character file extension (e.g., '.jpg', '.JPG')
        extension = query.slice(-4);
        basePart = query.slice(0, -4);

        if (!validExtensions.includes(extension)) {
            return false;
        }
    }

    // Check the length of the base part
    if (basePart.length !== totalLength) {
        return false;
    }

    // Check if the first 14 characters are composed of numbers
    for (let i = 0; i < numericLength; i++) {
        if (!('0' <= basePart[i] && basePart[i] <= '9')) {
            return false;
        }
    }

    // Check if the last 10 characters are composed of base58
    for (let i = numericLength; i < totalLength; i++) {
        if (!base58Chars.includes(basePart[i])) {
            return false;
        }
    }

    return true;
}

function isValidSolanaPublicKey(query) {

    if (query === null) {
        return false;
    }

    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const length = query.length;

    // Check the number of characters
    if (length < 32 || length > 44) {
        return false;
    }

    // Check the character set used
    for (let i = 0; i < length; i++) {
        if (!base58Chars.includes(query[i])) {
            return false;
        }
    }

    return true;
}

function isValidDateInQuery(queryDateString) {
    // URL decode
    const decodedString = decodeURIComponent(queryDateString);

    /// Regular expression to check the date format
    const regex = /^\d{4}-\d{2}-\d{2}$/;

    // Check if the date format is correct
    if (!regex.test(decodedString)) {
        return false;
    }

    // Create a date object and check if the date is valid
    const date = new Date(decodedString);
    return date instanceof Date && !isNaN(date);
}

function isValidTimeInQuery(queryTimeString) {
    // URL decode
    const decodedString = decodeURIComponent(queryTimeString);

    // 日付の形式をチェックする正規表現
    //const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
    const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

    // Regular expression to check the date format
    return regex.test(decodedString);
}

function isValidZoomInQuery(queryString) {
    // URL decode
    const decodedString = decodeURIComponent(queryString);

    // Regular expression to match numbers from 0 to 22
    const regex = /^(?:[0-9]|1[0-9]|2[0-2])$/;

    // Check if the query string matches the regular expression
    return regex.test(decodedString);
}

function isValidLongitude(longitude) {
    // Regular expression to validate the range of longitude
    const regex = /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;

    // Check if the longitude matches the regular expression
    return regex.test(longitude);
}

function isValidLatitude(latitude) {
    // Regular expression to validate the range of latitude
    const regex = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/;

    // Check if the latitude matches the regular expression
    return regex.test(latitude);
}

function sanitize(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

const PurchaseApp = React.memo(() => {
    if (DEBUG) {
        console.log("function App()");
    }
    const { useJSMapAPI } = useLock();

    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const apiKeyEmbed = process.env.REACT_APP_GOOGLE_MAPS_API_KEY_EMBED;
    const queryUrl = useQuery();

    const queryImageId = queryUrl.get('id');
    const isValidId = isValidImageId(queryImageId);
    //const [imageId, setImageId] = useState(isValidId ? sanitize(queryImageId) : null);
    const imageId = isValidId ? sanitize(queryImageId) : null;

    const queryKey = queryUrl.get('key');
    const isValidKey = isValidSolanaPublicKey(queryKey);
    //const [key, setKey] = useState(isValidKey ? sanitize(queryKey) : null);
    const key = isValidKey ? sanitize(queryKey) : null;

    const queryStartDate = queryUrl.get('startDate');
    const isValidStartDate = isValidDateInQuery(queryStartDate);
    const [startDate, setStartDate] = useState(isValidStartDate ? sanitize(queryStartDate) : "");

    const queryStartTime = queryUrl.get('startTime');
    const isValidStartTime = isValidTimeInQuery(queryStartTime);
    const [startTime, setStartTime] = useState(isValidStartTime ? sanitize(queryStartTime) : "");

    const queryEndDate = queryUrl.get('endDate');
    const isValidEndDate = isValidDateInQuery(queryStartDate);
    const [endDate, setEndDate] = useState(isValidEndDate ? sanitize(queryEndDate) : "");

    const queryEndTime = queryUrl.get('endTime');
    const isValidEndTime = isValidTimeInQuery(queryEndTime);
    const [endTime, setEndTime] = useState(isValidEndTime ? sanitize(queryEndTime) : "");

    const [selectedSortOrder, setSelectedSortOrder] = useState('captureDate');

    const queryLng = queryUrl.get('lng');
    const queryLat = queryUrl.get('lat');
    const queryNElat = queryUrl.get('NElat');
    const queryNElng = queryUrl.get('NElng');
    const querySWlat = queryUrl.get('SWlat');
    const querySWlng = queryUrl.get('SWlng');
    const queryZoom = queryUrl.get('zoom');

    const isValidLat = isValidLatitude(queryLat);
    const isValidLng = isValidLongitude(queryLng);
    const isValidNElat = isValidLatitude(queryNElat);
    const isValidNElng = isValidLongitude(queryNElng);
    const isValidSWlat = isValidLatitude(querySWlat);
    const isValidSWlng = isValidLongitude(querySWlng);
    const isValidZoom = isValidZoomInQuery(queryZoom);

    const initialLat = isValidLat ? parseFloat(sanitize(queryLat)) : 35.68286;
    const initialLng = isValidNElat ? parseFloat(sanitize(queryLng)) : 139.76908;
    let initialNElat = queryImageId ? 90 : (isValidNElat ? parseFloat(sanitize(queryNElat)) : 35.88339);
    let initialNElng = queryImageId ? 180 : (isValidNElng ? parseFloat(sanitize(queryNElng)) : 140.01627);
    let initialSWlat = queryImageId ? -90 : (isValidSWlat ? parseFloat(sanitize(querySWlat)) : 35.48182);
    let initialSWlng = queryImageId ? -180 : (isValidSWlng ? parseFloat(sanitize(querySWlng)) : 139.52188);
    let initialZoom = queryImageId ? 0 : (isValidZoom ? parseInt(sanitize(queryZoom)) : 10);

    let middleLat, middleLng, latMargin, lngMargin, isLatInRange, isLngInRange;

    if (isValidLat && isValidLng && isValidNElat && isValidNElng && isValidSWlat && isValidSWlng) {
        middleLat = (parseFloat(sanitize(queryNElat)) + parseFloat(sanitize(querySWlat))) / 2;
        middleLng = (parseFloat(sanitize(queryNElng)) + parseFloat(sanitize(querySWlng))) / 2;

        latMargin = Math.abs(parseFloat(sanitize(queryNElat)) - parseFloat(sanitize(querySWlat))) * 0.05;
        lngMargin = Math.abs(parseFloat(sanitize(queryNElng)) - parseFloat(sanitize(querySWlng))) * 0.05;

        isLatInRange = queryLat && parseFloat(sanitize(queryLat)) >= (middleLat - latMargin) && parseFloat(sanitize(queryLat)) <= (middleLat + latMargin);
        isLngInRange = queryLng && parseFloat(sanitize(queryLng)) >= (middleLng - lngMargin) && parseFloat(sanitize(queryLng)) <= (middleLng + lngMargin);
    } else {
        isLatInRange = false;
        isLngInRange = false;
    }

    //Tokyo Station
    let initialCenter = {
        lat: 35.68286,
        lng: 139.76908
    }

    if (isValidLng && isValidLat) {// If the lat and lng in the query are valid values

        initialCenter = {
            lat: initialLat,
            lng: initialLng
        }

        if (!(isValidNElat && isValidNElng && isValidSWlat && isValidSWlng && isLatInRange && isLngInRange)) { // Reset if the values of NElat, NElng, SWlat, or SWlng are invalid
            initialNElat = 90
            initialNElng = 180
            initialSWlat = -90
            initialSWlng = -180
            initialZoom = 0
        }
    }

    const [center, setCenter] = useState(initialCenter);
    const [NElat, setNElat] = useState(initialNElat);
    const [NElng, setNElng] = useState(initialNElng);
    const [SWlat, setSWlat] = useState(initialSWlat);
    const [SWlng, setSWlng] = useState(initialSWlng);
    const [zoom, setZoom] = useState(initialZoom);
    const [boundEmbedAPI, setBoundEmbedAPI] = useState("");

    /*
    console.log("isValidLng", isValidLng)
    console.log("isValidLat", isValidLat)
    console.log("isLngInRange", isLngInRange)
    console.log("isLngInRange", isLngInRange)
    console.log("center", center)
    console.log("NElat", NElat)
    console.log("NElng", NElng)
    console.log("SWlat", SWlat)
    console.log("SWlng", SWlng)
    console.log("zoom", zoom)
    */


    //****************************************************//
    //map API Embed
    //****************************************************//

    const generateEmbedUrl = (center, zoom) => {
        return `https://www.google.com/maps/embed/v1/view?key=${apiKeyEmbed}&center=${center.lat},${center.lng}&zoom=${zoom}`;
    };

    const [embedUrl, setEmbedUrl] = useState(generateEmbedUrl(center, zoom));

    const zoomLevels = {
        0: { width: 360, height: 180 },
        1: { width: 360, height: 149.38 },
        2: { width: 360, height: 94.98 },
        3: { width: 50.51, height: 63.28 },
        4: { width: 25.59, height: 31.64 },
        5: { width: 12.83779, height: 15.82032 },
        6: { width: 6.42382, height: 57.91016 },
        7: { width: 3.21252, height: 3.95508 },
        8: { width: 1.60634, height: 1.97754 },
        9: { width: 0.80318, height: 0.98876 },
        10: { width: 0.40158, height: 0.49438 },
        11: { width: 0.20106, height: 0.24720 },
        12: { width: 0.10049, height: 0.12360 },
        13: { width: 0.05020, height: 0.06180 },
        14: { width: 0.02510, height: 0.03090 },
        15: { width: 0.01255, height: 0.01544 },
        16: { width: 0.00628, height: 0.00772 },
        17: { width: 0.00314, height: 0.00386 },
        18: { width: 0.00156, height: 0.00194 },
        19: { width: 0.00078, height: 0.00096 },
        20: { width: 0.00039, height: 0.00048 },
        21: { width: 0.00020, height: 0.00024 },
    };

    const handleCenterChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = parseFloat(value);

        setCenter((prevCenter) => {
            const zoomLevel = zoomLevels[zoom] || { width: 0.02, height: 0.02 };
            const changeAmount = zoomLevel[name === 'lat' ? 'height' : 'width'] / 4;
            const newValue = prevCenter[name] + (parsedValue - prevCenter[name]) * changeAmount;

            // Limit to 5 decimal places
            const roundedValue = parseFloat(newValue.toFixed(5));

            return {
                ...prevCenter,
                [name]: roundedValue
            };
        });
    };

    const handleZoomChange = (e) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            value = 0;
        } else if (value < 0) {
            value = 0;
        } else if (value > 21) {
            value = 21;
        }
        setZoom(value);
    };

    useEffect(() => {
        setEmbedUrl(generateEmbedUrl(center, zoom));
        setBoundEmbedAPI(getBounds(center, zoom));
    }, [center, zoom]);

    const getBounds = (center, zoom) => {
        const range = zoomLevels[zoom];
        const NE = {
            lat: center.lat + range.height / 2,
            lng: center.lng + range.width / 2
        };
        const SW = {
            lat: center.lat - range.height / 2,
            lng: center.lng - range.width / 2
        };
        return { NE, SW };
    };

    useEffect(() => {

        if (boundEmbedAPI) {
            const NE = boundEmbedAPI.NE;
            const SW = boundEmbedAPI.SW;
            if (NE.lng < SW.lng) {
                setNElat(parseFloat(NE.lat.toFixed(5)));
                setNElng(180);
                setSWlat(parseFloat(SW.lat.toFixed(5)));
                setSWlng(-180);
            } else {
                setNElat(parseFloat(NE.lat.toFixed(5)));
                setNElng(parseFloat(NE.lng.toFixed(5)));
                setSWlat(parseFloat(SW.lat.toFixed(5)));
                setSWlng(parseFloat(SW.lng.toFixed(5)));
            }
        }

    }, [boundEmbedAPI]);

    //****************************************************//
    //map API javascript
    //****************************************************//

    const containerStyle = {
        width: '360px',
        height: '360px'
    };

    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRefs = useRef([]);

    const [markersAll, setMarkersAll] = useState([]);
    
    const updateBounds = useCallback(() => {
        if (mapInstanceRef.current) {
            const bounds = mapInstanceRef.current.getBounds();
            if (bounds) {
                const NE = bounds.getNorthEast();
                const SW = bounds.getSouthWest();
                if (NE.lng() < SW.lng()) {
                    setNElat(parseFloat(NE.lat().toFixed(5)));
                    setNElng(180);
                    setSWlat(parseFloat(SW.lat().toFixed(5)));
                    setSWlng(-180);
                } else {
                    setNElat(parseFloat(NE.lat().toFixed(5)));
                    setNElng(parseFloat(NE.lng().toFixed(5)));
                    setSWlat(parseFloat(SW.lat().toFixed(5)));
                    setSWlng(parseFloat(SW.lng().toFixed(5)));
                }
            }
        }
    }, []);

    const handleZoomChanged = useCallback(() => {
        if (mapInstanceRef.current) {
            const newZoom = mapInstanceRef.current.getZoom();
            setZoom(newZoom);
            console.log("Zoom level changed to:", newZoom);
            updateBounds();
        }
    }, [updateBounds]);

    const handleBoundsChanged = useCallback(() => {
        if (mapInstanceRef.current) {
            const newCenter = mapInstanceRef.current.getCenter();
            let adjustedLng = (newCenter.lng() + 180) % 360 - 180;
            if (adjustedLng < -180) {
                adjustedLng += 360;
            }
            setCenter({ lat: newCenter.lat(), lng: adjustedLng });
            console.log("Center changed to:", newCenter.lat(), newCenter.lng());
            console.log("Center changed to:", newCenter.lat(), adjustedLng);
            updateBounds();
        }
    }, [updateBounds]);

    const createMarkers = useCallback(() => {
        if (mapInstanceRef.current) {
            markerRefs.current.forEach(marker => marker.setMap(null));
            markerRefs.current = [];

            markersAll.forEach((markerData) => {
                const marker = new window.google.maps.Marker({
                    position: markerData.position,
                    map: mapInstanceRef.current,
                    draggable: markerData.draggable,
                });
                markerRefs.current.push(marker);
            });
        }
    }, [markersAll]);

    useEffect(() => {
        if (!mapInstanceRef.current && useJSMapAPI) {
            const loader = new Loader({
                apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
                version: "weekly",
            });

            loader.load().then(() => {
                if (mapRef.current) {
                    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
                        center: center,
                        zoom: zoom,
                        streetViewControl: false,
                        mapTypeControl: false,
                        fullscreenControl: false,
                        disableDoubleClickZoom: true,
                        clickableIcons: false,
                    });

                    mapInstanceRef.current.addListener("zoom_changed", handleZoomChanged);
                    mapInstanceRef.current.addListener("dragend", handleBoundsChanged);

                    createMarkers();
                }
            });
        }

        return () => {
            if (mapInstanceRef.current && !useJSMapAPI) {
                window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
                mapInstanceRef.current = null;
            }
        };

    }, [useJSMapAPI, handleZoomChanged, handleBoundsChanged, createMarkers]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            createMarkers();
        }
    }, [markersAll, createMarkers]);

    useEffect(() => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(center);
            mapInstanceRef.current.setZoom(zoom);
        }
    }, [center, zoom]);

    useEffect(() => {
        if (DEBUG) {
            console.log("markersAll");
            console.log(markersAll);
        }
    }, [markersAll]);

    const handleDocDataAll = (data) => {

        let newMarkers = data.map(doc => {
            const { latitude, longitude } = doc.data;
            return {
                position: {
                    lat: latitude,
                    lng: longitude
                },
                draggable: false
            };
        });
        setMarkersAll(newMarkers);
    };

    const [searchResultMessage, setSearchResultMessage] = useState([]);

    const handleMsg = (searchResultMessage) => {
        setSearchResultMessage(searchResultMessage);
    };

    const handleStartDateChange = (event) => {
        setStartDate(event.target.value);
    }

    const handleStartTimeChange = (event) => {
        setStartTime(event.target.value);
    }

    const handleEndDateChange = (event) => {
        setEndDate(event.target.value);
    }

    const handleEndTimeChange = (event) => {
        setEndTime(event.target.value);
    }

    const handleSortOrderChange = (event) => {
        setSelectedSortOrder(event.target.value);
    }
    
    const [selectedImagesHandle, setSelectedImagesHandle] = useState([]);

    const [selectedImagesFlag, setSelectedImagesFlag] = useState(false);

    const [isSendButtonDisabled, setSendButtonDisabled] = useState(true);

    const handleSearchButtonClick = () => {
        setSendButtonDisabled(true);
    }
    
    const Header = React.memo(() => {
        if (DEBUG) {
            console.log("Header");
        }

        const { isLocked } = useLock();

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
                        PURCHASE PAGE
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

    const Footer = React.memo(() => {
        if (DEBUG) {
            console.log("Footer");
        }

        const { isLocked } = useLock();

        const handleAgreementLinkClick = useCallback((event) => {
            if (isLocked) {
                event.preventDefault();
                event.stopPropagation();
            }
            setSendButtonDisabled(false);
        }, [isLocked]);

        return (
            <div style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                width: '100%',
                backgroundColor: 'rgba(245, 245, 245, 0.9)', //gray
                zIndex: 1000,
                borderTop: '1px solid #ddd', //gray
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
                                href={process.env.REACT_APP_BUYER_AGREEMENT_LINK}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={handleAgreementLinkClick}
                                style={isLocked ? { pointerEvents: 'none', color: 'grey' } : {}}
                            >
                                link to terms of service
                            </a>
                        </p>
                    </div>
                    {/*{selectedImagesFlag && !isSendButtonDisabled && ( */}
                    {selectedImagesFlag && (
                        <div style={isLocked ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
                            <SendTransaction selectedImagesHandle={selectedImagesHandle} />
                        </div>
                    )}
                </div>
            </div>
        );
    });

    return (

        <div>
            <div style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                marginTop: '60px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0px',
            }}>

                {!useJSMapAPI && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ width: '150px' }}>Center Latitude:</label>
                                <input
                                    type="number"
                                    name="lat"
                                    value={center.lat}
                                    onChange={handleCenterChange}
                                    style={{ flex: '1' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ width: '150px' }}>Center Longitude:</label>
                                <input
                                    type="number"
                                    name="lng"
                                    value={center.lng}
                                    onChange={handleCenterChange}
                                    style={{ flex: '1' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label style={{ width: '150px' }}>Zoom Level:</label>
                                <input
                                    type="number"
                                    value={zoom}
                                    onChange={handleZoomChange}
                                    style={{ flex: '1' }}
                                />
                            </div>
                            <div style={{ position: 'relative', width: '360px', height: '360px' }}>
                                <iframe
                                    width="360"
                                    height="360"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    allowFullScreen
                                    src={embedUrl}
                                    title="Google Maps Embed API"
                                ></iframe>
                                <div style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'transparent',
                                    zIndex: 1
                                }}></div>
                            </div>
                        </div>
                    </div>
                )}
                
                {useJSMapAPI && (
                    <div style={containerStyle}>
                        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}

            </div>

            <Overlay />

            <Header />

            {selectedImagesFlag && <Footer />}
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

                {!useJSMapAPI && (
                    <p style={{ color: 'red' }}>
                        API access is currently restricted. To lift the restriction, please connect your wallet.
                    </p>
                )}
                {imageId === null && (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '50px' }}>
                                <label>Capture Date</label>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ minWidth: '50px' }}>FROM:</label>
                                <input type="date" value={startDate} onChange={handleStartDateChange} />
                                <input type="time" value={startTime} onChange={handleStartTimeChange} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <label style={{ minWidth: '50px' }}>TO:</label>
                                <input type="date" value={endDate} onChange={handleEndDateChange} />
                                <input type="time" value={endTime} onChange={handleEndTimeChange} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <label style={{ minWidth: '50px' }}>SORT BY:</label>
                            <select value={selectedSortOrder} onChange={handleSortOrderChange}>
                                <option value="captureDate">Capture Date</option>
                                <option value="uploadDate">Upload Date</option>
                            </select>
                        </div>
                    </div>
                )}
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
                    <SearchButton
                        db={db}
                        queryKey={key}
                        startDate={startDate}
                        startTime={startTime}
                        endDate={endDate}
                        endTime={endTime}
                        selectedSortOrder={selectedSortOrder}
                        zoom={zoom}
                        CenterLat={center.lat}
                        CenterLng={center.lng}
                        NElat={NElat}
                        NElng={NElng}
                        SWlat={SWlat}
                        SWlng={SWlng}
                        imageId={imageId}
                        onSearchMsg={handleMsg}
                        onDocData={handleDocDataAll}
                        setSelectedImagesHandle={setSelectedImagesHandle}
                        onClick={handleSearchButtonClick}
                        setSelectedImagesFlag={setSelectedImagesFlag}
                        setSendButtonDisabled={setSendButtonDisabled}
                    />
                </div>

                <div style={{
                    padding: '0px',
                    maxWidth: '1200px',
                    margin: '0 auto',
                    marginTop: '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                }}>

                    {imageId === null && markersAll && markersAll.length === 0 && <p>{searchResultMessage}</p>}
                    <div id="image-container" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '100px' }}></div>

                </div>

            </div>
        </div>

    );
});


export default PurchaseMain;