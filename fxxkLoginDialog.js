// ==UserScript==
// @name         屏蔽骚扰(知乎/CSDN/简书/掘金)
// @namespace    http://tampermonkey.net/
// @version      2.0.0
// @description  屏蔽(知乎：登录弹窗；CSDN：登录弹窗、登录复制；简书：抽奖弹窗；掘金：底部插件下载)
// @author       leekbillow
// @match        https://*.zhihu.com/*
// @match        https://*.blog.csdn.net/*
// @match        https://*.jianshu.com/*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @updateURL    https://raw.githubusercontent.com/leekbillow/customTampermonkey/main/fxxkLoginDialog.js
// ==/UserScript==

(function () {
  "use strict";

  switch (true) {
    case /\bblog\.csdn\.net\b(?!\.)/.test(location.hostname): {
      // CSDN
      GM_addStyle(`
        .passport-login-container,
        #passportbox
        {
            display:none!important
        }
        code
        {
          user-select:text!important;
        }
        .hljs-button
        {
          display:none!important;
        }
      `);
      document.body.querySelector("#content_views").oncopy = function () {
        GM_setClipboard(getSelection().toString());
      };
      break;
    }
    case /\bzhihu\.com\b(?!\.)/.test(location.hostname): {
      // 知乎
      //添加限制样式
      let bhuStyle = GM_addStyle(`
        .Modal-wrapper,
        .Modal-backdrop,
        .signFlowModal
        {
            display:none!important;
        }
      `);
      // 弹窗数量，专栏为2
      let rubbishDialogQuantity = 1 + /\bzhuanlan\.zhihu\.com\b(?!\.)/.test(location.hostname),
        clicked = [];
      // 取消首次自动弹出登录框,解除监听
      let removeStyle = function () {
          bhuStyle.remove();
        },
        targetNode = document.body,
        observerOptions = {
          childList: true,
          subtree: true,
        },
        observer = new MutationObserver(function (mutationList, observer) {
          let rubbishDialogCloseButtons = document.querySelectorAll(".Modal-closeButton");
          if (rubbishDialogCloseButtons.length > 0) {
            // 关闭弹窗
            rubbishDialogCloseButtons.forEach((E) => {
              if (clicked.includes(E)) return;
              E.click();
              clicked.push(E);
              if (--rubbishDialogQuantity < 1) {
                observer.disconnect();
                let loginButton = document.querySelector(".AppHeader-login");
                loginButton && (loginButton.onclick = () => removeStyle());
              }
            });
            // 添加查看回答按钮
            const extendxButtons = document.querySelectorAll(".Button.ContentItem-rightButton.ContentItem-expandButton");
            extendxButtons.forEach((E) => {
              const url = E.parentElement.parentElement.querySelector('.ContentItem.AnswerItem>[itemprop="url"]').getAttribute("content"),
                answerId = url.split("/").pop(),
                directViewButton = E.cloneNode();
              directViewButton.innerHTML = "我™要看回答";
              directViewButton.setAttribute("style", "bottom: 35px");
              directViewButton.onclick = async () => {
                try {
                  const { responseText } = await GM.xmlHttpRequest({
                      method: "get",
                      url: `https://www.zhihu.com/appview/v2/answer/${answerId}?native=0&omni=1&sds=2&X-AD=canvas_version%3Av%3D5.1%3Bsetting%3Acad%3D0&seg_like_open=0`,
                    }),
                    newWindow = window.open("", answerId, "popup,width=850,height=1000,left=200,top=200"),
                    content = responseText,
                    document = newWindow.document;
                  document.open();
                  document.write(content);
                  document.close();
                  newWindow.onload = () => {
                    const imgs = document.querySelectorAll("[data-actualsrc]"),
                      scripts = document.querySelectorAll("script"),
                      norequiredSelector = [".css-199kefw", ".css-i8ps43", ".css-1gcwqws", ".css-1yuc9s4", ".AnswerToolbar-wrapper"];
                    imgs.forEach((img) => {
                      img.setAttribute("src", img.getAttribute("data-actualsrc"));
                    });
                    scripts.forEach((script) => script.remove());
                    norequiredSelector.forEach((selector) => document.querySelector(selector)?.remove());
                  };
                } catch (err) {
                  console.log(err);
                }
              };
              E.insertAdjacentElement("afterend", directViewButton);
            });
          } else return;
        });
      observer.observe(targetNode, observerOptions);
      //3秒后移除监听
      setTimeout(() => (observer.disconnect(), removeStyle()), 3000);
      break;
    }
    case /\bjianshu\.com\b(?!\.)/.test(location.hostname): {
      // 简书
      GM_addStyle(`
        body>div:last-child
        {
          display:none!important
        }
        body
        {
            overflow:auto!important
        }
      `);
      break;
    }
    default:
      break;
  }
})();
