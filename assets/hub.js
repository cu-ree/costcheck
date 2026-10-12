/* 상견례 준비 노트 · 허브 (둘러보기) — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 홈: 필터 · 검색 ═════════ */
  let filter='all';
  function applyFilter(){
    const q=$('#q').value.trim().toLowerCase();let shown=0;
    $$('#grid .item').forEach(el=>{const tags=el.dataset.tags,text=(el.textContent+' '+tags).toLowerCase();const ok=(filter==='all'||tags.split(' ').includes(filter))&&(!q||text.includes(q));el.hidden=!ok;if(ok)shown++});
    $('#empty').hidden=shown>0;
  }
  $$('.filters .chip').forEach(c=>c.addEventListener('click',()=>{filter=c.dataset.f;$$('.filters .chip').forEach(x=>x.setAttribute('aria-pressed',String(x===c)));applyFilter()}));
  $('#q').addEventListener('input',applyFilter);
  applyFilter();
})();
