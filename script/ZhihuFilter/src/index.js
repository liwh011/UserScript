// ==UserScript==
// @name         知乎关键词屏蔽问题
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  按照关键词或者正则，在知乎首页屏蔽对应的问题
// @author       liwh011
// @match        https://www.zhihu.com/
// @icon         https://static.zhihu.com/heifetz/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addElement
// @grant        GM_setClipboard
// @updateURL    https://github.com/liwh011/UserScript/raw/master/script/%E7%9F%A5%E4%B9%8E%E6%8C%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%B1%8F%E8%94%BD%E9%97%AE%E9%A2%98.user.js
// ==/UserScript==

import { initVue } from "./vueApp/index";
import { ListItem, Question } from './question'
import config from './config'
import { findBanWord } from "./util";
import {
    BlockerFactory,
} from "./questionBlocker";

function main() {
    'use strict';
    const questionContainerDom = document.getElementsByClassName('Topstory-recommend')[0].firstChild
    let processedDomCount = 0 // 处理过的dom的数目
    const checkAllQuestion = () => {
        /**
         * @type Question[]
         */
        const questions = Array.from(questionContainerDom.childNodes)
            .slice(processedDomCount)
            .filter(d => !d.classList.contains('TopstoryItem--advertCard') && d.classList.contains('TopstoryItem-isRecommend'))
            .map(v => { try { return ListItem.from(v) } catch (e) { console.log(e); return null } })

        questions.forEach(question => {
            if (!question) return
            if (question.hidden || question.recovered) return

            const bannedWord = findBanWord(question.title)
            if (!bannedWord) return

            BlockerFactory.getBlocker(question).block()
        })

        processedDomCount += questions.length
    }


    let alreadyRunning = false
    document.onscroll = () => alreadyRunning ? null : new Promise((resolve, reject) => {
        alreadyRunning = true;
        checkAllQuestion();
        setTimeout(() => { alreadyRunning = false; }, 500)
        resolve()
    })
    document.onscroll() // 首次运行调用一次
}

// 加载VUEJS
GM_addElement('script', {
    src: 'https://unpkg.com/vue@next',
    type: 'text/javascript'
});

GM_addElement('script', {
    src: 'https://unpkg.com/element-plus',
    type: 'text/javascript'
});

GM_addElement('link', {
    href: 'https://unpkg.com/element-plus/dist/index.css',
    rel: 'stylesheet'
});


// 需要等JS加载完才能调用VUE
const timerID = setInterval(() => {
    if ('undefined' == typeof Vue || 'undefined' == typeof ElementPlus)
        return
    initVue()
    main()
    clearInterval(timerID)
}, 50);
