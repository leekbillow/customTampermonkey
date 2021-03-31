// ==UserScript==
// @name         移除知乎登录弹窗
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  移除知乎的登录弹窗
// @author       leekbillow
// @match        https://www.zhihu.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/leekbillow/customTampermonkey/main/fxxkZhihuLoginDialog.js
// ==/UserScript==

(function() {
    'use strict';

    //添加限制样式
    let style=document.createElement('style'),
        styleId=`Tampermonkey${new Date()*1}`;
    style.id=styleId;
    style.innerHTML=`
    .Modal-wrapper,
    .Modal-backdrop,
    .signFlowModal
    {
        display:none!important;
    }`;
    document.head.append(style);
    //取消首次自动弹出登录框,解除监听
    let removeStyle=function()
        {
            document.querySelector('.AppHeader-login').onclick=()=>document.getElementById(styleId).remove();
        },
        targetNode = document.body,
        observerOptions=
        {
            childList: true,
            subtree: true
        },
        observer = new MutationObserver(function(mutationList,observer)
        {
            let rubbishDialogClose=document.querySelector('.Modal-closeButton');
            if(rubbishDialogClose)
            {
                observer.disconnect();
                rubbishDialogClose.click();
                setTimeout(removeStyle,200);
            }
            else return;
        });
    observer.observe(targetNode, observerOptions);
})();
