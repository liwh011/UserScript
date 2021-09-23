import config from './config'

// 在后代中寻找符合条件的dom
export const findChildDom = (dom, predicate) => {
    let childNodes = Array.from(dom.childNodes, v => v)
    for (let i = 0; i < childNodes.length; i++) {
        if (predicate(childNodes[i]))
            return childNodes[i]
        childNodes = childNodes.concat(Array.from(childNodes[i].childNodes))
    }
    return null
}



export const hideDom = dom => { dom.style.display = 'none' }


export const showDom = dom => { dom.style.display = 'block' }


export const attachHiddenClass = dom => { dom.classList.add('bannedByUser') }


export const attachShownClass = dom => { dom.classList.remove('bannedByUser'); dom.classList.add('recoveredByUser') }


export const isRegexLike = str => str.startsWith('/') && str.endsWith('/')


// 寻找文本的屏蔽词
export const findBanWord = (text, wordList) => {
    for (let i = 0; i < wordList.length; i++) {
        const v = wordList[i]
        if (!v) continue    // 忽略空字串
        const reg = isRegexLike(v) ? eval(v) : eval(`/(${v})/`)
        if (reg.test(text)) {
            return v
        }
    }
    return null
}