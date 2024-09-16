// src/pages/Home.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# DATA2TX: A Marketplace for Machine Learning Data

DATA2TX is a service that leverages Solana to enable the buying and selling of training data for machine learning. The primary focus is on handling images with geolocation data.

Currently, a demo version is available. In the full version, transactions will be conducted on Solana's Mainnet using USD stablecoins. In the demo, however, we use Solana's devnet, where transactions are simulated using wrapped SOL.

Since anyone can obtain SOL through airdrops on the devnet, tokens circulating on the devnet have no value. Please note that while you can experience buying and selling images in the demo, the tokens used have no real value.

The demo service is designed for use on desktop devices and is not compatible with mobile devices. For the full service, we plan to consider implementation for mobile use.

`,
    ja: `
# DATA2TX：機械学習用データのマーケットプレイス

DATA2TXは、Solanaを利用して機械学習用の学習データを売買するサービスです。主に、位置情報が付いた画像を取り扱います。

現在、デモ版がリリース中です。正式なサービスでは、SolanaのMainnet上でドルステーブルコインを使用して取引を行う予定です。ただし、デモではSolanaのdevnetを使用し、wrapped SOLを代わりに使い、擬似的に取引を行うことができます。

devnetでは、誰でもエアドロップによってSOLを入手できるため、devnet上で流通するトークンには価値がありません。デモでは画像の売買を体験できますが、使用しているトークンは無価値であることにご注意ください。

デモサービスは、デスクトップでの利用を想定しており、モバイルには非対応です。正式なサービスでは、モバイルでの実装も検討予定です。

`
};

const Home = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default Home;