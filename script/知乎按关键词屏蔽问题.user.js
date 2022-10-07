// ==UserScript==  
// @name         知乎关键词屏蔽问题  
// @namespace    http://tampermonkey.net/  
// @version      2.0.6  
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

const template$4 = `
    <label class="Switch" :class="{ 'Switch--checked': modelValue, 'Switch--disabled': disabled }">
        <input
            class="Switch-input"
            type="checkbox"
            v-model="value"
            :disabled="disabled"
        >
    </label>
`;

const script$5 = {
    props: [
        'disabled',
        'modelValue'
    ],

    emits: ['update:modelValue'],
    
    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    }
};


var zSwitch = {
    name: 'z-switch',
    definition: { ...script$5, template: template$4 }
};

const BAN_MODE = {
    SHOW: { value: -1, label: '不屏蔽' },
    HIDE: { value: 0, label: '仅隐藏' },
    SHOW_BAN_TIP: { value: 1, label: '替换为“被屏蔽提示”' },
    SET_UNINTERESTED: { value: 2, label: '设置不感兴趣' },
    BAN_TAG: { value: 3, label: '不感兴趣并提交TAG' },
};


const LIST_CHOICE = {
    SAME_AS_TITLE: { value: 0, label: '与标题使用相同屏蔽词' },
    USE_OWN_LIST: { value: 1, label: '使用单独的屏蔽词' },
    USE_BOTH: { value: 2, label: '在标题的基础上扩展' },
};


let defaultConfig = {
    // 在这里增加屏蔽词，支持正则（以/开头/结尾的字符串）
    banWordList: [
        '屏蔽词示例',
        '一般屏蔽词：',
        '彩礼',
        '结婚',
        '正则屏蔽词：',
        '/(中国[男女]性|[国锅蝈][男蝻女])/',
        '/女[权拳]/',
        '/普通?[却且]?自?信/',
    ].reverse(),
    // // 即给该问题点不感兴趣，以达到让知乎的推荐机制减少推荐相关内容的目的。
    // setUninterested: true,
    // // 点击不感兴趣后会出现一系列tag
    // banUninterestedTag: true,
    // // 当屏蔽后，是否在该问题的原地方显示“该问题已被屏蔽，点击可以恢复”的提示，点击可以还原并查看。
    // showBanTip: true,


    hideQuestion: BAN_MODE.SHOW_BAN_TIP.value,
    hideVideo: BAN_MODE.SHOW.value,

    shouldTestAnswer: false,
    whatListShouldBeUsedToTestAnswer: LIST_CHOICE.SAME_AS_TITLE.value,
    answerBanWordList: [],

    hideControversialQuestion: BAN_MODE.SHOW.value,
    controversialQuestionEvaluateOffset: 10,

};


var config = (() => {
    for (let key in defaultConfig) {
        // 读取GM存储的配置，覆盖默认配置
        defaultConfig[key] = GM_getValue(key, defaultConfig[key]);

        if (Array.isArray(defaultConfig[key])) {
            defaultConfig[key] = new Proxy(defaultConfig[key], {
                set(target, idx, value, receiver) {
                    target[idx] = value;
                    GM_setValue(key, defaultConfig[key]);
                    return true
                }
            });
        }
    }

    return new Proxy(defaultConfig, {
        get(target, key) { return target[key] },
        set(target, key, value, receiver) {
            GM_setValue(key, value);
            target[key] = value;
            return true
        }
    })
})();

const template$3 = `
    <label class="SearchBar-input Input-wrapper Input-wrapper--grey">
        <input type="text" autocomplete="off" class="Input" :placeholder="placeholder" v-model="value">
    </label>
`;

const script$4 = {
    props: [
        'disabled',
        'modelValue',
        'placeholder',
    ],

    emits: ['update:modelValue'],

    computed: {
        value: {
            get() {
                return this.modelValue
            },
            set(value) {
                this.$emit('update:modelValue', value);
            }
        }
    }
};


var zInput = {
    name: 'z-input',
    definition: { ...script$4, template: template$3 }
};

