# 상견례 PPT 견본(빈 템플릿) 생성기

`/ppt/` 아래쪽 "빈 템플릿 파일 받기"의 견본 4종을 만드는 스크립트입니다.
사이트 편집기와 **같은 정의 파일** `assets/ppt-deck.js`를 씁니다.

```
assets/ppt-deck.js   테마 4종, 예시 내용(SAMPLE), 장 레이아웃(buildDeck)
        │                          미리보기 HTML(toHtml) · PptxGenJS 파일(toPptx)
        ├── assets/ppt.js     사이트 편집기 (브라우저)
        └── ppt/tools/build.js  견본 파일 4종 (Node)
```

| 키 | 파일 | 장 수 |
|---|---|---|
| `rose` | `상견례PPT_01_로즈다이어리.pptx` | 17 |
| `modern` | `상견례PPT_02_청홍모던.pptx` | 16 (신랑·신부 소개가 한 장) |
| `picnic` | `상견례PPT_03_봄소풍.pptx` | 17 |
| `navy` | `상견례PPT_04_네이비챕터.pptx` | 22 (장 구분 페이지 5장 포함) |

## 견본 다시 만들기

Node.js 18 이상. 이 폴더(`ppt/tools/`)에서 실행하세요.

```bash
npm install            # pptxgenjs, sharp
node build.js          # 4종 모두
node build.js rose     # 한 종만 (rose | modern | picnic | navy)
```

- 결과는 `../files/`에 같은 이름으로 덮어씁니다.
- 예시 이름·문구를 바꾸려면 `ppt-deck.js`의 `SAMPLE`을 고치세요. 사이트 편집기 기본값도 같이 바뀝니다.
- `ppt-deck.js`를 고친 뒤에는 꼭 이 스크립트를 다시 실행해 견본과 편집기가 어긋나지 않게 하세요.
- `node_modules/`는 `.gitignore`에 들어 있어 커밋되지 않습니다.
- 같은 폴더에 `apply_theme.js`가 있으면 파워포인트 테마 색까지 입힙니다(선택). 지금은 없어서 건너뜁니다.
- pptxgenjs 3.12 의 Node `writeFile`은 압축 옵션을 무시해서, `write({ outputType: 'STREAM', compression: true })`로 받아 직접 저장합니다. (압축하지 않으면 파일이 2~3배 커짐)

## 템플릿 추가하기

1. `ppt-deck.js`의 `THEMES`에 키를 하나 더합니다. 색(`bg`, `ink`, `accent` …), 사진 칸 모양(`photo`: `round` | `soft` | `polaroid` | `frame`),
   가족 사진 모양(`family`: `circle` | `card` | `polaroid` | `frame`), `profileBoth`(신랑·신부 한 장), `dividers`(장 구분 페이지)를 정합니다.
2. 표지(`/* 1. 표지 */`)처럼 템플릿마다 모양이 다른 곳은 `key`로 분기해 그 템플릿의 표지를 더합니다. 나머지 장은 위 설정만으로 그려집니다.
3. `file`에 견본 파일 이름을 정하고 `node build.js 새키`로 견본을 만든 뒤, `tools/src/pages/ppt.html`의 "빈 템플릿 파일 받기" 목록에 링크를 더합니다.
   편집기 템플릿 카드는 `THEMES`에서 자동으로 생깁니다.
