// ==UserScript==
// @name        Links
// @description Get link URLs
// @namespace   https://github.com/octocat
// @version     0.1.0
// @match       https://*/*
// @license     MIT
// @author      Octocat
// @noframes
// @run-at      document-idle
// @grant       GM_registerMenuCommand
// ==/UserScript==
(function() {
    const findLinks = ()=>[
            ...document.querySelectorAll('a')
        ]
    ;
    GM_registerMenuCommand('Get links', ()=>{
        const links = findLinks();
        const urls = links.map((elm)=>elm.href
        );
        console.log(urls);
    });
    return {
    };
})();
