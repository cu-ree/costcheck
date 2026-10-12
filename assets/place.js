/* 상견례 준비 노트 · 장소 찾기 — sgr.js, place/config.js 다음에 불러온다
   - 추천 장소: place/venues.json (직접 확인한 곳만. 형식은 place/README.md)
   - 지도: config.js 에 NAVER_MAP_CLIENT_ID 가 있으면 네이버 지도, 없거나 인증에 실패하면 타일 지도 */
'use strict';
(()=>{
  const CFG=window.SGR_PLACE_CONFIG||{};
  const KR=[['인천',0,0],['서울',1,0],['경기',2,0],['강원',3,0],['충남',0,1],['세종',1,1],['충북',2,1],['경북',3,1],['전북',0,2],['대전',1,2],['대구',2,2],['울산',3,2],['광주',0,3],['전남',1,3],['경남',2,3],['부산',3,3],['제주',0,4]];
  const SEOUL=[['은평구',2,0],['종로구',3,0],['성북구',4,0],['강북구',5,0],['도봉구',6,0],['강서구',0,1],['마포구',1,1],['서대문구',2,1],['중구',3,1],['동대문구',4,1],['중랑구',5,1],['노원구',6,1],['양천구',0,2],['영등포구',1,2],['용산구',2,2],['성동구',3,2],['광진구',4,2],['강동구',5,2],['구로구',0,3],['동작구',1,3],['서초구',2,3],['강남구',3,3],['송파구',4,3],['금천구',0,4],['관악구',1,4]];
  // 네이버 지도에서 지역을 고를 때 가운데로 옮길 위치 (대략적인 시청·도청 근처)
  const CENTER={서울:[37.5665,126.978],부산:[35.1796,129.0756],대구:[35.8714,128.6014],인천:[37.4563,126.7052],광주:[35.1595,126.8526],대전:[36.3504,127.3845],울산:[35.5384,129.3114],세종:[36.4801,127.289],경기:[37.4138,127.5183],강원:[37.8228,128.1555],충북:[36.8,127.7],충남:[36.5184,126.8],전북:[35.7175,127.153],전남:[34.8679,126.991],경북:[36.4919,128.8889],경남:[35.4606,128.2132],제주:[33.4996,126.5312]};
  const VTYPES=[
    {t:'한정식',d:'어르신 입맛에 가장 무난하고 코스가 차분해요',c:'#e3ece4',f:'#5e8c6a'},
    {t:'호텔 한식당',d:'룸과 서비스가 안정적이고 주차가 편해요',c:'#e4ebf6',f:'#2a4a7a'},
    {t:'일식 코스',d:'조용한 룸이 많고 코스 구성이 깔끔해요',c:'#f5e1dc',f:'#c25b51'},
    {t:'중식 코스',d:'원형 테이블이라 대화가 고르게 오가요',c:'#f7eed3',f:'#a77d1f'},
    {t:'양식 코스',d:'젊은 분위기를 원할 때, 메뉴 설명이 쉬워요',c:'#ebe4f3',f:'#7a5aa6'}
  ];
  const vtype=t=>VTYPES.find(v=>v.t===t||v.t.startsWith(String(t||'').replace(/ 코스$/,'')))||VTYPES[0];

  let VENUES=[];          // venues.json 에서 읽은 목록
  let placeSel=null;
  let nmap=null,markers=[],info=null;   // 네이버 지도 (키가 있을 때만)

  const inRegion=(v,r)=>{const [sido,gu]=r.split(' ');return v.sido===sido&&(!gu||v.gu===gu)};
  const regionsWithVenues=()=>new Set(VENUES.flatMap(v=>[v.sido,v.sido+' '+v.gu]));
  const validVenue=v=>v&&typeof v==='object'&&v.name&&v.sido;
  const hasPos=v=>Number.isFinite(+v.lat)&&Number.isFinite(+v.lng)&&+v.lat&&+v.lng;

  /* ── 타일 지도 ── */
  function renderTiles(){
    const has=regionsWithVenues();
    const mk=(list,prefix)=>list.map(([n,c,r])=>{const key=prefix+n,venue=has.has(key)?' has-venue':'';
      return `<button type="button" class="tile${prefix===''&&n==='서울'?' has-sub':''}${venue}" style="grid-column:${c+1};grid-row:${r+1}" data-r="${esc(key)}" aria-pressed="${placeSel===key}">${esc(prefix&&n.length>2?n.replace(/구$/,''):n)}</button>`}).join('');
    $('#tilesKr').innerHTML=mk(KR,'');
    $('#tilesSeoul').innerHTML=mk(SEOUL,'서울 ');
  }
  function showSeoul(on){$('#tilesKr').hidden=on;$('#tilesSeoul').hidden=!on;$('#mapBack').hidden=!on;$('#mapTitle').textContent=on?'서울':'전국';$('#mapHint').textContent=on?'자치구를 누르면 그 지역에서 찾을 수 있는 상견례 장소 유형을 보여 드려요.':'실제 위치를 단순화한 타일 지도예요. 빨간 점이 있는 지역은 한 번 더 누르면 자세히 볼 수 있어요.'}

  /* ── 결과: 추천 카드 + 유형별 검색 ── */
  function venueCard(v,i){
    const room=v.room&&typeof v.room==='object'?[v.room.private?'독립 룸':'',v.room.max?`최대 ${v.room.max}명`:''].filter(Boolean).join(' · '):'';
    const link=v.naverMap||`https://map.naver.com/p/search/${encodeURIComponent([v.name,v.address].filter(Boolean).join(' '))}`;
    const rows=[['1인',v.price],['룸',room],['주차',v.parking],['주소',v.address]].filter(r=>r[1]);
    return `<article class="venue-card" data-vi="${i}"><div class="venue-hd"><b>${esc(v.name)}</b><span class="venue-type" style="background:${vtype(v.type).c};color:${vtype(v.type).f}">${esc(v.type||'')}</span></div>`+
      (v.note?`<p class="venue-note">${esc(v.note)}</p>`:'')+
      `<dl>${rows.map(([k,val])=>`<dt>${k}</dt><dd>${esc(val)}</dd>`).join('')}</dl>`+
      `<div class="venue-ft">${v.checked?`<span>${esc(v.checked)} 직접 확인</span>`:'<span></span>'}<span class="venue-links">${nmap&&hasPos(v)?`<button type="button" class="btn-ghost" data-focus="${i}">지도에서 보기</button>`:''}<a href="${esc(link)}" target="_blank" rel="noopener">네이버 지도</a></span></div></article>`;
  }
  function pickRegion(r,opts={}){
    if(!nmap&&r==='서울'&&placeSel==='서울'&&!opts.keep){showSeoul(true);return}
    placeSel=r;
    if(!nmap)renderTiles();else syncSelect();
    const list=VENUES.map((v,i)=>[v,i]).filter(([v])=>inRegion(v,r));
    const q=t=>encodeURIComponent(`${r} ${t} 룸`);
    let html=`<h3>${esc(r)}</h3>`;
    if(list.length){
      html+=`<p>직접 확인한 상견례 장소 ${list.length}곳이에요. 가격과 룸 조건은 확인한 날짜 기준이라 예약 전에 다시 물어보세요.</p><div class="venue-list">${list.map(([v,i])=>venueCard(v,i)).join('')}</div><h4 class="vtypes-hd">이 지역에서 더 찾아보기</h4>`;
    }else{
      html+=`<p>${r==='서울'&&!nmap?'서울 전체로 찾거나, 한 번 더 누르면 자치구별로 볼 수 있어요.':'아래 유형 중 양가 취향에 맞는 걸 골라 지도에서 바로 찾아보세요.'}</p>`;
    }
    html+=`<div class="vtypes">${VTYPES.map(v=>`<div class="vtype"><i style="background:${v.c};color:${v.f}">${esc(v.t.slice(0,2))}</i><div><b>${esc(v.t)}</b><span>${esc(v.d)}</span></div><div class="links"><a href="https://map.naver.com/p/search/${q(v.t)}" target="_blank" rel="noopener">네이버 지도</a><a href="https://map.kakao.com/?q=${q(v.t)}" target="_blank" rel="noopener">카카오맵</a></div></div>`).join('')}</div>`;
    html+=`<div class="ask"><h4>예약 전화할 때 물어볼 다섯 가지</h4><ol><li>문을 닫을 수 있는 독립된 룸인가요?</li><li>예약 인원이 모두 한 테이블에 앉을 수 있나요?</li><li>룸 이용 시간 제한이나 최소 주문 금액이 있나요?</li><li>주차를 지원하고, 엘리베이터를 쓸 수 있나요?</li><li>알레르기나 어르신 식사에 맞춰 조정할 수 있나요?</li></ol></div>`;
    $('#placeResult').innerHTML=html;
    if(nmap)fitRegion(r,list.map(([v])=>v));
    if(!opts.noScroll&&innerWidth<=960)$('#placeResult').scrollIntoView({behavior:'smooth',block:'start'});
  }

  /* ── 네이버 지도 (NCP Maps JavaScript API v3) ── */
  function loadNaverMap(id){
    return new Promise((res,rej)=>{
      // 키나 서비스 URL 이 맞지 않으면 네이버가 이 함수를 부른다 (스크립트를 다 받은 뒤에 부를 수도 있음)
      window.navermap_authFailure=()=>{rej(new Error('auth'));useTiles('auth')};
      const s=document.createElement('script');
      s.src='https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId='+encodeURIComponent(id);
      s.onload=()=>window.naver&&naver.maps?res():rej(new Error('load'));s.onerror=()=>rej(new Error('load'));
      document.head.appendChild(s);
    });
  }
  function initNaverMap(){
    const N=naver.maps;
    $('#tileWrap').hidden=true;$('#nmapWrap').hidden=false;$('#mapBack').hidden=true;
    $('#mapTitle').textContent='네이버 지도';
    nmap=new N.Map('nmap',{center:new N.LatLng(36.3,127.8),zoom:7,zoomControl:true,zoomControlOptions:{position:N.Position.TOP_RIGHT}});
    info=new N.InfoWindow({borderWidth:0,backgroundColor:'transparent',disableAnchor:true,pixelOffset:new N.Point(0,-6)});
    markers=VENUES.map((v,i)=>{
      if(!hasPos(v))return null;
      const m=new N.Marker({position:new N.LatLng(+v.lat,+v.lng),map:nmap,title:v.name});
      N.Event.addListener(m,'click',()=>{pickRegion(v.gu?`${v.sido} ${v.gu}`:v.sido,{keep:true,noScroll:true});focusVenue(i)});
      return m;
    });
    const sel=$('#regionSelect');
    sel.innerHTML='<option value="">지역을 골라 주세요</option>'+KR.map(([n])=>`<option>${n}</option>`).join('')+'<optgroup label="서울 자치구">'+SEOUL.map(([n])=>`<option value="서울 ${n}">서울 ${n}</option>`).join('')+'</optgroup>';
    sel.addEventListener('change',()=>{if(sel.value)pickRegion(sel.value,{keep:true})});
    $('#mapHint').textContent=VENUES.length?`직접 확인한 추천 장소 ${VENUES.length}곳이 표시돼요. 표시를 누르거나 지역을 고르세요.`:'지역을 고르면 상견례에 맞는 식당 유형과 바로 검색할 수 있는 링크를 보여 드려요.';
  }
  const syncSelect=()=>{const s=$('#regionSelect');if(s)s.value=placeSel||''};
  function fitRegion(r,list){
    const N=naver.maps,pts=list.filter(hasPos).map(v=>new N.LatLng(+v.lat,+v.lng));
    if(pts.length>1){const b=new N.LatLngBounds(pts[0],pts[0]);pts.forEach(p=>b.extend(p));nmap.fitBounds(b,{top:40,right:40,bottom:40,left:40})}
    else if(pts.length===1){nmap.setCenter(pts[0]);nmap.setZoom(15)}
    else{const c=CENTER[r.split(' ')[0]];if(c){nmap.setCenter(new N.LatLng(c[0],c[1]));nmap.setZoom(r.includes(' ')?13:r==='서울'?11:9)}}
  }
  function focusVenue(i){
    const v=VENUES[i],m=markers[i];if(!m)return;
    nmap.setCenter(m.getPosition());if(nmap.getZoom()<15)nmap.setZoom(15);
    info.setContent(`<div class="nmap-info"><b>${esc(v.name)}</b><span>${esc(v.type||'')}${v.price?' · '+esc(v.price):''}</span></div>`);info.open(nmap,m);
    $$('.venue-card').forEach(c=>c.classList.toggle('on',+c.dataset.vi===i));
  }

  /* ── 시작 ── */
  $('#tilesKr').addEventListener('click',e=>{const b=e.target.closest('.tile');if(b)pickRegion(b.dataset.r)});
  $('#tilesSeoul').addEventListener('click',e=>{const b=e.target.closest('.tile');if(b)pickRegion(b.dataset.r)});
  $('#mapBack').addEventListener('click',()=>showSeoul(false));
  $('#placeResult').addEventListener('click',e=>{const b=e.target.closest('[data-focus]');if(b){focusVenue(+b.dataset.focus);$('#nmapWrap').scrollIntoView({behavior:'smooth',block:'center'})}});
  renderTiles();
  fetch('venues.json',{cache:'no-cache'}).then(r=>r.ok?r.json():{venues:[]}).catch(()=>({venues:[]})).then(async data=>{
    VENUES=(Array.isArray(data.venues)?data.venues:[]).filter(validVenue);
    renderTiles();
    const id=String(CFG.NAVER_MAP_CLIENT_ID||'').trim();
    if(!id)return;
    try{await loadNaverMap(id);initNaverMap();if(placeSel)pickRegion(placeSel,{keep:true,noScroll:true})}
    catch(e){useTiles(e.message)}
  });
  function useTiles(why){
    if(!$('#tileWrap').hidden&&!nmap)return;
    console.warn('네이버 지도를 쓸 수 없어 타일 지도를 보여 줍니다:',why);
    nmap=null;markers=[];$('#tileWrap').hidden=false;$('#nmapWrap').hidden=true;showSeoul(false);renderTiles();
    if(placeSel)pickRegion(placeSel,{keep:true,noScroll:true});
  }
})();
