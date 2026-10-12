#!/usr/bin/env python3
"""
build_site.py — costcheck.kr (상견례 준비 노트) 페이지 생성기

본문 조각(tools/src/pages, tools/src/guides, tools/src/info 의 *.html)에
공통 머리말·헤더·푸터를 붙여 <주소>/index.html 로 쓰고, sitemap.xml 과 robots.txt 도 만든다.
페이지별 title·description·canonical·og 태그는 아래 PAGES 표에서 HTML 소스에 직접 들어간다.

    python tools/build_site.py

글이나 도구 화면을 고칠 때는 조각 파일만 고치고 이 스크립트를 다시 실행한다.
(생성된 */index.html, 404.html, sitemap.xml 을 직접 고치면 다음 실행 때 덮어써진다.)

조각 안에서 쓸 수 있는 치환자
  {{R}}          사이트 루트까지의 상대 경로 (예: "../")
  {{EMAIL}}      문의 이메일 (CONTACT_EMAIL, 비어 있으면 '준비 중' 안내)
  {{tool:키}}    도구 바로가기 카드 (가이드 본문용, 예: {{tool:checklist}})
"""

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tools" / "src"
OUT = ROOT

# ═════════ 사이트 설정: 값은 모두 여기 한 곳에서 넣는다 ═════════
DOMAIN = "https://costcheck.kr"
BRAND = "COSTCHECK"
# 검색 등록 소유확인 값(content="..." 안의 값만). 넣고 다시 실행하면 모든 페이지 <head>에 들어간다. 비우면 주석으로 자리만 남긴다.
NAVER_VERIFY = ""
GOOGLE_VERIFY = ""
# 애드센스 게시자 ID (예: "ca-pub-0000000000000000"). 비우면 광고 스크립트를 넣지 않는다.
ADSENSE_CLIENT = ""
# 문의 이메일. 비우면 문의·개인정보처리방침 페이지에 '준비 중'으로 표시된다.
CONTACT_EMAIL = ""
# ═══════════════════════════════════════════════════════════════

BASE = DOMAIN + "/"
TITLE_MAX, DESC_MAX = 30, 80

