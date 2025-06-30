import { AdItem, Question, VideoItem } from "./question";
import { showDom, hideDom, attachHiddenClass, attachShownClass, findChildDom, findBanWord } from "./util";
import config, { BAN_MODE } from "./config";

export class BlockerFactory {
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
        ])

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
export class DoNothingBlocker extends Blocker {
    constructor(question) {
        super()
    }
    block() {
        // do nothing
    }
}

/**
 * 直接讲整个问题从列表中隐藏
 */
export class RemoveFromListBlocker extends Blocker {
    constructor(question) {
        super()
        this.question = question
    }
    block() {
        hideDom(this.question.dom)
        attachHiddenClass(this.question.dom)
    }
}


/**
 * 将问题从列表中隐藏，但在问题的原位置插入一条“已屏蔽”提示，点击提示可以再次显示该问题
 */
export class ReplaceWithHiddenNoticeBlocker extends Blocker {
    constructor(question, violatedWord) {
        super()
        this.question = question
    }
    block(reason) {
        attachHiddenClass(this.question.dom) // 添加一个class作为标记，标记这个问题已经被隐藏了
        hideDom(this.question.dom.firstChild.firstChild)

        // 创建屏蔽成功的提示dom
        let banTipDom = document.createElement('a')
        banTipDom.appendChild(document.createTextNode(`已屏蔽，点击恢复。（${reason}）`))
        banTipDom.classList.add('Button', 'ContentItem-more', 'Button--plain')
        banTipDom.onclick = () => {
            attachShownClass(this.question.dom) // 添加一个class作为标记，标记这个dom已经被手动恢复了
            showDom(this.question.dom.firstChild.firstChild)
            hideDom(banTipDom)
        }
        this.question.dom.firstChild.appendChild(banTipDom)
    }
}


/**
 * 将该问题设为不感兴趣，通过影响推荐系统，以达到多端屏蔽的目的
 */
export class SetUninterestedBlocker extends Blocker {
    constructor(question) {
        super()
        this.question = question
    }
    block() {
        // 点击更多按钮，弹出浮动菜单
        const moreBtn = findChildDom(this.question.dom,
            (c) => c.id?.startsWith('Popover') && c.classList?.contains('OptionsButton'))
        moreBtn.click()

        const id = moreBtn.id.match(/Popover([0-9]*)-toggle/)[1]
        findChildDom(document.getElementById(`Popover${id}-content`),
            c => c.type === 'button' && c.innerText === '不喜欢该内容')?.click()
    }
}


/**
 * 将问题设置为不感兴趣后，对显示的TAG进行检查，如果存在TAG违反了屏蔽词，则将TAG提交。
 */
export class BanUninterestedTagBlocker extends Blocker {
    constructor(question) {
        super()
        this.question = question
    }
    block() {
        // 需要先设置不感兴趣才会出现TAG
        new SetUninterestedBlocker(this.question).block()

        const uninterestedTags = Array.from(this.question.dom.getElementsByClassName('Button TopstoryItem-uninterestTag'))
        let f = false
        uninterestedTags.forEach(d => {
            if (findBanWord(d.innerText, config.banWordList)) {
                d.click()
                f = true
            }
        })
        if (f) {
            this.question.dom.getElementsByClassName('Button TopstoryItem-actionButton Button--plain')[0]?.click()
        }
    }
}