const template$2 = `
    <button type="button"
        class="Button SearchBar-askButton"
        :class="{ 'Button--primary': type=='primary', 'Button--plain': type=='text', 'Button--blue': !danger, 'Button--red': danger }"
    >
        <slot/>
    </button>
`;

const script$3 = {
    props: {
        type: {
            default: 'primary'
        },
        danger: {
            type: Boolean,
            default: false
        }
    }
};


var zButton = {
    name: 'z-button',
    definition: { ...script$3, template: template$2 }
};

const template$1 = `
    <div
        class="Tag tag-margin"
        style="height: auto;"
    >
        <div class="Tag-content" style="display: flex; align-items: center;">
            <slot />
            <slot name="extra" />
        </div>
    </div>
`;

const script$2 = {

};


var zTag = {
    name: 'z-tag',
    definition: { ...script$2, template: template$1 }
};

const template = `
    <div class="css-17ucl2c" style="padding: 0;">
        <div class="css-1pysja1">
            <div class="css-uuymsm">{{title}}</div>
            <div class="css-9z9vmi">{{description}}</div>
        </div>
        <slot name="extra" />
    </div>
    <div style="margin-top: 8px;" v-if="$slots.addition">
        <slot name="addition" />
    </div>
`;

const script$1 = {
    props: {
        title: {
            type: String,
            default: ''
        },
        description: {
            type: String,
            default: ''
        },
    }
};


var zThing = {
    name: 'z-thing',
    definition: { ...script$1, template }
};

