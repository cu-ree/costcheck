/* 상견례 준비 노트 공통 스크립트 — 모든 페이지에서 먼저 불러온다.
   도구별 스크립트(seat.js 등)는 이 파일의 함수를 그대로 쓴다. */
'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastT;const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('show'),2400)};
const store={get(k,d){try{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const DOW='일월화수목금토';
const jong=s=>{const c=String(s).trim().slice(-1).charCodeAt(0);return c>=0xAC00&&c<=0xD7A3&&(c-0xAC00)%28!==0};
const josa=(s,a,b)=>s+(jong(s)?a:b);
const fmtDate=v=>{if(!v)return '';const [y,m,d]=v.split('-').map(Number);const dt=new Date(y,m-1,d);return `${y}년 ${m}월 ${d}일 ${DOW[dt.getDay()]}요일`};
const fmtTime=v=>{if(!v)return '';let [h,mi]=v.split(':').map(Number);const ap=h<12?'오전':'오후';const hh=h%12===0?12:h%12;return `${ap} ${hh}시${mi?` ${mi}분`:''}`};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
function svgToPng(svg,w,h,name,bg='#fff'){
  const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),img=new Image();
  img.onload=()=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.fillStyle=bg;x.fillRect(0,0,w,h);x.drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
    c.toBlob(b=>{if(b){download(b,name);toast('이미지를 저장했어요.')}else toast('이미지로 바꾸지 못했어요.')},'image/png')};
  img.onerror=()=>{URL.revokeObjectURL(url);toast('이미지로 바꾸지 못했어요.')};img.src=url;
}
function printOnly(node){const area=$('#printArea');area.innerHTML='';area.appendChild(node);document.body.classList.add('printing');const done=()=>{document.body.classList.remove('printing');area.innerHTML='';window.removeEventListener('afterprint',done)};window.addEventListener('afterprint',done);setTimeout(()=>{window.print();setTimeout(done,1000)},60)}
async function copyText(t,msg){try{await navigator.clipboard.writeText(t);toast(msg)}catch(e){toast('복사하지 못했어요. 직접 선택해 복사해 주세요.')}}
// SVG 글자 폭 대략 계산 (한글 1em, 영문·숫자 0.58em)
const estW=(s,size)=>[...s].reduce((a,ch)=>a+(/[ㄱ-힝一-鿿○●♥]/.test(ch)?size:ch===' '?size*.3:size*.58),0);
function wrapLines(text,maxW,measure){
  const out=[];
  for(const para of String(text).split('\n')){
    if(!para.trim()){out.push('');continue}
    let line='';
    for(const word of para.split(' ')){
      const t=line?line+' '+word:word;
      if(measure(t)<=maxW){line=t;continue}
      if(line)out.push(line);
      if(measure(word)<=maxW){line=word}else{let cur='';for(const ch of [...word]){if(measure(cur+ch)>maxW){out.push(cur);cur=ch}else cur+=ch}line=cur}
    }
    out.push(line);
  }
  return out;
}
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function setSeg(attr,val){$$(`[data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===val)))}
function renderSwatches(el,themes,cur,onPick){
  el.innerHTML=Object.entries(themes).map(([k,t])=>`<button type="button" class="swatch" data-k="${k}" aria-pressed="${k===cur}" style="--c:${t.sw||'#'+t.accent};--c2:${t.sw2||'#'+t.soft}"><i></i>${esc(t.name)}</button>`).join('');
  el.querySelectorAll('.swatch').forEach(b=>b.addEventListener('click',()=>onPick(b.dataset.k)));
}
// 날짜 기본값: 3주 뒤 토요일
function defaultMeetIso(){const d=new Date();d.setDate(d.getDate()+21+((6-d.getDay()+7)%7));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}

/* 그림 도우미 (배치도 · 안내장 · 손편지) */
const SERIF="'Noto Serif KR','Nanum Myeongjo','AppleMyungjo','Batang',serif";
const SANS="'Pretendard','Apple SD Gothic Neo','Malgun Gothic',sans-serif";
const flowerCluster=(x,y,s,petal,center)=>{let g=`<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="-26" cy="18" rx="9" ry="20" fill="#a9c9a4" transform="rotate(-50 -26 18)"/><ellipse cx="26" cy="20" rx="9" ry="20" fill="#a9c9a4" transform="rotate(50 26 20)"/>`;for(let i=0;i<5;i++){const a=i*72*Math.PI/180;g+=`<circle cx="${(Math.cos(a)*14).toFixed(1)}" cy="${(Math.sin(a)*14).toFixed(1)}" r="12" fill="${petal}"/>`}return g+`<circle r="8" fill="${center}"/></g>`};
const knot=(x,y,s,c1,c2)=>`<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0c-40-56-88-40-70 4z" fill="${c1}"/><path d="M0 0c40-56 88-40 70 4z" fill="${c1}"/><path d="M0 0c-22-28-54-28-52-6M0 0c22-28 54-28 52-6" fill="none" stroke="${c2}" stroke-width="3"/><circle r="15" fill="${c2}"/></g>`;
const threads=(y,w)=>`<path d="M-10 ${y+20} C ${w*.25} ${y+50}, ${w*.35} ${y-20}, ${w*.5} ${y+10} S ${w*.8} ${y+45}, ${w+10} ${y-5}" fill="none" stroke="#6a86b8" stroke-width="2.5"/><path d="M-10 ${y-10} C ${w*.25} ${y-35}, ${w*.35} ${y+40}, ${w*.5} ${y+10} S ${w*.8} ${y-25}, ${w+10} ${y+30}" fill="none" stroke="#d9837a" stroke-width="2.5"/>`;

/* 자리 배치도 인원을 비용 계산기에서 불러올 수 있도록 이 브라우저에 남긴다 (인원 수만) */
const SEAT_KEY='costcheck_sgr_seat';

/* 공통 화면: 맨 위로 버튼, 모바일 메뉴에서 현재 메뉴를 가운데로, 가이드 예시 문장 복사 */
(()=>{
  const toTop=$('#toTop');
  if(toTop){window.addEventListener('scroll',()=>toTop.classList.toggle('show',scrollY>600),{passive:true});toTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}))}
  const gnb=$('.gnb'),cur=$('.gnb [aria-current="page"]');
  if(gnb&&cur&&gnb.scrollWidth>gnb.clientWidth)gnb.scrollLeft=cur.offsetLeft-(gnb.clientWidth-cur.offsetWidth)/2;
  $$('.say[data-copy]').forEach(box=>{
    const b=document.createElement('button');b.type='button';b.className='copy';b.textContent='복사';
    b.addEventListener('click',()=>copyText(box.querySelector('p').textContent.trim(),'문장을 복사했어요.'));
    box.classList.add('has-copy');box.appendChild(b);
  });
})();
