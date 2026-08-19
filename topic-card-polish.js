(()=>{
const icon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5v-16Z"/></svg>';
function decorate(){document.querySelectorAll('.topic-card').forEach(card=>{if(card.querySelector('.topic-common-icon'))return;const el=document.createElement('span');el.className='topic-common-icon';el.innerHTML=icon;card.insertBefore(el,card.firstChild)})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',decorate);else decorate();
new MutationObserver(decorate).observe(document.body,{childList:true,subtree:true});
})();