# key, 주소, 종류, 메뉴 이름, 짧은 이름, 그림, title, description, 한 줄 소개
PAGES = [
    dict(key="home", path="", kind="hub", nav="둘러보기", short="상견례 준비 노트", art=None,
         title="상견례 준비 총정리와 무료 도구 | COSTCHECK",
         desc="상견례 순서와 예절, 자리 배치도, 가족 소개 PPT, 비용 계산까지. 예비부부의 상견례 준비를 무료 도구와 가이드로 한곳에서 도와요."),
    dict(key="seat", path="seat", kind="tool", nav="자리 배치도", short="자리 배치도", art="seat",
         title="상견례 자리 배치도 무료 만들기 | COSTCHECK",
         desc="양가 인원과 호칭만 넣으면 상견례 자리 배치도가 완성돼요. 상석과 출입문까지 표시되고, 이미지로 저장해 가족과 공유하세요.",
         blurb="인원과 호칭만 넣으면 배치도가 완성돼요"),
    dict(key="place", path="place", kind="tool", nav="장소 찾기", short="장소 찾기", art="place", pre=["place/config.js"],
         title="지역별 상견례 장소 찾기 | COSTCHECK",
         desc="지도에서 지역을 누르면 상견례에 맞는 식당 유형과 검색 링크를 보여 드려요. 예약 전에 꼭 물어볼 질문도 함께 확인하세요.",
         blurb="지역별 식당 유형과 예약 전 물어볼 질문"),
    dict(key="gift", path="gift", kind="tool", nav="선물 추천", short="선물 추천", art="gift",
         title="상견례 선물 추천, 예산별 정리 | COSTCHECK",
         desc="3만 원부터 10만 원 이상까지 예산과 부모님 취향에 맞는 상견례 선물을 골라 드려요. 양가가 편한 선물 고르는 기준도 담았어요.",
         blurb="예산과 취향으로 고르는 선물"),
    dict(key="ppt", path="ppt", kind="tool", nav="PPT", short="가족 소개 PPT", art="ppt", pre=["assets/ppt-deck.js"],
         title="상견례 가족 소개 PPT 만들기 | COSTCHECK",
         desc="템플릿 4종 중 하나를 고르고 두 사람 이야기와 사진을 채우면 상견례 가족 소개 PPT가 완성돼요. 무료로 바로 파일을 받으세요.",
         blurb="템플릿을 골라 내용·사진을 채우는 편집기"),
    dict(key="invite", path="invite", kind="tool", nav="안내장", short="안내장", art="invite",
         title="상견례 안내장 무료 만들기 | COSTCHECK",
         desc="일시, 장소, 주차 안내를 한 장에 담은 상견례 안내장을 만들어 보세요. 이미지로 저장하거나 안내 문자로 복사해 양가에 보내세요.",
         blurb="일시·장소·주차를 한 장에, 안내 문자 복사까지"),
    dict(key="letter", path="letter", kind="tool", nav="손편지", short="손편지", art="letter",
         title="상견례 손편지 예시와 편지지 | COSTCHECK",
         desc="상견례 전후 상대 부모님, 우리 부모님께 쓰는 손편지 예시를 골라 보세요. 예쁜 편지지에 담아 이미지로 저장할 수 있어요.",
         blurb="받는 분과 시점별 편지 초안과 편지지"),
    dict(key="cost", path="cost", kind="tool", nav="비용 계산", short="비용 계산기", art="cost",
         title="상견례 비용 계산기, 누가 낼까 | COSTCHECK",
         desc="인원과 코스 가격만 넣으면 상견례 총비용과 1인당 금액, 집안별 부담을 바로 계산해요. 예비부부, 양가 반반 등 방식별로 비교하세요.",
         blurb="총비용과 집안별 부담을 바로 계산"),
    dict(key="talk", path="talk", kind="tool", nav="대화 카드", short="대화 카드", art="talk",
         title="상견례 인사말과 대화 주제 | COSTCHECK",
         desc="첫 인사, 가족 소개, 분위기 풀기, 마무리 인사까지 상견례에서 바로 쓸 수 있는 말을 모았어요. 피해야 할 이야기도 확인하세요.",
         blurb="첫 인사부터 마무리까지 상황별 문장"),
    dict(key="checklist", path="checklist", kind="tool", nav="체크리스트", short="D-day 체크리스트", art="check",
         title="상견례 준비 체크리스트 D-day | COSTCHECK",
         desc="상견례 날짜를 넣으면 한 달 전부터 당일까지 할 일을 시기별로 정리해 드려요. 체크하며 빠짐없이 준비하세요.",
         blurb="날짜를 넣으면 시기별 할 일 정리"),
    dict(key="order", path="guide/order", kind="guide", short="상견례 순서와 진행", art="flow",
         title="상견례 순서와 진행, 당일 흐름 | COSTCHECK",
         desc="상견례 당일 도착부터 배웅까지 시간대별 순서와 진행 멘트를 정리했어요. 상황별 대처법을 보고 체크리스트로 준비하세요.",
         blurb="도착부터 배웅까지 시간표와 진행 멘트"),
    dict(key="outfit", path="guide/outfit", kind="guide", short="상견례 복장", art="outfit",
         title="상견례 복장, 신랑·신부·부모님 | COSTCHECK",
         desc="상견례 옷차림을 예비신랑, 예비신부, 부모님별로 정리했어요. 계절별 기준과 좌식 룸 대비, 양가 복장을 맞추는 말까지 확인하세요.",
         blurb="신랑·신부·부모님별 옷차림 기준"),
    dict(key="manners", path="guide/manners", kind="guide", short="상견례 예절과 피해야 할 말", art="manners",
         title="상견례 예절과 피해야 할 말 | COSTCHECK",
         desc="상견례 호칭, 인사, 식사와 술자리 예절, 피해야 할 말을 예시 문장으로 정리했어요. 말실수를 수습하는 말도 미리 보세요.",
         blurb="호칭, 식사 예절, 피해야 할 말"),
    dict(key="thanks", path="guide/thanks", kind="guide", short="상견례 후 감사 인사", art="thanks",
         title="상견례 후 감사 인사와 문자 예시 | COSTCHECK",
         desc="상견례 후 상대 부모님께 보내는 감사 문자 예시를 상황별로 모았어요. 보내는 시점과 우리 부모님께 할 말까지 복사해 쓰세요.",
         blurb="그날 저녁 보내는 감사 문자 예시"),
    dict(key="who-pays", path="guide/who-pays", kind="guide", short="상견례 비용은 누가 내나", art="whopays",
         title="상견례 비용, 누가 내야 할까 | COSTCHECK",
         desc="상견례 식사비를 누가 낼지 방식별로 맞는 경우와 정하는 순서, 계산 타이밍을 정리했어요. 계산기로 집안별 부담도 확인하세요.",
         blurb="방식별 비교와 계산하는 요령"),
    dict(key="about", path="about", kind="info", short="사이트 소개",
         title="사이트 소개 | COSTCHECK",
         desc="COSTCHECK 상견례 준비 노트가 어떤 사이트인지, 어떤 도구와 가이드가 있는지, 입력한 내용을 어떻게 다루는지 소개해요."),
    dict(key="privacy", path="privacy", kind="info", short="개인정보처리방침",
         title="개인정보처리방침 | COSTCHECK",
         desc="COSTCHECK는 회원가입 없이 쓰며 입력값과 사진을 서버로 보내지 않아요. 브라우저에 남는 값과 광고 쿠키를 안내합니다."),
    dict(key="contact", path="contact", kind="info", short="문의하기",
         title="문의하기 | COSTCHECK",
         desc="COSTCHECK 상견례 준비 노트에 대한 오류 제보, 내용 제안, 장소 추천 문의는 이메일로 보내 주세요."),
]
BY_KEY = {p["key"]: p for p in PAGES}
TOOLS = [p for p in PAGES if p["kind"] == "tool"]
GUIDES = [p for p in PAGES if p["kind"] == "guide"]
INFOS = [p for p in PAGES if p["kind"] == "info"]
NOT_FOUND = dict(key="404", path="", kind="404", short="페이지를 찾을 수 없어요",
                 title="페이지를 찾을 수 없어요 | COSTCHECK", desc="주소가 바뀌었거나 없는 페이지예요. 상견례 준비 노트 첫 화면에서 다시 찾아보세요.")

