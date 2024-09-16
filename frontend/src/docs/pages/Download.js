// src/pages/Upload.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Download

This section explains how to download images you have purchased.

The download can be performed from the page linked below. This page is also linked from the top page.

[download](/download)

### STEP 1: Request Purchased Image Links

First, connect your wallet, specify the date of the image purchase, and press the "Search" button. At this point, the start date and time of the purchase are mandatory parameters.

When you press the "Search" button, your wallet will open, and a confirmation screen will appear. Here, a signature is created with your private key to indicate the image download request, and it is sent to the server.

![download_sign](/images/download_sign.png)

### STEP 2: Download Purchased Image Links

In a typical photo stock service, a user's identity is verified by an email address and password. However, in DATA2TX, identity is verified through the signature.

Once the user's identity is confirmed and the payment transaction is verified to be successful, a time-limited URL for the corresponding image will be provided. The URL is set to expire in 15 minutes, after which access to the image will no longer be available.

![download_list](/images/download_list.png)

The images are provided as two files: the image itself and an annotation file, which includes the seller's signature agreeing to the terms.

This access control method is patent-pending.

In the official service, a "Download all" button is provided to download all displayed images and annotations at once. However, in the demo version, this feature is disabled to reduce server load.

`,
    ja: `
# Download

ここでは購入した画像のダウンロード方法を説明します。

ダウンロードは下記のページから行います。このページはトップページからもリンクが貼ってあります。

[download](/download)

### STEP 1: 購入画像リンクの要求

最初にウォレットの接続を行い、画像を購入した日付を指定して、Searchボタンを押します。このとき、画像を購入し日付の開始日時は必須パラメータとなります。

Searchボタンを押すと、ウォレットが立ち上がり、Confirm画面が表示されます。ここでは、画像ダウンロード要求を示すテキストに秘密鍵で署名を行い、それをサーバーに送信しています。

![download_sign](/images/download_sign.png)

### STEP 2: Download Purchased Image Links

一般的なフォトストックサービスでは、メールアドレスとパスワードを使い、購入した本人かを検証しますが、DATA2TXでは、署名を検証することで本人であるかを検証します。

本人であることの検証、また、送金トランザクションが成功していることを確認した上で、該当する画像の期限付きURLをユーザーに提示します。期限付きURLは15分に設定されており、それよりも時間が過ぎると画像にアクセスできなくなります。

![download_list](/images/download_list.png)

画像は下記のように、画像本体とアノテーションの２つのファイルが用意されており、アノテーションのファイルに、販売者が契約書に同意した署名が付与されています。

このアクセス制御方法は、特許出願済みとなります。

正式サービスでは、表示された画像、アノテーション一覧を一括ダウンロードするDownload allボタンを提供していますが、デモ版では負荷軽減のため、無効としています。
`
};

const Download = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default Download;