const html = `



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


    <el-tabs type="border-card"
        @click.stop=""
        v-else
        @tab-click="onTabClick"
        style="position: fixed; top: 0; right: 0; width: 500px; height: calc(100vh - 100px); margin: 24px; margin-top: 76px; z-index: 999; overflow-y: auto;">

        <el-tab-pane label="基本设置">
            <el-divider>问题屏蔽设定</el-divider>
            
            <el-space direction="vertical" alignment="flex-start" :size="32" fill style="width: 100%;">
                <z-thing title="屏蔽方式" description="当标题含有屏蔽词时的处理方式">
                    <template #extra>
                        <el-select v-model="config.hideQuestion" placeholder="请选择">
                            <el-option
                                v-for="item in banModeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </z-thing>

                <z-thing title="是否对回答检查屏蔽词" description="开启后，回答的内容也可能触发屏蔽">
                    <template #extra>
                        <el-switch v-model="config.shouldTestAnswer" />
                    </template>
                </z-thing>

                <z-thing title="回答屏蔽词设定" description="使用什么屏蔽词库来检查回答的内容。默认与标题共用屏蔽词库，你也可以使用独立的词库" v-if="config.shouldTestAnswer">
                    <template #extra>
                        <el-select v-model="config.whatListShouldBeUsedToTestAnswer" placeholder="请选择">
                            <el-option
                                v-for="item in banListUsedByAnswerOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </z-thing>
            </el-space>

            <el-divider>争议回答设定</el-divider>
            <el-space direction="vertical" alignment="flex-start" :size="32" fill style="width: 100%;">
                <el-alert title="争议回答即评论数量高于相同赞数下其他回答的评论数的回答" type="info" />

                <z-thing title="屏蔽方式" description="当评论数高于一定程度时采取的措施">
                    <template #extra>
                        <el-select v-model="config.hideControversialQuestion" placeholder="请选择">
                            <el-option
                                v-for="item in banModeOptions"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            />
                        </el-select>
                    </template>
                </z-thing>

                <z-thing title="阈值偏移" description="调整争议问题的衡量标准，即将期望函数上下平移 (单位：评论数)" v-if="config.hideControversialQuestion!==-1">
                    <template #extra>
                        <el-input-number v-model="config.controversialQuestionEvaluateOffset" :min="-100" :max="200" />
                    </template>
                </z-thing>
            </el-space>

            <el-divider>视频设定</el-divider>

            <z-thing title="屏蔽方式" description="适用于视频回答">
                <template #extra>
                    <el-select v-model="config.hideVideo" placeholder="请选择">
                        <el-option
                            v-for="item in banModeOptions"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                        />
                    </el-select>
                </template>
            </z-thing>
            
        </el-tab-pane>

        <el-tab-pane label="屏蔽词管理">
            <template v-if="config.whatListShouldBeUsedToTestAnswer!==0">
                <el-divider>当前操作词库切换</el-divider>

                <el-radio-group v-model="selectedBanWordList" style="width: 100%;">
                    <el-radio-button :label="0">标题屏蔽词词库</el-radio-button>
                    <el-radio-button :label="1">回答屏蔽词词库</el-radio-button>
                </el-radio-group>
            </template>

            <el-divider>屏蔽词操作</el-divider>

            <el-space direction="vertical" alignment="flex-start" :size="32" fill style="width: 100%;">
                <z-thing title="添加屏蔽词" description="支持正则(/reg/)">
                    <template #addition>
                        <div style="display: flex;">
                            <el-input v-model="newWordInput" placeholder="输入屏蔽词或正则" :rows="3"/>
                            <el-button @click="addWord" type="primary" style="margin-left: 8px;">保存</el-button>
                        </div>
                    </template>
                </z-thing>

                <z-thing title="现有屏蔽词">
                    <template #addition>
                        <el-space wrap v-if="getSelectedBanWordList().length>0">
                            <el-tag
                                v-for="(word, idx) in banWordListPreview()"
                                :key="idx"
                                closable
                                @close="removeWord(word)"
                            >
                                {{ word }}
                            </el-tag>
                            <el-button type="text" @click="expandBanWords^=1" v-if="getSelectedBanWordList().length>3">
                                {{ expandBanWords==false ? \`展开 (共\${getSelectedBanWordList().length}个) >\` : '< 收起' }}
                            </el-button>
                        </el-space>
                        <div v-else>暂无</div>
                    </template>
                </z-thing>
            </el-space>

            <el-divider>批量操作</el-divider>

            <el-space direction="vertical" alignment="flex-start" :size="32" fill style="width: 100%;">
                <z-thing title="批量添加屏蔽词" description="每行一个屏蔽词，支持正则(/reg/)">
                    <template #addition>
                        <div style="display: flex; padding: 0 0px 0px 0px; align-items: flex-end;">
                            <el-input type="textarea" v-model="multipleLineNewWordInput" placeholder="输入屏蔽词或正则" />
                            <el-button @click="multipleLineAddWord" type="primary" style="margin-left: 8px;">添加</el-button>
                        </div>
                    </template>
                </z-thing>

                <z-thing title="导出屏蔽词" description="将所有屏蔽词复制到剪贴板">
                    <template #extra>
                        <z-button @click="exportWordsToClipboard" type="text">{{ copySuccess ? '已复制√' : '复制'}}</z-button>
                    </template>
                </z-thing>

                <z-thing title="删除所有屏蔽词" description="删除所有屏蔽词">
                    <template #extra>
                        <z-button @click="clearWordList" type="text" danger>{{ clearAllDoubleConfirm ? '再次点击清空' : '清空'}}</z-button>
                    </template>
                </z-thing>
            </el-space>
        </el-tab-pane>
    </el-tabs>

`;


