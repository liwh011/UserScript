import os
import sys

header = """// ==UserScript==  
// @name         知乎关键词屏蔽问题  
// @namespace    http://tampermonkey.net/  
// @version      2.0.4  
// @description  按照关键词或者正则，在知乎首页屏蔽对应的问题  
// @author       liwh011  
// @match        https://www.zhihu.com/  
// @icon         https://static.zhihu.com/heifetz/favicon.ico  
// @grant        GM_setValue  
// @grant        GM_getValue  
// @grant        GM_addElement  
// @grant        GM_setClipboard  
// @updateURL    https://github.com/liwh011/UserScript/raw/master/script/%E7%9F%A5%E4%B9%8E%E6%8C%89%E5%85%B3%E9%94%AE%E8%AF%8D%E5%B1%8F%E8%94%BD%E9%97%AE%E9%A2%98.user.js  
// ==/UserScript==

"""

os.system("cd ./script/ZhihuFilter && rollup ./src/index.js -o dist.js")
with open("./script/ZhihuFilter/dist.js", "r", encoding="utf-8") as f:
    content = f.read()
with open("./script/ZhihuFilter/dist.js", "w", encoding="utf-8") as f:
    f.write(header + content)

os.system("cd ./script/ZhihuFilter && move dist.js ../知乎按关键词屏蔽问题.user.js")