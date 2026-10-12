/* 상견례 준비 노트 · 안내장 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 안내장 ═════════ */
  const INV_THEMES={
    flower:{name:'꽃',bg:'#fffaf6',accent:'#d9655b',soft:'#fbe7e1',ink:'#2b2b30',sw:'#f3c3b9',sw2:'#fbe7e1'},
    bojagi:{name:'보자기',bg:'#f8f4fb',accent:'#8a63b5',soft:'#ece3f6',ink:'#2b2734',sw:'#c8b2e3',sw2:'#ece3f6'},
    thread:{name:'청실홍실',bg:'#ffffff',accent:'#2a4a7a',soft:'#eef2f8',ink:'#1f2633',sw:'#2a4a7a',sw2:'#f3c3b9'}
  };
  let invTheme='flower';
  function invDeco(k,W){
    if(k==='flower')return flowerCluster(70,70,1.3,'#f3c3b9','#f7d27a')+flowerCluster(W-60,90,1,'#f6d2c9','#f2a99c')+flowerCluster(W-110,50,.7,'#f7d27a','#fff');
    if(k==='bojagi')return knot(W/2,92,.9,'#e8dbf4','#c8b2e3');
    return threads(70,W);
  }
  function buildInviteSvg(){
    const th=INV_THEMES[invTheme],W=600,v=id=>$('#'+id).value.trim();
    let y=170,body='';
    const text=(x,yy,s,size,fill,extra='',anchor='middle')=>`<text x="${x}" y="${yy}" text-anchor="${anchor}" font-size="${size}" font-family="${SANS}" fill="${fill}" ${extra}>${esc(s)}</text>`;
    body+=text(W/2,y,'INVITATION',13,th.accent,'font-weight="700" letter-spacing="4"');y+=52;
    for(const l of wrapLines(v('iTitle')||'두 가족의 첫 만남',480,s=>estW(s,34))){body+=text(W/2,y,l,34,th.ink,'font-weight="800"');y+=44}
    const names=[v('iGroom'),v('iBride')].filter(Boolean).join('  ♥  ');
    if(names){y+=4;body+=text(W/2,y,names,20,th.accent,'font-weight="700"');y+=40}
    for(const l of wrapLines(v('iMsg'),440,s=>estW(s,16))){body+=text(W/2,y,l,16,'#5a5a62');y+=27}
    y+=18;body+=`<line x1="${W/2-40}" y1="${y}" x2="${W/2+40}" y2="${y}" stroke="${th.accent}" stroke-width="1.5"/>`;y+=46;
    const when=[fmtDate($('#iDate').value),fmtTime($('#iTime').value)].filter(Boolean).join(' ');
    const rows=[['일시',when||'날짜를 넣어 주세요'],['장소',v('iPlace')],['주소',v('iAddr')],['주차',v('iPark')]].filter(r=>r[1]);
    for(const [k,val] of rows){
      const ls=wrapLines(val,380,s=>estW(s,17));
      body+=text(86,y,k,14,th.accent,'font-weight="700"','start');
      ls.forEach((l,i)=>{body+=text(150,y+i*27,l,17,th.ink,i?'':'font-weight="600"','start')});
      y+=ls.length*27+18;
    }
    const plan=v('iPlan').split('\n').map(s=>s.trim()).filter(Boolean).slice(0,6);
    if(plan.length){
      y+=6;const h=40+plan.length*30;
      body+=`<rect x="70" y="${y}" width="${W-140}" height="${h}" rx="18" fill="${th.soft}"/>`;
      body+=text(98,y+30,'당일 순서',13,th.accent,'font-weight="700"','start');
      plan.forEach((p,i)=>{const m=p.match(/^(\S+)\s+(.*)$/);const yy=y+60+i*30;if(m&&/\d/.test(m[1])){body+=text(98,yy,m[1],15,th.ink,'font-weight="700"','start')+text(170,yy,m[2],15,th.ink,'','start')}else body+=text(98,yy,p,15,th.ink,'','start')});
      y+=h+30;
    }
    y+=20;body+=text(W/2,y,'COSTCHECK 상견례 준비 노트',11,'#a3a3ab','letter-spacing="1"');
    const H=Math.max(860,y+40);
    return {svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="상견례 안내장"><rect width="${W}" height="${H}" fill="${th.bg}"/>${invDeco(invTheme,W)}<rect x="22" y="22" width="${W-44}" height="${H-44}" rx="14" fill="none" stroke="${th.soft}" stroke-width="2"/>${body}</svg>`,W,H};
  }
  function renderInvite(){$('#invCanvas').innerHTML=buildInviteSvg().svg}
  ['iTitle','iMsg','iGroom','iBride','iDate','iTime','iPlace','iAddr','iPark','iPlan'].forEach(id=>$('#'+id).addEventListener('input',renderInvite));
  $('#invPng').addEventListener('click',()=>{const {svg,W,H}=buildInviteSvg();svgToPng(svg,W*2,H*2,'상견례-안내장.png',INV_THEMES[invTheme].bg)});
  $('#invPrint').addEventListener('click',()=>{const d=document.createElement('div');d.style.maxWidth='520px';d.style.margin='0 auto';d.innerHTML=buildInviteSvg().svg;printOnly(d)});
  $('#invCopy').addEventListener('click',()=>{
    const v=id=>$('#'+id).value.trim();
    const when=[fmtDate($('#iDate').value),fmtTime($('#iTime').value)].filter(Boolean).join(' ');
    const q=[v('iPlace'),v('iAddr')].filter(Boolean).join(' ');
    const t=[`[상견례 안내] ${v('iTitle')}`,'',v('iMsg'),'',when&&`일시: ${when}`,v('iPlace')&&`장소: ${v('iPlace')}`,v('iAddr')&&`주소: ${v('iAddr')}`,v('iPark')&&`주차: ${v('iPark')}`,q&&`지도: https://map.naver.com/p/search/${encodeURIComponent(q)}`,v('iPlan')&&`\n당일 순서\n${v('iPlan')}`].filter(x=>x!==false&&x!==undefined&&x!=='').join('\n');
    copyText(t,'안내 문자를 복사했어요. 메신저에 붙여 넣으세요.');
  });
  $('#iDate').value=defaultMeetIso();
  function pickInv(k){invTheme=k;renderSwatches($('#invThemes'),INV_THEMES,invTheme,pickInv);renderInvite()}
  pickInv('flower');
})();