const script = {
    data() {
        return {
            newWordInput: '',   // 添加新屏蔽词的input
            multipleLineNewWordInput: '',   // 导入屏蔽词的多行input

            panelVisible: false,    // 面板显示隐藏
            expandBanWords: GM_getValue('banWordList', null) === null ? true : false,  // 是否展开所有屏蔽词
            copySuccess: false, // 是否复制成功
            clearAllDoubleConfirm: false,   // 清空全部的二次确认flag

            selectedBanWordList: 0,

            config,
        }
    },
    methods: {
        hidePanel() { this.panelVisible = false; },
        showPanel() { this.panelVisible = true; },

        onTabClick(tab) {
            if (this.config.whatListShouldBeUsedToTestAnswer === 0) {
                this.selectedBanWordList = 0;
            }
        },

        getSelectedBanWordList() {
            return this.selectedBanWordList === 0 ? this.config.banWordList : this.config.answerBanWordList
        },

        addWord() {
            if (!this.newWordInput) return
            const list = this.getSelectedBanWordList();
            if (list.includes(this.newWordInput)) {
                this.newWordInput = '';
                return
            }
            list.push(this.newWordInput);
            this.newWordInput = '';
        },
        removeWord(word) {
            const list = this.getSelectedBanWordList();
            const idx = list.indexOf(word);
            list.splice(idx, 1);
        },
        clearWordList() {
            if (!this.clearAllDoubleConfirm) {
                this.clearAllDoubleConfirm = true;
                setTimeout(() => {
                    this.clearAllDoubleConfirm = false;
                }, 5000);
                return
            }
            this.getSelectedBanWordList().splice(0);
            this.clearAllDoubleConfirm = false;
        },
        multipleLineAddWord() {
            if (!this.multipleLineNewWordInput) return
            const list = this.getSelectedBanWordList();
            const words = this.multipleLineNewWordInput.split('\n')
                .map(v => v.trim())
                .filter(v => !!v && !list.includes(v));
            list.push(...words);
            this.multipleLineNewWordInput = '';
        },

        exportWordsToClipboard() {
            const list = this.getSelectedBanWordList();
            const joinedStr = list.join('\n');
            GM_setClipboard(joinedStr);
            this.copySuccess = true;
            setTimeout(() => {
                this.copySuccess = false;
            }, 5000);
        },


        banWordListPreview() {
            const list = this.getSelectedBanWordList();
            if (this.expandBanWords)
                return Array.from(list).reverse()
            return Array.from(list).reverse().slice(0, 3)
        },
    },
    mounted() {
        document.onclick = this.hidePanel;
    },
    computed: {

        banModeOptions() {
            return Array.from(Object.values(BAN_MODE))
        },
        banListUsedByAnswerOptions() {
            return Array.from(Object.values(LIST_CHOICE))
        }
    }
};


