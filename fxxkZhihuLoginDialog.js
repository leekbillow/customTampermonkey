// ==UserScript==
// @name         移除知乎登录弹窗
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  移除知乎的登录弹窗
// @author       leekbillow
// @match        https://*.zhihu.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/leekbillow/customTampermonkey/main/fxxkZhihuLoginDialog.js
// ==/UserScript==

(function() {
    'use strict';

    //添加限制样式
    let style=document.createElement('style');
    style.classList.add('Tampermonkey');
    style.innerHTML=`
    .Modal-wrapper,
    .Modal-backdrop,
    .signFlowModal
    {
        display:none!important;
    }`;
    document.head.append(style);
    //取消首次自动弹出登录框,解除监听
    let removeStyle=function(){style.remove();},
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
                let loginButton=document.querySelector('.AppHeader-login');
                loginButton && (loginButton.onclick=()=>removeStyle());
            }
            else return;
        });
    observer.observe(targetNode, observerOptions);
    //3秒后移除监听
    setTimeout(()=>(observer.disconnect(),removeStyle()),3000);
})();
