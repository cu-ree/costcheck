/* 상견례 준비 노트 · 대화 카드 — sgr.js 다음에 불러온다 */
'use strict';
(()=>{
  /* ═════════ 대화 카드 ═════════ */
  const TALK=[
    {k:'첫 인사',who:'예비부부 → 상대 부모님',bg:'#f5e1dc',tip:'이름을 또박또박 말하고, 고개를 숙여 인사한 뒤 앉으세요.',lines:['처음 뵙겠습니다. ○○○입니다. 바쁘신데 이렇게 시간 내주셔서 감사합니다.','먼 길 오시느라 고생 많으셨습니다. 오시는 길은 괜찮으셨어요?','○○ 씨에게 말씀 많이 들었습니다. 직접 뵙게 되어 정말 반갑습니다.','오늘 뵙는다고 생각하니 어제 잠을 설쳤어요. 이렇게 뵈니 마음이 놓입니다.']},
    {k:'가족 소개',who:'예비부부 → 자기 가족 소개',bg:'#e4ebf6',tip:'자기 부모님은 자기가 소개해요. 직업보다 성격이나 취미를 곁들이면 분위기가 편해져요.',lines:['저희 아버지, 어머니이십니다. 아버지는 주말마다 등산을 다니실 만큼 부지런하세요.','어머니께서 오늘 오신다고 일주일 전부터 옷을 고르셨어요.','저희는 형제가 둘이고, 저는 둘째예요. 형은 오늘 일정이 있어 함께 못 왔어요.','저희 부모님은 두 분 다 음식 이야기를 제일 좋아하세요.']},
    {k:'분위기 풀기',who:'누구나',bg:'#e3ece4',tip:'모두가 끼어들 수 있는 질문이 좋아요. 대답이 길어질 질문일수록 어색함이 줄어요.',lines:['여기가 ○○으로 유명하다고 해서 골랐는데, 입에 맞으세요?','두 분은 어떻게 처음 만나셨어요?','○○ 씨는 어렸을 때 어떤 아이였어요?','요즘 즐겨 하시는 운동이나 취미가 있으세요?','고향이 ○○이시라고 들었어요. 저도 여행 가 봤는데 정말 좋더라고요.']},
    {k:'예식 이야기',who:'예비부부 → 양가 부모님',bg:'#f7eed3',tip:'미리 양가와 맞춘 큰 방향만 확인하고, 세부 결정은 미뤄도 괜찮아요.',lines:['식은 내년 봄쯤으로 생각하고 있는데, 두 분 생각은 어떠세요?','준비는 저희 둘이 하나씩 해 보고, 중간중간 말씀드릴게요.','자세한 건 저희가 정리해서 따로 다시 여쭙겠습니다.']},
    {k:'마무리 인사',who:'예비부부 → 상대 부모님',bg:'#ebe4f3',tip:'식당 밖까지 배웅하고, 그날 저녁 짧은 감사 문자를 보내 보세요.',lines:['오늘 이렇게 뵙게 되어 정말 감사했습니다. 조심히 들어가세요.','앞으로 자주 찾아뵙겠습니다. 늘 건강하세요.','다음에는 저희가 좋은 곳으로 모시겠습니다.']},
    {k:'피해 주세요',who:'이런 이야기는 꺼내지 않아요',bg:'#eeeef1',avoid:true,tip:'가벼운 농담으로라도 비교나 금액 이야기는 피하는 게 안전해요.',lines:['집안, 학벌, 직업을 비교하는 말','예단, 예물 금액이나 집 마련 비용 이야기','정치, 종교처럼 생각이 갈리기 쉬운 주제','"저희 집은 원래 이렇게 해요" 같은 단정하는 말','예비부부의 지난 연애나 실수담']}
  ];
  let talkCat=0,talkIdx=0;
  function renderTalk(){
    const c=TALK[talkCat],line=c.lines[talkIdx];
    $('#talkTabs').innerHTML=TALK.map((t,i)=>`<button type="button" class="chip" data-t="${i}" aria-pressed="${i===talkCat}">${t.k}</button>`).join('');
    $$('#talkTabs .chip').forEach(b=>b.addEventListener('click',()=>{talkCat=+b.dataset.t;talkIdx=0;renderTalk()}));
    $('#talkCard').style.background=c.bg;
    $('#talkWho').textContent=c.who;
    $('#talkText').textContent=c.avoid?line:`“${line}”`;
    $('#talkCount').textContent=`${talkIdx+1} / ${c.lines.length}`;
    $('#talkCopy').hidden=!!c.avoid;
    $('#talkListTitle').textContent=c.avoid?'피하면 좋은 이야기':`${c.k} 문장 모아 보기`;
    $('#talkList').innerHTML=c.lines.map((l,i)=>`<li class="${i===talkIdx?'on':''}" data-i="${i}">${esc(l)}</li>`).join('');
    $$('#talkList li').forEach(li=>li.addEventListener('click',()=>{talkIdx=+li.dataset.i;renderTalk()}));
    $('#talkTip').textContent=c.tip;
  }
  $('#talkNext').addEventListener('click',()=>{talkIdx=(talkIdx+1)%TALK[talkCat].lines.length;renderTalk()});
  $('#talkCopy').addEventListener('click',()=>copyText(TALK[talkCat].lines[talkIdx],'문장을 복사했어요.'));
  renderTalk();
})();