const css = `
    .css-9ytsk0 {
        box-sizing: border-box;
        margin: 0;
        min-width: 0;
        border-bottom: 1px solid;
        border-color: #EBEBEB;
        /* padding-right: 0; */
        padding: 16px 0;
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


const initVue = () => {
    // css
    let style = document.createElement('style');
    style.innerHTML = css;
    document.getElementsByTagName('HEAD').item(0).appendChild(style);

    // html
    const ele = document.createElement('div');
    ele.innerHTML = '<div id="banapp"></div>';
    document.body.appendChild(ele);


    const app = Vue.createApp({ ...script, template: html });
    app.component(zSwitch.name, zSwitch.definition);
    app.component(zInput.name, zInput.definition);
    app.component(zButton.name, zButton.definition);
    app.component(zTag.name, zTag.definition);
    app.component(zThing.name, zThing.definition);

    app.use(ElementPlus);
    app.mount('#banapp');
    return app
};

// 在后代中寻找符合条件的dom
const findChildDom = (dom, predicate) => {
    let childNodes = Array.from(dom.childNodes, v => v);
    for (let i = 0; i < childNodes.length; i++) {
        if (predicate(childNodes[i]))
            return childNodes[i]
        childNodes = childNodes.concat(Array.from(childNodes[i].childNodes));
    }
    return null
};



const hideDom = dom => { dom.style.display = 'none'; };


const showDom = dom => { dom.style.display = 'block'; };


const attachHiddenClass = dom => { dom.classList.add('bannedByUser'); };


const attachShownClass = dom => { dom.classList.remove('bannedByUser'); dom.classList.add('recoveredByUser'); };


const isRegexLike = str => str.startsWith('/') && str.endsWith('/');


// 寻找文本的屏蔽词
const findBanWord = (text, wordList) => {
    for (let i = 0; i < wordList.length; i++) {
        const v = wordList[i];
        if (!v) continue    // 忽略空字串
        const reg = isRegexLike(v) ? eval(v) : eval(`/(${v})/`);
        if (reg.test(text)) {
            return v
        }
    }
    return null
};

class ListItem {
    /**
     * 
     * @param {HTMLElement} dom 
     */
    static from(dom) {
        if (dom.getElementsByClassName('ZVideoItem-video').length > 0
            || dom.getElementsByClassName('VideoAnswerPlayer').length > 0) {
            return new VideoItem(dom)
        } else if (dom.getElementsByClassName('Pc-feedAd-container').length > 0) {
            return new AdItem(dom)
        } else if (dom.getElementsByClassName('Feed').length > 0) {
            return new Question(dom)
        } else {
            return null
        }
    }

    constructor(dom) {
        if (new.target === ListItem) {
            throw new Error('不能实例化ListItem')
        }

        this.dom = dom;
        this.title = this.getTitle(dom);
        this.answer = this.getAnswer(dom);
        this.author = this.getAuthor(dom);
        this.likeCount = this.getLikeCount(dom);
        this.commentCount = this.getCommentCount(dom);

        this.hidden = this.isHidden(dom);
        this.recovered = this.isShown(dom);

        this.uninterestedTags = [];
    }

    // 获取问题的标题
    getTitle(dom) {
        return dom.getElementsByClassName('ContentItem-title')[0]?.innerText
    }

    getAnswer(dom) {
        const t = dom.querySelector('.RichText.ztext.CopyrightRichText-richText')?.innerText;
        const matchRes = t.match(/(.*?)：(.*)/);
        return matchRes ? matchRes[2] : ''
    }

    getAuthor(dom) {
        const t = dom.querySelector('.RichText.ztext.CopyrightRichText-richText')?.innerText;
        const matchRes = t.match(/(.*?)：(.*)/);
        return matchRes ? matchRes[1] : ''
    }

    getLikeCount(dom) {
        const t = dom.getElementsByClassName('Button VoteButton VoteButton--up')[0]?.innerText;
        const matchRes = t.match(/赞同 ([0-9.,]*)( 万)?/) || ['0', '0'];
        return matchRes[2] ? Number(matchRes[1]) * 10000 : Number(matchRes[1].replace(',', ''))
    }

    getCommentCount(dom) {
        const t = findChildDom(dom, d => d.type === 'button' && d.innerText.includes('评论'))?.innerText || '';
        if (t.match(/添加评论/)) return 0
        return Number(t.match(/([0-9]*) 条评论/)[1])
    }

    // 是否因为包含屏蔽词被隐藏了
    isHidden(dom) { return dom.classList.contains('banedByUser') }
    // 是否被用户手动恢复了
    isShown(dom) { return dom.classList.contains('recoveredByUser') }

}


class Question extends ListItem {
    constructor(dom) {
        super(dom);
    }
}


class VideoItem extends ListItem {
    constructor(dom) {
        super(dom);
    }
}

class AdItem extends ListItem {
    constructor(dom) {
        super(dom);
    }
}

class BlockerFactory {
    /**
     * 
     * @param {Question} question 
     * @returns {Blocker}
     */
    static getBlocker(question, banMode) {
        /**
         * @type Map<number, typeof Blocker>
         */
        const map = new Map([
            [BAN_MODE.SHOW.value, DoNothingBlocker],
            [BAN_MODE.HIDE.value, RemoveFromListBlocker],
            [BAN_MODE.SHOW_BAN_TIP.value, ReplaceWithHiddenNoticeBlocker],
            [BAN_MODE.SET_UNINTERESTED.value, SetUninterestedBlocker],
            [BAN_MODE.BAN_TAG.value, BanUninterestedTagBlocker],
        ]);

        return new (map.get(banMode))(question)
    }
    
}


class Blocker {
    /**
     * @param {Question} question
     */
    constructor() { }
    block() { }
}


/**
 * 啥也不干
 */
class DoNothingBlocker extends Blocker {
    constructor(question) {
        super();
    }
    block() {
        // do nothing
    }
}

/**
 * 直接讲整个问题从列表中隐藏
 */
class RemoveFromListBlocker extends Blocker {
    constructor(question) {
        super();
        this.question = question;
    }
    block() {
        hideDom(this.question.dom);
        attachHiddenClass(this.question.dom);
    }
}


/**
 * 将问题从列表中隐藏，但在问题的原位置插入一条“已屏蔽”提示，点击提示可以再次显示该问题
 */
class ReplaceWithHiddenNoticeBlocker extends Blocker {
    constructor(question, violatedWord) {
        super();
        this.question = question;
    }
    block(reason) {
        attachHiddenClass(this.question.dom); // 添加一个class作为标记，标记这个问题已经被隐藏了
        hideDom(this.question.dom.firstChild.firstChild);

        // 创建屏蔽成功的提示dom
        let banTipDom = document.createElement('a');
        banTipDom.appendChild(document.createTextNode(`已屏蔽，点击恢复。（${reason}）`));
        banTipDom.classList.add('Button', 'ContentItem-more', 'Button--plain');
        banTipDom.onclick = () => {
            attachShownClass(this.question.dom); // 添加一个class作为标记，标记这个dom已经被手动恢复了
            showDom(this.question.dom.firstChild.firstChild);
            hideDom(banTipDom);
        };
        this.question.dom.firstChild.appendChild(banTipDom);
    }
}


/**
 * 将该问题设为不感兴趣，通过影响推荐系统，以达到多端屏蔽的目的
 */
class SetUninterestedBlocker extends Blocker {
    constructor(question) {
        super();
        this.question = question;
    }
    block() {
        // 点击更多按钮，弹出浮动菜单
        const moreBtn = findChildDom(this.question.dom,
            (c) => c.id?.startsWith('Popover') && c.classList?.contains('OptionsButton'));
        moreBtn.click();

        const id = moreBtn.id.match(/Popover([0-9]*)-toggle/)[1];
        findChildDom(document.getElementById(`Popover${id}-content`),
            c => c.type === 'button' && c.innerText === '不感兴趣')?.click();
    }
}


/**
 * 将问题设置为不感兴趣后，对显示的TAG进行检查，如果存在TAG违反了屏蔽词，则将TAG提交。
 */
class BanUninterestedTagBlocker extends Blocker {
    constructor(question) {
        super();
        this.question = question;
    }
    block() {
        // 需要先设置不感兴趣才会出现TAG
        new SetUninterestedBlocker(this.question).block();

        const uninterestedTags = Array.from(this.question.dom.getElementsByClassName('Button TopstoryItem-uninterestTag'));
        let f = false;
        uninterestedTags.forEach(d => {
            if (findBanWord(d.innerText, config.banWordList)) {
                d.click();
                f = true;
            }
        });
        if (f) {
            this.question.dom.getElementsByClassName('Button TopstoryItem-actionButton Button--plain')[0]?.click();
        }
    }
}

class RuleFactory {
    static getRules(question) {
        const ruleSet = new RuleFilterSet();

        ruleSet.add(new AdFilter());

        // 视频
        if (config.hideVideo !== BAN_MODE.SHOW.value) {
            ruleSet.add(new VideoFilter());
        }

        // 普通问题
        if (config.hideQuestion !== BAN_MODE.SHOW.value) {
            // 标题屏蔽词检查
            ruleSet.add(new WordListFilter_Title(config.banWordList));

            // 回答屏蔽词检查
            if (config.shouldTestAnswer) {
                let wordList = [];
                switch (config.whatListShouldBeUsedToTestAnswer) {
                    case LIST_CHOICE.SAME_AS_TITLE.value:
                        wordList = config.banWordList;
                        break;
                    case LIST_CHOICE.USE_OWN_LIST.value:
                        wordList = config.answerBanWordList;
                        break;
                    case LIST_CHOICE.USE_BOTH.value:
                        wordList = config.answerBanWordList.concat(config.banWordList);
                        break;
                }
                ruleSet.add(new WordListFilter_Answer(wordList));
            }
        }
        
        // 争议问题检查
        if (config.hideControversialQuestion !== BAN_MODE.SHOW.value) {
            ruleSet.add(new LikeCommentRatioFilter(config.controversialQuestionEvaluateOffset));
        }
        return ruleSet
    }
}


/**
 * 规则集，所有规则resolve才可放行
 */
class RuleFilterSet {
    constructor() {
        /**
         * @type RuleFilter[]
         */
        this.set = Array.from(arguments).filter(v => v instanceof RuleFilter);
    }

    /**
     * 与上一个规则
     * @param {RuleFilter} filter 
     */
    add(filter) {
        this.set.push(filter);
    }

    /**
     * 看看问题是否满足所有规则
     * @param {ListItem} question 
     * @returns {Promise<string|null>}
     */
    apply(question) {
        return Promise.all(Array.from(this.set, v => v.isValid(question)))
    }
}


const genValidateResult = (reason, banMode = -1) => {
    return {
        reason,
        banMode
    }
};


/**
 * abstract base class
 */
class RuleFilter {
    constructor() { }
    /**
     * 测试该问题是否遵从本规则的限制
     * @param {ListItem} question 
     * @returns {Promise}
     */
    isValid(question) { }
}


/**
 * 标题中的屏蔽词
 */
class WordListFilter_Title extends RuleFilter {
    constructor(wordList) {
        super();
        this.wordList = wordList;
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const res = findBanWord(question.title, this.wordList);
            if (res === null) return resolve()
            return reject(genValidateResult(`标题中含有${res}`, config.hideQuestion))
        })
    }
}


/**
 * 回答中的屏蔽词
 */
class WordListFilter_Answer extends RuleFilter {
    constructor(wordList) {
        super();
        this.wordList = wordList;
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const res = findBanWord(question.answer, this.wordList);
            if (res === null) return resolve()
            return reject(genValidateResult(`回答中含有${res}`, config.hideQuestion))
        })
    }
}

/**
 * 赞评比、争议问题
 */
class LikeCommentRatioFilter extends RuleFilter {
    constructor(offset = 0) {
        super();
        this.offset = offset;
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const expect = this.expectCommentCount(question.likeCount);
            if (question.commentCount > expect)
                return reject(genValidateResult(`赞评比不符合要求 ${question.likeCount}:${question.commentCount} 期望${expect.toFixed(0)}`, config.hideControversialQuestion))
            return resolve()
        })
    }

    expectCommentCount(likeCount) {
        return 4.3724 * likeCount ** 0.4992 + this.offset
    }
}

/**
 * 视频
 */
class VideoFilter extends RuleFilter {
    constructor() {
        super();
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            if (question instanceof VideoItem)
                return reject(genValidateResult(`视频`, config.hideVideo))
            return resolve()
        })
    }
}

/**
 * 广告
 */
class AdFilter extends RuleFilter {
    constructor() {
        super();
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            if (question instanceof AdItem)
                return reject(genValidateResult(`广告`, BAN_MODE.HIDE.value))
            return resolve()
        })
    }
}

// ==UserScript==



function main() {
    const questionContainerDom = document.getElementsByClassName('Topstory-recommend')[0].firstChild;
    let processedDomCount = 0; // 处理过的dom的数目
    const checkAllQuestion = () => {
        /**
         * @type Array<ListItem|null>
         */
        const questions = Array.from(questionContainerDom.childNodes)
            .slice(processedDomCount)
            .filter(d => d.classList.contains('TopstoryItem-isRecommend'))
            .map(v => { try { return ListItem.from(v) } catch (e) { console.log(e); return null } });

        questions.forEach(question => {
            if (!question) return
            if (question.hidden || question.recovered) return

            const rules = RuleFactory.getRules(question);
            rules.apply(question).catch((err) => {
                console.error(err);
                const { reason, banMode } = err;
                BlockerFactory.getBlocker(question, banMode).block(reason);
            });
        });

        processedDomCount += questions.length;
    };


    let alreadyRunning = false;
    document.onscroll = () => alreadyRunning ? null : new Promise((resolve, reject) => {
        alreadyRunning = true;
        checkAllQuestion();
        setTimeout(() => { alreadyRunning = false; }, 500);
        resolve();
    });
    document.onscroll(); // 首次运行调用一次
}

// 加载VUEJS
GM_addElement('script', {
    src: 'https://unpkg.com/vue@next',
    type: 'text/javascript'
});

setTimeout(() => {
    GM_addElement('script', {
        src: 'https://unpkg.com/element-plus',
        type: 'text/javascript'
    });
}, 1000);

GM_addElement('link', {
    href: 'https://unpkg.com/element-plus/dist/index.css',
    rel: 'stylesheet'
});


// 需要等JS加载完才能调用VUE
const timerID = setInterval(() => {
    if ('undefined' == typeof Vue || 'undefined' == typeof ElementPlus)
        return
    initVue();
    main();
    clearInterval(timerID);
}, 50);
