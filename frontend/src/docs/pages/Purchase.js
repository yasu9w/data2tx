// src/pages/Upload.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Purchase

Here, we will explain how users can purchase images.

In DATA2TX, image purchases are made using cryptocurrency. By using Solana, which offers low fees and fast transactions, it is possible to buy and sell images even one at a time. The payment is processed immediately, and the proceeds are sent to the seller without delay.

One of the key features of DATA2TX is that it handles images with geolocation data. In the future, various types of training data may be handled, but by using blockchain, we leverage the advantage of low-cost, small-scale international payments to provide a platform for buying and selling geotagged images across countries.

Purchases can be made from the page linked below. This page is also linked from the top page.

[purchase](/purchase)

### STEP 1: Image Search

With DATA2TX, you can search for images from the map using the Google Maps API. If you are not connected to a wallet, the use of the API is restricted, and the Google Static Maps API is provided.

![staticAPI](/images/staticAPI.png)  

With the Google Static Maps API, interactive features are limited, and the map is manipulated by setting the center position and zoom level using numeric input boxes. The feature to display shooting locations with pins is also restricted.

By connecting a wallet, you can use the Maps JavaScript API. New users who connect to DATA2TX for the first time are given 5 points. Each time you connect your wallet and load the Maps JavaScript API, 1 point is used.

![javascriptAPI](/images/jsAPI.png) 

Zooming in and out of the map or moving its position does not use any points; 1 point is used at the time of connecting the wallet. As long as the wallet remains connected, you can use the map without consuming additional points.

Additionally, 5 new points are awarded for each image purchased. Due to the high cost of the Maps JavaScript API, we have implemented these usage restrictions, which may be inconvenient.

You can search by specifying the geolocation and, if necessary, the date and time range of the capture, and then pressing the "Search" button. The search results will be displayed as a list below.

### STEP 2: Image Purchase

To purchase an image, click on the desired image from the search results, review the terms of service by clicking the "link to terms of service" at the bottom left, and then click the "Purchase" button at the bottom right.

![javascriptAPI](/images/purchase_select.png)  

When you press the "Purchase" button, a confirmation screen will appear in your wallet. Upon approval, a transaction will be issued, and the payment will be processed.

![javascriptAPI](/images/purchase_confirm.png)  

In the demo version, the price for each image is set at 0.03 wSOL, with a 30% service fee (0.009 wSOL) collected, and 70% (0.021 wSOL) sent to the image seller's address.

In the official service, the price for each image is planned to be $3 in USD stablecoins, with a 30% fee ($0.9) and 70% ($2.1) going to the seller.

Purchased images will be overlaid in gray and will not be available for purchase again.

`,
    ja: `
# Purchase

ここでは画像を購入するユーザーが画像を購入する方法を説明します。

DATA2TXでは、画像購入の決済を仮想通貨を用いて行います。手数料が安価で高速なSolanaを使うことにより一枚から売買が可能となります。また、決済は即時行われ、対価は販売者にすぐに送金されます。

DATA2TXの１つの特徴として、位置情報が付いた画像を取り扱うことにあります。今後様々な学習データを取り扱う可能性はありますが、ブロックチェーンを使うことにより、安価に少額な国際送金ができるというメリットを活かして、位置情報が付いた画像を国を跨いで売買できるプラットフォームを提供します。

購入は下記のページから行います。このページはトップページからもリンクが貼ってあります。

[purchase](/purchase)

### STEP 1: 画像の検索

DATA2TXでは、Google map APIを使い、地図上から画像検索ができます。ウォレットに接続していない場合は、API利用に制限がかかっており、Google Static Maps APIを提供しています。

![staticAPI](/images/staticAPI.png)  

Google Static Maps APIでは、インタラクティブな機能は制限され、数値ボックスから中心位置と、ズームレベルを設定することでマップを操作します。また、撮影場所をピンで表示する機能も制限されます。

ウォレットを接続するとMaps JavaScript API を利用することができます。初めてDATA2TXに接続するユーザーには５ポイント付与があり、ウォレットを接続し、Maps JavaScript API読み込むごとに１ポイント利用されます。

![javascriptAPI](/images/jsAPI.png)  

マップのズーム変更や位置移動ではポイントは利用されず、ウォレットを接続したタイミングで１ポイント利用されます。その後ウォレットを接続している限りは、ポイントを利用せずにマップを利用できます。

また、画像を一枚購入すると新たに５ポイント付与される仕組みとなっています。Maps JavaScript APIのコストが高いため、不便ですがこのような利用制約を設けております。

地図で位置情報、必要であれば撮影日時の時間範囲を指定してSearchボタンを押すと検索することができます。検索された画像は下に一覧が表示されます。

### STEP 2: 画像の購入

検索した画像の中から欲しい画像をクリックし、左下に表示されるlink to terms of serviceから利用規約を確認し、右下のPurchaseボタンより画像を購入することができます。

![javascriptAPI](/images/purchase_select.png)  

Purchaseボタンを押すと、ウォレットのConfirm画面が出るので、承認するとトランザクションが発行され、送金が行われます。

![javascriptAPI](/images/purchase_confirm.png)  

デモ版では、画像一枚0.03wSOLの価格に設定されており、30%の0.009wSOLがサービス手数料として徴収されます。また、70%の0.021wSOLが画像販売者のアドレスに送金されます。

正式なサービスでは、画像一枚の価格をドルステーブルコインで3ドル、手数料を30%の0.9ドル、販売者への対価を70%の2.1ドルに予定しています。

購入済みの画像は、灰色の重畳表示がされ、購入できないようになっています。

`
};

const Upload = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default Upload;