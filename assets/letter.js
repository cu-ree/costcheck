/* 상견례 준비 노트 · 손편지 · 일러스트 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 손편지 ═════════ */
  const LETTER_THEMES={
    flower:{name:'봄꽃',bg:'#fffaf6',line:'#f2dcd5',ink:'#3a3236',sw:'#f3c3b9',sw2:'#fffaf6'},
    bojagi:{name:'보자기',bg:'#f8f4fb',line:'#e6dcef',ink:'#33293d',sw:'#c8b2e3',sw2:'#f8f4fb'},
    thread:{name:'청실홍실',bg:'#ffffff',line:'#e7e9ee',ink:'#232a38',sw:'#6a86b8',sw2:'#f3c3b9'}
  };
  let lTheme='flower',lTo='in-law',lWhen='before';
  function letterDraft(){
    const v=id=>$('#'+id).value.trim();
    const me=v('lFrom')||'저',p=v('lPartner')||'○○',call=v('lCall')||(lTo==='mine'?'엄마, 아빠':'아버님, 어머님');
    if(lTo==='in-law'){
      const open=`${call}, 안녕하세요.\n${josa(p,'과','와')} 함께하고 있는 ${me}입니다.`;
      const body=lWhen==='before'
        ?`곧 뵙게 될 날을 앞두고 설레는 마음으로 글을 씁니다.\n${josa(p,'을','를')} 이렇게 바르고 따뜻한 사람으로 키워 주셔서 진심으로 감사드립니다.\n부족한 점이 많지만 ${josa(p,'과','와')} 서로 아끼며 예쁘게 살겠습니다.`
        :`지난 상견례 자리에서 따뜻하게 맞아 주셔서 정말 감사했습니다.\n처음 뵙는 자리라 많이 긴장했는데, 먼저 편하게 말씀 건네 주셔서 마음이 놓였습니다.\n앞으로 ${josa(p,'과','와')} 함께 자주 찾아뵙겠습니다.`;
      return `${open}\n\n${body}\n\n늘 건강하세요.\n${me} 올림`;
    }
    const open=`사랑하는 ${call}께.`;
    const body=lWhen==='before'
      ?`두 집안이 처음 만나는 날을 앞두니, 그동안 저를 키워 주신 시간이 많이 떠올라요.\n늘 믿고 응원해 주셔서 고맙습니다.\n그날은 편한 마음으로 오셔서 웃으며 함께해 주세요.`
      :`상견례 자리에 함께해 주셔서 고마워요.\n저보다 더 긴장하셨을 텐데 끝까지 웃으며 자리를 지켜 주셔서 든든했어요.\n이제 ${p}네 가족과 함께 더 자주 찾아뵐게요.`;
    return `${open}\n\n${body}\n\n언제나 고맙고 사랑해요.\n${me} 드림`;
  }
  function letterBgSvg(k){
    const W=900,H=1200,th=LETTER_THEMES[k];
    let d=`<rect width="${W}" height="${H}" fill="${th.bg}"/>`;
    if(k==='flower')d+=flowerCluster(90,90,1.8,'#f3c3b9','#f7d27a')+flowerCluster(190,60,1,'#f7d27a','#fff')+flowerCluster(W-90,H-90,1.8,'#f6d2c9','#f2a99c')+flowerCluster(W-200,H-60,1,'#f3c3b9','#fff');
    else if(k==='bojagi')d+=knot(W/2,130,1.2,'#e8dbf4','#c8b2e3')+`<rect x="40" y="40" width="${W-80}" height="${H-80}" rx="24" fill="none" stroke="#e6dcef" stroke-width="3"/>`;
    else d+=threads(110,W)+threads(H-110,W);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${d}</svg>`;
  }
  const letterBgCache={};
  function loadImg(svg){return new Promise(res=>{const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);res(img)};img.onerror=()=>{URL.revokeObjectURL(url);res(null)};img.src=url})}
  let fontReady=false;
  async function drawLetter(){
    const cv=$('#letterCanvas'),ctx=cv.getContext('2d'),th=LETTER_THEMES[lTheme],W=900,H=1200;
    if(!letterBgCache[lTheme])letterBgCache[lTheme]=await loadImg(letterBgSvg(lTheme));
    ctx.fillStyle=th.bg;ctx.fillRect(0,0,W,H);
    if(letterBgCache[lTheme])ctx.drawImage(letterBgCache[lTheme],0,0,W,H);
    const fam=fontReady?"'Nanum Pen Script', cursive":"'Apple SD Gothic Neo','Malgun Gothic',sans-serif";
    const top=lTheme==='bojagi'?240:230,bottom=H-170,left=120,maxW=W-240;
    let gap=60,size=fontReady?46:30,lines;
    for(let tries=0;tries<12;tries++){
      ctx.font=`${size}px ${fam}`;
      lines=wrapLines($('#lBody').value,maxW,s=>ctx.measureText(s).width);
      if(top+gap*lines.length<=bottom)break;
      gap-=4;size=Math.round(size*0.92);
    }
    ctx.strokeStyle=th.line;ctx.lineWidth=2;
    for(let y=top+gap;y<=bottom;y+=gap){ctx.beginPath();ctx.moveTo(left-10,y);ctx.lineTo(W-left+10,y);ctx.stroke()}
    ctx.fillStyle=th.ink;ctx.textBaseline='alphabetic';ctx.font=`${size}px ${fam}`;
    lines.forEach((l,i)=>ctx.fillText(l,left,top+gap*(i+1)-gap*0.22));
  }
  $$('[data-lto]').forEach(b=>b.addEventListener('click',()=>{lTo=b.dataset.lto;setSeg('lto',lTo);$('#lCall').value=lTo==='mine'?'엄마, 아빠':'아버님, 어머님';$('#lBody').value=letterDraft();drawLetter()}));
  $$('[data-lwhen]').forEach(b=>b.addEventListener('click',()=>{lWhen=b.dataset.lwhen;setSeg('lwhen',lWhen);$('#lBody').value=letterDraft();drawLetter()}));
  ['lFrom','lPartner','lCall'].forEach(id=>$('#'+id).addEventListener('change',()=>{$('#lBody').value=letterDraft();drawLetter()}));
  $('#lBody').addEventListener('input',drawLetter);
  $('#letterDraft').addEventListener('click',()=>{$('#lBody').value=letterDraft();drawLetter();toast('초안을 다시 썼어요.')});
  $('#letterPng').addEventListener('click',()=>$('#letterCanvas').toBlob(b=>{if(b){download(b,'상견례-손편지.png');toast('이미지를 저장했어요.')}},'image/png'));
  $('#letterPrint').addEventListener('click',()=>{const img=new Image();img.src=$('#letterCanvas').toDataURL('image/png');img.style.maxWidth='560px';img.style.margin='0 auto';printOnly(img)});
  // 일러스트는 assets/art/*.svg 파일로 두고, 누르면 PNG로 바꿔 저장한다
  function renderIllus(){
    $$('#illusGrid button[data-src]').forEach(b=>b.addEventListener('click',async()=>{
      try{
        const r=await fetch(b.dataset.src);if(!r.ok)throw new Error(r.status);
        const s=new DOMParser().parseFromString(await r.text(),'image/svg+xml').documentElement;
        s.setAttribute('width','800');s.setAttribute('height','1000');
        svgToPng(new XMLSerializer().serializeToString(s),800,1000,`상견례-일러스트-${b.dataset.name}.png`);
      }catch(e){toast('그림을 불러오지 못했어요. 잠시 뒤 다시 눌러 주세요.')}
    }));
  }
  function pickLetter(k){lTheme=k;renderSwatches($('#letterThemes'),LETTER_THEMES,lTheme,pickLetter);drawLetter()}
  $('#lBody').value=letterDraft();
  renderSwatches($('#letterThemes'),LETTER_THEMES,lTheme,pickLetter);
  renderIllus();
  drawLetter();
  if(document.fonts){document.fonts.load("46px 'Nanum Pen Script'").then(f=>{if(f&&f.length){fontReady=true;drawLetter()}}).catch(()=>{})}
})();
