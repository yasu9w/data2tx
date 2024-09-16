// src/pages/Upload.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Upload

Here, we will explain how users who wish to sell images can upload their images.

In most traditional photo stock services, users create an account with an email address, register their personal information, and then start selling. However, with DATA2TX, only a wallet is required.

With DATA2TX, we store the registered images, the seller's address, and a signature that confirms the seller's agreement to the contract (also done via the wallet), allowing the images to be sold.

You can upload images from the page linked below. This page is also linked from the top page.

[upload](/upload)


### STEP 1: Loading Images

DATA2TX handles images with geolocation (GPS information) attached. Images taken with GPS enabled on your camera will be eligible for sale.

On a smartphone camera, you can configure whether or not to attach GPS information from the settings.

For digital cameras, some high-end models come equipped with GPS, but most digital cameras do not have built-in GPS.

If your camera does not have GPS, you can use a smartphone app provided by the camera manufacturer to add geolocation information. We recommend using such apps.

Additionally, external GPS devices are also available from camera manufacturers, so using an external GPS device is another good option.

If the image has geolocation information attached, you can load it as shown below.

![UPLOAD STEP1](/images/upload_step1.png)

### STEP 2: Annotation

When you drag on the loaded image, a red frame and a text input box will appear.

Draw a red frame around any object of your choice and enter text.

This will create training data for general object detection learning.

At this stage, we have not defined specific objects or strict annotation methods, but we plan to establish annotation definitions as needed in the future.

### STEP 3: Annotation (Subjects to be protected)

Below this, there is STEP 3, which is intended to protect subjects from being included in the training data.

For example, this step is added to protect personal information, such as the faces of people or license plates that may have been captured prominently in the image.

We plan to add a clause to the terms of service that requires data buyers to respect and protect these annotated areas during their training.

Once all inputs are complete, click "link to terms of services" at the bottom left to display the terms of service page.

### STEP 4: Upload

Once the terms of service are completed, an "Upload" button will appear at the bottom right.

When you click this button, your wallet will open, and you will be prompted to confirm. At this point, no tokens will be moved or NFTs will be issued (DATA2TX does not issue NFTs at this time); only a signature will be made.

![UPLOAD CONFIRM](/images/upload_confirm.png) 

By clicking "Confirm," you will sign the document agreeing to the terms using your secret key.

This signature is provided to the image buyers along with the annotation information, allowing them to verify that the seller has agreed to the terms.

With this, the sales registration is complete. When an image is purchased, the payment will be immediately sent to the registered address.


`,
    ja: `
# Upload

ここでは、画像を販売するユーザーが画像をアップロードする方法を説明します。

一般的なフォトストックサービスでは、メールアドレスでアカウントを作成し、個人情報を登録して販売開始となりますが、DATA2TXではウォレットのみを使います。

DATA2TXでは、販売者から登録された画像、販売者のアドレス、販売者が契約書に同意したという署名（これもウォレットで行います）を預かり、画像を販売できるようにします。

アップロードは下記のページから行います。このページはトップページからもリンクが貼ってあります。

[upload](/upload)

### STEP 1: 画像の読み込み

DATA2TXでは、位置情報（GPS情報）が付与された画像を取り扱います。カメラで撮影する際にGPSをONにして撮影した画像が販売対象となります。

スマートフォンのカメラでは、設定からGPS情報を付けるか付けないかを設定することができます。

デジタルカメラでは、一部の上位機種のカメラではGPSが搭載されていますが、多くのデジタルカメラではGPSが内蔵となっておりません。

そのような機種の場合は、カメラメーカーから提供されているスマートフォンのアプリで位置情報を付与することができるため、アプリをご活用ください。

また、外付けのGPS機器もカメラメーカーから販売されていますので、このような外部GPSを使うのも良い選択だと思います。

位置情報が付与された画像であれば、下記のように画像を読み込むことができます。

![UPLOAD STEP1](/images/upload_step1.png)  


### STEP 2: アノテーション

読み込まれた画像の上でドラッグをすると赤い枠とテキスト入力ボックスが表示されます。

任意物体に赤い枠をつけてテキスト入力をしてください。

これは一般的な被写体検出の学習のための学習データとなります。

ここでは、被写体の限定や、厳格なアノテーション方法などは定義していませんが、今後必要に応じてアノテーション定義を決めていくことを考えています。

### STEP 3: アノテーション (保護対象のオブジェクト)

その下にSTEP3が設けられており、これは被写体を学習対象から保護するためのものです。

例えば、大きく映り込んでしまった人物の顔やナンバープレートなど個人情報を守るためにこの項目を追加しています。

学習のためにデータを購入した購入者はこの保護アノテーションの領域は保護するように学習する義務を利用規約に追加する予定です。

全ての入力が完了したら左下のlink to terms of servicesを押すと利用規約のページが表示されます。

![UPLOAD STEP1](/images/upload_step2.png)  

### STEP 4: アップロード

利用規約が完了すると、右下にUploadボタンが表示されます。

このボタンを押すとウォレットが立ち上がり、Confirmを要求されます。このとき、トークンの移動やNFTの発行などは行わず（DATA2TXでは現時点でNFTの発行は行いません）、署名のみを行います。

![UPLOAD CONFIRM](/images/upload_confirm.png)  

Confirmを押すと、先ほどの契約書に同意した文面に秘密鍵を使い署名します。

この署名は、画像購入者にアノテーション情報と一緒に提供され、販売者が契約書に記録したことを確認することができます。

以上で販売登録が完了し、画像が購入されると即時登録したアドレス宛に代金が送金される仕組みになっています。


`
};

const Upload = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default Upload;