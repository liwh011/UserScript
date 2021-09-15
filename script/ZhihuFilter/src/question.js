import { showDom, hideDom, attachHiddenClass, attachShownClass, findChildDom, findBanWord } from "./util";


export class Question {
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
        const moreBtn = findChildDom(this.dom, (c) => c.id?.startsWith('Popover') && c.classList?.contains('OptionsButton'))
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

