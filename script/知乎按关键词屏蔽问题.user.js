// ==UserScript==
// @name         知乎关键词屏蔽问题
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  按照关键词或者正则，在知乎首页屏蔽对应的问题
// @author       liwh011
// @match        https://www.zhihu.com/
// @icon         https://static.zhihu.com/heifetz/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 在这里增加屏蔽词，支持正则（以/开头/结尾的字符串）
    const banWords = ['杨笠', '彩礼', '/.*杨笠.*男性.*/']
    

    //==============================
    //==============================
    //==============================

    // 获取问题的标题
    const getTitle = (dom) => {
        return dom.firstChild?.firstChild?.firstChild?.firstChild?.innerText || ''
    }

    // 是否因为包含屏蔽词被隐藏了
    const isHidden = dom => dom.classList.contains('banedByUser')
    // 是否被用户手动恢复了
    const isShown = dom => dom.classList.contains('recoveredByUser')

    const hideDom = dom => { dom.style.display = 'none' }
    const showDom = dom => { dom.style.display = 'block' }
    const attachHiddenClass = dom => { dom.classList.add('banedByUser') }
    const attachShownClass = dom => { dom.classList.remove('banedByUser'); dom.classList.add('recoveredByUser') }


    const isRegexLike = str => str.startsWith('/') && str.endsWith('/')

    // 寻找文本的屏蔽词
    const findBanWord = (text) => {
        for (let i = 0; i < banWords.length; i++) {
            const v = banWords[i]
            if (!v) continue    // 忽略空字串
            const reg = isRegexLike(v) ? eval(v) : eval(`/(${v})/`)
            if (reg.test(text)) {
                return v
            }
        }
        return null
    }

    document.onscroll = () => {
        const questionDoms = Array.from(document.getElementsByClassName('Card TopstoryItem TopstoryItem--old TopstoryItem-isRecommend'), v => v)
        questionDoms.forEach((dom) => {
            const bannedWord = findBanWord(getTitle(dom))
            if (!bannedWord) return
            if (isHidden(dom) || isShown(dom)) return

            attachHiddenClass(dom) // 添加一个class作为标记，标记这个dom已经被隐藏了
            hideDom(dom.firstChild.firstChild)

            // 创建屏蔽成功的提示dom
            let banTipDom = document.createElement('a')
            banTipDom.appendChild(document.createTextNode(`已屏蔽，点击恢复。（关键词：${bannedWord}）`))
            banTipDom.classList.add('Button', 'ContentItem-more', 'Button--plain')
            let dom_ = dom
            banTipDom.onclick = () => {
                attachShownClass(dom_) // 添加一个class作为标记，标记这个dom已经被手动恢复了
                showDom(dom_.firstChild.firstChild)
                hideDom(banTipDom)
            }

            dom.firstChild.appendChild(banTipDom)
        })
    }
})();