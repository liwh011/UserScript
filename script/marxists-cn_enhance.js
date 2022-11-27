// ==UserScript==
// @name         马克思主义文库阅读体验增强
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  注脚点击侧边展示、样式调节
// @author       liwh011
// @match        https://www.marxists.org/chinese/maozedong/marxist.org-chinese-mao-*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=marxists.org
// @grant        none
// ==/UserScript==

function hideSidePopup() {
  if (!document.getElementById("popup")) return;
  document.getElementById("popup").innerHTML = "";
}

function setSidePopup(num, text) {
  if (!document.getElementById("popup")) {
    const container = document.createElement("div");
    container.id = "popup";
    document.body.appendChild(container);
    document.body.onclick = hideSidePopup;
  }
  const popElem = document.getElementById("popup");
  popElem.onclick = (e) => e.stopPropagation();
  popElem.innerHTML = `
    <div style="position: fixed;
                right: 20px;
                top: 20px;
                width: 400px;
                height: 80vh;
                overflow-y: auto;
                background-color: #fff;
                box-shadow: rgba(100,100,100,0.4) 0px 0px 20px;
                padding: 12px;">
        <button id="popup-close">关闭</button>
        <a href="#_ftn${num}">转到注脚[${num}]</a>
        <div style="">
            ${text}
        </div>
    </div>
    `;
  document.getElementById("popup").onclick = hideSidePopup;
}

(function () {
  "use strict";

  document.body.style = `
        width: 700px;
        margin: auto;
        letter-spacing: 3px;
        font-size: 18px;
        font-family: '微软雅黑';
        line-height: 2;
    `;

  document.querySelectorAll(`a[name^="_ftnref"]`).forEach((elem) => {
    const elemName = elem.name;
    if (!elemName) return;
    const num = Number(elem.name.substr("_ftnref".length));
    elem.href = "javascript:void(0);";
    elem.onclick = (e) => {
      const ftnElem = document.querySelector(`a[name="_ftn${num}"]`);
      const text = ftnElem.nextSibling.textContent;
      setSidePopup(num, text);
      e.stopPropagation();
    };
  });
})();
