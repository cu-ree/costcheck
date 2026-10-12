/* 상견례 준비 노트 · 비용 계산기 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 비용 계산기 ═════════ */
  const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
  const man=n=>{if(n<10000)return won(n);const v=n/10000;return (Number.isInteger(v)?v:v.toFixed(1))+'만 원'};
  const num=el=>{const v=parseInt(String(el.value).replace(/[^0-9]/g,''),10);return isNaN(v)?0:v};
  let cost={people:6,split:'couple'};
  function fmtInput(el){const v=num(el);el.value=v?v.toLocaleString('ko-KR'):''}
  function calc(){
    const course=+$('#course').value,drink=+$('#drink').value,room=num($('#room')),etc=num($('#etc')),gift=num($('#gift')),p=cost.people;
    $('#pOut').textContent=p+'명';$('#courseOut').textContent=man(course);$('#drinkOut').textContent=drink?man(drink):'없음';
    $$('#courseQuick button').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.v===course)));
    const parts=[['식사',p*course,'#f3b0a8'],['음료 · 주류',p*drink,'#f2cd73'],['룸 · 기타',room+etc,'#9fb5dd']];
    const meal=parts.reduce((a,x)=>a+x[1],0);
    $('#total').textContent=won(meal);
    $('#perHead').textContent=`1인당 ${won(p?meal/p:0)}${gift?` · 선물 별도 ${man(gift)} × 2`:''}`;
    $('#costBar').innerHTML=meal?parts.map(([,v,c])=>`<i style="width:${100*v/meal}%;background:${c}"></i>`).join(''):'';
    $('#costRows').innerHTML=parts.map(([k,v,c])=>`<li><span style="--c:${c}">${k}</span><b>${won(v)}</b></li>`).join('');
    const map={couple:[['예비부부',meal]],half:[['신랑 측',meal/2],['신부 측',meal/2]],groom:[['신랑 측',meal],['신부 측',0]],bride:[['신랑 측',0],['신부 측',meal]]};
    let rows=map[cost.split];
    if(gift)rows=cost.split==='couple'?[...rows,['양가 선물 (각각)',gift]]:rows.map(([k,v])=>[k+' (선물 포함)',v+gift]);
    $('#splitTitle').textContent=cost.split==='couple'?'예비부부가 낼 때':'집안별 부담';
    $('#splitRows').innerHTML=rows.map(([k,v])=>`<div class="split-row"><span>${k}</span><b>${won(v)}</b></div>`).join('');
  }
  $('#pMinus').addEventListener('click',()=>{cost.people=Math.max(2,cost.people-1);calc()});
  $('#pPlus').addEventListener('click',()=>{cost.people=Math.min(20,cost.people+1);calc()});
  ['course','drink'].forEach(id=>$('#'+id).addEventListener('input',calc));
  ['room','etc','gift'].forEach(id=>$('#'+id).addEventListener('input',e=>{fmtInput(e.target);calc()}));
  $$('#courseQuick button').forEach(b=>b.addEventListener('click',()=>{$('#course').value=b.dataset.v;calc()}));
  $$('[data-split]').forEach(b=>b.addEventListener('click',()=>{cost.split=b.dataset.split;$$('[data-split]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));calc()}));
  // 자리 배치도 페이지에서 정한 인원(이 브라우저에 저장된 값)을 불러온다
  $('#syncPeople').addEventListener('click',()=>{const sv=store.get(SEAT_KEY,null),ok=sv&&+sv.g>0&&+sv.b>0;cost.people=ok?Math.min(20,+sv.g+(+sv.b)):6;calc();toast(ok?`배치도 인원 ${cost.people}명을 불러왔어요.`:'저장된 배치도가 없어 기본 인원 6명을 넣었어요.')});
  calc();
})();
