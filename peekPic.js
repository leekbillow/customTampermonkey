// ==UserScript==
// @name         无图模式
// @icon         https://avatars.githubusercontent.com/u/43409097?v=4
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  无图模式，鼠标悬浮后显示图片
// @author       leekbillow
// @homepage     https://github.com/leekbillow/customTampermonkey
// @match        https://*/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_getValues
// @grant        GM_setValues
// @grant        GM_registerMenuCommand
// @run-at       document-start
// ==/UserScript==

(function () {
  "use strict";

  let imgStyle = null;
  function apply() {
    const delay = GM_getValue('delay') || 0;
    imgStyle?.remove();
    imgStyle = GM_addStyle(`
      img {
        filter: blur(5px) !important;
        opacity: 0.1 !important;
        transition:
          filter 0.5s 0s ease-in-out,
          opacity 0.5s 0s ease-in-out !important;
      }
      img:hover {
        filter: blur(0) !important;
        transition:
          filter 1s ${delay}ms ease-in-out,
          opacity 1s ${delay}ms ease-in-out !important;
        opacity: 1 !important;
      }
    `);
  }

  function cancel() {
    imgStyle?.remove();
    imgStyle = null;
  }

  function openConfigForm() {
    const { enabled, delay } = GM_getValues({ enabled: '', delay: 1000 });
    const inputs = [
      { type: 'checkbox', name: 'enabled', label: '默认启用', value: 'true', checked: enabled === 'true', },
      { type: 'range', name: 'delay', label: '显示延迟(ms)', value: delay || 0, min: 0, max: 3000, step: 100 },
    ]

    const form = document.createElement('form');
    form.style = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, 50%);
      z-index:99999;
      background: #888;
      padding: 20px;
      border-radius: 5px;
    `;
    inputs.forEach(input => {
      const div = document.createElement('div');
      div.innerHTML = `
      <label>${input.label}：</label>
      ${input.type === 'select'
          ? `<select name="${input.name}">
            ${input.options.map(opt => `<option value="${opt.value}">${opt.text}</option>`).join('')}
          </select>`
          : `<input ${Object.entries(input).map(([k, v]) => `${k}="${v}"`).join(' ')}>`
        }
    `;
      form.appendChild(div);
    });

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.textContent = '保存';
    saveBtn.onclick = (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const config = Object.fromEntries(formData.entries());
      GM_setValues(config)
      form.remove();
      cancel();
      if (config.enabled) apply();
    };
    form.appendChild(saveBtn);

    document.body.appendChild(form);
  }

  const enabled = GM_getValue('enabled');
  if (enabled) apply();

  GM_registerMenuCommand("临时启用", apply);
  GM_registerMenuCommand("临时禁用", cancel);
  GM_registerMenuCommand("设置", openConfigForm);
})();
