# COSTCHECK 상견례 준비 노트 (costcheck.kr)

상견례를 앞둔 예비부부를 위한 무료 도구와 가이드 모음. 정적 HTML/CSS/JS 사이트이며 서버·DB가 없습니다.
도구에 입력한 내용과 사진은 브라우저 안에서만 처리합니다.

## 주소

| 주소 | 내용 |
|---|---|
| `/` | 첫 화면 (허브) |
| `/seat/` `/place/` `/gift/` `/ppt/` `/invite/` `/letter/` `/cost/` `/talk/` `/checklist/` | 도구 9개 |
| `/guide/order/` `/guide/outfit/` `/guide/manners/` `/guide/thanks/` `/guide/who-pays/` | 가이드 5개 |
| `/about/` `/privacy/` `/contact/` | 사이트 소개, 개인정보처리방침, 문의 |
| `/404.html` `/sitemap.xml` `/robots.txt` | 기본 파일 |

## 폴더 구조

```text
index.html, */index.html, 404.html   tools/build_site.py 가 만든 페이지 (직접 고치지 않음)
sitemap.xml, robots.txt              tools/build_site.py 가 만듦
assets/                              sgr.css, sgr.js(공통), 도구별 JS, ppt-deck.js(PPT 장 정의), art/ 일러스트
ppt/files/                           빈 템플릿(견본) PPT 4종
ppt/tools/                           견본 생성기 build.js (README.md 참고)
place/                               config.js(네이버 지도 키), venues.json(추천 장소), README.md(설정 순서)
tools/build_site.py                  페이지 생성기 + 사이트 설정(소유확인·애드센스·문의 이메일)
tools/src/                           페이지 본문 조각 (pages: 첫 화면·도구, guides: 가이드, info: 소개·방침·문의·404)
tools/geocode_venues.py              venues.json 주소 → 위도·경도 (로컬 전용, .env 의 NCP 키)
favicon.svg, favicon.ico, apple-touch-icon.png, CNAME, .nojekyll
_prototype/                          예전 프로토타입 보관 (.gitignore 로 커밋·배포 제외)
```

## 고치고 다시 만들기

```bash
python tools/build_site.py      # 페이지, 404.html, sitemap.xml, robots.txt 생성
```

- 글·도구 화면: `tools/src/` 조각을 고친 뒤 생성기를 실행합니다.
- title·description: `tools/build_site.py`의 `PAGES` 표.
- 네이버·구글 소유확인, 애드센스 게시자 ID, 문의 이메일: `tools/build_site.py` 맨 위 "사이트 설정" 한 곳.
- PPT 장 레이아웃: `assets/ppt-deck.js` (편집기와 견본이 같이 씀). 고친 뒤 `ppt/tools`에서 `node build.js`로 견본을 다시 만드세요.
- 네이버 지도·추천 장소: `place/README.md`.

## 로컬에서 보기

```bash
python -m http.server 8000
```

http://localhost:8000/ 을 엽니다. 폴더 주소(`/seat/` 등)를 쓰므로 파일을 더블클릭해 `file://`로 열면 링크가 맞지 않습니다.
