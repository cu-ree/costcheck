/* 상견례 가족 소개 PPT 공통 정의 (costcheck.kr/ppt/)
 *
 * 브라우저 편집기(ppt.js)와 견본 파일 생성기(ppt/tools/build.js)가 이 파일 하나를 같이 쓴다.
 * 장 레이아웃은 buildDeck()가 "데이터"(도형·글자·아이콘·표·사진 칸 목록)로 한 번만 만들고,
 *   - toHtml()  : 그 데이터로 미리보기 HTML을 그리고
 *   - toPptx()  : 같은 데이터로 PptxGenJS 파일을 만든다.
 * 그래서 미리보기와 받은 파일의 장 구성·위치가 같다.
 *
 * 단위: 위치·크기는 인치(슬라이드 13.333 × 7.5), 글자 크기는 pt. 옵션 이름은 PptxGenJS 그대로 쓴다.
 * 템플릿 추가: THEMES 에 항목을 더하고, 표지처럼 템플릿마다 모양이 다른 곳은 key 로 분기한다.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PptDeck = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const F = 'Malgun Gothic';
  const W = 13.333, H = 7.5, M = 0.8, CW = W - 2 * M;
  const jong = s => { s = String(s || '').trim(); const c = s.charCodeAt(s.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
  const clone = o => JSON.parse(JSON.stringify(o));

  /* ───────── 아이콘 (react-icons Fi/Fa 와 같은 모양) ───────── */
  const ICON_PATHS = {
    camera: c => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    heartLine: c => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heart: c => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="#${c}"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg>`
  };
  // px 를 주면 width/height 를 넣는다 (PNG 로 바꿀 때)
  const iconSvg = (name, color, px) => { const s = ICON_PATHS[name](color); return px ? s.replace('<svg ', `<svg width="${px}" height="${px}" `) : s; };

  /* ───────── 테마 4종 ───────── */
  const THEMES = {
    rose: {
      file: '상견례PPT_01_로즈다이어리', name: '로즈 다이어리', desc: '흰 바탕에 장밋빛 포인트, 둥근 사진 칸과 원형 가족 사진',
      bg: 'FFFFFF', ink: '3B2B2B', sub: '8A7470', accent: 'C47478', soft: 'F7E6E4', soft2: 'FCF4F3', line: 'EAD6D3', groom: '6F86AE', bride: 'C47478', pop: 'D99A6C',
      disp: 'Cambria', title: { align: 'center', x: M, y: 0.5, w: CW, h: 0.8, size: 28 }, ct: 1.6,
      photo: 'round', family: 'circle', moment: 'round', profileBoth: false, dividers: false
    },
    modern: {
      file: '상견례PPT_02_청홍모던', name: '청홍 모던', desc: '청색은 신랑, 홍색은 신부. 두 사람을 한 장에 소개',
      bg: 'F1F2F5', ink: '2A2E35', sub: '767C8A', accent: '3E6DB5', soft: 'EEF1F6', soft2: 'F6F7FA', line: 'E1E5EC', groom: '3E6DB5', bride: 'D9667F', pop: 'D9667F',
      disp: 'Calibri', title: { align: 'center', x: M, y: 0.55, w: CW, h: 0.8, size: 28 }, ct: 1.65,
      photo: 'soft', family: 'card', moment: 'soft', profileBoth: true, dividers: false
    },
    picnic: {
      file: '상견례PPT_03_봄소풍', name: '봄 소풍', desc: '연둣빛 바탕에 폴라로이드 사진 칸과 마스킹 테이프',
      bg: 'F3F7EC', ink: '33402F', sub: '6B7864', accent: '6E9A69', soft: 'E2ECD6', soft2: 'FFFFFF', line: 'D6E2C8', groom: '5C86B0', bride: 'E0806A', pop: 'F2A65A',
      disp: 'Calibri', title: { align: 'left', x: 1.25, y: 0.5, w: 10.5, h: 0.8, size: 28 }, ct: 1.6,
      photo: 'polaroid', family: 'polaroid', moment: 'polaroid', profileBoth: false, dividers: false
    },
    navy: {
      file: '상견례PPT_04_네이비챕터', name: '네이비 챕터', desc: '짙은 남색 표지와 금색 테두리, 장마다 구분 페이지',
      bg: 'FFFFFF', ink: '1F2A44', sub: '687087', accent: 'B08D57', soft: 'EEF0F5', soft2: 'F6F7FA', line: 'DFE2EA', groom: '3F5A8C', bride: 'B0646A', pop: 'B08D57', dark: '1F2A44', dark2: '2B3756',
      disp: 'Cambria', title: { align: 'left', x: M, y: 0.72, w: CW, h: 0.75, size: 28 }, ct: 1.75,
      photo: 'frame', family: 'frame', moment: 'frame', profileBoth: false, dividers: true
    }
  };

  /* ───────── 예시 내용 (편집기 기본값 = 견본 파일 내용) ───────── */
  const SAMPLE = {
    groom: '철수', bride: '은혜',
    date: '2026년 11월 7일 토요일', place: '○○ 한정식 2층 연회룸',
    groomProfile: [['이름', '김철수'], ['생년월일', '1995. 03. 14'], ['직업', 'IT 회사 개발자'], ['MBTI', 'ISTJ'], ['성격', '차분하고 꼼꼼해요'], ['취미', '등산, 캠핑'], ['좋아하는 음식', '된장찌개, 회']],
    brideProfile: [['이름', '이은혜'], ['생년월일', '1996. 08. 22'], ['직업', '초등학교 교사'], ['MBTI', 'ENFP'], ['성격', '밝고 다정해요'], ['취미', '베이킹, 여행'], ['좋아하는 음식', '파스타, 떡볶이']],
    groomFamily: [['아버지', '김○○', '주말마다 산에 오르시는\n든든한 아버지'], ['어머니', '박○○', '요리 솜씨가 좋으신\n다정한 어머니'], ['형', '김○○', '조카 바보,\n듬직한 형'], ['형수', '최○○', '늘 먼저 챙겨 주는\n고마운 형수님']],
    brideFamily: [['아버지', '이○○', '말수는 적어도\n정이 많으신 아버지'], ['어머니', '정○○', '웃음이 많은\n우리 집 분위기 메이커'], ['언니', '이○○', '제일 친한 친구 같은\n든든한 언니'], ['남동생', '이○○', '막내지만\n누구보다 듬직해요']],
    meet: { date: '2022. 04. 16', title: '친구의 소개로 처음 만났어요', text: '성수동의 작은 카페에서 처음 만났습니다. 좋아하는 음식도, 웃는 포인트도 닮아서 세 시간이 금방 지나갔어요. 헤어지기 아쉬워 한 번 더 만나자고 한 그날이 우리의 시작이었습니다.', quote: '“커피 한 잔\n더 하실래요?”', quoteBy: '그날 철수가 건넨 한마디' },
    moments: [['2022. 04', '첫 만남', '성수동 작은 카페에서'], ['2022. 10', '첫 여행', '강릉 바다를 보러'], ['2024. 05', '함께한 2년', '제주도에서 한 달 살기'], ['2026. 06', '프러포즈', '처음 만난 그 카페에서']],
    reasons: ['은혜와 있으면 하루의 끝이 편안해요. 힘든 날에도 웃게 해 주는 사람이라 평생 곁에서 지켜 주고 싶었습니다.', '철수는 말보다 행동으로 마음을 보여 주는 사람이에요. 작은 약속도 꼭 지키는 모습을 보며 이 사람이면 되겠다고 생각했어요.'],
    roadmap: [['2026. 11', '상견례'], ['2026. 12', '예식장 계약'], ['2027. 02', '웨딩 촬영'], ['2027. 03', '예물 · 혼수'], ['2027. 04', '신혼집 입주'], ['2027. 05', '결혼식']],
    roadmapNote: '지금은 상견례를 마치고 예식장을 알아보고 있어요. 큰 일정은 두 사람이 정리해서 양가에 미리 말씀드릴게요.',
    status: [['예식 날짜', '2027년 5월 15일 토요일 낮 12시', '확정'], ['예식장', '○○웨딩홀 3층 그랜드홀', '계약 완료'], ['스드메', '업체 비교 중', '진행 중'], ['신혼여행', '이탈리아 8박 9일', '예정'], ['신혼집', '○○동 아파트', '계약 완료'], ['예물 · 예단', '양가와 상의해 간소하게', '상의 중']],
    venue: [['예식장', '○○웨딩홀 3층 그랜드홀'], ['일시', '2027년 5월 15일 토요일 낮 12시'], ['주소', '서울 ○○구 ○○로 00'], ['식사', '한식 코스'], ['주차', '건물 지하 주차장 2시간 무료']],
    promises: [['서로의 부모님을 내 부모님처럼', '양가 어른들께 자주 연락드리고 마음을 쓰겠습니다.'], ['작은 일도 함께 의논하기', '중요한 결정은 꼭 둘이 상의해서 정하겠습니다.'], ['한 달에 한 번은 찾아뵙기', '바쁘더라도 양가를 번갈아 찾아뵙겠습니다.'], ['웃음이 많은 집 만들기', '서로에게 다정한 말을 아끼지 않겠습니다.']],
    letter: '오늘 이렇게 두 가족이 한자리에 모일 수 있어 정말 감사합니다.\n지금까지 저희를 사랑으로 키워 주신 마음 잊지 않고,\n서로 아끼고 존중하며 예쁘게 살겠습니다.\n부족한 점이 있더라도 너그러이 지켜봐 주세요.\n늘 건강하세요. 사랑합니다.'
  };
  const STATUS_STATES = ['확정', '계약 완료', '진행 중', '예정', '상의 중'];
  const CHAPTERS = [['우리를 소개합니다', '신랑 · 신부 소개'], ['우리 가족', '양가 가족 소개'], ['우리의 이야기', '첫 만남부터 결혼 결심까지'], ['결혼 준비', '일정 · 현황 · 예식장'], ['앞으로', '약속과 감사 인사']];
  const LIMITS = { family: [1, 6], roadmap: [2, 6], status: [1, 6], profile: 7, venue: 5 };
  const PHOTO_NOTE = '사진 넣는 법: 사진 칸을 선택하고 마우스 오른쪽 → [도형 서식] → 채우기 → [그림 또는 질감 채우기] → [삽입]을 누르면 칸 모양 그대로 사진이 들어가요. 글자는 눌러서 바로 고치면 됩니다.';

  /* 장 목록 (편집기의 장 켜고 끄기 기준). chapter 는 목차·구분 페이지에 쓰는 장 번호 */
  function slideList(key) {
    const T = THEMES[key], L = [];
    const add = (id, label, chapter) => L.push({ id, label, chapter });
    add('cover', '표지'); add('contents', '목차');
    if (T.dividers) add('div0', '장 구분: 우리를 소개합니다', -1);
    if (T.profileBoth) add('profile', '신랑 · 신부 소개', 0); else { add('profileG', '신랑 소개', 0); add('profileB', '신부 소개', 0); }
    if (T.dividers) add('div1', '장 구분: 우리 가족', -1);
    add('famG', '신랑 측 가족', 1); add('famB', '신부 측 가족', 1);
    if (T.dividers) add('div2', '장 구분: 우리의 이야기', -1);
    add('meet', '첫 만남', 2); add('moments', '함께한 시간들', 2); add('reasons', '결혼을 결심한 이유', 2);
    if (T.dividers) add('div3', '장 구분: 결혼 준비', -1);
    add('timeline', '준비 타임라인', 3); add('status', '준비 현황', 3); add('venue', '예식장 소개', 3); add('wedding', '웨딩 촬영', 3);
    if (T.dividers) add('div4', '장 구분: 앞으로', -1);
    add('promises', '앞으로의 약속', 4); add('letter', '부모님께 편지', 4); add('qa', 'Q & A'); add('thanks', '감사 인사');
    return L;
  }

  /* 사용자가 넣은 값을 기본 구조에 맞춰 정리 (빈 값·잘못된 값 방어) */
  function normalize(c) {
    const S = SAMPLE, o = Object.assign(clone(S), c || {});
    const str = v => (v == null ? '' : String(v));
    const rows = (v, def, n) => (Array.isArray(v) ? v : def).map(r => (Array.isArray(r) ? r : []).slice(0, n).map(str)).map(r => { while (r.length < n) r.push(''); return r; });
    o.groom = str(o.groom); o.bride = str(o.bride); o.date = str(o.date); o.place = str(o.place);
    o.groomProfile = rows(o.groomProfile, S.groomProfile, 2).slice(0, LIMITS.profile);
    o.brideProfile = rows(o.brideProfile, S.brideProfile, 2).slice(0, LIMITS.profile);
    o.groomFamily = rows(o.groomFamily, S.groomFamily, 3).slice(0, LIMITS.family[1]);
    o.brideFamily = rows(o.brideFamily, S.brideFamily, 3).slice(0, LIMITS.family[1]);
    if (!o.groomFamily.length) o.groomFamily = [['', '', '']];
    if (!o.brideFamily.length) o.brideFamily = [['', '', '']];
    o.meet = Object.assign(clone(S.meet), o.meet || {});
    o.moments = rows(o.moments, S.moments, 3).slice(0, 4); while (o.moments.length < 4) o.moments.push(['', '', '']);
    o.reasons = (Array.isArray(o.reasons) ? o.reasons : S.reasons).slice(0, 2).map(r => str(Array.isArray(r) ? r[1] : r)); while (o.reasons.length < 2) o.reasons.push('');
    o.roadmap = rows(o.roadmap, S.roadmap, 2).slice(0, LIMITS.roadmap[1]);
    o.status = rows(o.status, S.status, 3).slice(0, LIMITS.status[1]);
    o.venue = rows(o.venue, S.venue, 2).slice(0, LIMITS.venue);
    o.promises = rows(o.promises, S.promises, 2).slice(0, 4); while (o.promises.length < 4) o.promises.push(['', '']);
    o.letter = str(o.letter); o.roadmapNote = str(o.roadmapNote);
    return o;
  }

  /* ═════════ 장 만들기: 내용 → 데이터 ═════════
     opts.off    : 빼는 장 id 목록
     opts.photos : 사진이 들어간 칸 { 칸이름: true } (그 칸은 자리표시 대신 사진 항목이 된다) */
  function buildDeck(key, input, opts) {
    opts = opts || {};
    const T = THEMES[key], D = normalize(input);
    const off = new Set(opts.off || []), hasPhoto = s => !!(opts.photos && opts.photos[s]);
    const G = D.groom || '신랑', B = D.bride || '신부';
    const list = slideList(key), on = id => !off.has(id) && list.some(l => l.id === id);

    // 장(chapter)마다 켜진 장이 하나라도 있어야 목차·구분 페이지에 나온다. 번호는 켜진 순서대로
    const active = CHAPTERS.map((_, i) => list.some(l => l.chapter === i && on(l.id)));
    const chapNo = []; let k = 0; active.forEach((a, i) => { if (a) chapNo[i] = String(++k).padStart(2, '0'); });

    const slides = [], slots = [], masters = {};
    const S = { shape: (s, shape, o, extra) => s.items.push(Object.assign({ t: 'shape', shape, o }, extra || {})) };
    const tx = (s, text, o) => s.items.push({ t: 'text', text, o: Object.assign({ isTextBox: true, fontFace: F, margin: 0, valign: 'top', color: T.ink, fontSize: 14 }, o) });
    const icon = (s, name, color, o) => s.items.push({ t: 'icon', name, color, o });
    const table = (s, rows, o) => s.items.push({ t: 'table', rows, o });
    const shadow = () => ({ type: 'outer', color: '000000', opacity: 0.14, blur: 6, offset: 2, angle: 90 });

    // 사진 칸: 사진이 있으면 photo 항목, 없으면 "사진을 넣어 주세요" 자리표시
    function photo(s, slot, label, x, y, w, h, opt) {
      opt = opt || {};
      const kind = opt.circle ? 'circle' : T.photo, filled = hasPhoto(slot), tag = { slot };
      slots.push({ slot, label, slide: s.id });
      let ix = x, iy = y, iw = w, ih = h;
      const pic = (shape, px, py, pw, ph, r) => s.items.push({ t: 'photo', slot, shape, o: { x: px, y: py, w: pw, h: ph, rectRadius: r || 0 } });
      if (kind === 'circle') {
        if (filled) pic('circle', x, y, w, h);
        else S.shape(s, 'ellipse', { x, y, w, h, fill: { color: T.soft }, line: { color: T.soft }, objectName: '사진 칸' }, tag);
      } else if (kind === 'round' || kind === 'soft') {
        const r = Math.min(0.3, Math.min(w, h) * 0.12);
        if (filled) pic('round', x, y, w, h, r);
        else S.shape(s, 'roundRect', { x, y, w, h, rectRadius: r, fill: { color: T.soft }, line: { color: T.soft }, objectName: '사진 칸' }, tag);
      } else if (kind === 'polaroid') {
        const pad = Math.min(0.14, w * 0.06), foot = Math.min(0.55, h * 0.18);
        S.shape(s, 'rect', { x, y, w, h, fill: { color: 'FFFFFF' }, line: { color: 'E4E9DC', width: 0.75 }, shadow: shadow() }, tag);
        ix = x + pad; iy = y + pad; iw = w - 2 * pad; ih = h - pad - foot;
        if (filled) pic('rect', ix, iy, iw, ih);
        else S.shape(s, 'rect', { x: ix, y: iy, w: iw, h: ih, fill: { color: T.soft }, line: { color: T.soft }, objectName: '사진 칸' }, tag);
        if (!opt.noTape) S.shape(s, 'rect', { x: x + w / 2 - Math.min(0.55, w * 0.22), y: y - 0.12, w: Math.min(1.1, w * 0.44), h: 0.26, fill: { color: T.pop, transparency: 35 }, line: { color: T.pop, transparency: 35 }, rotate: opt.tapeRot ?? -4 });
      } else if (kind === 'frame') {
        const dark = opt.dark;
        if (filled) pic('rect', x, y, w, h);
        else S.shape(s, 'rect', { x, y, w, h, fill: { color: dark ? T.dark2 : T.soft }, line: { color: dark ? T.dark2 : T.soft }, objectName: '사진 칸' }, tag);
        S.shape(s, 'rect', { x: x + 0.1, y: y + 0.1, w: w - 0.2, h: h - 0.2, fill: { type: 'none' }, line: { color: T.accent, width: 0.75 } }, tag);
      }
      if (filled) return;
      const sz = Math.min(0.5, Math.min(iw, ih) * 0.22);
      const showLabel = Math.min(iw, ih) >= 1.3 && !opt.noLabel;
      const cy = iy + ih / 2 - (showLabel ? sz * 0.75 : sz / 2);
      const col = kind === 'frame' && opt.dark ? 'C9B48A' : T.accent;
      icon(s, 'camera', col, { x: ix + iw / 2 - sz / 2, y: cy, w: sz, h: sz, transparency: 20 });
      if (showLabel) tx(s, opt.label || '사진을 넣어 주세요', { x: ix, y: cy + sz + 0.08, w: iw, h: 0.3, fontSize: 11, color: col, align: 'center' });
    }
    function card(s, x, y, w, h, opt) {
      opt = opt || {};
      if (T.photo === 'polaroid') S.shape(s, 'roundRect', { x, y, w, h, rectRadius: 0.18, fill: { color: 'FFFFFF' }, line: { color: 'E4E9DC', width: 0.75 }, shadow: shadow() });
      else if (T.photo === 'frame') S.shape(s, 'rect', { x, y, w, h, fill: { color: opt.fill || T.soft2 }, line: { color: T.line, width: 0.75 } });
      else if (T.photo === 'soft') S.shape(s, 'roundRect', { x, y, w, h, rectRadius: 0.22, fill: { color: opt.fill || T.soft2 }, line: { color: T.line, width: 0.75 } });
      else S.shape(s, 'roundRect', { x, y, w, h, rectRadius: 0.22, fill: { color: opt.fill || T.soft2 }, line: { color: opt.fill || T.soft2 } });
    }
    function pill(s, text, x, y, w, color, filled) {
      filled = filled !== false;
      S.shape(s, 'roundRect', { x, y, w, h: 0.36, rectRadius: 0.18, fill: filled ? { color } : { type: 'none' }, line: { color, width: 1 } });
      tx(s, text, { x, y, w, h: 0.36, fontSize: 12, bold: true, color: filled ? 'FFFFFF' : color, align: 'center', valign: 'middle' });
    }

    /* 마스터 (편집할 때 움직이지 않는 틀) */
    const heartCol = key === 'modern' ? T.bride : T.accent;
    const mItems = [];
    if (key === 'rose') {
      mItems.push({ t: 'shape', shape: 'rect', o: { x: 0.28, y: 0.28, w: W - 0.56, h: H - 0.56, fill: { type: 'none' }, line: { color: T.line, width: 1 } } });
      mItems.push({ t: 'icon', name: 'heartLine', color: T.line, o: { x: W - 0.78, y: H - 0.74, w: 0.3, h: 0.3 } });
    } else if (key === 'modern') {
      mItems.push({ t: 'shape', shape: 'roundRect', o: { x: 0.3, y: 0.3, w: W - 0.6, h: H - 0.6, rectRadius: 0.3, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF' } } });
      mItems.push({ t: 'shape', shape: 'ellipse', o: { x: W / 2 - 0.14, y: 0.42, w: 0.12, h: 0.12, fill: { color: T.groom }, line: { color: T.groom } } });
      mItems.push({ t: 'shape', shape: 'ellipse', o: { x: W / 2 + 0.02, y: 0.42, w: 0.12, h: 0.12, fill: { color: T.bride }, line: { color: T.bride } } });
    } else if (key === 'picnic') {
      mItems.push({ t: 'icon', name: 'heart', color: T.pop, o: { x: 0.8, y: 0.74, w: 0.32, h: 0.32 } });
    }
    masters.CONTENT = { bg: T.bg, items: mItems, title: { x: T.title.x, y: T.title.y, w: T.title.w, h: T.title.h, fontFace: F, fontSize: T.title.size, bold: true, color: T.ink, align: T.title.align, valign: 'middle', margin: 0 } };
    masters.COVER = { bg: key === 'navy' ? T.dark : T.bg, items: key === 'modern' ? [mItems[0]] : [] };
    if (T.dividers) masters.DIVIDER = { bg: T.dark, items: [] };

    const label = id => (list.find(l => l.id === id) || {}).label || id;
    const slide = (id, master, section, notes) => { const s = { id, label: label(id), master, section, notes, items: [] }; slides.push(s); return s; };
    const content = (id, sec, title, notes) => { const s = slide(id, 'CONTENT', sec, (notes ? notes + '\n\n' : '') + PHOTO_NOTE); s.title = title; return s; };
    const chapterLabel = (s, n) => { if (key === 'navy') tx(s, [{ text: `CHAPTER ${chapNo[n]}`, options: { fontFace: T.disp, charSpacing: 2 } }, { text: `   ${CHAPTERS[n][0]}`, options: { fontFace: F } }], { x: M, y: 0.42, w: 8, h: 0.3, fontSize: 12, bold: true, color: T.accent }); };
    const CT = T.ct;
    const nameTitle = (name, rest, color) => key === 'modern' ? [{ text: name, options: { color } }, { text: rest }] : name + rest;
    const lines = arr => arr.filter(r => r.some(v => String(v).trim()));

    /* 1. 표지 */
    if (on('cover')) {
      const s = slide('cover', 'COVER', '표지', '표지예요. 두 사람 이름, 날짜, 장소를 바꿔 주세요.\n\n' + PHOTO_NOTE);
      if (key === 'rose') {
        photo(s, 'cover', '표지 사진', 8.25, 1.45, 3.6, 4.6, { label: '두 사람 사진' });
        icon(s, 'heart', heartCol, { x: 11.45, y: 5.55, w: 0.55, h: 0.55 });
        icon(s, 'heartLine', T.accent, { x: 7.75, y: 1.1, w: 0.42, h: 0.42 });
        tx(s, 'Our Family Meeting', { x: 1.1, y: 2.0, w: 6, h: 0.5, fontFace: T.disp, italic: true, fontSize: 20, color: T.accent });
        tx(s, [{ text: G }, { text: '  ♥  ', options: { color: T.accent } }, { text: B }], { x: 1.1, y: 2.6, w: 6.2, h: 1.0, fontSize: 44, bold: true });
        tx(s, '두 가족이 처음 만나는 날', { x: 1.1, y: 3.7, w: 6, h: 0.5, fontSize: 20, color: T.sub });
        tx(s, `${D.date}\n${D.place}`, { x: 1.1, y: 4.7, w: 6, h: 0.8, fontSize: 14, color: T.sub, lineSpacingMultiple: 1.3 });
      } else if (key === 'modern') {
        photo(s, 'cover', '표지 사진', W / 2 - 1.35, 0.95, 2.7, 2.7, { circle: true, label: '두 사람 사진' });
        tx(s, [{ text: '신랑 ' + G, options: { color: T.groom } }, { text: ',  ' }, { text: '신부 ' + B, options: { color: T.bride } }], { x: M, y: 3.95, w: CW, h: 0.8, fontSize: 36, bold: true, align: 'center' });
        tx(s, '저희 두 사람을 소개합니다', { x: M, y: 4.8, w: CW, h: 0.5, fontSize: 20, color: T.sub, align: 'center' });
        tx(s, `${D.date}  ·  ${D.place}`, { x: M, y: 5.6, w: CW, h: 0.4, fontSize: 14, color: T.sub, align: 'center' });
      } else if (key === 'picnic') {
        photo(s, 'cover', '표지 사진', 7.6, 1.05, 4.6, 5.3, { label: '두 사람 사진', tapeRot: -6 });
        tx(s, 'Happy Day', { x: 1.1, y: 1.9, w: 5, h: 0.6, fontFace: T.disp, bold: true, fontSize: 24, color: T.pop });
        tx(s, [{ text: G }, { text: ' & ', options: { color: T.accent } }, { text: B }], { x: 1.1, y: 2.55, w: 6.2, h: 1.0, fontSize: 44, bold: true });
        tx(s, '우리 두 사람의 이야기를\n들려 드릴게요', { x: 1.1, y: 3.7, w: 6, h: 1.0, fontSize: 20, color: T.sub, lineSpacingMultiple: 1.2 });
        tx(s, `${D.date}  ·  ${D.place}`, { x: 1.1, y: 5.15, w: 6.2, h: 0.4, fontSize: 14, color: T.sub });
        icon(s, 'heart', T.pop, { x: 6.55, y: 1.25, w: 0.42, h: 0.42 });
        icon(s, 'heart', T.accent, { x: 6.95, y: 1.85, w: 0.26, h: 0.26 });
      } else {
        S.shape(s, 'rect', { x: 0.4, y: 0.4, w: W - 0.8, h: H - 0.8, fill: { type: 'none' }, line: { color: T.accent, width: 1 } });
        S.shape(s, 'rect', { x: 0.5, y: 0.5, w: W - 1.0, h: H - 1.0, fill: { type: 'none' }, line: { color: T.accent, width: 0.5 } });
        tx(s, 'THE FIRST MEETING', { x: M, y: 2.0, w: CW, h: 0.45, fontFace: T.disp, fontSize: 16, bold: true, color: T.accent, align: 'center', charSpacing: 6 });
        tx(s, `${G}   ·   ${B}`, { x: M, y: 2.6, w: CW, h: 1.1, fontSize: 48, bold: true, color: 'FFFFFF', align: 'center' });
        tx(s, '우리 두 사람과 두 가족의 이야기', { x: M, y: 3.8, w: CW, h: 0.5, fontSize: 20, color: 'C8CDD9', align: 'center' });
        tx(s, `${D.date}  ·  ${D.place}`, { x: M, y: 5.0, w: CW, h: 0.4, fontSize: 14, color: T.accent, align: 'center' });
      }
    }

    /* 2. 목차: 켜진 장만, 가운데 정렬 */
    if (on('contents')) {
      const s = content('contents', '표지', 'CONTENTS', '목차예요. 순서를 바꾸거나 필요 없는 장은 지워도 괜찮아요.');
      const idx = CHAPTERS.map((_, i) => i).filter(i => active[i]);
      const cw = 2.1, gap = (CW - cw * 5) / 4, y = CT + 0.55, h = 3.7;
      const x0 = M + (CW - (idx.length * cw + (idx.length - 1) * gap)) / 2;
      idx.forEach((ci, j) => {
        const [t, sub] = CHAPTERS[ci], x = x0 + j * (cw + gap);
        card(s, x, y, cw, h);
        tx(s, chapNo[ci], { x: x + 0.25, y: y + 0.35, w: cw - 0.5, h: 0.7, fontFace: T.disp, fontSize: 36, bold: true, color: T.accent });
        tx(s, t, { x: x + 0.25, y: y + 1.35, w: cw - 0.4, h: 0.9, fontSize: 16, bold: true });
        tx(s, sub, { x: x + 0.25, y: y + 2.3, w: cw - 0.4, h: 0.9, fontSize: 12, color: T.sub });
      });
    }

    const divider = (i) => {
      const id = 'div' + i;
      if (!T.dividers || !active[i] || !on(id)) return;
      const [t, sub] = CHAPTERS[i];
      const s = slide(id, 'DIVIDER', t, '장을 나누는 페이지예요. 오른쪽 칸에 그 장을 대표하는 사진을 넣어 보세요.\n\n' + PHOTO_NOTE);
      tx(s, chapNo[i], { x: M + 0.2, y: 1.7, w: 4, h: 1.5, fontFace: T.disp, fontSize: 96, bold: true, color: T.accent });
      tx(s, t, { x: M + 0.2, y: 3.4, w: 6, h: 0.8, fontSize: 36, bold: true, color: 'FFFFFF' });
      tx(s, sub, { x: M + 0.2, y: 4.3, w: 6, h: 0.5, fontSize: 18, color: 'C8CDD9' });
      photo(s, id, `장 대표 사진 (${t})`, 7.45, 0.9, 5.0, 5.7, { dark: true, label: '장 대표 사진' });
    };

    /* 3. 소개 */
    divider(0);
    if (T.profileBoth) {
      if (on('profile')) {
        const s = content('profile', '우리를 소개합니다', [{ text: '신랑', options: { color: T.groom } }, { text: ', ' }, { text: '신부', options: { color: T.bride } }, { text: '를 소개합니다' }], '두 사람을 한 장에 소개하는 페이지예요.');
        const halves = [[M, '신랑', D.groomProfile, T.groom, 'groom'], [W / 2 + 0.25, '신부', D.brideProfile, T.bride, 'bride']];
        for (const [x0, role, prof0, col, slot] of halves) {
          const prof = lines(prof0);
          photo(s, slot, `${role} 사진`, x0, CT + 0.05, 2.3, 2.75);
          tx(s, role, { x: x0 + 2.6, y: CT + 0.1, w: 2.5, h: 0.35, fontSize: 13, bold: true, color: col });
          tx(s, (prof[0] || ['', ''])[1], { x: x0 + 2.6, y: CT + 0.45, w: 2.9, h: 0.6, fontSize: 24, bold: true });
          prof.slice(1, 4).forEach(([k2, v], i) => {
            tx(s, k2, { x: x0 + 2.6, y: CT + 1.25 + i * 0.5, w: 1.1, h: 0.4, fontSize: 12, bold: true, color: T.sub, valign: 'middle' });
            tx(s, v, { x: x0 + 3.7, y: CT + 1.25 + i * 0.5, w: 1.9, h: 0.4, fontSize: 14, valign: 'middle' });
          });
          const rows = prof.slice(4).map(([k2, v]) => [{ text: k2, options: { bold: true, color: col, fontSize: 13 } }, { text: v, options: { fontSize: 14 } }]);
          if (rows.length) table(s, rows, { x: x0, y: CT + 3.2, w: 5.55, colW: [1.7, 3.85], rowH: 0.52, fontFace: F, color: T.ink, valign: 'middle', border: { type: 'solid', pt: 0.75, color: T.line }, fill: { color: 'FFFFFF' }, margin: [0, 0.12, 0, 0.12] });
        }
      }
    } else {
      for (const [id, role, prof0, col, left, slot] of [['profileG', '신랑', D.groomProfile, T.groom, true, 'groom'], ['profileB', '신부', D.brideProfile, T.bride, false, 'bride']]) {
        if (!on(id)) continue;
        const name = role === '신랑' ? G : B, prof = lines(prof0);
        const s = content(id, '우리를 소개합니다', `${role} ${name}${jong(name) ? '을' : '를'} 소개합니다`, `${role} 소개 페이지예요. 항목은 자유롭게 바꿔 쓰세요.`);
        chapterLabel(s, 0);
        const px = left ? M + 0.2 : W - M - 0.2 - 4.3, tx0 = left ? M + 5.2 : M + 0.2;
        photo(s, slot, `${role} 사진`, px, CT + 0.15, 4.3, 4.95, { label: `${role} 사진` });
        if (key === 'rose') icon(s, 'heart', heartCol, { x: px + 3.8, y: CT - 0.05, w: 0.45, h: 0.45 });
        pill(s, role === '신랑' ? 'GROOM' : 'BRIDE', tx0, CT + 0.2, 1.3, col);
        const rows = prof.map(([k2, v]) => [{ text: k2, options: { bold: true, color: col, fontSize: 13 } }, { text: v, options: { fontSize: 15 } }]);
        if (rows.length) table(s, rows, { x: tx0, y: CT + 0.85, w: 6.4, colW: [1.9, 4.5], rowH: 0.6, fontFace: F, color: T.ink, valign: 'middle', border: [{ type: 'none' }, { type: 'none' }, { type: 'solid', pt: 0.75, color: T.line }, { type: 'none' }], margin: [0, 0.1, 0, 0.05] });
      }
    }

    /* 4. 가족 (한 장에 1~6명) */
    divider(1);
    for (const [id, side, name, fam0, col, pre] of [['famG', '신랑', G, D.groomFamily, T.groom, 'gfam'], ['famB', '신부', B, D.brideFamily, T.bride, 'bfam']]) {
      if (!on(id)) continue;
      const s = content(id, '우리 가족', nameTitle(name, '네 가족을 소개합니다', col), `${side} 측 가족을 소개하는 페이지예요. 인원이 다르면 칸을 지우거나 복사해서 쓰세요.`);
      chapterLabel(s, 1);
      const fam = fam0.slice(0, 6), n = Math.max(1, fam.length), colW = CW / n;
      const sc = Math.min(1, (colW - 0.25) / 2.35), small = n >= 5;
      for (let i = 0; i < n; i++) {
        const [role, who, desc] = fam[i] || ['', '', ''], cx = M + colW * i + colW / 2;
        let pw = 2.3 * sc, ph = 2.75 * sc; const py = CT + 0.25;
        if (T.family === 'circle') { pw = ph = 2.3 * sc; }
        if (T.family === 'polaroid') { pw = 2.35 * sc; ph = 2.9 * sc; }
        photo(s, `${pre}${i}`, `${side} 측 가족 ${i + 1} (${role || '가족'})`, cx - pw / 2, py, pw, ph, { circle: T.family === 'circle', label: role || '가족 사진', tapeRot: i % 2 ? 4 : -4 });
        const foot = Math.min(0.55, ph * 0.18);
        const ly = T.family === 'polaroid' ? py + ph - foot + 0.042 : py + ph + 0.22;
        tx(s, [{ text: role + '  ', options: { color: col, bold: true } }, { text: who, options: { bold: true } }], { x: cx - colW / 2 + 0.1, y: ly, w: colW - 0.2, h: 0.4, fontSize: small ? 13 : 16, align: 'center' });
        tx(s, desc, { x: cx - colW / 2 + 0.15, y: (T.family === 'polaroid' ? py + ph + 0.2 : ly + 0.48), w: colW - 0.3, h: 0.8, fontSize: small ? 11 : 12, color: T.sub, align: 'center', lineSpacingMultiple: 1.15 });
      }
    }

    /* 5. 이야기 */
    divider(2);
    if (on('meet')) {
      const s = content('meet', '우리의 이야기', '우리의 첫 만남', '두 사람이 처음 만난 날을 소개해요.');
      chapterLabel(s, 2);
      tx(s, D.meet.date, { x: M + 0.1, y: CT + 0.35, w: 5.4, h: 0.5, fontFace: T.disp, fontSize: 22, bold: true, color: T.accent });
      tx(s, D.meet.title, { x: M + 0.1, y: CT + 0.95, w: 5.4, h: 0.6, fontSize: 22, bold: true });
      tx(s, D.meet.text, { x: M + 0.1, y: CT + 1.75, w: 5.2, h: 2.4, fontSize: 15, color: T.sub, lineSpacingMultiple: 1.45 });
      photo(s, 'meet1', '첫 만남 사진 1', 6.75, CT + 0.15, 3.05, 4.85, { label: '첫 만남 사진' });
      photo(s, 'meet2', '첫 만남 사진 2', 10.05, CT + 0.15, 2.48, 2.3, { noTape: true, noLabel: true });
      if (key === 'picnic') S.shape(s, 'wedgeRoundRectCallout', { x: 10.05, y: CT + 2.75, w: 2.48, h: 1.75, fill: { color: 'FFFFFF' }, line: { color: T.line, width: 0.75 }, rectRadius: 0.2 });
      else card(s, 10.05, CT + 2.7, 2.48, 2.3, { fill: T.soft2 });
      tx(s, D.meet.quote, { x: 10.25, y: CT + 2.95, w: 2.15, h: 0.9, fontSize: 15, bold: true, color: T.accent });
      tx(s, D.meet.quoteBy, { x: 10.2, y: CT + 3.95, w: 2.2, h: 0.5, fontSize: 11, color: T.sub });
    }
    if (on('moments')) {
      const s = content('moments', '우리의 이야기', '함께한 시간들', '연애하며 기억에 남는 순간 네 가지를 골라 보세요.');
      chapterLabel(s, 2);
      const colW = CW / 4;
      if (T.photo !== 'polaroid') S.shape(s, 'line', { x: M + colW / 2, y: CT + 0.48, w: CW - colW, h: 0, line: { color: T.line, width: 1.5, dashType: 'dash' } });
      for (let i = 0; i < 4; i++) {
        const [d, t, sub] = D.moments[i], cx = M + colW * i + colW / 2;
        pill(s, d, cx - 0.7, CT + 0.3, 1.4, i === 3 ? T.pop : T.accent);
        photo(s, `moment${i}`, `함께한 순간 ${i + 1}`, cx - 1.3, CT + 0.95, 2.6, 2.75, { label: t || '사진을 넣어 주세요', tapeRot: i % 2 ? 3 : -3 });
        tx(s, t, { x: cx - colW / 2 + 0.1, y: CT + 3.95, w: colW - 0.2, h: 0.4, fontSize: 16, bold: true, align: 'center' });
        tx(s, sub, { x: cx - colW / 2 + 0.1, y: CT + 4.4, w: colW - 0.2, h: 0.4, fontSize: 13, color: T.sub, align: 'center' });
      }
    }
    if (on('reasons')) {
      const s = content('reasons', '우리의 이야기', '결혼을 결심한 이유', '서로에게 결혼을 결심한 이유를 직접 써 보세요. 짧아도 충분히 진심이 전해져요.');
      chapterLabel(s, 2);
      const cw = (CW - 0.4) / 2;
      for (let i = 0; i < 2; i++) {
        const who = i ? B : G, text = D.reasons[i], x = M + i * (cw + 0.4), y = CT + 0.2, col = i ? T.bride : T.groom;
        card(s, x, y, cw, 4.7);
        photo(s, `reason${i}`, `${who} 사진 (결심한 이유)`, x + 0.4, y + 0.4, 1.5, 1.5, { circle: true, noLabel: true });
        tx(s, `${who}${jong(who) ? '이가' : '가'} 결혼을 결심한 이유`, { x: x + 2.15, y: y + 0.75, w: cw - 2.4, h: 0.5, fontSize: 18, bold: true, color: col });
        tx(s, '“', { x: x + 0.4, y: y + 2.05, w: 1, h: 0.8, fontFace: T.disp, fontSize: 54, bold: true, color: T.line });
        tx(s, text, { x: x + 0.45, y: y + 2.7, w: cw - 0.9, h: 1.8, fontSize: 15, lineSpacingMultiple: 1.45 });
      }
    }

    /* 6. 결혼 준비 */
    divider(3);
    if (on('timeline')) {
      const s = content('timeline', '결혼 준비', '결혼 준비 타임라인', '결혼식까지의 큰 일정을 보여 주는 페이지예요. 날짜와 항목을 바꿔 쓰세요.');
      chapterLabel(s, 3);
      const road = D.roadmap.length ? D.roadmap : [['', '']];
      const n = road.length, y = CT + 2.15, x0 = M + 0.6, x1 = W - M - 0.6, step = n > 1 ? (x1 - x0) / (n - 1) : 0;
      S.shape(s, 'line', { x: x0, y, w: x1 - x0, h: 0, line: { color: T.line, width: 3 } });
      for (let i = 0; i < n; i++) {
        const [d, t] = road[i], cx = n > 1 ? x0 + step * i : (x0 + x1) / 2, last = i === n - 1 && n > 1, first = i === 0;
        S.shape(s, 'ellipse', { x: cx - 0.26, y: y - 0.26, w: 0.52, h: 0.52, fill: { color: last ? T.pop : first ? T.accent : 'FFFFFF' }, line: { color: last ? T.pop : T.accent, width: 2 } });
        if (last) icon(s, 'heart', 'FFFFFF', { x: cx - 0.13, y: y - 0.12, w: 0.26, h: 0.26 });
        tx(s, d, { x: cx - 1, y: y - 0.85, w: 2, h: 0.4, fontFace: T.disp, fontSize: 14, bold: true, color: T.accent, align: 'center' });
        tx(s, t, { x: cx - 1, y: y + 0.45, w: 2, h: 0.45, fontSize: 16, bold: true, align: 'center' });
      }
      pill(s, '지금 여기', x0 - 0.6, y - 1.55, 1.2, T.accent, false);
      card(s, M + 0.6, CT + 3.55, CW - 1.2, 1.25);
      icon(s, 'heart', heartCol, { x: M + 0.95, y: CT + 3.97, w: 0.4, h: 0.4 });
      tx(s, D.roadmapNote, { x: M + 1.6, y: CT + 3.7, w: CW - 2.6, h: 0.95, fontSize: 15, valign: 'middle' });
    }
    if (on('status')) {
      const s = content('status', '결혼 준비', '결혼 준비 현황', '준비 상황을 한눈에 보여 주는 표예요. 진행 상황 칸의 글자를 바꿔 쓰세요.');
      chapterLabel(s, 3);
      const stCol = st => st === '진행 중' ? T.pop : (st === '예정' || st === '상의 중') ? T.sub : T.accent;
      const head = ['항목', '내용', '진행 상황'].map(h => ({ text: h, options: { bold: true, color: 'FFFFFF', fill: { color: key === 'navy' ? T.dark : T.accent }, fontSize: 14, align: h === '내용' ? 'left' : 'center' } }));
      const rows = lines(D.status).map(([a, b, c], i) => [
        { text: a, options: { bold: true, fontSize: 15, align: 'center', fill: { color: i % 2 ? T.soft2 : 'FFFFFF' } } },
        { text: b, options: { fontSize: 15, fill: { color: i % 2 ? T.soft2 : 'FFFFFF' } } },
        { text: c, options: { bold: true, fontSize: 14, color: stCol(c), align: 'center', fill: { color: i % 2 ? T.soft2 : 'FFFFFF' } } }
      ]);
      table(s, [head, ...rows], { x: M + 0.3, y: CT + 0.25, w: CW - 0.6, colW: [2.6, 6.33, 2.2], rowH: 0.62, fontFace: F, color: T.ink, valign: 'middle', border: { type: 'solid', pt: 0.75, color: T.line }, margin: [0, 0.2, 0, 0.2] });
    }
    if (on('venue')) {
      const s = content('venue', '결혼 준비', '예식장을 소개합니다', '예식장 사진과 정보를 넣는 페이지예요.');
      chapterLabel(s, 3);
      photo(s, 'venue', '예식장 사진', M + 0.1, CT + 0.15, 6.9, 4.85, { label: '예식장 사진' });
      const x = M + 7.4;
      lines(D.venue).forEach(([k2, v], i) => {
        const y = CT + 0.2 + i * 0.95;
        tx(s, k2, { x, y, w: 4.1, h: 0.32, fontSize: 12, bold: true, color: T.accent });
        tx(s, v, { x, y: y + 0.34, w: 4.1, h: 0.5, fontSize: 15 });
      });
    }
    if (on('wedding')) {
      const s = content('wedding', '결혼 준비', '웨딩 촬영', '웨딩 촬영 사진이나 촬영 장소 사진을 넣어 보세요. 아직 찍지 않았다면 이 장은 지워도 괜찮아요.');
      chapterLabel(s, 3);
      const y = CT + 0.15, hh = 4.85;
      photo(s, 'wed0', '웨딩 촬영 대표 사진', M + 0.1, y, 5.3, hh, { label: '대표 사진' });
      photo(s, 'wed1', '웨딩 촬영 사진 2', M + 5.65, y, 2.9, (hh - 0.25) / 2, { noLabel: true, tapeRot: 3 });
      photo(s, 'wed2', '웨딩 촬영 사진 3', M + 5.65, y + (hh + 0.25) / 2, 2.9, (hh - 0.25) / 2, { noLabel: true, noTape: true });
      photo(s, 'wed3', '웨딩 촬영 세로 사진', M + 8.8, y, CW - 8.9, hh, { label: '세로 사진', tapeRot: -3 });
    }

    /* 7. 앞으로 */
    divider(4);
    if (on('promises')) {
      const s = content('promises', '앞으로', '앞으로 이렇게 살겠습니다', '두 사람이 함께 정한 약속을 적어 보세요.');
      chapterLabel(s, 4);
      const cw = (CW - 0.4) / 2, ch = 2.15;
      D.promises.forEach(([t, d], i) => {
        const x = M + (i % 2) * (cw + 0.4), y = CT + 0.15 + Math.floor(i / 2) * (ch + 0.35);
        card(s, x, y, cw, ch);
        S.shape(s, 'ellipse', { x: x + 0.4, y: y + 0.45, w: 0.75, h: 0.75, fill: { color: i % 2 ? T.bride : T.groom }, line: { color: i % 2 ? T.bride : T.groom } });
        tx(s, String(i + 1), { x: x + 0.4, y: y + 0.45, w: 0.75, h: 0.75, fontFace: T.disp, fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle' });
        tx(s, t, { x: x + 1.45, y: y + 0.45, w: cw - 1.8, h: 0.5, fontSize: 18, bold: true });
        tx(s, d, { x: x + 1.45, y: y + 1.0, w: cw - 1.8, h: 0.8, fontSize: 14, color: T.sub, lineSpacingMultiple: 1.3 });
      });
    }
    if (on('letter')) {
      const s = content('letter', '앞으로', '양가 부모님께', '부모님께 드리는 편지예요. 발표 마지막에 직접 읽어 드리면 좋아요.');
      chapterLabel(s, 4);
      const x = 2.2, w = W - 4.4, y = CT + 0.15, h = 4.85;
      card(s, x, y, w, h, { fill: key === 'modern' ? 'FDF3F5' : T.soft2 });
      icon(s, 'heart', heartCol, { x: W / 2 - 0.22, y: y + 0.35, w: 0.44, h: 0.44 });
      tx(s, D.letter, { x: x + 0.8, y: y + 1.05, w: w - 1.6, h: 2.9, fontSize: 15, lineSpacingMultiple: 1.55, align: 'center' });
      tx(s, `${G} · ${B} 올림`, { x: x + 0.8, y: y + 4.05, w: w - 1.6, h: 0.45, fontSize: 15, bold: true, color: T.accent, align: 'right' });
    }
    if (on('qa')) {
      const light = key === 'navy';
      const s = slide('qa', light ? 'DIVIDER' : 'COVER', '앞으로', '질문을 받는 페이지예요. 필요 없으면 지워도 괜찮아요.');
      S.shape(s, 'wedgeRoundRectCallout', { x: 2.0, y: 1.7, w: 2.2, h: 1.5, fill: { color: light ? T.dark2 : T.soft }, line: { color: light ? T.dark2 : T.soft }, rectRadius: 0.3 });
      tx(s, '?', { x: 2.0, y: 1.75, w: 2.2, h: 1.2, fontFace: T.disp, fontSize: 54, bold: true, color: T.accent, align: 'center', valign: 'middle' });
      S.shape(s, 'wedgeRoundRectCallout', { x: 9.2, y: 4.1, w: 2.0, h: 1.35, fill: { color: light ? T.dark2 : T.soft }, line: { color: light ? T.dark2 : T.soft }, rectRadius: 0.3, flipH: true });
      tx(s, '!', { x: 9.2, y: 4.15, w: 2.0, h: 1.05, fontFace: T.disp, fontSize: 48, bold: true, color: light ? T.accent : T.pop, align: 'center', valign: 'middle' });
      tx(s, 'Q & A', { x: M, y: 2.55, w: CW, h: 1.4, fontFace: T.disp, fontSize: 72, bold: true, color: light ? 'FFFFFF' : T.ink, align: 'center' });
      tx(s, '궁금한 점을 편하게 물어봐 주세요', { x: M, y: 4.05, w: CW, h: 0.5, fontSize: 20, color: light ? 'C8CDD9' : T.sub, align: 'center' });
    }
    if (on('thanks')) {
      const s = slide('thanks', 'COVER', '앞으로', '마지막 인사 페이지예요.');
      const dark = key === 'navy';
      if (dark) S.shape(s, 'rect', { x: 0.4, y: 0.4, w: W - 0.8, h: H - 0.8, fill: { type: 'none' }, line: { color: T.accent, width: 1 } });
      icon(s, 'heart', dark ? T.accent : heartCol, { x: W / 2 - 0.3, y: 1.9, w: 0.6, h: 0.6 });
      tx(s, '감사합니다', { x: M, y: 2.75, w: CW, h: 1.1, fontSize: 48, bold: true, color: dark ? 'FFFFFF' : T.ink, align: 'center' });
      tx(s, '오늘 함께해 주셔서 진심으로 감사합니다.\n앞으로 잘 부탁드립니다.', { x: M, y: 4.0, w: CW, h: 0.9, fontSize: 18, color: dark ? 'C8CDD9' : T.sub, align: 'center', lineSpacingMultiple: 1.35 });
      tx(s, `${G}  ·  ${B}`, { x: M, y: 5.25, w: CW, h: 0.45, fontSize: 16, bold: true, color: T.accent, align: 'center' });
    }

    return { key, theme: T, title: `상견례 가족 소개 - ${T.name}`, masters, slides, slots, content: D };
  }

  /* ═════════ 데이터 → PptxGenJS 파일 ═════════
     io.rasterize(svg문자열, px) → Promise<'image/png;base64,...'>   (아이콘 PNG 변환. 브라우저는 canvas, Node 는 sharp)
     io.photoData(photo항목)     → Promise<'image/...;base64,...'>  (사진 칸에 넣을 잘라 둔 사진) */
  async function toPptx(PptxGenJS, deck, io) {
    const T = deck.theme, pres = new PptxGenJS();
    pres.layout = 'LAYOUT_WIDE';
    pres.title = deck.title;
    pres.author = 'COSTCHECK';
    pres.theme = { headFontFace: F, bodyFontFace: F };
    const cache = {};
    const iconData = async (name, color) => cache[name + color] || (cache[name + color] = await io.rasterize(iconSvg(name, color, ICON_PX), ICON_PX));

    for (const [name, m] of Object.entries(deck.masters)) {
      const objects = [];
      for (const it of m.items) {
        if (it.t === 'shape') objects.push(it.shape === 'rect' ? { rect: it.o } : { text: { text: '', options: Object.assign({ shape: it.shape }, it.o) } });
        else if (it.t === 'icon') objects.push({ image: Object.assign({ data: await iconData(it.name, it.color) }, it.o) });
      }
      if (m.title) objects.push({ placeholder: { options: Object.assign({ name: 'title', type: 'title' }, m.title), text: '' } });
      pres.defineSlideMaster({ title: name, background: { color: m.bg }, objects });
    }
    const sections = new Set();
    for (const sd of deck.slides) {
      if (!sections.has(sd.section)) { pres.addSection({ title: sd.section }); sections.add(sd.section); }
      const s = pres.addSlide({ masterName: sd.master, sectionTitle: sd.section });
      if (sd.title) s.addText(sd.title, { placeholder: 'title' });
      if (sd.notes) s.addNotes(sd.notes);
      for (const it of sd.items) {
        if (it.t === 'shape') s.addShape(it.shape, Object.assign({}, it.o));
        else if (it.t === 'text') s.addText(it.text, Object.assign({}, it.o));
        else if (it.t === 'icon') s.addImage(Object.assign({ data: await iconData(it.name, it.color) }, it.o));
        else if (it.t === 'table') s.addTable(it.rows, Object.assign({}, it.o));
        else if (it.t === 'photo') {
          const data = io.photoData ? await io.photoData(it) : null;
          if (data) s.addImage({ data, x: it.o.x, y: it.o.y, w: it.o.w, h: it.o.h, altText: '사진' });
        }
      }
    }
    return pres;
  }
  const ICON_PX = 160;

  /* ═════════ 데이터 → 미리보기 HTML ═════════
     슬라이드 한 장을 16:9 상자 안의 절대 위치 요소로 그린다. 크기는 cqw 라서 썸네일·큰 화면 모두 같은 마크업.
     o.photoUrl(slot) → 사진 미리보기 주소 (없으면 사진 항목은 그리지 않음) */
  const u = 100 / W;
  const L = v => (v * u).toFixed(3) + 'cqw';
  const P = v => (v / 72 * u).toFixed(3) + 'cqw';
  const escH = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rgba = (hex, tr) => { const n = parseInt(hex, 16), a = 1 - (tr || 0) / 100; return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const FONT_STACK = f => f === 'Cambria' ? "Cambria,Georgia,'Malgun Gothic',serif" : f === 'Calibri' ? "Calibri,Carlito,'Malgun Gothic',sans-serif" : "'Malgun Gothic','맑은 고딕','Apple SD Gothic Neo',Pretendard,sans-serif";
  const box = o => `left:${L(o.x)};top:${L(o.y)};width:${L(o.w)};height:${L(o.h || 0)};`;
  const LINE_H = 1.22;

  function shapeHtml(it) {
    const o = it.o, slot = it.slot ? ` data-slot="${it.slot}"` : '';
    const fill = o.fill && o.fill.type !== 'none' && o.fill.color ? rgba(o.fill.color, o.fill.transparency) : 'transparent';
    const ln = o.line && o.line.color && o.line.type !== 'none' ? `${P(o.line.width || 1)} ${o.line.dashType === 'dash' ? 'dashed' : 'solid'} ${rgba(o.line.color, o.line.transparency)}` : '0';
    const rot = o.rotate ? `transform:rotate(${o.rotate}deg);` : '';
    const sh = o.shadow ? `box-shadow:0 ${P(o.shadow.offset || 2)} ${P(o.shadow.blur || 6)} rgba(0,0,0,${o.shadow.opacity || .2});` : '';
    if (it.shape === 'line') return `<i class="pd-o" style="${box(o)}height:0;border-top:${ln}"></i>`;
    if (it.shape === 'wedgeRoundRectCallout') {
      const w = o.w, h = o.h, r = Math.min(o.rectRadius || 0.2, Math.min(w, h) / 2), tipX = w * 0.2917, tipY = h * 1.125, b1 = w * 0.2, b2 = w * 0.38;
      const d = `M${r} 0H${w - r}Q${w} 0 ${w} ${r}V${h - r}Q${w} ${h} ${w - r} ${h}H${b2}L${tipX} ${tipY}L${b1} ${h}H${r}Q0 ${h} 0 ${h - r}V${r}Q0 0 ${r} 0Z`;
      const strokeW = (o.line && o.line.width ? o.line.width : 1) / 72;
      return `<svg class="pd-o" style="${box(o)}overflow:visible;${o.flipH ? 'transform:scaleX(-1);' : ''}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><path d="${d}" fill="${fill}" stroke="${o.line && o.line.color ? rgba(o.line.color) : 'none'}" stroke-width="${strokeW}"/></svg>`;
    }
    const rad = it.shape === 'ellipse' ? '50%' : it.shape === 'roundRect' ? L(o.rectRadius || 0) : '0';
    return `<i class="pd-o${it.slot ? ' pd-slot' : ''}"${slot} style="${box(o)}background:${fill};border:${ln};border-radius:${rad};${rot}${sh}"></i>`;
  }
  function runsHtml(text, o) {
    const runs = Array.isArray(text) ? text : [{ text }];
    return runs.map(r => {
      const ro = r.options || {}; let st = '';
      if (ro.color) st += `color:#${ro.color};`;
      if (ro.bold != null) st += `font-weight:${ro.bold ? 700 : 400};`;
      if (ro.italic) st += 'font-style:italic;';
      if (ro.fontFace) st += `font-family:${FONT_STACK(ro.fontFace)};`;
      if (ro.fontSize) st += `font-size:${P(ro.fontSize)};`;
      if (ro.charSpacing) st += `letter-spacing:${P(ro.charSpacing)};`;
      return st ? `<span style="${st}">${escH(r.text)}</span>` : escH(r.text);
    }).join('');
  }
  function textHtml(text, o, extraCls) {
    const jc = o.valign === 'middle' ? 'center' : o.valign === 'bottom' ? 'flex-end' : 'flex-start';
    const st = `${box(o)}justify-content:${jc};text-align:${o.align || 'left'};font-family:${FONT_STACK(o.fontFace)};font-size:${P(o.fontSize || 18)};color:#${o.color || '000000'};font-weight:${o.bold ? 700 : 400};${o.italic ? 'font-style:italic;' : ''}line-height:${(LINE_H * (o.lineSpacingMultiple || 1)).toFixed(3)};${o.charSpacing ? `letter-spacing:${P(o.charSpacing)};` : ''}`;
    return `<div class="pd-o pd-t${extraCls || ''}" style="${st}"><div>${runsHtml(text, o)}</div></div>`;
  }
  function tableHtml(it) {
    const o = it.o, cols = o.colW || [];
    const bd = b => !b || b.type === 'none' ? 'none' : `${P(b.pt || 1)} solid #${b.color || '000000'}`;
    const sides = Array.isArray(o.border) ? o.border.map(bd) : [0, 0, 0, 0].map(() => bd(o.border));
    const mg = Array.isArray(o.margin) ? o.margin : [0.05, 0.1, 0.05, 0.1];
    const rows = it.rows.map(r => `<tr style="height:${L(o.rowH)}">` + r.map((c, ci) => {
      const co = Object.assign({}, c.options || {});
      const bg = co.fill && co.fill.color ? `#${co.fill.color}` : o.fill && o.fill.color ? `#${o.fill.color}` : 'transparent';
      return `<td style="width:${L(cols[ci] || 1)};padding:${mg.map(L).join(' ')};vertical-align:${o.valign === 'middle' ? 'middle' : 'top'};text-align:${co.align || 'left'};background:${bg};font-size:${P(co.fontSize || o.fontSize || 12)};color:#${co.color || o.color || '000000'};font-weight:${co.bold ? 700 : 400};border-top:${sides[0]};border-right:${sides[1]};border-bottom:${sides[2]};border-left:${sides[3]}">${escH(c.text)}</td>`;
    }).join('') + '</tr>').join('');
    return `<table class="pd-o pd-tbl" style="left:${L(o.x)};top:${L(o.y)};width:${L(o.w)};font-family:${FONT_STACK(o.fontFace)}">${rows}</table>`;
  }
  function itemHtml(it, opt) {
    if (it.t === 'shape') return shapeHtml(it);
    if (it.t === 'text') return textHtml(it.text, it.o);
    if (it.t === 'icon') return `<img class="pd-o" alt="" style="${box(it.o)}opacity:${1 - (it.o.transparency || 0) / 100}" src="data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg(it.name, it.color))}">`;
    if (it.t === 'table') return tableHtml(it);
    if (it.t === 'photo') {
      const url = opt.photoUrl && opt.photoUrl(it.slot); if (!url) return '';
      const rad = it.shape === 'circle' ? '50%' : it.shape === 'round' ? L(it.o.rectRadius) : '0';
      return `<img class="pd-o pd-photo pd-slot" data-slot="${it.slot}" alt="" style="${box(it.o)}object-fit:cover;border-radius:${rad}" src="${escH(url)}">`;
    }
    return '';
  }
  function toHtml(deck, sd, opt) {
    opt = opt || {};
    const m = deck.masters[sd.master];
    let h = `<div class="pd-slide" style="background:#${m.bg}">`;
    for (const it of m.items) h += itemHtml(it, opt);
    if (sd.title && m.title) h += textHtml(sd.title, m.title, ' pd-title');
    for (const it of sd.items) h += itemHtml(it, opt);
    return h + '</div>';
  }

  return { F, W, H, THEMES, SAMPLE, CHAPTERS, STATUS_STATES, LIMITS, slideList, normalize, buildDeck, toPptx, toHtml, iconSvg, ICON_PX, jong };
});
