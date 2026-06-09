// 스크롤 위치 기준으로 "현재 보고 있는 제목"에 해당하는 목차 링크를 찾는다.
function getActiveLink(content: HTMLElement): HTMLElement | null {
  const links = Array.from(content.querySelectorAll<HTMLElement>("a[data-for]"))
  if (links.length === 0) return null

  // 화면 상단에서 살짝 아래 지점을 "현재"의 기준선으로 삼는다
  const base = Math.min(160, window.innerHeight * 0.2)
  let threshold = base
  // 페이지 끝부분의 제목들은 상단까지 스크롤되지 못하므로,
  // 바닥에 가까워질수록 기준선을 아래로 내려 하단 항목도 차례로 활성화되게 한다
  const distanceToBottom =
    document.documentElement.scrollHeight - (window.scrollY + window.innerHeight)
  if (distanceToBottom < window.innerHeight) {
    const t = Math.max(0, distanceToBottom) / window.innerHeight // 1→0 으로 감소
    threshold = base + (window.innerHeight - base) * (1 - t)
  }

  let active: HTMLElement | null = null
  for (const link of links) {
    const slug = link.getAttribute("data-for")
    const heading = slug ? document.getElementById(slug) : null
    if (!heading) continue
    if (heading.getBoundingClientRect().top <= threshold) {
      active = link
    } else {
      break // 링크는 제목 순서대로이므로 기준선 아래를 만나면 종료
    }
  }
  // 첫 제목보다 위로 스크롤된 상태면 첫 항목을 현재로 본다
  return active ?? links[0]
}

// 현재 항목 강조(.toc-current)와 레일 위 표시기(thumb) 위치를 갱신한다
function updateToc() {
  for (const content of document.querySelectorAll<HTMLElement>(".toc-content")) {
    const active = getActiveLink(content)
    content.querySelectorAll("a.toc-current").forEach((el) => el.classList.remove("toc-current"))

    const thumb = content.querySelector<HTMLElement>(".toc-thumb")
    if (!active) {
      if (thumb) thumb.style.opacity = "0"
      continue
    }
    active.classList.add("toc-current")
    if (thumb) {
      thumb.style.opacity = "1"
      thumb.style.transform = `translateY(${active.offsetTop}px)`
      thumb.style.height = `${active.offsetHeight}px`
    }
  }
}

// 스크롤 중 과도한 호출을 막기 위해 rAF로 묶는다
let ticking = false
function onScroll() {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    updateToc()
    ticking = false
  })
}

function toggleToc(this: HTMLElement) {
  this.classList.toggle("collapsed")
  this.setAttribute(
    "aria-expanded",
    this.getAttribute("aria-expanded") === "true" ? "false" : "true",
  )
  const content = this.nextElementSibling as HTMLElement | undefined
  if (!content) return
  content.classList.toggle("collapsed")
}

function setupToc() {
  for (const toc of document.getElementsByClassName("toc")) {
    const button = toc.querySelector(".toc-header")
    const content = toc.querySelector(".toc-content")
    if (!button || !content) return
    button.addEventListener("click", toggleToc)
    window.addCleanup(() => button.removeEventListener("click", toggleToc))

    // 슬라이드 표시기 요소를 한 번만 생성
    if (!content.querySelector(".toc-thumb")) {
      const thumb = document.createElement("span")
      thumb.className = "toc-thumb"
      content.prepend(thumb)
    }
  }
}

document.addEventListener("nav", () => {
  setupToc()

  // 스크롤·클릭·리사이즈에 따라 현재 항목과 표시기를 갱신
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll)
  window.addCleanup(() => {
    window.removeEventListener("scroll", onScroll)
    window.removeEventListener("resize", onScroll)
  })
  updateToc() // 초기 위치 설정
})
