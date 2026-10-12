/* 상견례 준비 노트 · D-day 체크리스트 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ D-day 체크 ═════════ */
  const PHASES=[
    {d:30,t:'한 달 전',items:[['date','양가 날짜와 참석 인원 정하기','형제자매까지 함께할지도 정해요'],['area','만날 지역 정하기','장소 찾기에서 지역별로 둘러보세요']]},
    {d:21,t:'3주 전',items:[['book','식당 예약하기','독립 룸, 주차, 이용 시간 확인'],['refund','예약금과 취소 규정 확인','인원 변경 가능 시점까지']]},
    {d:14,t:'2주 전',items:[['gift','선물 여부와 규모 맞추기','선물 추천에서 예산별로 골라 보세요'],['outfit','옷차림 분위기 맞추기','부모님께도 미리 귀띔'],['ppt','가족 소개 자료 준비 (선택)','가족 소개 PPT로 초안 만들기']]},
    {d:7,t:'1주 전',items:[['seat','자리 배치 정하기','배치도를 가족과 공유해요'],['talk','꺼낼 이야기, 피할 이야기 정리','대화 카드를 참고하세요'],['pay','식사비 낼 사람 정하기','비용 계산기로 미리 계산']]},
    {d:1,t:'하루 전',items:[['confirm','식당 예약 다시 확인','예약자 이름과 시간'],['notice','양가에 안내장 보내기','주소와 주차 안내 포함']]},
    {d:0,t:'당일',items:[['early','20~30분 일찍 도착하기','자리와 메뉴 확인'],['thanks','저녁에 감사 인사 전하기','문자나 손편지로 짧게']]}
  ];
  const CK_KEY='costcheck_sgr_check_v3',DATE_KEY='costcheck_sgr_date';
  let checked=store.get(CK_KEY,[]);if(!Array.isArray(checked))checked=[];
  const savedDate=store.get(DATE_KEY,'');if(typeof savedDate==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(savedDate))$('#meetDate').value=savedDate;
  function renderCheck(){
    const v=$('#meetDate').value;let meet=null,diff=null;
    if(v){const [y,m,d]=v.split('-').map(Number);meet=new Date(y,m-1,d);const n=new Date();diff=Math.round((meet-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5)}
    $('#ddayNum').textContent=diff===null?'D-?':diff>0?`D-${diff}`:diff===0?'D-DAY':`D+${-diff}`;
    $('#ddayDate').textContent=meet?`${meet.getFullYear()}년 ${meet.getMonth()+1}월 ${meet.getDate()}일 (${DOW[meet.getDay()]})`:'날짜를 넣으면 남은 날을 세어 드려요.';
    let nowIdx=-1;if(diff!==null){nowIdx=PHASES.findIndex(p=>diff>=p.d);if(nowIdx===-1)nowIdx=PHASES.length-1}
    const all=PHASES.flatMap(p=>p.items.map(i=>i[0]));
    $('#phases').innerHTML=PHASES.map((p,pi)=>{
      let when='';if(meet){const dd=new Date(meet);dd.setDate(dd.getDate()-p.d);when=`${dd.getMonth()+1}월 ${dd.getDate()}일 (${DOW[dd.getDay()]})${p.d?'까지':''}`}
      const st=diff===null?'':pi===nowIdx?'now':(pi<nowIdx?'past':'');
      const badge=st==='now'?'<em class="now">지금 할 일</em>':st==='past'?'<em class="past">지난 단계</em>':'';
      return `<div class="phase ${st==='now'?'now':''}"><div class="phase-hd"><b>${p.t}</b><span>${when}</span>${badge}</div>`+p.items.map(([id,t,n])=>`<label class="ck"><input type="checkbox" data-id="${id}" ${checked.includes(id)?'checked':''}><span>${esc(t)}<small>${esc(n)}</small></span></label>`).join('')+'</div>';
    }).join('');
    $$('#phases input').forEach(el=>el.addEventListener('change',()=>{const id=el.dataset.id;checked=el.checked?[...new Set([...checked,id])]:checked.filter(x=>x!==id);store.set(CK_KEY,checked);updateProg(all)}));
    updateProg(all);
  }
  function updateProg(all){const done=all.filter(id=>checked.includes(id)).length;$('#progTxt').textContent=`${done} / ${all.length}`;$('#progBar').style.width=(100*done/all.length)+'%'}
  $('#meetDate').addEventListener('change',e=>{store.set(DATE_KEY,e.target.value);renderCheck()});
  $('#resetCheck').addEventListener('click',()=>{checked=[];store.del(CK_KEY);renderCheck();toast('체크를 모두 지웠어요.')});
  renderCheck();
})();
