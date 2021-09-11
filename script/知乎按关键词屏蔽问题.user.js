// ==UserScript==
// @name         知乎关键词屏蔽问题
// @namespace    http://tampermonkey.net/
// @version      1.0.2
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


//==============================
//==============================
//============默认配置===========
//==============================

// 在这里增加屏蔽词，支持正则（以/开头/结尾的字符串）
let 屏蔽词列表 = [
    '屏蔽词示例',
    '一般屏蔽词：',
    '彩礼',
    '结婚',
    '正则屏蔽词：',
    '/(中国[男女]性|[国锅蝈][男蝻女])/',
    '/女[权拳]/',
    '/普通?[却且]?自?信/',
].reverse()
// 即给该问题点不感兴趣，以达到让知乎的推荐机制减少推荐相关内容的目的。
let 是否设置不感兴趣 = true
// 点击不感兴趣后会出现一系列tag
let 是否设置不感兴趣TAG = true
// 当屏蔽后，是否在该问题的原地方显示“该问题已被屏蔽，点击可以恢复”的提示，点击可以还原并查看。
let 是否显示已被屏蔽条目 = true


//==============================
//==============================
//==============================

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



const hideDom = dom => { dom.style.display = 'none' }
const showDom = dom => { dom.style.display = 'block' }
const attachHiddenClass = dom => { dom.classList.add('bannedByUser') }
const attachShownClass = dom => { dom.classList.remove('bannedByUser'); dom.classList.add('recoveredByUser') }


const isRegexLike = str => str.startsWith('/') && str.endsWith('/')


class Question {
    constructor(dom) {
        this.dom = dom
        this.title = this.getTitle(dom)
        this.answer = this.getAnswer(dom)
        this.author = this.getAuthor(dom)
        this.likeCount = this.getLikeCount(dom)
        this.commentCount = this.getCommentCount(dom)

        this.hidden = this.isHidden(dom)
        this.recovered = this.isShown(dom)

        this.uninterestedTags = []
    }

    // 获取问题的标题
    getTitle(dom) {
        return dom.getElementsByClassName('ContentItem-title')[0]?.innerText
    }

    getAnswer(dom) {
        const t = dom.getElementsByClassName('RichText ztext CopyrightRichText-richText css-hnrfcf')[0]?.innerText
        const matchRes = t.match(/(.*?)：(.*)/)
        return matchRes ? matchRes[2] : ''
    }

    getAuthor(dom) {
        const t = dom.getElementsByClassName('RichText ztext CopyrightRichText-richText css-hnrfcf')[0]?.innerText
        const matchRes = t.match(/(.*?)：(.*)/)
        return matchRes ? matchRes[1] : ''
    }

    getLikeCount(dom) {
        const t = dom.getElementsByClassName('Button VoteButton VoteButton--up')[0]?.innerText
        const matchRes = t.match(/赞同 ([0-9]*)( 万)?/) || [0, 0]
        return matchRes[2] ? Number(matchRes[1]) * 10000 : Number(matchRes[1])
    }

    getCommentCount(dom) {
        const t = findChildDom(dom, d => d.type === 'button' && d.innerText.includes('评论'))?.innerText || ''
        if (t.match(/添加评论/)) return 0
        return Number(t.match(/([0-9]*) 条评论/)[1])
    }

    // 是否因为包含屏蔽词被隐藏了
    isHidden(dom) { return dom.classList.contains('banedByUser') }
    // 是否被用户手动恢复了
    isShown(dom) { return dom.classList.contains('recoveredByUser') }


    removeFromList() {
        hideDom(this.dom)
        attachHiddenClass(this.dom)
    }

    replaceWithHiddenNotice(bannedWord) {
        attachHiddenClass(this.dom) // 添加一个class作为标记，标记这个问题已经被隐藏了
        hideDom(this.dom.firstChild.firstChild)

        // 创建屏蔽成功的提示dom
        let banTipDom = document.createElement('a')
        banTipDom.appendChild(document.createTextNode(`已屏蔽，点击恢复。（关键词：${bannedWord}）`))
        banTipDom.classList.add('Button', 'ContentItem-more', 'Button--plain')
        banTipDom.onclick = () => {
            attachShownClass(this.dom) // 添加一个class作为标记，标记这个dom已经被手动恢复了
            showDom(this.dom.firstChild.firstChild)
            hideDom(banTipDom)
        }
        this.dom.firstChild.appendChild(banTipDom)
    }

