// ==UserScript==
// @name         移除知乎/CSDN登录弹窗
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  移除知乎/CSDN登录弹窗二合一
// @author       leekbillow
// @match        https://*.zhihu.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/leekbillow/customTampermonkey/main/fxxkLoginDialog.js
// ==/UserScript==

(function() {
    'use strict';

    switch(true)
    {
        case /\bblog\.csdn\.net\b(?!\.)/.test(location.hostname):
        {
            // CSDN
            let csdnStyle=document.createElement('style');
            csdnStyle.classList.add('Tampermonkey');
            csdnStyle.innerHTML=`
            .login-mark,
            #passportbox,
            .toolbar-advert
            {
                display:none!important
            }`;
            document.head.append(csdnStyle);
            break;
        }
        case /\bzhihu\.com\b(?!\.)/.test(location.hostname):
        {
            // 知乎
            //添加限制样式
            let bhuStyle=document.createElement('style');
            bhuStyle.classList.add('Tampermonkey');
            bhuStyle.innerHTML=`
            .Modal-wrapper,
            .Modal-backdrop,
            .signFlowModal
            {
                display:none!important;
            }`;
            document.head.append(bhuStyle);
            //取消首次自动弹出登录框,解除监听
            let removeStyle=function(){bhuStyle.remove();},
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
            break;
        }
    }
})();
