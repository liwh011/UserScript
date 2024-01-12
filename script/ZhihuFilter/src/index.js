import { initVue } from "./vueApp/index";
import { ListItem, Question } from './question'
import config from './config'
import { findBanWord } from "./util";
import {
    BlockerFactory,
} from "./questionBlocker";
import { RuleFactory } from "./ruleFilter";



function main() {
    'use strict';
    const questionContainerDom = document.getElementsByClassName('Topstory-recommend')[0].firstChild
    let processedDomCount = 0 // 处理过的dom的数目
    const checkAllQuestion = () => {
        /**
         * @type Array<ListItem|null>
         */
        const questions = Array.from(questionContainerDom.childNodes)
            .slice(processedDomCount)
            .filter(d => d.classList.contains('TopstoryItem-isRecommend'))
            .map(v => { 
                try { 
                    return ListItem.from(v) 
                } catch (e) { 
                    console.log(e); 
                    return null 
                } 
            })

        questions.forEach(question => {
            if (!question) return
            if (question.hidden || question.recovered) return

            const rules = RuleFactory.getRules(question)
            rules.apply(question).catch((err) => {
                console.error(err)
                const { reason, banMode } = err
                BlockerFactory.getBlocker(question, banMode).block(reason)
            })
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
    src: 'https://unpkg.zhimg.com/vue@next',
    type: 'text/javascript'
});

setTimeout(() => {
    GM_addElement('script', {
        src: 'https://npm.elemecdn.com/element-plus',
        type: 'text/javascript'
    });
}, 1000);

GM_addElement('link', {
    href: 'https://npm.elemecdn.com/element-plus/dist/index.css',
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
