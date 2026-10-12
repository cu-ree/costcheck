/* 상견례 준비 노트 · 가족 소개 PPT 편집기 — sgr.js, ppt-deck.js 다음에 불러온다
   장 모양은 모두 ppt-deck.js 에 있다. 이 파일은 입력 화면, 사진 처리, 미리보기 배치, 내려받기만 맡는다. */
'use strict';
(()=>{
  const D=window.PptDeck;
  if(!D||!$('#peForm'))return;
  const KEY='costcheck_sgr_ppt_v1';
  const TPLS=Object.keys(D.THEMES);
  const PPTX_CDN='https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
  const MAX_SIDE=1600;   // 올린 사진은 긴 변을 이 크기로 줄여 둔다
  const DPI=200;         // 사진 칸에 넣을 때 해상도 (인치당 픽셀, 긴 변은 MAX_SIDE 이하)

  /* ── 상태: 글자 입력은 브라우저에 임시 저장, 사진은 메모리에만 ── */
  const fresh=()=>({tpl:'rose',c:D.normalize(D.SAMPLE),off:[],dateIso:'2026-11-07',sel:'cover'});
  function load(){
    const v=store.get(KEY,null);if(!v||typeof v!=='object')return fresh();
    return {tpl:TPLS.includes(v.tpl)?v.tpl:'rose',c:D.normalize(v.c),off:Array.isArray(v.off)?v.off.filter(x=>typeof x==='string'):[],dateIso:typeof v.dateIso==='string'?v.dateIso:'',sel:'cover'};
  }
  let st=load();
  const photos={};  // 칸 이름 → {canvas, url}
  let saveT;const save=()=>{clearTimeout(saveT);saveT=setTimeout(()=>store.set(KEY,{tpl:st.tpl,c:st.c,off:st.off,dateIso:st.dateIso}),300)};

  const getP=p=>p.split('.').reduce((o,k)=>o==null?o:o[k],st.c);
  const setP=(p,v)=>{const ks=p.split('.'),last=ks.pop();const o=ks.reduce((a,k)=>a[k],st.c);o[last]=v};
  const photoOn=()=>Object.fromEntries(Object.keys(photos).map(k=>[k,true]));
  const decks=()=>({on:D.buildDeck(st.tpl,st.c,{off:st.off,photos:photoOn()}),all:D.buildDeck(st.tpl,st.c,{photos:photoOn()})});
  const photoUrl=s=>photos[s]&&photos[s].url;

  /* ── 입력 화면 ── */
  const id=p=>'pe_'+p.replace(/\./g,'_');
  const inp=(p,label,o={})=>`<div class="field"><label for="${id(p)}">${label}</label><input class="inp" id="${id(p)}" data-p="${p}" value="${esc(getP(p))}" maxlength="${o.max||40}"${o.ph?` placeholder="${esc(o.ph)}"`:''}></div>`;
  const ta=(p,label,rows=3,o={})=>`<div class="field"><label for="${id(p)}">${label}</label><textarea class="inp" id="${id(p)}" data-p="${p}" rows="${rows}" maxlength="${o.max||400}">${esc(getP(p))}</textarea>${o.help?`<small>${o.help}</small>`:''}</div>`;
  const mini=(p,label,o={})=>`<input class="inp" data-p="${p}" value="${esc(getP(p))}" maxlength="${o.max||30}" aria-label="${esc(label)}"${o.ph?` placeholder="${esc(o.ph)}"`:''}>`;
  const sec=(key,title,body,open)=>`<details class="pe-sec" data-sec="${key}"${open?' open':''}><summary>${title}</summary><div class="pe-sec-body">${body}</div></details>`;
  const openSecs=()=>new Set($$('#peForm details[open]').map(d=>d.dataset.sec));

  function renderForm(){
    const keep=$('#peForm').children.length?openSecs():new Set(['basic']);
    const c=st.c,LIM=D.LIMITS;
    const kv=(arr,label)=>arr.map((_,i)=>`<div class="pe-kv">${mini(`${label}.${i}.0`,`항목 ${i+1} 이름`,{max:12})}${mini(`${label}.${i}.1`,`항목 ${i+1} 내용`)}</div>`).join('');
    const fam=(arr,label)=>arr.map((_,i)=>`<div class="pe-item"><div class="pe-item-hd"><b>${i+1}</b><button type="button" class="btn-ghost" data-del="${label}.${i}"${arr.length<=LIM.family[0]?' disabled':''}>빼기</button></div><div class="two">${inp(`${label}.${i}.0`,'관계',{max:8,ph:'아버지'})}${inp(`${label}.${i}.1`,'이름',{max:10,ph:'김○○'})}</div>${ta(`${label}.${i}.2`,'한 줄 소개',2,{max:40})}</div>`).join('')+(arr.length<LIM.family[1]?`<button type="button" class="btn btn-sm btn-line" data-add="${label}">가족 한 명 더하기</button>`:'')+`<p class="pe-help">한 장에 1~${LIM.family[1]}명까지 들어가요.</p>`;
    const body={
      basic:`<div class="two">${inp('groom','신랑 이름',{max:8})}${inp('bride','신부 이름',{max:8})}</div><div class="two"><div class="field"><label for="pe_date">날짜</label><input class="inp" id="pe_date" type="date" data-date value="${esc(st.dateIso)}"></div>${inp('place','장소',{max:30})}</div>`,
      groomProfile:kv(c.groomProfile,'groomProfile')+'<p class="pe-help">왼쪽은 항목 이름, 오른쪽은 내용이에요. 빈 줄은 빠져요. 첫 줄(이름)은 청홍 모던에서 크게 보여요.</p>',
      brideProfile:kv(c.brideProfile,'brideProfile')+'<p class="pe-help">빈 줄은 빠져요.</p>',
      groomFamily:fam(c.groomFamily,'groomFamily'),
      brideFamily:fam(c.brideFamily,'brideFamily'),
      meet:`<div class="two">${inp('meet.date','날짜',{max:16})}${inp('meet.quoteBy','한마디 설명',{max:24})}</div>${inp('meet.title','제목',{max:30})}${ta('meet.text','이야기',4,{max:200})}${ta('meet.quote','기억에 남는 한마디',2,{max:30,help:'줄을 바꾸면 그대로 반영돼요'})}`,
      moments:c.moments.map((_,i)=>`<div class="pe-item"><div class="pe-item-hd"><b>${i+1}</b></div><div class="pe-three">${mini(`moments.${i}.0`,`${i+1}번 날짜`,{max:10,ph:'2024. 05'})}${mini(`moments.${i}.1`,`${i+1}번 제목`,{max:14})}${mini(`moments.${i}.2`,`${i+1}번 설명`,{max:20})}</div></div>`).join(''),
      reasons:ta('reasons.0','신랑이 결혼을 결심한 이유',4,{max:160})+ta('reasons.1','신부가 결혼을 결심한 이유',4,{max:160}),
      roadmap:c.roadmap.map((_,i)=>`<div class="pe-kv pe-kv-del">${mini(`roadmap.${i}.0`,`${i+1}번 날짜`,{max:10,ph:'2027. 05'})}${mini(`roadmap.${i}.1`,`${i+1}번 일정`,{max:12})}<button type="button" class="btn-ghost" data-del="roadmap.${i}"${c.roadmap.length<=LIM.roadmap[0]?' disabled':''} aria-label="${i+1}번 일정 빼기">빼기</button></div>`).join('')+(c.roadmap.length<LIM.roadmap[1]?'<button type="button" class="btn btn-sm btn-line" data-add="roadmap">일정 더하기</button>':'')+ta('roadmapNote','아래 안내 문구',3,{max:120}),
      status:c.status.map((r,i)=>`<div class="pe-item"><div class="pe-item-hd"><b>${i+1}</b><button type="button" class="btn-ghost" data-del="status.${i}"${c.status.length<=LIM.status[0]?' disabled':''}>빼기</button></div><div class="pe-three">${mini(`status.${i}.0`,`${i+1}번 항목`,{max:10})}${mini(`status.${i}.1`,`${i+1}번 내용`,{max:30})}<select class="inp" data-p="status.${i}.2" aria-label="${i+1}번 진행 상황">${D.STATUS_STATES.map(s=>`<option${s===r[2]?' selected':''}>${s}</option>`).join('')}</select></div></div>`).join('')+(c.status.length<LIM.status[1]?'<button type="button" class="btn btn-sm btn-line" data-add="status">줄 더하기</button>':''),
      venue:kv(c.venue,'venue'),
      promises:c.promises.map((_,i)=>`<div class="pe-item"><div class="pe-item-hd"><b>${i+1}</b></div>${mini(`promises.${i}.0`,`${i+1}번 약속`,{max:20})}${mini(`promises.${i}.1`,`${i+1}번 설명`,{max:40})}</div>`).join(''),
      letter:ta('letter','편지 내용',7,{max:400,help:'줄을 바꾸면 슬라이드에서도 줄이 바뀌어요'}),
      photos:photoList()
    };
    const titles=[['basic','기본 정보'],['groomProfile','신랑 프로필'],['brideProfile','신부 프로필'],['groomFamily','신랑 측 가족'],['brideFamily','신부 측 가족'],['meet','첫 만남 이야기'],['moments','함께한 순간 4개'],['reasons','결혼을 결심한 이유'],['roadmap','준비 타임라인'],['status','준비 현황표'],['venue','예식장 정보'],['promises','약속 4개'],['letter','부모님께 편지'],['photos','사진 넣기']];
    $('#peForm').innerHTML=titles.map(([k,t])=>sec(k,k==='photos'?`${t} <span class="pe-badge">${Object.keys(photos).length}장</span>`:t,body[k],keep.has(k))).join('')+'<div class="pe-form-end"><button type="button" class="btn" data-download>내 PPT 받기</button><button type="button" class="btn-ghost" id="peReset">예시로 되돌리기</button></div>';
  }
  function photoList(){
    const {all}=decks(),seen=new Set(),groups=[];
    for(const s of all.slots){if(seen.has(s.slot))continue;seen.add(s.slot);let g=groups.find(x=>x.slide===s.slide);if(!g)groups.push(g={slide:s.slide,label:(all.slides.find(x=>x.id===s.slide)||{}).label,items:[]});g.items.push(s)}
    return '<p class="pe-help">사진은 서버로 보내지 않고 이 브라우저 안에서 줄이고 잘라요. 칸 모양에 맞게 가운데를 잘라 넣어요.</p>'+groups.map(g=>`<div class="pe-ph-group"><b>${esc(g.label)}</b><ul class="pe-ph-list">${g.items.map(s=>`<li><span class="pe-ph-thumb"${photos[s.slot]?` style="background-image:url(${photos[s.slot].url})"`:''}></span><span class="pe-ph-label">${esc(s.label)}</span><button type="button" class="btn btn-sm btn-line" data-photo="${s.slot}">${photos[s.slot]?'바꾸기':'사진 넣기'}</button>${photos[s.slot]?`<button type="button" class="btn-ghost" data-unphoto="${s.slot}">빼기</button>`:''}</li>`).join('')}</ul></div>`).join('');
  }
  const refreshPhotoList=()=>{const d=$('#peForm details[data-sec="photos"]');if(!d)return;d.querySelector('.pe-sec-body').innerHTML=photoList();d.querySelector('.pe-badge').textContent=Object.keys(photos).length+'장'};

  /* ── 미리보기 ── */
  function renderPreview(){
    const {on,all}=decks(),opt={photoUrl};
    $('#peTpls').innerHTML=TPLS.map(k=>{const d=D.buildDeck(k,st.c,{photos:photoOn()}),T=D.THEMES[k];
      return `<button type="button" class="pe-tpl" data-tpl="${k}" aria-pressed="${k===st.tpl}">${D.toHtml(d,d.slides[0],opt)}<b>${esc(T.name)}</b><span>${esc(T.desc)} · ${d.slides.length}장</span></button>`}).join('');
    if(!all.slides.some(s=>s.id===st.sel))st.sel='cover';
    $('#peThumbs').innerHTML=all.slides.map(sd=>{
      const inc=on.slides.find(x=>x.id===sd.id),n=inc?on.slides.indexOf(inc)+1:'',auto=!inc&&!st.off.includes(sd.id);
      return `<li class="pe-thumb${inc?'':' off'}${sd.id===st.sel?' sel':''}"><button type="button" class="pe-thumb-pic" data-sel="${sd.id}" aria-label="${esc(sd.label)} 크게 보기">${D.toHtml(inc?on:all,inc||sd,opt)}</button><label class="pe-thumb-lab"><input type="checkbox" data-toggle="${sd.id}"${inc||auto?' checked':''}${sd.id==='cover'||auto?' disabled':''}><span>${n?n+'. ':''}${esc(sd.label)}${auto?' (장이 비어 빠짐)':''}</span></label></li>`}).join('');
    const cur=on.slides.find(x=>x.id===st.sel),sd=cur||all.slides.find(x=>x.id===st.sel);
    $('#peStage').innerHTML=D.toHtml(cur?on:all,sd,opt);
    $('#peStage').classList.toggle('off',!cur);
    $('#peStageLabel').textContent=cur?`${on.slides.indexOf(cur)+1} / ${on.slides.length} · ${sd.label}`:`${sd.label} (빠진 장)`;
    $('#peCount').textContent=`${on.slides.length}장 · 사진 ${Object.keys(photos).length}장`;
  }
  let renderT;const schedule=()=>{clearTimeout(renderT);renderT=setTimeout(renderPreview,120)};

  /* ── 사진: 브라우저 안에서 줄이고, 칸 모양대로 잘라 넣는다 ── */
  let pendingSlot=null;
  const pickPhoto=slot=>{pendingSlot=slot;const f=$('#peFile');f.value='';f.click()};
  function loadImage(file){return new Promise((res,rej)=>{const url=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(url);res(img)};img.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('img'))};img.src=url})}
  async function addPhoto(slot,file){
    if(!file||!/^image\//.test(file.type)){toast('사진 파일을 골라 주세요.');return}
    try{
      const img=await loadImage(file),k=Math.min(1,MAX_SIDE/Math.max(img.naturalWidth,img.naturalHeight));
      const c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.naturalWidth*k));c.height=Math.max(1,Math.round(img.naturalHeight*k));
      const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);
      photos[slot]={canvas:c,url:c.toDataURL('image/jpeg',0.88)};
      refreshPhotoList();schedule();toast('사진을 넣었어요.');
    }catch(e){toast('사진을 읽지 못했어요. 다른 파일로 해 보세요.')}
  }
  function photoData(it){
    const p=photos[it.slot];if(!p)return null;
    const {w,h}=it.o,ar=w/h,src=p.canvas;
    let ow=Math.min(MAX_SIDE,Math.round(w*DPI)),oh=Math.round(ow/ar);if(oh>MAX_SIDE){oh=MAX_SIDE;ow=Math.round(oh*ar)}
    let cw=src.width,ch=cw/ar;if(ch>src.height){ch=src.height;cw=ch*ar}
    const c=document.createElement('canvas');c.width=ow;c.height=oh;const x=c.getContext('2d');
    if(it.shape!=='rect'){
      x.beginPath();
      if(it.shape==='circle')x.ellipse(ow/2,oh/2,ow/2,oh/2,0,0,Math.PI*2);
      else{const R=Math.min(ow/2,oh/2,(it.o.rectRadius||0)/w*ow);x.moveTo(R,0);x.arcTo(ow,0,ow,oh,R);x.arcTo(ow,oh,0,oh,R);x.arcTo(0,oh,0,0,R);x.arcTo(0,0,ow,0,R);x.closePath()}
      x.clip();
    }
    x.drawImage(src,(src.width-cw)/2,(src.height-ch)/2,cw,ch,0,0,ow,oh);
    return c.toDataURL(it.shape==='rect'?'image/jpeg':'image/png',0.86).replace(/^data:/,'');
  }
  function rasterize(svg,px){return new Promise((res,rej)=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=px;c.getContext('2d').drawImage(img,0,0,px,px);res(c.toDataURL('image/png').replace(/^data:/,''))};img.onerror=rej;img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)})}

  /* ── 내려받기 ── */
  const safe=s=>String(s||'').replace(/[\\/:*?"<>|\s]+/g,'').slice(0,12);
  let busy=false;
  async function downloadPpt(){
    if(busy)return;busy=true;
    const btns=$$('#peDown,[data-download]');btns.forEach(b=>{b.disabled=true;b.textContent='만드는 중…'});
    try{
      if(!window.PptxGenJS)await loadScript(PPTX_CDN);
      const {on}=decks();
      const pres=await D.toPptx(window.PptxGenJS,on,{rasterize,photoData:it=>photoData(it)});
      const name=`상견례PPT_${safe(st.c.groom)||'신랑'}_${safe(st.c.bride)||'신부'}.pptx`;
      await pres.writeFile({fileName:name,compression:true});
      toast(`${on.slides.length}장짜리 PPT를 받았어요. 파워포인트에서 열어 보세요.`);
    }catch(e){console.error(e);toast('PPT 파일을 만들지 못했어요. 인터넷 연결을 확인해 주세요.')}
    finally{busy=false;btns.forEach(b=>{b.disabled=false;b.textContent='내 PPT 받기'})}
  }

  /* ── 이벤트 ── */
  const form=$('#peForm');
  form.addEventListener('input',e=>{
    const t=e.target;
    if(t.dataset.p){setP(t.dataset.p,t.value);save();schedule()}
    else if('date' in t.dataset){st.dateIso=t.value;st.c.date=t.value?fmtDate(t.value):'';save();schedule()}
  });
  form.addEventListener('change',e=>{if(e.target.tagName==='SELECT'&&e.target.dataset.p){setP(e.target.dataset.p,e.target.value);save();schedule()}});
  form.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.add){const arr=st.c[b.dataset.add];arr.push(b.dataset.add==='status'?['','','예정']:b.dataset.add==='roadmap'?['','']:['','','']);save();renderForm();schedule()}
    else if(b.dataset.del){const [k,i]=b.dataset.del.split('.');st.c[k].splice(+i,1);
      // 가족을 빼면 그 뒤 가족의 사진도 한 칸씩 당긴다
      if(/Family$/.test(k)){const pre=k==='groomFamily'?'gfam':'bfam';for(let j=+i;j<6;j++){if(photos[pre+(j+1)])photos[pre+j]=photos[pre+(j+1)];else delete photos[pre+j]}}
      save();renderForm();schedule()}
    else if(b.dataset.photo)pickPhoto(b.dataset.photo);
    else if(b.dataset.unphoto){delete photos[b.dataset.unphoto];refreshPhotoList();schedule()}
    else if('download' in b.dataset)downloadPpt();
    else if(b.id==='peReset'){if(confirm('입력한 내용을 지우고 예시로 되돌릴까요? 넣은 사진도 빠져요.')){const tpl=st.tpl;st=fresh();st.tpl=tpl;for(const k in photos)delete photos[k];store.del(KEY);renderForm();renderPreview();toast('예시로 되돌렸어요.')}}
  });
  $('#peFile').addEventListener('change',e=>{const f=e.target.files[0];if(pendingSlot&&f)addPhoto(pendingSlot,f)});
  $('#peTpls').addEventListener('click',e=>{const b=e.target.closest('[data-tpl]');if(!b||b.dataset.tpl===st.tpl)return;st.tpl=b.dataset.tpl;save();refreshPhotoList();renderPreview();toast(`${josa(D.THEMES[st.tpl].name,'으로','로')} 바꿨어요.`)});
  $('#peThumbs').addEventListener('click',e=>{const b=e.target.closest('[data-sel]');if(b){st.sel=b.dataset.sel;renderPreview()}});
  $('#peThumbs').addEventListener('change',e=>{const t=e.target.dataset.toggle;if(!t)return;st.off=e.target.checked?st.off.filter(x=>x!==t):[...new Set([...st.off,t])];save();renderPreview()});
  $('#peStage').addEventListener('click',e=>{const s=e.target.closest('[data-slot]');if(s)pickPhoto(s.dataset.slot)});
  const step=d=>{const {all}=decks(),i=all.slides.findIndex(x=>x.id===st.sel);st.sel=all.slides[(i+d+all.slides.length)%all.slides.length].id;renderPreview()};
  $('#pePrev').addEventListener('click',()=>step(-1));$('#peNext').addEventListener('click',()=>step(1));
  $('#peDown').addEventListener('click',downloadPpt);

  renderForm();renderPreview();
})();