    setUninterested() {
        const moreBtn = findChildDom(dom, (c) => c.id?.startsWith('Popover') && c.classList?.contains('OptionsButton'))
        moreBtn.click()
        const id = moreBtn.id.match(/Popover([0-9]*)-toggle/)[1]
        findChildDom(document.getElementById(`Popover${id}-content`),
            c => c.type === 'button' && c.innerText === '不感兴趣')?.click()
    }

    banUninterestedTags() {
        this.uninterestedTags = Array.from(this.dom.getElementsByClassName('Button TopstoryItem-uninterestTag'))
        let f = false
        this.uninterestedTags.forEach(d => {
            if (findBanWord(d.innerText)) {
                d.click()
                f = true
            }
        })
        if (f) {
            this.dom.getElementsByClassName('Button TopstoryItem-actionButton Button--plain')[0]?.click()
        }
    }


}



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
            .map(v => { try { return new Question(v) } catch { return null } })

        questions.forEach(question => {
            if (!question) return
            if (question.hidden || question.recovered) return

            const bannedWord = findBanWord(question.title)
            if (!bannedWord) return

            if (是否设置不感兴趣) {
                question.setUninterested()
                if (是否设置不感兴趣TAG) {
                    question.banUninterestedTags()
                }
                return
            }
            if (是否显示已被屏蔽条目) {
                question.replaceWithHiddenNotice(bannedWord)
            } else {
                question.removeFromList()
            }
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




const initOptionPanel = () => {
    // 添加样式
    let style = document.createElement('style');
    style.innerHTML = `
        .css-9ytsk0 {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            border-bottom: 1px solid;
            border-color: #EBEBEB;
            padding-right: 0;
        }

        .css-17ucl2c {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            padding-top: 20px;
            padding-bottom: 20px;
            padding-left: 18px;
            padding-right: 18px;
            -webkit-align-items: center;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -webkit-box-pack: center;
            -webkit-justify-content: center;
            -ms-flex-pack: center;
            justify-content: center;
            display: -webkit-box;
            display: -webkit-flex;
            display: -ms-flexbox;
            display: flex;
        }

        .css-1pysja1 {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            -webkit-flex: 1;
            -ms-flex: 1;
            flex: 1;
        }

        .css-uuymsm {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            font-size: 24px;
            font-family: inherit;
            font-weight: 600;
            line-height: 1.25;
            font-family: inherit;
            line-height: 1.25;
            font-weight: 600;
            font-size: 15px;
            line-height: 1.4;
        }

        .css-9z9vmi {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            margin-top: 5px;
            color: #8590A6;
            font-size: 14px;
        }

        .css-fyakhq {
            box-sizing: border-box;
            margin: 0;
            min-width: 0;
            margin-left: 20px;
            font-size: 14px;
        }

        .css-1v994a0 {
            margin-right: 6px;
        }

        .tag-margin {
            margin-right: 0px;
            margin-bottom: 8px;
        }
`;
    document.getElementsByTagName('HEAD').item(0).appendChild(style)


    // 添加设置面板
    const optionPanel = `
    <div id="banapp">


    <div style="position: fixed; top: 60px; right: 0; margin: 16px; z-index: 999; height: auto; width: 50px; padding: 8px 0;"
        class="Button CornerButton Button--plain"
        @click.stop="showPanel"
        v-if="!panelVisible"
    >
        <a style="color: rgb(15, 136, 235); display: flex; flex-direction: column; align-items: center;" type="button" class="Button Button--plain">
            <span class="GlobalSideBar-categoryIcon">
                <svg class="Zi Zi--Edit" fill="currentColor" viewBox="0 0 24 24" width="24" height="24">
                    <path
                        d="M4.076 16.966a4.19 4.19 0 0 1 1.05-1.76l8.568-8.569a.524.524 0 0 1 .741 0l2.928 2.927a.524.524 0 0 1 0 .74l-8.568 8.57c-.49.49-1.096.852-1.761 1.051l-3.528 1.058a.394.394 0 0 1-.49-.488l1.06-3.53zM20.558 4.83c.59.59.59 1.546 0 2.136l-1.693 1.692a.503.503 0 0 1-.712 0l-2.812-2.812a.504.504 0 0 1 0-.712l1.693-1.693a1.51 1.51 0 0 1 2.135 0l1.389 1.389z">
                    </path>
                </svg>
            </span>
            <span class="GlobalSideBar-categoryLabel">屏蔽<br>设置</span>
        </a>
    </div>



    <div v-if="panelVisible"
        id="optionPanel"
        tabindex="-1"
        @click.stop=""
        style="position: fixed; top: 0; right: 0; width: 450px; height: calc(100vh - 48px); margin: 24px;"
        class="Popover-content Popover-content--bottom PushNotifications-menuContainer PushNotifications-menuContainer--old Popover-content--fixed Popover-content--arrowed undefined Popover-content-enter-done container">
        
        <div class="Messages-header" @click.stop="">
            <button
                class="Button Messages-tab Messages-myMessageTab Button--plain"
                style="display: flex; align-items: center; padding: 0 8px;"
                @click="hidePanel"
            >
                <svg width="25px" height="25px" viewBox="0 0 30 30" class="css-1p094v5" fill="none">
                    <g opacity=".5">
                        <g fill="#000" opacity=".8">
                            <path d="M21.397 6.663l1.414 1.414L8.078 22.811l-1.414-1.415z"></path>
                            <path d="M22.815 21.4L21.4 22.814 6.66 8.074l1.414-1.415z"></path>
                        </g>
                    </g>
                </svg>
                <span>隐藏面板</span>
            </button>
        </div>

        <div style="overflow-y: auto; height: calc(100% - 48px);">
            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">在原问题处显示“已屏蔽该问题”提示</div>
                        <div class="css-9z9vmi">掩耳盗铃（仅适用于未开启“设置不感兴趣”）</div>
                    </div>
                    <label class="Switch" :class="{ 'Switch--checked': showBanTip, 'Switch--disabled': setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="showBanTip" :disabled="setUninterested">
                    </label>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">使用“不感兴趣”来屏蔽问题</div>
                        <div class="css-9z9vmi">效果一般，可让推荐系统不推送类似问题</div>
                    </div>
                    <label class="Switch" :class="{ 'Switch--checked': setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="setUninterested">
                    </label>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">“不感兴趣”后按照屏蔽词来提交TAG</div>
                        <div class="css-9z9vmi">效果强力，带有某个TAG的问题都不会被推送了</div>
                    </div>
                    <label class="Switch" :class="{ 'Switch--checked': banUninterestedTag, 'Switch--disabled': !setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="banUninterestedTag" :disabled="!setUninterested">
                    </label>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">添加屏蔽词</div>
                        <div class="css-9z9vmi">支持正则(/reg/)</div>
                    </div>
                    <div style="display: flex;">
                        <label class="SearchBar-input Input-wrapper Input-wrapper--grey">
                            <input type="text" autocomplete="off" class="Input" placeholder="输入屏蔽词或正则" v-model="newWordInput">
                        </label>
                        <button type="button" class="Button SearchBar-askButton Button--primary Button--blue" @click="addWord">保存</button>
                    </div>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">现有屏蔽词</div>
                    </div>
                </div>
                <div style="padding: 0px 16px 16px 16px;">
                    <div v-if="banWordList.length>0">
                        <div
                            class="Tag tag-margin"
                            style="height: auto;"
                            v-for="(word, idx) in (expandBanWords ? Array.from(banWordList).reverse() : Array.from(banWordList).reverse().slice(0,3))"
                            :key="idx"
                        >
                            <div class="Tag-content" style="display: flex; align-items: center;">
                                {{ word }}
                                <svg width="20px" height="20px" viewBox="0 0 30 30" class="css-1p094v5" fill="none" style="margin-left: 4px" @click="removeWord(word)">
                                    <g opacity=".5">
                                        <g fill="#000" opacity=".5">
                                            <path d="M21.397 6.663l1.414 1.414L8.078 22.811l-1.414-1.415z"></path>
                                            <path d="M22.815 21.4L21.4 22.814 6.66 8.074l1.414-1.415z"></path>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                        </div>
                        <button class="Button Button--plain Button--blue SearchBar-askButton"
                            style="margin: 0;"
                            @click="expandBanWords^=1"
                            v-if="banWordList.length>3"
                        >
                            {{ expandBanWords==false ? \`展开 (共\${banWordList.length}个) >\` : '< 收起' }}
                        </button>
                    </div>
                    <div v-else>暂无</div>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">批量添加屏蔽词</div>
                        <div class="css-9z9vmi">每行一个屏蔽词，支持正则(/reg/)</div>
                    </div>
                </div>
                <div style="display: flex; padding: 0 16px 16px 16px; align-items: flex-end;">
                    <label class="SearchBar-input Input-wrapper Input-wrapper--grey" style="height: auto;">
                        <textarea type="text" class="Input" placeholder="输入屏蔽词或正则" style="overflow-y: visible; height: 100px;" v-model="multipleLineNewWordInput"></textarea>
                    </label>
                    <button type="button" class="Button SearchBar-askButton Button--primary Button--blue" style="height: 34px;" @click="multipleLineAddWord">添加</button>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">导出屏蔽词</div>
                        <div class="css-9z9vmi">将所有屏蔽词复制到剪贴板</div>
                    </div>
                    <button class="Button Button--plain Button--blue" @click="exportWordsToClipboard">{{ copySuccess ? '已复制√' : '复制'}}</button>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">删除所有屏蔽词</div>
                        <div class="css-9z9vmi">删除所有屏蔽词</div>
                    </div>
                    <button class="Button Button--plain Button--red" @click="clearWordList">{{ clearAllDoubleConfirm ? '再次点击清空' : '清空'}}</button>
                </div>
            </div>
        </div>

    </div>
    </div>
`;
    const ele = document.createElement('div')
    ele.innerHTML = optionPanel
    document.body.appendChild(ele)
}

const initVue = () => {
    // 挂载VUE
    const app = {
        data() {
            return {
                newWordInput: '',   // 添加新屏蔽词的input
                multipleLineNewWordInput: '',   // 导入屏蔽词的多行input

                panelVisible: false,    // 面板显示隐藏
                expandBanWords: GM_getValue('banWordList', null) === null ? true : false,  // 是否展开所有屏蔽词
                copySuccess: false, // 是否复制成功
                clearAllDoubleConfirm: false,   // 清空全部的二次确认flag

                banWordList: GM_getValue('banWordList', 屏蔽词列表),
                showBanTip: GM_getValue('showBanTip', 是否显示已被屏蔽条目),
                setUninterested: GM_getValue('setUninterested', 是否设置不感兴趣),
                banUninterestedTag: GM_getValue('banUninterestedTag', 是否设置不感兴趣TAG),
            }
        },
        methods: {
            hidePanel() { this.panelVisible = false },
            showPanel() { this.panelVisible = true; },

            addWord() {
                if (!this.newWordInput) return
                if (this.banWordList.includes(this.newWordInput)) {
                    this.newWordInput = ''
                    return
                }
                this.banWordList.push(this.newWordInput)
                this.onBanWordListChange()
                this.newWordInput = ''
            },
            removeWord(word) {
                const idx = this.banWordList.indexOf(word)
                this.banWordList.splice(idx, 1)
                this.onBanWordListChange()
            },
            clearWordList() {
                if (!this.clearAllDoubleConfirm) {
                    this.clearAllDoubleConfirm = true
                    setTimeout(() => {
                        this.clearAllDoubleConfirm = false
                    }, 5000);
                    return
                }
                this.banWordList = []
                this.onBanWordListChange()
                this.clearAllDoubleConfirm = false
            },
            multipleLineAddWord() {
                if (!this.multipleLineNewWordInput) return
                const words = this.multipleLineNewWordInput.split('\n')
                    .map(v => v.trim())
                    .filter(v => !!v && !this.banWordList.includes(v))
                this.banWordList = this.banWordList.concat(words)
                this.onBanWordListChange()
                this.multipleLineNewWordInput = ''
            },

            exportWordsToClipboard() {
                const joinedStr = this.banWordList.join('\n')
                GM_setClipboard(joinedStr)
                this.copySuccess = true
                setTimeout(() => {
                    this.copySuccess = false
                }, 5000)
            },

            onBanWordListChange() {
                GM_setValue('banWordList', this.banWordList)
                屏蔽词列表 = this.banWordList
            }
        },
        watch: {
            showBanTip(v) { GM_setValue('showBanTip', v); 是否显示已被屏蔽条目 = v },
            setUninterested(v) { GM_setValue('setUninterested', v); 是否设置不感兴趣 = v },
            banUninterestedTag(v) { GM_setValue('banUninterestedTag', v); 是否设置不感兴趣TAG = v },
        },
        mounted() {
            document.onclick = this.hidePanel
        }
    }
    Vue.createApp(app).mount('#banapp')
}

// 加载VUEJS
GM_addElement('script', {
    src: 'https://unpkg.com/vue@next',
    type: 'text/javascript'
});

// 需要等JS加载完才能调用VUE
const timerID = setInterval(() => {
    if ('undefined' == typeof Vue)
        return
    initOptionPanel()
    initVue()
    main()
    clearInterval(timerID)
}, 50);
