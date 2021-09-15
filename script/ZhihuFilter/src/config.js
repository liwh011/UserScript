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
    // 即给该问题点不感兴趣，以达到让知乎的推荐机制减少推荐相关内容的目的。
    setUninterested: true,
    // 点击不感兴趣后会出现一系列tag
    banUninterestedTag: true,
    // 当屏蔽后，是否在该问题的原地方显示“该问题已被屏蔽，点击可以恢复”的提示，点击可以还原并查看。
    showBanTip: true,
}


export default (() => {
    /**
     * @type defaultConfig
     */
    let config = {}
    for (let key in defaultConfig) {
        // 读取GM存储的配置，覆盖默认配置
        defaultConfig[key] = GM_getValue(key, defaultConfig[key])

        // 定义一个中介对象，每个属性的SETTER自动保存到存储当中
        Object.defineProperty(config, key, {
            configurable: true,
            enumerable: true,
            get() {
                return defaultConfig[key]
            },
            set(v) {
                defaultConfig[key] = v
                GM_setValue(key, v)
            }
        })
    }
    return config
})()