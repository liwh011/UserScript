@echo off

setlocal enableDelayedExpansion

SET ENDL=^


SET head=// ==UserScript==  !ENDL!^
// @name         知乎关键词屏蔽问题TEST22  !ENDL!^
// @namespace    http://tampermonkey.net/  !ENDL!^
// @version      2.0.0  !ENDL!^
// @description  按照关键词或者正则，在知乎首页屏蔽对应的问题  !ENDL!^
// @author       liwh011  !ENDL!^
// @match        https://www.zhihu.com/  !ENDL!^
// @icon         https://static.zhihu.com/heifetz/favicon.ico  !ENDL!^
// @grant        GM_setValue  !ENDL!^
// @grant        GM_getValue  !ENDL!^
// @grant        GM_addElement  !ENDL!^
// @grant        GM_setClipboard  !ENDL!^
// @updateURL    https://github.com/liwh011/UserScript/raw/master/script/%E7%9F%A5%E4%B9%8E%E6%8C%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%B1%8F%E8%94%BD%E9%97%AE%E9%A2%98.user.js  !ENDL!^
// ==/UserScript==  !ENDL!




cd ./script/ZhihuFilter
rollup ./src/index.js -o dist.js --intro "!head!"