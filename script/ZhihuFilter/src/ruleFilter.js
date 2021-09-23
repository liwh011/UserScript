import config, { BAN_MODE, LIST_CHOICE } from "./config"
import { ListItem, VideoItem } from "./question"
import { findBanWord } from "./util"


export class RuleFactory {
    static getRules(question) {
        const ruleSet = new RuleFilterSet()

        // 视频
        if (config.hideVideo !== BAN_MODE.SHOW.value) {
            ruleSet.add(new VideoFilter())
        }

        // 普通问题
        if (config.hideQuestion !== BAN_MODE.SHOW.value) {
            // 标题屏蔽词检查
            ruleSet.add(new WordListFilter_Title(config.banWordList))

            // 回答屏蔽词检查
            if (config.shouldTestAnswer) {
                let wordList = []
                switch (config.whatListShouldBeUsedToTestAnswer) {
                    case LIST_CHOICE.SAME_AS_TITLE.value:
                        wordList = config.banWordList
                        break;
                    case LIST_CHOICE.USE_OWN_LIST.value:
                        wordList = config.answerBanWordList
                        break;
                    case LIST_CHOICE.USE_BOTH.value:
                        wordList = config.answerBanWordList.concat(config.banWordList)
                        break;
                    default:
                        break;
                }
                ruleSet.add(new WordListFilter_Answer(wordList))
            }
        }
        
        // 争议问题检查
        if (config.hideControversialQuestion !== BAN_MODE.SHOW.value) {
            ruleSet.add(new LikeCommentRatioFilter(config.controversialQuestionEvaluateOffset))
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
        this.set = Array.from(arguments).filter(v => v instanceof RuleFilter)
    }

    /**
     * 与上一个规则
     * @param {RuleFilter} filter 
     */
    add(filter) {
        this.set.push(filter)
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
}


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
        super()
        this.wordList = wordList
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const res = findBanWord(question.title, this.wordList)
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
        super()
        this.wordList = wordList
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const res = findBanWord(question.answer, this.wordList)
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
        super()
        this.offset = offset
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            const expect = this.expectCommentCount(question.likeCount)
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
        super()
    }

    isValid(question) {
        return new Promise((resolve, reject) => {
            if (question instanceof VideoItem)
                return reject(genValidateResult(`视频`, config.hideVideo))
            return resolve()
        })
    }
}