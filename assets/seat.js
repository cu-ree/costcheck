/* 상견례 준비 노트 · 자리 배치도 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 자리 배치도 ═════════ */
  const G_DEF=['아버지','어머니','예비신랑','형제·자매','가족','가족','가족','가족'];
  const B_DEF=['아버지','어머니','예비신부','형제·자매','가족','가족','가족','가족'];
  const freshSeat=()=>({g:3,b:3,shape:'rect',door:'right',title:'두 집안의 첫 상견례',namesG:G_DEF.slice(),namesB:B_DEF.slice()});
  let seat=freshSeat();
  for(const id of ['groomCount','brideCount']){const sel=$('#'+id);for(let i=1;i<=8;i++){const o=new Option(i+'명',i);if(i===3)o.selected=true;sel.add(o)}}
  function renderNameFields(){
    const groups=[['G','신랑 측',seat.g,'var(--groom)'],['B','신부 측',seat.b,'var(--bride)']];
    $('#nameFields').innerHTML=groups.map(([k,label,n,color])=>`<h4><i style="background:${color}"></i>${label}</h4>`+Array.from({length:n},(_,i)=>`<div class="name-row"><span>${i+1}</span><input class="inp" data-k="${k}" data-i="${i}" maxlength="14" aria-label="${label} ${i+1}번째 자리 호칭" value="${esc(seat['names'+k][i])}"></div>`).join('')).join('');
    $$('#nameFields input').forEach(el=>el.addEventListener('input',e=>{seat['names'+e.target.dataset.k][+e.target.dataset.i]=e.target.value;renderSeats()}));
  }
  const C={paper:'#ffffff',ink:'#22252a',ink3:'#7a7e86',rule:'#cfd2cc',table:'#e6ede8',cheong:'#2a4a7a',hong:'#b23a35',cs:'#edf1f7',hs:'#f9eeec'};
  const T=(x,y,s,size,fill,fam,extra='')=>`<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="central" font-size="${size}" font-family="${fam}" fill="${fill}" ${extra}>${esc(s)}</text>`;
  const VT=(x,cy,s,size,fill,fam)=>{const ch=[...s],step=size*1.2,y0=cy-step*(ch.length-1)/2;return ch.map((c,i)=>T(x,(y0+i*step).toFixed(1),c,size,fill,fam)).join('')};
  function seatPositions(n,side){
    const top=156,span=290,cy=301,sign=side==='g'?-1:1;
    return Array.from({length:n},(_,i)=>{const y=top+span*(i+1)/(n+1);let off=190;
      if(seat.shape==='round'){const dy=y-cy;const ell=190*Math.sqrt(Math.max(0,1-(dy/175)**2));const tbl=Math.sqrt(Math.max(0,118*118-dy*dy));off=Math.max(ell,tbl+74)}
      return {x:350+sign*off,y}});
  }
  function seatBox(p,label,side,h){
    const w=128,x=p.x-w/2,y=p.y-h/2,col=side==='g'?C.cheong:C.hong,bg=side==='g'?C.cs:C.hs;
    const raw=(label||'').trim()||'참석자',chars=[...raw];
    const txt=chars.length>10?chars.slice(0,9).join('')+'…':raw;
    const fs=Math.max(10,Math.min(15,h*.4,(w-24)/[...txt].length)).toFixed(1);
    const barX=side==='g'?x+w-3:x;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w}" height="${h.toFixed(1)}" fill="${bg}" stroke="${col}" stroke-width=".9"/><rect x="${barX.toFixed(1)}" y="${y.toFixed(1)}" width="3" height="${h.toFixed(1)}" fill="${col}"/>`+T((p.x+(side==='g'?-2:2)).toFixed(1),p.y.toFixed(1),txt,fs,C.ink,SERIF);
  }
  function doorMark(){
    const tickV=(x,y)=>`<line x1="${x-9}" y1="${y}" x2="${x+9}" y2="${y}" stroke="${C.ink}" stroke-width="1.3"/>`;
    const tickH=(x,y)=>`<line x1="${x}" y1="${y-9}" x2="${x}" y2="${y+9}" stroke="${C.ink}" stroke-width="1.3"/>`;
    const gapV=(x,y1,y2)=>`<rect x="${x-8}" y="${y1}" width="16" height="${y2-y1}" fill="${C.paper}"/>`+tickV(x,y1)+tickV(x,y2);
    const gapH=(y,x1,x2)=>`<rect x="${x1}" y="${y-8}" width="${x2-x1}" height="16" fill="${C.paper}"/>`+tickH(x1,y)+tickH(x2,y);
    switch(seat.door){
      case 'left':return gapV(24,380,440)+VT(48,410,'출입문',11,C.ink3,SANS)+VT(652,301,'안쪽·상석',11,C.hong,SANS);
      case 'top':return gapH(24,520,580)+T(550,47,'출입문',11,C.ink3,SANS)+T(350,474,'안쪽 · 상석',11,C.hong,SANS);
      case 'bottom':return gapH(526,320,380)+T(350,505,'출입문',11,C.ink3,SANS)+T(350,145,'안쪽 · 상석',11,C.hong,SANS);
      default:return gapV(676,380,440)+VT(652,410,'출입문',11,C.ink3,SANS)+VT(48,301,'안쪽·상석',11,C.hong,SANS);
    }
  }
  function buildSeatSvg(){
    const title=(seat.title||'').trim()||'상견례',ts=Math.min(24,Math.floor(540/Math.max([...title].length,1)));
    let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 550" width="700" height="550" role="img" aria-label="${esc(title)} 자리 배치도"><rect width="700" height="550" fill="${C.paper}"/>`;
    s+=`<rect x="20" y="20" width="660" height="510" fill="none" stroke="${C.ink}" stroke-width="2.4"/><rect x="28" y="28" width="644" height="494" fill="none" stroke="${C.ink}" stroke-width=".8"/>`;
    s+=T(350,58,'相 見 禮',12,C.hong,SERIF,'letter-spacing="4"')+T(350,90,title,ts,C.ink,SERIF,'font-weight="500"');
    s+=`<line x1="320" y1="114" x2="380" y2="114" stroke="${C.rule}"/>`;
    s+=T(160,136,'신랑 측',12,C.cheong,SANS,'font-weight="600" letter-spacing="1"')+T(540,136,'신부 측',12,C.hong,SANS,'font-weight="600" letter-spacing="1"');
    s+=seat.shape==='rect'?`<rect x="272" y="156" width="156" height="290" rx="2" fill="${C.table}" stroke="${C.ink}" stroke-width=".9"/>`:`<circle cx="350" cy="301" r="118" fill="${C.table}" stroke="${C.ink}" stroke-width=".9"/>`;
    s+=`<path d="M322 301 C 336 285, 364 317, 378 301" fill="none" stroke="${C.cheong}" stroke-width="1.3"/><path d="M322 301 C 336 317, 364 285, 378 301" fill="none" stroke="${C.hong}" stroke-width="1.3"/>`;
    const h=Math.max(24,Math.min(42,290/(Math.max(seat.g,seat.b)+1)-6));
    seatPositions(seat.g,'g').forEach((p,i)=>s+=seatBox(p,seat.namesG[i],'g',h));
    seatPositions(seat.b,'b').forEach((p,i)=>s+=seatBox(p,seat.namesB[i],'b',h));
    s+=doorMark();
    s+=`<text x="44" y="503" font-size="11" font-family="${SANS}" fill="${C.ink3}" dominant-baseline="central">신랑 측 ${seat.g}명, 신부 측 ${seat.b}명</text><text x="656" y="503" font-size="10" font-family="${SANS}" fill="${C.ink3}" text-anchor="end" dominant-baseline="central" letter-spacing="1.5">COSTCHECK</text>`;
    return s+'</svg>';
  }
  function renderSeats(){$('#seatCanvas').innerHTML=buildSeatSvg();$('#seatCount').textContent=`${seat.g+seat.b}명, ${seat.shape==='rect'?'긴':'원형'} 테이블`}
  function syncCounts(){seat.g=+$('#groomCount').value;seat.b=+$('#brideCount').value;store.set(SEAT_KEY,{g:seat.g,b:seat.b});renderNameFields();renderSeats()}
  $('#groomCount').addEventListener('change',syncCounts);$('#brideCount').addEventListener('change',syncCounts);
  $('#meetingName').addEventListener('input',e=>{seat.title=e.target.value;renderSeats()});
  $('#doorSide').addEventListener('change',e=>{seat.door=e.target.value;renderSeats()});
  function setShape(v){seat.shape=v;$$('[data-shape]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.shape===v)))}
  $$('[data-shape]').forEach(b=>b.addEventListener('click',()=>{setShape(b.dataset.shape);renderSeats()}));
  $('#resetSeat').addEventListener('click',()=>{seat=freshSeat();store.del(SEAT_KEY);$('#groomCount').value=3;$('#brideCount').value=3;$('#meetingName').value=seat.title;$('#doorSide').value='right';setShape('rect');renderNameFields();renderSeats();toast('처음 배치로 되돌렸어요.')});
  $('#downloadSvg').addEventListener('click',()=>{download(new Blob([buildSeatSvg()],{type:'image/svg+xml;charset=utf-8'}),'상견례-자리배치도.svg');toast('SVG 파일을 저장했어요.')});
  $('#downloadPng').addEventListener('click',()=>svgToPng(buildSeatSvg(),1400,1100,'상견례-자리배치도.png'));
  $('#printSeat').addEventListener('click',()=>{const d=document.createElement('div');d.innerHTML=buildSeatSvg();printOnly(d)});
  // 지난번에 정한 인원이 있으면 이어서 보여 준다 (호칭은 저장하지 않음)
  {const sv=store.get(SEAT_KEY,null);if(sv&&sv.g>=1&&sv.g<=8&&sv.b>=1&&sv.b<=8){seat.g=sv.g;seat.b=sv.b;$('#groomCount').value=sv.g;$('#brideCount').value=sv.b}}
  renderNameFields();renderSeats();
})();