# 도구 페이지 아래 '같이 보면 좋은 글'
RELATED = {
    "seat": ["manners", "order"],
    "place": ["order", "who-pays"],
    "gift": ["who-pays", "thanks"],
    "ppt": ["order", "manners"],
    "invite": ["order", "outfit"],
    "letter": ["thanks", "manners"],
    "cost": ["who-pays", "order"],
    "talk": ["manners", "thanks"],
    "checklist": ["order", "outfit"],
}

# 모바일 하단 빠른 이동
TABBAR = [
    ("home", "둘러보기", '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>'),
    ("seat", "배치도", '<rect x="8" y="4" width="8" height="16" rx="4"/><circle cx="4" cy="8" r="1.5"/><circle cx="4" cy="16" r="1.5"/><circle cx="20" cy="8" r="1.5"/><circle cx="20" cy="16" r="1.5"/>'),
    ("place", "장소", '<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    ("gift", "선물", '<rect x="4" y="9" width="16" height="11" rx="2"/><path d="M3 9h18M12 9v11M12 9c-2-4-6-4-6-1.5S10 9 12 9zm0 0c2-4 6-4 6-1.5S14 9 12 9z"/>'),
    ("checklist", "체크", '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4M9 15l2 2 4-4"/>'),
]

E = lambda s: html.escape(str(s), quote=True)
CUR = ' aria-current="page"'


def rel(page):
    if page["kind"] == "404":
        return "/"  # 404.html 은 아무 주소에서나 보이므로 루트 기준 절대 경로를 쓴다
    depth = len(page["path"].split("/")) if page["path"] else 0
    return "../" * depth or "./"


def href(r, page):
    return r + (page["path"] + "/" if page["path"] else "")


def url_of(page):
    return BASE + (page["path"] + "/" if page["path"] else "")


def tool_card(r, key):
    p = BY_KEY[key]
    return (f'<a class="tool-link" href="{href(r, p)}"><img src="{r}assets/art/{p["art"]}.svg" alt="" width="52" height="65" loading="lazy">'
            f'<div><b>{E(p["short"])}</b><span>{E(p["blurb"])}</span></div></a>')


def email_html():
    if CONTACT_EMAIL:
        return f'<a href="mailto:{E(CONTACT_EMAIL)}">{E(CONTACT_EMAIL)}</a>'
    return '<!-- TODO: tools/build_site.py 의 CONTACT_EMAIL 에 문의 이메일을 넣으세요 --><span class="email-todo">문의 이메일 준비 중</span>'


def fill(text, r):
    text = re.sub(r"\{\{tool:([\w-]+)\}\}", lambda m: tool_card(r, m.group(1)), text)
    return text.replace("{{R}}", r).replace("{{EMAIL}}", email_html())


def verify_tags():
    out = []
    if NAVER_VERIFY:
        out.append(f'<meta name="naver-site-verification" content="{E(NAVER_VERIFY)}">')
    if GOOGLE_VERIFY:
        out.append(f'<meta name="google-site-verification" content="{E(GOOGLE_VERIFY)}">')
    if NAVER_VERIFY and GOOGLE_VERIFY:
        return "\n".join(out)
    todo = []
    if not NAVER_VERIFY:
        todo.append('<meta name="naver-site-verification" content="네이버에서_받은_값">')
    if not GOOGLE_VERIFY:
        todo.append('<meta name="google-site-verification" content="구글에서_받은_값">')
    return "\n".join(out + ["<!-- [검색 등록] 소유확인 코드는 tools/build_site.py 의 NAVER_VERIFY, GOOGLE_VERIFY 에 넣고 다시 실행하세요."] + todo + ["-->"])


def adsense_tag():
    if ADSENSE_CLIENT:
        return (f'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={E(ADSENSE_CLIENT)}"\n'
                '     crossorigin="anonymous"></script>')
    return "<!-- [광고] 애드센스 게시자 ID 는 tools/build_site.py 의 ADSENSE_CLIENT 에 넣으세요. -->"


def head(page, r):
    is404 = page["kind"] == "404"
    og_type = "article" if page["kind"] == "guide" else "website"
    meta_url = "" if is404 else f'<link rel="canonical" href="{url_of(page)}">\n'
    og = "" if is404 else f"""<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{BRAND}">
<meta property="og:locale" content="ko_KR">
<meta property="og:title" content="{E(page["title"])}">
<meta property="og:description" content="{E(page["desc"])}">
<meta property="og:url" content="{url_of(page)}">
"""
    ld = ""
    if page["key"] == "home":
        ld = ('<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebSite","name":"COSTCHECK 상견례 준비 노트",'
              f'"url":"{BASE}","inLanguage":"ko-KR","description":"{E(page["desc"])}"}}</script>\n')
    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
{verify_tags()}
<title>{E(page["title"])}</title>
<meta name="description" content="{E(page["desc"])}">
{'<meta name="robots" content="noindex">' + chr(10) if is404 else ''}{meta_url}{og}<meta name="theme-color" content="#ffffff">
<link rel="icon" href="{r}favicon.svg" type="image/svg+xml">
<link rel="icon" href="{r}favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="{r}apple-touch-icon.png">
{ld}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nanum+Pen+Script&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<link rel="stylesheet" href="{r}assets/sgr.css">
{adsense_tag()}
</head>"""


def header(page, r):
    navs = [p for p in PAGES if p["kind"] in ("hub", "tool")]
    links = "\n".join(
        f'      <a href="{href(r, p)}"{CUR if p is page else ""}>{E(p["nav"])}</a>' for p in navs)
    return f"""<header class="hd">
  <div class="wrap hd-in">
    <a class="logo" href="{r}">COSTCHECK<span>상견례</span></a>
    <nav class="gnb" aria-label="상견례 준비 메뉴">
{links}
    </nav>
  </div>
</header>"""


def footer(r):
    tools = "".join(f'<a href="{href(r, p)}">{E(p["short"])}</a>' for p in TOOLS)
    guides = "".join(f'<a href="{href(r, p)}">{E(p["short"])}</a>' for p in GUIDES)
    infos = "".join(f'<a href="{href(r, p)}">{E(p["short"])}</a>' for p in INFOS)
    return f"""<footer class="ft">
  <div class="wrap">
    <div class="ft-in">
      <div class="ft-about"><b>COSTCHECK</b><p>상견례 준비 노트는 일반적인 관례를 정리한 안내예요. 지역과 집안에 따라 다를 수 있으니 양가의 뜻을 먼저 살펴 주세요. 도구에 입력한 내용과 사진은 서버로 보내지 않아요.</p></div>
      <nav aria-label="준비 도구"><h2>준비 도구</h2>{tools}</nav>
      <nav aria-label="상견례 가이드"><h2>가이드</h2>{guides}</nav>
      <nav aria-label="사이트 정보"><h2>사이트</h2><a href="{r}">첫 화면</a>{infos}</nav>
    </div>
    <p class="ft-copy">© 2026 COSTCHECK · costcheck.kr</p>
  </div>
</footer>"""


def tabbar(page, r):
    items = []
    for key, label, icon in TABBAR:
        p = BY_KEY[key]
        cur = CUR if p is page else ""
        items.append(f'  <a href="{href(r, p)}"{cur}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">{icon}</svg>{label}</a>')
    return '<nav class="tabbar" aria-label="빠른 이동">\n' + "\n".join(items) + "\n</nav>"


def more_tools(page, r):
    chips = "".join(
        f'<a class="chip" href="{href(r, p)}"{CUR if p is page else ""}>{E(p["short"])}</a>' for p in TOOLS)
    return f"""<div class="wrap more-tools">
  <h3>다른 준비 도구</h3>
  <div class="chips">{chips}</div>
</div>"""


def related(page, r):
    items = "".join(f'<li><a href="{href(r, BY_KEY[k])}">{E(BY_KEY[k]["short"])} <span>{E(BY_KEY[k]["blurb"])}</span></a></li>'
                    for k in RELATED.get(page["key"], []))
    return f'<aside class="related" aria-label="같이 보면 좋은 글"><h2>같이 보면 좋은 가이드</h2><ul>{items}</ul></aside>'


def guide_more(page, r):
    items = "".join(f'<li><a href="{href(r, p)}">{E(p["short"])}<span>{E(p["blurb"])}</span></a></li>'
                    for p in GUIDES if p is not page)
    return f'<nav class="guide-more" aria-label="다른 가이드"><h2>다른 상견례 가이드</h2><ul>{items}</ul></nav>'


def render(page):
    r = rel(page)
    kind = page["kind"]
    script = None
    if kind in ("guide", "info", "404"):
        folder = {"guide": "guides", "info": "info", "404": "info"}[kind]
        body = fill((SRC / folder / f"{page['key']}.html").read_text(encoding="utf-8"), r).rstrip()
        if kind == "guide":
            crumb = f'<ol class="crumb"><li><a href="{r}">상견례 준비</a></li><li>가이드</li><li aria-current="page">{E(page["short"])}</li></ol>\n'
            more = guide_more(page, r) + "\n"
        elif kind == "info":
            crumb = f'<ol class="crumb"><li><a href="{r}">상견례 준비</a></li><li aria-current="page">{E(page["short"])}</li></ol>\n'
            more = ""
        else:
            crumb, more = "", ""
        back = "" if kind == "404" else f'<p class="back-hub"><a class="btn btn-line btn-sm" href="{r}">← 상견례 준비 전체 보기</a></p>\n'
        main = f"""<main class="view wrap">
<article class="article">
{crumb}{body}
{more}{back}</article>
</main>"""
    else:
        body = fill((SRC / "pages" / f"{page['key']}.html").read_text(encoding="utf-8"), r).rstrip()
        if kind == "hub":
            main = f"<main>\n{body}\n</main>"
            script = "hub"
        else:
            main = f"""<main>
<div class="view wrap">
{body}
{related(page, r)}
</div>
{more_tools(page, r)}
</main>"""
            script = page["key"]
    scripts = f'<script src="{r}assets/sgr.js"></script>'
    for extra in page.get("pre", []):
        scripts += f'\n<script src="{r}{extra}"></script>'
    if script:
        scripts += f'\n<script src="{r}assets/{script}.js"></script>'
    return f"""{head(page, r)}
<body>

{header(page, r)}

{main}

{footer(r)}

{tabbar(page, r)}

<button class="to-top" id="toTop" aria-label="맨 위로"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d1d22" stroke-width="2" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<div id="printArea"></div>

{scripts}
</body>
</html>
"""


def write(path, text):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def main():
    seen_t, seen_d = set(), set()
    for page in PAGES:
        t, d = page["title"], page["desc"]
        warn = []
        if len(t) > TITLE_MAX:
            warn.append(f"title {len(t)}자")
        if len(d) > DESC_MAX:
            warn.append(f"description {len(d)}자")
        if t in seen_t or d in seen_d:
            warn.append("다른 페이지와 같은 title/description")
        seen_t.add(t)
        seen_d.add(d)
        write(OUT / page["path"] / "index.html" if page["path"] else OUT / "index.html", render(page))
        print(f"{'!' if warn else ' '} /{page['path'] + '/' if page['path'] else ''}  ({len(t)}/{len(d)}자) {' · '.join(warn)}")
    write(OUT / "404.html", render(NOT_FOUND))
    print("  /404.html")
    # 사이트맵: 실제로 만든 페이지만 (404 제외)
    urls = "".join(f"  <url><loc>{url_of(p)}</loc></url>\n" for p in PAGES)
    write(OUT / "sitemap.xml", f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n{urls}</urlset>\n')
    write(OUT / "robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {BASE}sitemap.xml\n")
    print(f"{len(PAGES)}개 페이지 + 404.html, sitemap.xml({len(PAGES)}개 주소), robots.txt -> {OUT}")
    for name, val in [("NAVER_VERIFY", NAVER_VERIFY), ("GOOGLE_VERIFY", GOOGLE_VERIFY), ("ADSENSE_CLIENT", ADSENSE_CLIENT), ("CONTACT_EMAIL", CONTACT_EMAIL)]:
        if not val:
            print(f"  (비어 있음) {name}")


if __name__ == "__main__":
    main()
