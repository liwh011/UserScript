import { findChildDom } from "./util";

export class ListItem {
    /**
     * 
     * @param {HTMLElement} dom 
     */
    static from(dom) {
        if (dom.getElementsByClassName('ZVideoItem-video').length > 0
            || dom.getElementsByClassName('VideoAnswerPlayer').length > 0) {
            return new VideoItem(dom)
        } else {
            return new Question(dom)
        }
    }

    constructor(dom) {
        if (new.target === ListItem) {
            throw new Error('不能实例化ListItem')
        }

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
        const matchRes = t.match(/赞同 ([0-9.,]*)( 万)?/) || [0, 0]
        return matchRes[2] ? Number(matchRes[1]) * 10000 : Number(matchRes[1].replace(',', ''))
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

}


export class Question extends ListItem {
    constructor(dom) {
        super(dom)
    }
}


export class VideoItem extends ListItem {
    constructor(dom) {
        super(dom)
    }
}
