// src/pages/GettingStarted.js
import React from 'react';
import Content from '../components/Content';

const markdownContent = {
    en: `
# Getting Started

If you already have an account and can obtain wrapped SOL on the devnet, you may skip this section.

Solana has two networks: the mainnet, where tokens with real value circulate, and the devnet, which is intended for developers and contains tokens with no value.

The official service will use the mainnet, while the currently available demo version uses the devnet. Additionally, the demo version is designed for PC use only and is not compatible with mobile devices.

1. **Prepare a Wallet**

   First, you need to set up a wallet that can be used through your browser. Please install the Phantom or Solflare Wallet from your browser's extension store.

   ![Phantom Wallet Icon](/images/install_wallet.png)

   Once the browser extension is installed, the wallet can be accessed from the top right corner of the browser.

   With the wallet, you can freely manage tokens in your blockchain account. While cryptocurrency exchanges have dedicated interfaces, on-chain accounts use wallets like this to perform cryptocurrency transactions.
   
   If you want to purchase images in the official service, you need to buy SOL tokens on a cryptocurrency exchange and transfer them to your wallet account to start the purchase.
   
   To convert earnings from selling images into fiat currency (USD, JPY), transfer the funds from the wallet to a cryptocurrency exchange and exchange them for fiat currency.

2. **Devnet Configuration**

   For the demo version, you will use the devnet, so you need to set up your wallet for the devnet first.

   If you are using Phantom, go to the "Settings" at the bottom of the menu, open "Developer Settings," and switch to "Testnet Mode." You can change the settings from here.

   ![Phantom Wallet Icon](/images/devnet_setting.png)   

3. **Airdrop**

   On the devnet, you can obtain SOL via airdrop.

   While on the mainnet, it's common to purchase SOL with fiat currency, the devnet uses tokens with no value, allowing you to obtain SOL via airdrop.

   You can perform an airdrop by entering your address on the official page below:

   [https://faucet.solana.com/](https://faucet.solana.com/)

   When performing an airdrop, please specify an amount of 2.5 SOL or 5 SOL. This is because, in a later step, you will need to convert 1 SOL to 1 wSOL, and having only 1 SOL will not leave enough to cover the fees.

   Once the airdrop is successful, you will be able to check the airdropped SOL in your wallet.

4. **Conversion to Wrapped SOL**

   The SOL we have referred to so far is Native SOL. Native SOL is used for paying fees for issuing transactions and creating new token-associated accounts.

   On the other hand, when transferring to others or utilizing smart contract services, you will use wrapped SOL (wSOL), which is a tokenized form of SOL.

   Typically, the conversion to wrapped SOL is done by installing the Solana library and using the command line. However, we have prepared a dedicated page for this purpose.

   [Convert SOL to wSOL](/sol2wsol)

   This page is also linked from the top page.

   For those who are not familiar with cryptocurrency, the following steps will likely be your first crypto experience.

   First, click the "Connect" button at the top right to connect your wallet.

   This will allow you to make payments and sign transactions directly from your wallet within the browser.

   One important note: connecting your wallet to an unknown web page and clicking "confirm" without verifying the details can result in your tokens being stolen. Be careful.

   Moving tokens with no value, like in the demo version on the devnet, is not a problem. However, when moving tokens with real value on the mainnet, exercise extreme caution to avoid theft.


   Here, you will be using two buttons: "Convert" and "Close."

   The "Convert" button will convert 1 SOL to 1 wSOL. The amount to be converted is fixed.

   The "Close" button converts wSOL back to SOL. Specifically, it settles the wSOL account, converting all of it back to SOL.

   When you first press the "Convert" button, a screen will appear as shown below. Press "Confirm" to issue a transaction, and SOL will be converted to wSOL.

   ![SOL2WSOL](/images/sol2wsol.png)   

   When you check your wallet, you will see that your SOL has decreased and your wrapped SOL has increased.

   Since this is your first time, let’s also check the transaction log.

   A long string labeled "Transaction Signature" is displayed on the previous page. Please copy this string.

   Transactions on the blockchain can be verified by anyone. By using web services like the ones below, you can enter the Signature you copied earlier to check the details of the transaction.

   [https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)

   The details are omitted here, but it contains the information of the token transaction you just performed.

   You can also convert wSOL to SOL by performing the same steps with the "Close" button.

   Since you will be using wSOL, if you have closed your wSOL account, please use the "Convert" button again to convert to wSOL.

`,
    ja: `
# はじめに

すでにアカウントをお持ちで、devnetでwrappedSOLが用意できる方はこの章を飛ばしてください。

Solanaには、価値があるトークンが流通しているmainnetと、開発者向けの価値がないトークンが流通しているdevnetが存在します。

正式なサービスではmainnetを利用し、現在公開しているデモ版ではdevnetを利用します。また、デモ版はPC利用を想定しており、モバイル利用には未対応です。

1. **ウォレットの用意**

   まず、ブラウザから利用可能なウォレットの準備が必要です。ブラウザの拡張機能からPhantom、もしくはSolflare Walletをインストールしてください。

   ![Phantom Wallet Icon](/images/install_wallet.png)

   拡張機能のインストールが完了すると、ブラウザの右上からウォレットが使えるようになります。

   ウォレットでは、ブロックチェーン上の自分のアカウントのトークン操作を自由に行うことができます。仮想通貨取引所では専用のインターフェースが用意されていますが、ブロックチェーン上のアカウント（オンチェーン）では、このようなウォレットを使い、仮想通貨の取引を行います。
   
   正式なサービスで画像を購入したい場合は、仮想通貨取引所でトークンSOLを購入し、このウォレットのアカウントに送金することで画像の購入を開始することができます。
   
   また、画像を販売して得られた収益を法定通貨（米ドル、日本円）に換金したい場合は、ウォレットから仮想通貨取引所に送金を行い、法定通貨と交換を行います。
   
2. **devnet設定**

   デモ版ではdevnetを使うため、最初にウォレットのdevnet設定を行います。

   Phantomを使用している場合は、メニューの一番下にある歯車マークの「Settings」から「Developer Settings」を開き、「Testnet Mode」に切り替えるボタンがあります。ここから設定を変更できます。

   ![Phantom Wallet Icon](/images/devnet_setting.png)   

3. **Airdrop**

   devnetでは、airdropでSOLを入手することができます。

   mainnetでは、法定通貨でSOLを購入するのが一般的ですが、devnetは価値がないトークンが流通しているため、airdropにより、SOLを入手することが可能です。

   以下の公式ページに自分のアドレスを入力することで、airdropを行うことができます。

   [https://faucet.solana.com/](https://faucet.solana.com/)

   airdropを行う際は、2.5SOLまたは5SOLを指定してください。後の手順で1SOLを1wSOLに変換するため、1SOLだけでは手数料が支払えなくなってしまいます。

   airdropが成功すれば、あなたのウォレットからairdropされたSOLが確認できます。

4. **Airdrop**

   ここまでSOLと呼んでいたものはNative SOLになります。Native SOLは、トランザクションを発行するための手数料を支払ったり、新たにトークンに紐づいたアカウントを作成する際の手数料を支払ったりできます。

   一方で、他の人に送金をしたり、スマートコントラクトのサービスを利用する際は、SOLがトークン化されたものであるwrapped SOL(wSOL)を使います。

   wrapped SOLへの変換は、通常Solanaのライブラリをインストールしてコマンドラインから変換を行うのですが、今回は下記の専用ページを用意しました。

   [Convert SOL to wSOL](/sol2wsol)　

   このページは、トップページにもリンクが貼ってあります。

   仮想通貨に馴染みがない方は、これから行う操作が初めてのクリプト体験となるでしょう。

   まず、右上のConnectボタンを押して、ウォレットを接続してください。

   これにより、ブラウザ内でウォレットから支払いを行なったり、署名を行ったりすることができるようになります。

   ここで一つ注意点ですが、知らないwebページにウォレットを接続し、内容を確認せずconfirmを押すことはトークンを盗まれる可能性があるので気をつけてください。

   デモ版のようにdevnetで価値がないトークンを移動させる分には問題はありませんが、mainnetで価値があるトークンを移動させるときは、盗まれないように細心の注意を払ってください。

   ここでは、ConvertとCloseという２つのボタンを操作します。

   Convertの方は、1SOLを1wSOLに変換します。変換する金額は固定になります。

   Closeの方は、wSOLをSOLに変換します。正確にはwSOLのアカウントを精算することで、全てSOLに変換します。

   最初にConvertボタンを押すと下記のような画面が表示され、Confirmを押すとトランザクションが発行され、SOLがwSOLに変換されます。

   ![SOL2WSOL](/images/sol2wsol.png)   

   ウォレットを確認するとSOLが減り、wrapped SOLが増えていることがわかると思います。

   最初なのでトランザクションログの確認もしてみましょう。

   先ほどのページにTranasction Signatureという長い文字列が表示されているので、これをコピーしてください。

   ブロックチェーン上の取引は誰でもその内容を確認をすることができます。下記のようなwebサービスが公開されており、ここに先ほどのSignatureを入力することで、その取引内容を確認することができます。

   [https://explorer.solana.com/?cluster=devnet](https://explorer.solana.com/?cluster=devnet)

   中身は省略しますが、先ほど行ったトークン取引の内容が記載されています。

   また、Closeボタンについても同様に操作をすることでwSOLをSOLに変換することができます。

   これからwSOLを使うので、一度wSOLのアカウントをクローズした方はConvertボタンから再度wSOLへの変換をお願いします。

`
};

const GettingStarted = ({ language, sidebarOpen }) => {
    return <Content markdown={markdownContent[language]} sidebarOpen={sidebarOpen} />;
};

export default GettingStarted;