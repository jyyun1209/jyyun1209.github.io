#!/usr/bin/env node
// 티스토리 RSS의 글 1개를 Quartz 마크다운으로 변환한다.
//
// 사용법:
//   node scripts/import-tistory.mjs --match "글 제목 일부" --out "content/카테고리/글폴더"
//   [--rss https://본인블로그.tistory.com/rss]  (기본값은 아래 DEFAULT_RSS)
//
// 동작:
//   - RSS에서 제목에 --match 가 포함된 첫 글을 찾는다
//   - 본문 HTML을 마크다운으로 변환 (turndown + gfm: 표/취소선 지원)
//   - 본문 이미지를 --out 폴더로 내려받아 image-N.확장자 로 저장하고 경로를 로컬로 치환
//   - frontmatter(title/status/publish_date/tags)를 붙여 <out>/index.md 로 기록
//
// 규칙: 이미지 확장자는 소문자, 파일/폴더명에 마침표 금지 (Quartz 슬러그 안전)

import { writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import TurndownService from "turndown"
import { gfm } from "turndown-plugin-gfm"

const DEFAULT_RSS = "https://jyyun1209.tistory.com/rss"

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) out[argv[i].slice(2)] = argv[i + 1]
  }
  return out
}

// HTML 엔티티 디코드 (이중 인코딩 대비해 최대 2회까지 안정화)
function decodeEntities(s, passes = 1) {
  const once = (t) =>
    t
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&#x27;|&apos;/g, "'")
      .replace(/&#0?34;/g, '"')
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
  let r = s
  for (let i = 0; i < passes; i++) r = once(r)
  return r
}

function pick(block, tag) {
  const m = block.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))
  return m ? m[1].trim() : ""
}

function extToLower(url) {
  const path = url.split("?")[0]
  const m = path.match(/\.([a-zA-Z0-9]+)$/)
  const ext = (m ? m[1] : "png").toLowerCase()
  return ext === "jpeg" ? "jpg" : ext
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!args.match || !args.out) {
    console.error('사용법: node scripts/import-tistory.mjs --match "제목일부" --out "content/.../폴더"')
    process.exit(1)
  }
  const rssUrl = args.rss || DEFAULT_RSS

  const xml = await (await fetch(rssUrl)).text()
  const items = xml.split("<item>").slice(1)
  const block = items.find((it) => decodeEntities(pick(it, "title"), 2).includes(args.match))
  if (!block) {
    console.error(`매칭되는 글을 찾지 못했습니다: "${args.match}"`)
    process.exit(1)
  }

  const title = decodeEntities(pick(block, "title"), 2)
  const link = pick(block, "link")
  const pubDate = pick(block, "pubDate")
  const isoDate = pubDate ? new Date(pubDate).toISOString().slice(0, 10) : ""
  // category: 경로형(슬래시 포함)은 블로그 카테고리이므로 태그에서 제외
  const tags = [...block.matchAll(/<category>([\s\S]*?)<\/category>/g)]
    .map((m) => decodeEntities(m[1], 2).trim())
    .filter((c) => c && !c.includes("/"))
  const uniqueTags = [...new Set(tags)]

  let html = decodeEntities(pick(block, "description"), 1)

  const td = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    emDelimiter: "*",
  })
  td.use(gfm)
  let md = td.turndown(html)

  // 헤딩 안에 중복된 굵게(**) 제거: "## **제목**" -> "## 제목"
  md = md.replace(/^(#{1,6})\s*\*\*([\s\S]+?)\*\*\s*$/gm, "$1 $2")
  // 빈 줄 3개 이상 -> 2개로 축소
  md = md.replace(/\n{3,}/g, "\n\n")

  // 이미지 다운로드 + 로컬 경로 치환
  mkdirSync(args.out, { recursive: true })
  const imgRegex = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g
  const matches = [...md.matchAll(imgRegex)]
  let idx = 0
  const replacements = []
  for (const m of matches) {
    idx++
    const [full, alt, url] = m
    const filename = `image-${idx}.${extToLower(url)}`
    try {
      const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
      writeFileSync(join(args.out, filename), buf)
      replacements.push([full, `![${alt}](${filename})`])
      console.log(`  내려받음: ${filename}  <- ${url.slice(0, 60)}...`)
    } catch (e) {
      console.warn(`  실패(원본 URL 유지): ${url}`)
    }
  }
  for (const [from, to] of replacements) md = md.split(from).join(to)

  // frontmatter
  const fm = [
    "---",
    `title: ${JSON.stringify(title)}`,
    "status: Draft",
    `publish_date: ${isoDate}`,
    "tags:",
    ...uniqueTags.map((t) => `  - ${t}`),
    `source: ${link}`,
    "---",
    "",
  ].join("\n")

  writeFileSync(join(args.out, "index.md"), fm + md + "\n")
  console.log(`\n완료: ${join(args.out, "index.md")}`)
  console.log(`제목: ${title}`)
  console.log(`날짜: ${isoDate} | 태그: ${uniqueTags.join(", ")} | 이미지: ${idx}개`)
}

main()
