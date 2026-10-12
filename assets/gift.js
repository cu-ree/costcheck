/* 상견례 준비 노트 · 선물 추천 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 선물 추천 ═════════ */
  const BUDGETS=[['b1','3만 원 이하'],['b2','3~5만 원'],['b3','5~10만 원'],['b4','10만 원 이상']];
  const TASTES=[['health','건강을 챙기세요'],['sweet','달콤한 걸 좋아하세요'],['tea','차·커피를 즐기세요'],['fruit','과일을 좋아하세요'],['trad','전통적인 게 좋아요'],['drink','술을 즐기세요'],['practical','실용적인 게 좋아요']];
  const GIFTS=[
    {n:'한과·약과 세트',b:['b2','b3'],t:['sweet','trad'],c:'#f5e1dc',why:'상견례 선물로 가장 익숙하고 어르신들이 반가워하세요.',tip:'유통기한이 넉넉한지 확인하세요.'},
    {n:'제철 과일 바구니',b:['b3','b4'],t:['fruit','any'],c:'#fbe9e1',why:'누구나 부담 없이 받는 선물이에요. 계절감도 전할 수 있어요.',tip:'무게가 있으니 차로 이동할 때 고르세요.'},
    {n:'홍삼·건강즙 세트',b:['b3','b4'],t:['health'],c:'#e8e0d4',why:'부모님 건강을 챙기는 마음이 잘 전해져요.',tip:'복용 중인 약이 있으신지 미리 여쭤 보세요.'},
    {n:'전통 꿀 세트',b:['b2','b3'],t:['health','sweet','trad'],c:'#f7eed3',why:'보관이 쉽고 오래 두고 드실 수 있어요.',tip:'원산지와 꿀 종류를 함께 적어 드리면 좋아요.'},
    {n:'프리미엄 견과 세트',b:['b1','b2'],t:['health','practical'],c:'#efe6da',why:'가볍고 실속 있어 예산이 적을 때도 정성스러워 보여요.',tip:'소포장 제품이 드시기 편해요.'},
    {n:'전통차·녹차 세트',b:['b1','b2'],t:['tea','trad','health'],c:'#e3ece4',why:'차를 즐기시는 분께 은은하게 마음을 전하기 좋아요.',tip:'여러 가지 차가 든 구성이 무난해요.'},
    {n:'원두·드립백 세트',b:['b1','b2'],t:['tea','practical'],c:'#ebe2d9',why:'커피를 좋아하시는 부모님께 실용적인 선택이에요.',tip:'산미가 적은 원두가 무난해요.'},
    {n:'수제 양갱·떡 세트',b:['b1','b2'],t:['sweet','trad'],c:'#f3e3ea',why:'한입 크기라 나눠 드시기 좋고 포장이 예뻐요.',tip:'떡은 당일 받는 걸로 주문하세요.'},
    {n:'전통주 세트',b:['b2','b3'],t:['drink','trad'],c:'#e4ebf6',why:'술을 즐기시는 어른께 이야깃거리가 되는 선물이에요.',tip:'술을 안 드시는 집안도 있으니 꼭 확인하세요.'},
    {n:'와인 세트',b:['b2','b3','b4'],t:['drink'],c:'#ebe4f3',why:'식사 자리와 잘 어울리고 포장이 고급스러워요.',tip:'당도는 중간 정도가 무난해요.'},
    {n:'참기름·들기름 세트',b:['b1','b2'],t:['practical','trad','health'],c:'#f6eacd',why:'매일 쓰시는 식재료라 받는 분이 실용적으로 반겨요.',tip:'저온 압착 제품이 선물용으로 좋아요.'},
    {n:'정육 선물 세트',b:['b4'],t:['practical','any'],c:'#f5dcd6',why:'예산이 넉넉할 때 가족 식사로 나누기 좋아요.',tip:'냉장 보관이라 당일 전달 일정을 맞추세요.'},
    {n:'꽃바구니·화분',b:['b2','b3'],t:['any'],c:'#f0e4ee',why:'분위기를 화사하게 만들고 오래 기억에 남아요.',tip:'식당에 들고 가기 번거로울 수 있어 배송도 고려하세요.'}
  ];
  let gBudget='b2',gTaste=new Set();
  function renderGift(){
    $('#giftBudget').innerHTML=BUDGETS.map(([k,l])=>`<button type="button" class="chip" data-b="${k}" aria-pressed="${k===gBudget}">${l}</button>`).join('');
    $('#giftTaste').innerHTML=TASTES.map(([k,l])=>`<button type="button" class="chip" data-t="${k}" aria-pressed="${gTaste.has(k)}">${l}</button>`).join('');
    $$('#giftBudget .chip').forEach(b=>b.addEventListener('click',()=>{gBudget=b.dataset.b;renderGift()}));
    $$('#giftTaste .chip').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.t;gTaste.has(k)?gTaste.delete(k):gTaste.add(k);renderGift()}));
    const bandLabel=Object.fromEntries(BUDGETS);
    const list=GIFTS.filter(g=>g.b.includes(gBudget)).map(g=>({g,s:g.t.filter(t=>gTaste.has(t)).length*2+(g.t.includes('any')?1:0)})).sort((a,b)=>b.s-a.s).slice(0,6);
    $('#giftCount').textContent=`${bandLabel[gBudget]} 예산에 어울리는 선물 ${list.length}가지`;
    $('#giftList').innerHTML=list.map(({g})=>`<article class="gift"><div class="gift-art" style="background:${g.c}"><svg width="96" height="80" viewBox="0 0 96 80" aria-hidden="true"><rect x="16" y="30" width="64" height="44" rx="10" fill="#fff" opacity=".85"/><path d="M48 30c-14-20-32-14-26 2zM48 30c14-20 32-14 26 2z" fill="#fff"/><circle cx="48" cy="31" r="6" fill="${g.c}" stroke="#fff" stroke-width="3"/><path d="M16 46h64" stroke="${g.c}" stroke-width="4"/></svg></div><div class="gift-body"><p class="band">${g.b.map(b=>bandLabel[b]).join(' · ')}</p><h4>${esc(g.n)}</h4><p>${esc(g.why)}</p><p class="tip">${esc(g.tip)}</p><a href="https://search.shopping.naver.com/search/all?query=${encodeURIComponent(g.n.replace(/·/g,' ')+' 선물')}" target="_blank" rel="noopener">네이버 쇼핑에서 보기</a></div></article>`).join('');
  }
  renderGift();
})();
