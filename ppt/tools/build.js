// 상견례 가족 소개 PPT 견본(빈 템플릿) 4종 생성기
// 장 레이아웃·테마·예시 내용은 사이트 편집기와 같은 파일(assets/ppt-deck.js)을 쓴다.
// 그래서 여기서 만든 견본과 /ppt/ 편집기에서 받은 파일이 같은 디자인이 된다.
//
// 실행 준비: 이 폴더에서 npm install   (pptxgenjs sharp)
// 전체 생성: node build.js        한 종만: node build.js rose  (rose | modern | picnic | navy)
// 결과 파일은 ../files/ 에 저장된다. 자세한 내용은 README.md
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const sharp = require('sharp');
const Deck = require('../../assets/ppt-deck.js');
// 테마 색 적용 도구는 선택 사항이에요. 없으면 건너뜁니다.
let applyTheme = null;
try { ({ applyTheme } = require('./apply_theme.js')); } catch (e) { /* 없어도 PPT는 정상 생성 */ }

// 아이콘 SVG → PNG (브라우저 편집기는 같은 일을 canvas로 한다)
const rasterize = async (svg, px) => 'image/png;base64,' + (await sharp(Buffer.from(svg)).resize(px, px).png().toBuffer()).toString('base64');

async function build(key) {
  const T = Deck.THEMES[key];
  if (!T) throw new Error(`없는 템플릿: ${key} (${Object.keys(Deck.THEMES).join(' | ')})`);
  const deck = Deck.buildDeck(key, Deck.SAMPLE);
  const pres = await Deck.toPptx(pptxgen, deck, { rasterize });
  const file = path.join(__dirname, '..', 'files', `${T.file}.pptx`);
  // pptxgenjs 3.12 의 Node writeFile 은 compression 옵션을 무시해서(압축 안 함) STREAM 으로 받아 직접 쓴다
  fs.writeFileSync(file, await pres.write({ outputType: 'STREAM', compression: true }));
  if (applyTheme) await applyTheme(file, {
    name: `COSTCHECK ${T.name}`, headFontFace: Deck.F, bodyFontFace: Deck.F,
    colors: { dk1: T.ink, lt1: 'FFFFFF', dk2: T.dark || T.ink, lt2: T.bg, accent1: T.accent, accent2: T.groom, accent3: T.bride, accent4: T.pop, accent5: T.sub, accent6: T.line, hlink: T.groom, folHlink: T.sub }
  });
  console.log('wrote', file, `(${deck.slides.length}장)`);
}

(async () => { for (const k of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(Deck.THEMES)) await build(k); })()
  .catch(e => { console.error(e); process.exit(1); });
