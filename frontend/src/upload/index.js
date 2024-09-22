import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// デバッグ用の要素を作成
const debugElement = document.createElement('div');
debugElement.style.position = 'fixed';
debugElement.style.bottom = '0';
debugElement.style.left = '0';
debugElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
debugElement.style.color = 'white';
debugElement.style.padding = '10px';
debugElement.style.maxHeight = '200px';
debugElement.style.width = '100%'; // 横幅を画面全体に合わせる
debugElement.style.overflowY = 'scroll';
debugElement.style.zIndex = '1000';
document.body.appendChild(debugElement);

// デバッグメッセージを表示する関数
function logMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  debugElement.appendChild(messageElement);
}

// 使用例：変数の状態を表示
const 変数名 = { example: 'This is a debug message' }; // 例として変数を定義
logMessage('デバッグ情報: ' + JSON.stringify(変数名)); // 変数の状態を表示