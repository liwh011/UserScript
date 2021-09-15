import config from './config'

const html = `
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
                    <label class="Switch" :class="{ 'Switch--checked': config.showBanTip, 'Switch--disabled': config.setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="config.showBanTip" :disabled="config.setUninterested">
                    </label>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">使用“不感兴趣”来屏蔽问题</div>
                        <div class="css-9z9vmi">效果一般，可让推荐系统不推送类似问题</div>
                    </div>
                    <label class="Switch" :class="{ 'Switch--checked': config.setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="config.setUninterested">
                    </label>
                </div>
            </div>

            <div class="css-9ytsk0">
                <div class="css-17ucl2c">
                    <div class="css-1pysja1">
                        <div class="css-uuymsm">“不感兴趣”后按照屏蔽词来提交TAG</div>
                        <div class="css-9z9vmi">效果强力，带有某个TAG的问题都不会被推送了</div>
                    </div>
                    <label class="Switch" :class="{ 'Switch--checked': config.banUninterestedTag, 'Switch--disabled': !config.setUninterested }">
                        <input class="Switch-input" type="checkbox" v-model="config.banUninterestedTag" :disabled="!config.setUninterested">
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
                    <div v-if="config.banWordList.length>0">
                        <div
                            class="Tag tag-margin"
                            style="height: auto;"
                            v-for="(word, idx) in (expandBanWords ? Array.from(config.banWordList).reverse() : Array.from(config.banWordList).reverse().slice(0,3))"
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
                            v-if="config.banWordList.length>3"
                        >
                            {{ expandBanWords==false ? \`展开 (共\${config.banWordList.length}个) >\` : '< 收起' }}
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


const script = {
    data() {
        return {
            newWordInput: '',   // 添加新屏蔽词的input
            multipleLineNewWordInput: '',   // 导入屏蔽词的多行input

            panelVisible: false,    // 面板显示隐藏
            expandBanWords: GM_getValue('banWordList', null) === null ? true : false,  // 是否展开所有屏蔽词
            copySuccess: false, // 是否复制成功
            clearAllDoubleConfirm: false,   // 清空全部的二次确认flag

            config,
        }
    },
    methods: {
        hidePanel() { this.panelVisible = false },
        showPanel() { this.panelVisible = true; },

        addWord() {
            if (!this.newWordInput) return
            if (this.config.banWordList.includes(this.newWordInput)) {
                this.newWordInput = ''
                return
            }
            this.config.banWordList.push(this.newWordInput)
            this.newWordInput = ''
        },
        removeWord(word) {
            const idx = this.config.banWordList.indexOf(word)
            this.config.banWordList.splice(idx, 1)
        },
        clearWordList() {
            if (!this.clearAllDoubleConfirm) {
                this.clearAllDoubleConfirm = true
                setTimeout(() => {
                    this.clearAllDoubleConfirm = false
                }, 5000);
                return
            }
            this.config.banWordList = []
            this.clearAllDoubleConfirm = false
        },
        multipleLineAddWord() {
            if (!this.multipleLineNewWordInput) return
            const words = this.multipleLineNewWordInput.split('\n')
                .map(v => v.trim())
                .filter(v => !!v && !this.config.banWordList.includes(v))
            this.config.banWordList = this.config.banWordList.concat(words)
            this.multipleLineNewWordInput = ''
        },

        exportWordsToClipboard() {
            const joinedStr = this.config.banWordList.join('\n')
            GM_setClipboard(joinedStr)
            this.copySuccess = true
            setTimeout(() => {
                this.copySuccess = false
            }, 5000)
        },
    },
    mounted() {
        document.onclick = this.hidePanel
    }
}


const css = `
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


export const initVue = () => {
    // css
    let style = document.createElement('style');
    style.innerHTML = css
    document.getElementsByTagName('HEAD').item(0).appendChild(style)

    // html
    const ele = document.createElement('div')
    ele.innerHTML = html
    document.body.appendChild(ele)


    const app = Vue.createApp(script)
    app.mount('#banapp')
    return app
}