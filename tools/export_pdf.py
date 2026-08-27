#!/usr/bin/env python3
"""
index.html(About 페이지)을 영어판·한국어판 단일 페이지 PDF로 내보낸다.

동작:
  1. 각 언어를 고정(data-lang)하고 lang.js 토글 스크립트를 제거한 인쇄용 사본 생성
  2. 상단 nav 숨김 / 2단 그리드 강제(반응형 붕괴 방지) / footer의 Blog 링크 숨김 /
     배경색 인쇄(print-color-adjust) 적용
  3. 데스크톱 폭에서 실제 콘텐츠 높이를 측정해 한 페이지에 맞춘 @page 크기 지정
  4. 헤드리스 Chrome/Edge로 PDF 생성 → export/
  5. 임시 파일 정리

사용법:  python export_pdf.py
필요:    Chrome 또는 Edge, 파이썬 패키지 Pillow(없으면 자동 설치)
"""
import sys
import shutil
import tempfile
import subprocess
from datetime import date
from pathlib import Path

# Windows 콘솔에서도 한글 출력이 깨지지 않도록
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# ── 설정 ────────────────────────────────────────────
# 이 스크립트는 tools/ 안에 있으므로, 프로젝트 루트는 상위 폴더다.
ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT_DIR = ROOT / "export"
LANGS = {"en": "Junyoung_Yun_CV_EN.pdf", "ko": "Junyoung_Yun_CV_KO.pdf"}

PAGE_WIDTH = 1120      # px. 860(반응형 분기)보다 커야 데스크톱 2단이 유지된다.
BOTTOM_BUFFER = 120    # px. footer의 투명 여백 + 인쇄/화면 렌더 차이를 흡수하는 하단 버퍼.
MEASURE_TALL = 5000    # px. 높이 측정용 창 높이(콘텐츠보다 충분히 커야 한다).

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
]

EXPORT_CSS = """<style>
  .topnav {{ display: none !important; }}
  .page {{ margin: 28px auto !important; grid-template-columns: 300px 1fr !important; }}
  .entry {{ grid-template-columns: 92px 1fr !important; }}
  .footer-links a[href="blog.html"] {{ display: none !important; }}
  @page {{ size: {w}px {h}px; margin: 0; }}
  @media print {{
    * {{ -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }}
  }}
</style>
"""


def find_browser():
    for p in CHROME_CANDIDATES:
        if Path(p).exists():
            return p
    sys.exit("Chrome/Edge를 찾지 못했습니다. CHROME_CANDIDATES 경로를 확인하세요.")


def ensure_pillow():
    try:
        import PIL  # noqa: F401
    except ImportError:
        print("Pillow 설치 중...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "Pillow"], check=True)


def build_html(src_text, lang, page_h):
    s = src_text.replace('<script src="assets/lang.js"></script>\n', "")
    s = s.replace('<script src="assets/lang.js"></script>', "")
    s = s.replace('<html lang="ko">', f'<html lang="{lang}" data-lang="{lang}">')
    return s.replace("</head>", EXPORT_CSS.format(w=PAGE_WIDTH, h=page_h) + "</head>")


def run_browser(browser, *args):
    prof = tempfile.mkdtemp(prefix="cvpdf_")
    try:
        subprocess.run(
            [browser, "--headless=new", "--disable-gpu", "--no-sandbox",
             f"--user-data-dir={prof}", "--virtual-time-budget=3000", *args],
            check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        )
    finally:
        shutil.rmtree(prof, ignore_errors=True)


def measure_height(browser, html_path):
    """데스크톱 폭에서 렌더한 뒤, 배경색이 아닌 영역의 하단 y좌표(= 콘텐츠 높이)를 반환."""
    from PIL import Image, ImageChops
    shot = html_path.with_suffix(".measure.png")
    run_browser(browser, "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--window-size={PAGE_WIDTH},{MEASURE_TALL}",
                f"--screenshot={shot}", html_path.as_uri())
    im = Image.open(shot).convert("RGB")
    bg = im.getpixel((im.width - 2, im.height - 2))          # 우하단 = 배경색
    bbox = ImageChops.difference(im, Image.new("RGB", im.size, bg)).getbbox()
    shot.unlink(missing_ok=True)
    if not bbox:
        sys.exit(f"{html_path.name}: 콘텐츠 높이 측정 실패(빈 화면).")
    return bbox[3]


def main():
    if not SRC.exists():
        sys.exit(f"원본을 찾지 못했습니다: {SRC}")
    ensure_pillow()
    browser = find_browser()
    OUT_DIR.mkdir(exist_ok=True)
    src_text = SRC.read_text(encoding="utf-8")

    temp_files = []
    date_prefix = date.today().strftime("%y%m%d") + "_"   # 예: 260828_
    print(f"브라우저: {browser}")
    for lang, base_name in LANGS.items():
        pdf_name = date_prefix + base_name
        work = ROOT / f"_export_{lang}.html"
        temp_files.append(work)

        # 1) 높이 측정용 사본 → 실제 콘텐츠 높이 측정
        work.write_text(build_html(src_text, lang, MEASURE_TALL), encoding="utf-8")
        content_h = measure_height(browser, work)
        page_h = content_h + BOTTOM_BUFFER

        # 2) 측정 높이로 @page 지정 후 PDF 생성
        work.write_text(build_html(src_text, lang, page_h), encoding="utf-8")
        pdf_path = OUT_DIR / pdf_name
        run_browser(browser, "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf_path}", work.as_uri())
        print(f"  [{lang}] {pdf_path.relative_to(ROOT)}  ({PAGE_WIDTH}x{page_h}px, 콘텐츠 {content_h}px)")

    for t in temp_files:
        t.unlink(missing_ok=True)
    print("완료.")


if __name__ == "__main__":
    main()
