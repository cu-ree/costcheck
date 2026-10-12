# 장소 찾기 설정 안내 (/place/)

이 폴더의 파일

| 파일 | 하는 일 |
|---|---|
| `config.js` | 네이버 지도 Client ID 를 넣는 곳 (한 곳만 고치면 됨) |
| `venues.json` | 직접 고른 추천 장소 목록. 비어 있으면 지역별 검색 링크만 보여 줌 |
| `index.html` | 페이지 (생성기가 만듦, 직접 고치지 않음) |

동작 방식

- `config.js`의 `NAVER_MAP_CLIENT_ID`가 비어 있으면 지금처럼 **타일 지도**를 보여 줍니다.
- 값이 있으면 **네이버 지도**를 띄우고, `venues.json`에 좌표가 있는 장소를 지도에 표시합니다.
  키가 틀렸거나 등록한 서비스 URL과 주소가 다르면 자동으로 타일 지도로 돌아갑니다.
- 지역을 고르면 그 지역의 추천 장소를 카드로 보여 주고, 아래에 유형별 네이버 지도·카카오맵 검색 링크를 함께 보여 줍니다.
  추천 장소가 없는 지역은 검색 링크만 보여 줍니다.

---

## 1. 네이버 지도 키 받기 (NCP Maps)

1. 네이버 클라우드 플랫폼(https://www.ncloud.com) 가입 후 결제 수단을 등록합니다.
   Maps 무료 이용량은 **대표 계정**에만 적용되니, 하위 계정이 아닌 대표 계정으로 진행하세요.
2. 콘솔 → 전체 서비스 → Application Services → **Maps** → 이용 신청(약관 동의).
3. Maps → **Application** → [Application 등록]
   - Application 이름: 예) `costcheck` (10자 이하 권장)
   - API 선택: **Dynamic Map** (사이트 지도), **Geocoding** (좌표 도우미를 쓸 경우)
   - 서비스 환경 등록 → **Web 서비스 URL**: 아래 두 개를 넣습니다. (`http://`로 적고, `www`는 빼고, http/https는 구분하지 않음)
     - `http://costcheck.kr`
     - `http://localhost` (내 PC에서 확인할 때. 포트가 붙어도 되는지는 콘솔 안내를 확인하세요)
4. Application 목록 → [인증 정보] → **Client ID** 를 복사합니다.
   (Client Secret 은 사이트에 넣지 않습니다. 좌표 도우미용으로 `.env`에만 넣습니다.)

> 지도 스크립트 주소는 `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=Client_ID` 입니다.
> 예전 문서의 `ncpClientId` 파라미터는 새 콘솔에서 `ncpKeyId`로 바뀌었습니다. (2026-10 기준 공식 문서 확인)

## 2. 키 넣기

`place/config.js`

```js
window.SGR_PLACE_CONFIG = {
  NAVER_MAP_CLIENT_ID: '여기에_Client_ID'
};
```

배포한 뒤 https://costcheck.kr/place/ 를 열어 지도가 뜨는지 확인합니다.
지도가 안 뜨고 타일 지도가 보이면 브라우저 개발자 도구 콘솔에서 `네이버 지도를 쓸 수 없어…` 메시지와 이유(auth, load)를 확인하세요.
`auth`면 Client ID 또는 Web 서비스 URL 문제입니다.

## 3. 추천 장소 채우기 (venues.json)

**직접 확인한 곳만** 넣습니다. 지어낸 장소나 확인하지 않은 정보는 넣지 마세요.

```json
{
  "version": 1,
  "updated": "2026-10-20",
  "venues": [
    {
      "name": "○○ 한정식 (예시)",
      "sido": "서울",
      "gu": "강남구",
      "type": "한정식",
      "address": "서울 강남구 ○○로 00",
      "lat": 0,
      "lng": 0,
      "price": "1인 6~8만 원",
      "room": { "private": true, "max": 10 },
      "parking": "2시간 무료",
      "naverMap": "https://naver.me/xxxxxxx",
      "checked": "2026-10-20",
      "note": "문을 닫는 독립 룸, 엘리베이터 있음"
    }
  ]
}
```

위 항목은 형식을 보여 주기 위한 예시입니다. 실제 파일에는 넣지 마세요.

| 항목 | 필수 | 설명 |
|---|---|---|
| `name` | ○ | 식당 이름 |
| `sido` | ○ | 시도. 타일 지도 이름과 같게: 서울, 부산, 대구, 인천, 광주, 대전, 울산, 세종, 경기, 강원, 충북, 충남, 전북, 전남, 경북, 경남, 제주 |
| `gu` |  | 서울은 자치구(예: `강남구`). 서울 자치구 타일과 연결됩니다. 다른 시도는 시·군·구를 적어 두면 카드에만 쓰입니다 |
| `type` |  | `한정식` / `호텔 한식당` / `일식` / `중식` / `양식` 중 하나 |
| `address` |  | 도로명 주소. 좌표 도우미가 이 값으로 위도·경도를 찾습니다 |
| `lat`, `lng` |  | 위도·경도. 0 이거나 비어 있으면 지도에 표시하지 않고 카드만 보여 줍니다 |
| `price` |  | 1인 가격대 (자유 형식) |
| `room` |  | `{ "private": 독립 룸 여부, "max": 최대 인원 }` |
| `parking` |  | 주차 안내 |
| `naverMap` |  | 네이버 지도 장소 링크(공유 링크). 비우면 이름+주소 검색 링크를 씁니다 |
| `checked` |  | 내가 직접 확인한 날짜 (YYYY-MM-DD). 카드에 "○○ 직접 확인"으로 표시 |
| `note` |  | 한줄평 |

수정 후 확인: 저장소 루트에서 `python -m http.server 8000` → http://localhost:8000/place/
(JSON 문법이 틀리면 추천 장소 없이 검색 링크만 보입니다. 쉼표·따옴표를 확인하세요.)

## 4. 위도·경도 자동 채우기 (내 PC에서만)

Geocoding API 는 Client Secret 이 필요해서 사이트가 아니라 로컬 스크립트로 씁니다.

1. 저장소 루트의 `.env.example`을 `.env`로 복사하고 값을 넣습니다. `.env`는 `.gitignore`에 들어 있어 커밋되지 않습니다.
   ```
   NCP_MAPS_CLIENT_ID=…
   NCP_MAPS_CLIENT_SECRET=…
   ```
2. NCP 콘솔 Application 설정에서 **Geocoding** 이 선택되어 있어야 합니다 (안 되어 있으면 429 오류).
3. 저장소 루트에서 실행
   ```bash
   python tools/geocode_venues.py --dry-run   # 결과만 확인
   python tools/geocode_venues.py             # lat·lng 가 빈 장소만 채워 저장
   python tools/geocode_venues.py --force     # 이미 있는 좌표도 다시 채움
   ```
4. 바뀐 `venues.json`을 커밋하고 배포합니다.

## 5. 식당 자동 검색은 아직 없음

네이버 지역 검색 API 는 Client Secret 을 써야 해서 서버(예: Cloudflare Workers)가 필요합니다.
이번 버전에는 넣지 않았습니다. 붙이는 방법과 주의할 점은 작업 보고에 정리해 두었습니다.
