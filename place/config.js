/* 장소 찾기 설정 — 이 파일 한 곳만 고치면 된다.
   NAVER_MAP_CLIENT_ID: 네이버 클라우드 플랫폼(NCP) Maps 에서 발급받은 Client ID.
   - 비워 두면 지금처럼 타일 지도를 보여 준다.
   - 값을 넣으면 네이버 지도(Dynamic Map)를 띄우고 venues.json 의 추천 장소를 표시한다.
   - Client ID 는 브라우저에 그대로 보이는 값이라 넣어도 괜찮다. (Client Secret 은 절대 여기 넣지 말 것)
   자세한 순서는 같은 폴더의 README.md 참고 */
window.SGR_PLACE_CONFIG = {
  NAVER_MAP_CLIENT_ID: ''
};
