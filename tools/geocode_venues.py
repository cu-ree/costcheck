#!/usr/bin/env python3
"""
geocode_venues.py — venues.json 의 주소로 위도·경도(lat, lng)를 채운다. (내 PC에서만 실행)

네이버 클라우드 플랫폼(NCP) Maps 의 Geocoding API 를 쓴다. 이 API 는 Client Secret 이 필요해서
사이트(브라우저)에서는 부를 수 없고, 이렇게 로컬 스크립트로만 쓴다.

준비
  1. 저장소 루트의 .env.example 을 .env 로 복사하고 NCP_MAPS_CLIENT_ID, NCP_MAPS_CLIENT_SECRET 을 넣는다.
     (.env 는 .gitignore 에 들어 있어 커밋되지 않는다)
  2. NCP 콘솔의 Application 설정에서 Geocoding API 를 선택해 둔다. (안 하면 429 오류)

실행 (저장소 루트에서)
    python tools/geocode_venues.py              # lat·lng 가 빈 장소만 채움
    python tools/geocode_venues.py --force      # 이미 있는 좌표도 다시 채움
    python tools/geocode_venues.py --dry-run    # 결과만 보여 주고 파일은 안 바꿈

API: GET https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=주소
     헤더 x-ncp-apigw-api-key-id / x-ncp-apigw-api-key, 응답 addresses[0].x(경도) .y(위도)
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VENUES = ROOT / "place" / "venues.json"
ENDPOINT = "https://maps.apigw.ntruss.com/map-geocode/v2/geocode"


def load_env():
    env = dict(os.environ)
    path = ROOT / ".env"
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env.setdefault(k.strip(), v.strip().strip('"').strip("'"))
    return env


def geocode(address, key_id, key):
    url = ENDPOINT + "?" + urllib.parse.urlencode({"query": address})
    req = urllib.request.Request(url, headers={
        "x-ncp-apigw-api-key-id": key_id,
        "x-ncp-apigw-api-key": key,
        "Accept": "application/json",
    })
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.load(r)
    if data.get("status") != "OK":
        raise RuntimeError(data.get("errorMessage") or data.get("status"))
    addrs = data.get("addresses") or []
    if not addrs:
        return None
    a = addrs[0]
    return round(float(a["y"]), 7), round(float(a["x"]), 7), a.get("roadAddress") or a.get("jibunAddress")


def main():
    force, dry = "--force" in sys.argv, "--dry-run" in sys.argv
    env = load_env()
    key_id, key = env.get("NCP_MAPS_CLIENT_ID", ""), env.get("NCP_MAPS_CLIENT_SECRET", "")
    if not key_id or not key:
        sys.exit(".env 에 NCP_MAPS_CLIENT_ID 와 NCP_MAPS_CLIENT_SECRET 을 넣어 주세요. (.env.example 참고)")

    data = json.loads(VENUES.read_text(encoding="utf-8"))
    venues = data.get("venues", [])
    changed = 0
    for v in venues:
        name, addr = v.get("name", "?"), (v.get("address") or "").strip()
        if not addr:
            print(f"  건너뜀  {name}: 주소 없음")
            continue
        if v.get("lat") and v.get("lng") and not force:
            print(f"  유지    {name}: {v['lat']}, {v['lng']}")
            continue
        try:
            hit = geocode(addr, key_id, key)
        except urllib.error.HTTPError as e:
            hint = " (콘솔에서 Geocoding API 를 선택했는지 확인)" if e.code == 429 else " (Client ID/Secret 확인)" if e.code in (401, 403) else ""
            sys.exit(f"API 오류 {e.code}{hint}")
        except Exception as e:  # noqa: BLE001
            print(f"  실패    {name}: {e}")
            continue
        if not hit:
            print(f"  못 찾음 {name}: {addr}  → 도로명 주소로 다시 적어 보세요")
            continue
        lat, lng, found = hit
        print(f"  채움    {name}: {lat}, {lng}  ({found})")
        v["lat"], v["lng"] = lat, lng
        changed += 1

    if changed and not dry:
        VENUES.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
        print(f"{changed}곳 저장 -> {VENUES.relative_to(ROOT)}")
    elif dry:
        print(f"{changed}곳 찾음 (--dry-run 이라 저장하지 않음)")
    else:
        print("바뀐 곳 없음")


if __name__ == "__main__":
    main()
