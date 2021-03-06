export const BAN_MODE = {
    SHOW: { value: -1, label: '不屏蔽' },
    HIDE: { value: 0, label: '仅隐藏' },
    SHOW_BAN_TIP: { value: 1, label: '替换为“被屏蔽提示”' },
    SET_UNINTERESTED: { value: 2, label: '设置不感兴趣' },
    BAN_TAG: { value: 3, label: '不感兴趣并提交TAG' },
}


export const LIST_CHOICE = {
    SAME_AS_TITLE: { value: 0, label: '与标题使用相同屏蔽词' },
    USE_OWN_LIST: { value: 1, label: '使用单独的屏蔽词' },
    USE_BOTH: { value: 2, label: '在标题的基础上扩展' },
}


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

}


export default (() => {
    for (let key in defaultConfig) {
        // 读取GM存储的配置，覆盖默认配置
        defaultConfig[key] = GM_getValue(key, defaultConfig[key])

        if (Array.isArray(defaultConfig[key])) {
            defaultConfig[key] = new Proxy(defaultConfig[key], {
                set(target, idx, value, receiver) {
                    target[idx] = value
                    GM_setValue(key, defaultConfig[key])
                    return true
                }
            })
        }
    }

    return new Proxy(defaultConfig, {
        get(target, key) { return target[key] },
        set(target, key, value, receiver) {
            GM_setValue(key, value)
            target[key] = value
            return true
        }
    })
})()