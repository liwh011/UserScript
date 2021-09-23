import zSwitch from './components/zSwitch';
import config, { LIST_CHOICE } from '../config'
import zInput from './components/zInput';
import zButton from './components/zButton';
import zTag from './components/zTag';
import zThing from './components/zThing';
import { BAN_MODE } from '../config';

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
                        <el-space wrap v-if="config.banWordList.length>0">
                            <el-tag
                                v-for="(word, idx) in banWordListPreview()"
                                :key="idx"
                                closable
                                @close="removeWord(word)"
                            >
                                {{ word }}
                            </el-tag>
                            <el-button type="text" @click="expandBanWords^=1" v-if="config.banWordList.length>3">
                                {{ expandBanWords==false ? \`展开 (共\${config.banWordList.length}个) >\` : '< 收起' }}
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


        banWordListPreview() {
            if (this.expandBanWords)
                return Array.from(config.banWordList).reverse()
            return Array.from(config.banWordList).reverse().slice(0, 3)
        },
    },
    mounted() {
        document.onclick = this.hidePanel
    },
    computed: {

        banModeOptions() {
            return Array.from(Object.values(BAN_MODE))
        },
        banListUsedByAnswerOptions() {
            return Array.from(Object.values(LIST_CHOICE))
        }
    }
}


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


export const initVue = () => {
    // css
    let style = document.createElement('style');
    style.innerHTML = css
    document.getElementsByTagName('HEAD').item(0).appendChild(style)

    // html
    const ele = document.createElement('div')
    ele.innerHTML = '<div id="banapp"></div>'
    document.body.appendChild(ele)


    const app = Vue.createApp({ ...script, template: html })
    app.component(zSwitch.name, zSwitch.definition)
    app.component(zInput.name, zInput.definition)
    app.component(zButton.name, zButton.definition)
    app.component(zTag.name, zTag.definition)
    app.component(zThing.name, zThing.definition)

    app.use(ElementPlus)
    app.mount('#banapp')
    return app
}