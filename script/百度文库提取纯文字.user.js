// ==UserScript==
// @name         百度文库提取纯文本
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在控制台输出提取出来的文字，仅限文字。
// @author       liwh011
// @match        https://wenku.baidu.com/view/*
// @icon         https://www.google.com/s2/favicons?domain=baidu.com
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 在页面的左上角创建按钮
    var but = document.createElement('button')
    var txt = document.createTextNode('提取文字')
    but.appendChild(txt)
    but.classList.add('extBut')

    // 点击后在console输出所有纯文字
    but.onclick = () => {
        console.log(
            Array.from(document.getElementsByClassName('reader-word-layer'),
                (v) => v.innerText.trim() === '' ? '\n' : v.innerText).join('')
        )
    }


    // 设置一下按钮的样式
    var style = document.createElement('style');
    style.type = 'text/css';
    style.innerHTML = `
.extBut {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 50px;
    height: 50px;
    z-index: 999;
    border-radius: 50%;
    border: 2px solid #55555555;
}`
    
    
    document.getElementsByTagName('HEAD').item(0).appendChild(style)
    document.body.appendChild(but)
})();