// ==UserScript==
// @name         知乎关键词屏蔽问题
// @namespace    http://tampermonkey.net/
// @version      0.1.1
// @description  按照关键词或者正则，在知乎首页屏蔽对应的问题
// @author       liwh011
// @match        https://www.zhihu.com/
// @icon         https://static.zhihu.com/heifetz/favicon.ico
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    //==============================
    //==============================
    //==============================

    // 在这里增加屏蔽词，支持正则（以/开头/结尾的字符串）
    const 屏蔽词列表 = ['杨笠', '彩礼', '/普通?[却且]?自?信/', '/(性别|男女)对立/']
    // 即给该问题点不感兴趣，以达到让知乎的推荐机制减少推荐相关内容的目的。
    const 是否设置不感兴趣 = false
    // 当屏蔽后，是否在该问题的原地方显示“该问题已被屏蔽，点击可以恢复”的提示，点击可以还原并查看。
    const 是否显示已被屏蔽条目 = true


    //==============================
    //==============================
    //==============================

    // 获取问题的标题
    const getTitle = (dom) => {
        return dom.firstChild?.firstChild?.firstChild?.firstChild?.innerText || ''
    }

    // 在后代中寻找符合条件的dom
    const findChildDom = (dom, predicate) => {
        let childNodes = Array.from(dom.childNodes, v => v)
        for (let i = 0; i < childNodes.length; i++) {
            if (predicate(childNodes[i]))
                return childNodes[i]
            childNodes = childNodes.concat(Array.from(childNodes[i].childNodes))
        }
        return null
    }

    // 获取三个点的更多按钮
    const getMoreButton = (dom) => {
        return findChildDom(dom, (c) => c.id?.startsWith('Popover') && c.classList?.contains('OptionsButton'))
    }

    // 是否因为包含屏蔽词被隐藏了
    const isHidden = dom => dom.classList.contains('banedByUser')
    // 是否被用户手动恢复了
    const isShown = dom => dom.classList.contains('recoveredByUser')

    const hideDom = dom => { dom.style.display = 'none' }
    const showDom = dom => { dom.style.display = 'block' }
    const attachHiddenClass = dom => { dom.classList.add('bannedByUser') }
    const attachShownClass = dom => { dom.classList.remove('bannedByUser'); dom.classList.add('recoveredByUser') }


    const isRegexLike = str => str.startsWith('/') && str.endsWith('/')

    // 寻找文本的屏蔽词
    const findBanWord = (text) => {
        for (let i = 0; i < 屏蔽词列表.length; i++) {
            const v = 屏蔽词列表[i]
            if (!v) continue    // 忽略空字串
            const reg = isRegexLike(v) ? eval(v) : eval(`/(${v})/`)
            if (reg.test(text)) {
                return v
            }
        }
        return null
    }

    document.onscroll = () => {
        const questionDoms = Array.from(document.getElementsByClassName('Card TopstoryItem TopstoryItem--old TopstoryItem-isRecommend'))
        questionDoms.forEach((dom) => {
            if (isHidden(dom) || isShown(dom)) return

            const bannedWord = findBanWord(getTitle(dom))
            if (!bannedWord) return

            if (是否设置不感兴趣) {
                let button = getMoreButton(dom)
                if (button) {
                    button.click()
                    const id = button.id.match(/Popover([0-9]*)-toggle/)[1]
                    findChildDom(document.getElementById(`Popover${id}-content`),
                        c => c.type === 'button' && c.innerText === '不感兴趣')?.click()
                }
                return
            }


            if (是否显示已被屏蔽条目) {
                attachHiddenClass(dom) // 添加一个class作为标记，标记这个问题已经被隐藏了
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
            }
            else {
                attachHiddenClass(dom) // 添加一个class作为标记，标记这个问题已经被隐藏了
                hideDom(dom)
            }
        })
    }
})();