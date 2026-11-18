#!/usr/bin/env node
import { appendFile, mkdir, readFile, readdir, realpath, rename, rmdir, unlink, writeFile } from "node:fs/promises"
import { existsSync, realpathSync } from "node:fs"
import { createHash } from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { decodeUrlCharacters } from "./character-references.mjs"
import { rootTemplates, safePath, resolveWorkspace } from "./standard.mjs"

const hash = (bytes) => createHash("sha256").update(bytes).digest("hex")
const decode = (bytes) => new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes)
const bundledTemplates = path.resolve(realpathSync(fileURLToPath(new URL(".", import.meta.url))), "../templates")

function uniqueDestination(destination, reserved) {
  if (!existsSync(destination) && !reserved.has(destination)) { reserved.add(destination); return destination }
  const parsed = path.parse(destination)
  for (let index = 1; index < 1000; index++) {
    const suffix = index === 1 ? "-migrated" : `-migrated-${index}`
    const candidate = path.join(parsed.dir, `${parsed.name}${suffix}${parsed.ext}`)
    if (!existsSync(candidate) && !reserved.has(candidate)) { reserved.add(candidate); return candidate }
  }
  throw new Error(`No non-conflicting destination for ${destination}`)
}

async function files(root, instructionRoot, scan = false, blockers = []) {
  const info = await safePath(instructionRoot, root)
  if (!info) return []
  if (!info.isDirectory()) throw new Error(`Expected directory: ${root}`)
  const result = []
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const current = path.join(root, entry.name)
    if (scan && ([".git", "node_modules", ".next", ".venv"].includes(entry.name) || (entry.isDirectory() && entry.name === "templates" && await realpath(current) === bundledTemplates))) continue
    if (entry.isSymbolicLink()) {
      if (!scan) blockers.push(`${current} is a symlink; its owner must migrate it.`)
    } else if (entry.isDirectory()) result.push(...await files(current, instructionRoot, scan, blockers))
    else if (entry.isFile()) result.push(current)
  }
  return result
}

function rebaseUrl(url, source, destination, mappings, markdown = true) {
    const angle = markdown && url.startsWith("<")
    const raw = angle ? url.slice(1, -1) : url
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(raw)) return url
    const value = decodeUrlCharacters(raw, markdown).replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, "").replace(/[\t\r\n]/g, "")
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(value)) return url
    const separator = value.indexOf("#")
    const pathAndQuery = separator < 0 ? value : value.slice(0, separator)
    const queryIndex = pathAndQuery.indexOf("?")
    const pathname = queryIndex < 0 ? pathAndQuery : pathAndQuery.slice(0, queryIndex)
    const query = queryIndex < 0 ? "" : pathAndQuery.slice(queryIndex)
    const fragment = separator < 0 ? "" : value.slice(separator + 1)
    let decodedPath
    try { decodedPath = decodeURIComponent(pathname) } catch { decodedPath = pathname }
    const oldTarget = pathname ? path.resolve(path.dirname(source), decodedPath) : source
    const mapped = mappings.get(oldTarget)
    if (!mapped && source === destination) return url
    const newTarget = mapped?.destination ?? oldTarget
    const relative = path.relative(path.dirname(destination), newTarget).split(path.sep).join("/") || "."
    const anchor = mapped?.anchor ? `${mapped.anchor}${fragment ? `-${fragment}` : ""}` : fragment
    const encoded = relative.split("/").map((part) => encodeURIComponent(part).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`)).join("/")
    const result = `${encoded}${pathname.endsWith("/") ? "/" : ""}${query}${anchor ? `#${anchor}` : ""}`
    const serialized = markdown ? result.replace(/[\u0000-\u0020\u007f\s<>"'`()\\]/g, (char) => encodeURIComponent(char).replace(/[!'()*]/g, (part) => `%${part.charCodeAt(0).toString(16).toUpperCase()}`)).replace(/&/g, "&amp;") : result
    return angle ? `<${serialized}>` : serialized
}

function rebaseHtmlTag(tag, source, destination, mappings) {
  if (!/^<[a-z][\w:-]*(?:\s|\/?>)/i.test(tag)) return tag
  return tag.replace(/(\s)([^\s"'<>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g, (attribute, space, key, equal, double, single, bare) => {
    if (!["href", "src", "poster", "xlink:href"].includes(key.toLowerCase())) return attribute
    const original = double ?? single ?? bare
    if (/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(original)) return attribute
    const updated = rebaseUrl(original, source, destination, mappings, false)
    if (updated === original) return attribute
    const quote = single !== undefined ? "'" : '"'
    const escaped = updated.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;")
    return `${space}${key}${equal}${quote}${escaped}${quote}`
  })
}

function rebase(text, source, destination, mappings) {
  return rewriteMarkdown(text, null, source, destination, mappings)
}

function codeSpanEnd(value, start) {
  let length = 1
  while (value[start + length] === "`") length++
  const delimiter = "`".repeat(length)
  let end = value.indexOf(delimiter, start + length)
  while (end >= 0) {
    if (value[end - 1] !== "`" && value[end + length] !== "`") return end + length
    end = value.indexOf(delimiter, end + length)
  }
  return -1
}

function rewriteMarkdown(text, anchor, source, destination, mappings) {
  const normalize = (label) => label.replace(/^[ \t\r\n]+|[ \t\r\n]+$/g, "").replace(/[ \t\r\n]+/g, " ").toLowerCase().toUpperCase().toLowerCase()
  const labels = new Map()
  const definition = /^((?:(?:[ \t]*>[ \t]?)|(?:[ \t]*(?:[-+*]|\d{1,9}[.)])[ \t]+))*[ \t]*)\[((?:\\.|[^\]\\\n])+)\](:)/
  const outsideCode = (value, transform, literal = (line) => line) => {
    let fence, footnote = false, afterBlank = true
    let offset = 0, commentEnd = 0, inlineEnd = 0
    const lists = []
    const block = (line) => { inlineEnd = 0; return literal(line) }
    return value.split("\n").map((line) => {
      const start = offset
      offset += line.length + 1
      const trackLiterals = () => {
        for (let index = Math.max(start, commentEnd, inlineEnd); index < start + line.length; index++) {
          if (value[index] === slash) { index++; continue }
          if (value[index] === tick) {
            const end = codeEnd(value, index)
            if (end >= 0) { inlineEnd = end; index = end - 1; continue }
          }
          if (value.startsWith("<!--", index)) {
            const end = value.indexOf("-->", index + 4)
            commentEnd = end < 0 ? value.length : end + 3
            index = commentEnd - 1
          }
        }
      }
      if (start < commentEnd) { trackLiterals(); return transform(line) }
      const content = line.replace(/^(?: {0,3}>[ \t]?)+/, "")
      const spaces = content.match(/^[ \t]*/)[0].replace(/\t/g, "    ").length
      if (fence) {
        const marker = content.slice(Math.min(spaces, fence.base)).match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
        if (marker && marker[1][0] === fence.marker[0] && marker[1].length >= fence.marker.length && !marker[2].trim()) { fence = undefined; afterBlank = true }
        return block(line)
      }
      if (!content.trim()) { afterBlank = true; return block(line) }
      const containerIndent = lists.at(-1) ?? (footnote ? 4 : 0)
      if (afterBlank && spaces >= containerIndent + 4) return block(line)
      const list = content.match(/^([ \t]*)(?:[-+*]|\d{1,9}[.)])([ \t]+)(.*)$/)
      if (list) {
        while (lists.length && lists.at(-1) > spaces) lists.pop()
        lists.push(content.slice(0, content.length - list[3].length).replace(/\t/g, "    ").length)
      } else if (afterBlank || /^\s*#{1,6}\s/.test(content)) {
        while (lists.length && lists.at(-1) > spaces) lists.pop()
        if (spaces < 4) footnote = false
      }
      const isFootnote = /^\s*\[\^[^\]]+\]:/.test(content)
      const base = lists.at(-1) ?? (footnote ? 4 : 0)
      const logical = list ? list[3] : content.slice(Math.min(spaces, base))
      const marker = logical.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
      if (marker) { fence = { marker: marker[1], base }; return block(line) }
      if (afterBlank && spaces >= base + 4) return block(line)
      if (isFootnote) footnote = true
      afterBlank = false
      trackLiterals()
      return transform(line)
    }).join("\n")
  }
  const slash = String.fromCharCode(92)
  const tick = String.fromCharCode(96)
  const codeEnd = codeSpanEnd
  const angleEnd = (value, start, attributes = false) => {
    if (value.startsWith("<!--", start)) {
      const end = value.indexOf("-->", start + 4)
      return end < 0 ? value.length - 1 : end + 2
    }
    let quote
    for (let index = start + 1; index < value.length; index++) {
      const char = value[index]
      if (char === slash) { index++; continue }
      if (!attributes && (char === "\n" || char === "\r")) return -1
      if (quote) { if (char === quote) quote = undefined }
      else if (attributes && (char === '"' || char === "'")) quote = char
      else if (char === ">") return index
    }
    return -1
  }
  const close = (value, start, opening, ending) => {
    let depth = 1, quote
    for (let index = start + 1; index < value.length; index++) {
      const char = value[index]
      if (char === slash) { index++; continue }
      if (quote) { if (char === quote) quote = undefined; continue }
      if (opening === "(" && (char === '"' || char === "'") && /\s/.test(value[index - 1])) { quote = char; continue }
      if (opening === "(" && char === "<") { const end = angleEnd(value, index); if (end >= 0) { index = end; continue } }
      if (char === tick) { const end = codeEnd(value, index); if (end >= 0) { index = end - 1; continue } }
      if (char === opening) depth++
      else if (char === ending && --depth === 0) return index
    }
    return -1
  }
  const inlineDestination = (value) => {
    let start = 1
    while (/\s/.test(value[start] ?? "") && start < value.length) start++
    let end = start
    if (value[start] === "<") {
      const angle = angleEnd(value, start)
      if (angle < 0) return value
      end = angle + 1
    } else {
      let depth = 0
      while (end < value.length - 1 && !/\s/.test(value[end])) {
        if (value[end] === slash) { end += 2; continue }
        if (value[end] === "(") depth++
        else if (value[end] === ")" && --depth < 0) return value
        end++
      }
      if (depth) return value
    }
    return value.slice(0, start) + rebaseUrl(value.slice(start, end), source, destination, mappings) + value.slice(end)
  }
  const rewriteUses = (value, allowLinks = true) => {
    let result = "", index = 0
    while (index < value.length) {
      const char = value[index]
      if (char === slash) { result += value.slice(index, index + 2); index += 2; continue }
      if (char === tick) {
        const end = codeEnd(value, index)
        if (end >= 0) { result += value.slice(index, end); index = end; continue }
      }
      if (char === "<") {
        const end = angleEnd(value, index, /^<\/?[a-z][\w:-]*(?:\s|\/?>)/i.test(value.slice(index)))
        if (end >= 0) { result += rebaseHtmlTag(value.slice(index, end + 1), source, destination, mappings); index = end + 1; continue }
      }
      const atWordStart = index === 0 || !/[a-z0-9+.-]/i.test(value[index - 1])
      const url = atWordStart && /[a-z]/i.test(char) ? value.slice(index).match(/^(?:[a-z][a-z0-9+.-]*:\/\/|mailto:)[^\s<>]+/i) : null
      if (url) { result += url[0]; index += url[0].length; continue }
      const image = char === "!" && value[index + 1] === "["
      const start = image ? index + 1 : index
      if (value[start] === "[") {
        const end = close(value, start, "[", "]")
        if (end >= 0) {
          const display = value.slice(start + 1, end)
          const inlineEnd = value[end + 1] === "(" ? close(value, end + 1, "(", ")") : -1
          if (inlineEnd >= 0) {
            result += `${image ? "!" : ""}[${image ? display : rewriteUses(display, false)}]${value.slice(end + 1, inlineEnd + 1)}`
            index = inlineEnd + 1
            continue
          }
          const explicitEnd = value[end + 1] === "[" ? close(value, end + 1, "[", "]") : -1
          const explicit = explicitEnd >= 0 ? value.slice(end + 2, explicitEnd) : undefined
          const normalized = normalize(explicit || display)
          const destination = labels.get(normalized)
          if (destination && (image || allowLinks)) {
            result += !image && explicit === undefined && normalized.startsWith("^") ? `[${destination}]` : `${image ? "!" : ""}[${display}][${destination}]`
            index = explicitEnd >= 0 ? explicitEnd + 1 : end + 1
            continue
          }
          const shortcut = labels.get(normalize(display))
          if (shortcut && (image || allowLinks)) {
            result += `${image ? "!" : ""}[${display}][${shortcut}]`
            index = end + 1
            continue
          }
        }
      }
      result += char
      index++
    }
    return result
  }
  let tokenPrefix = `AFSLITERAL${hash(text)}X`
  while (text.includes(tokenPrefix)) tokenPrefix += "X"
  const literals = []
  const literal = (render) => { const index = literals.push(typeof render === "function" ? render : () => render) - 1; return `${tokenPrefix}${index}END` }
  const definitionEnd = (value, start) => {
    const gap = (index) => value.slice(index).match(/^[ \t]*(?:\r?\n(?:[ \t]*>[ \t]?)*[ \t]*)?/)[0].length
    let index = start + gap(start)
    const destinationStart = index
    if (value[index] === "<") {
      const end = angleEnd(value, index)
      if (end < 0) return -1
      index = end + 1
    } else {
      let depth = 0
      while (index < value.length && !/\s/.test(value[index])) {
        if (value[index] === slash) { index += 2; continue }
        if (value[index] === "(") depth++
        else if (value[index] === ")" && --depth < 0) return -1
        index++
      }
      if (depth !== 0 || index === destinationStart) return -1
    }
    const destinationEnd = index
    let end = index
    const titleStart = index + gap(index)
    const opener = value[titleStart]
    if (titleStart > index && ['"', "'", "("].includes(opener)) {
      const closer = opener === "(" ? ")" : opener
      for (let cursor = titleStart + 1; cursor < value.length; cursor++) {
        if (value[cursor] === slash) { cursor++; continue }
        if (/^\r?\n[ \t]*(?:>[ \t]*)?\r?\n/.test(value.slice(cursor))) break
        if (value[cursor] === closer) {
          if (!value.slice(cursor + 1).split("\n", 1)[0].trim()) end = cursor + 1
          break
        }
      }
    }
    return value.slice(end).split("\n", 1)[0].trim() ? null : { end, destinationStart, destinationEnd }
  }
  const protect = (value) => {
    let result = "", index = 0
    while (index < value.length) {
      if (index === 0 || value[index - 1] === "\n") {
        const match = value.slice(index).match(definition)
        if (match) {
          const label = normalize(match[2])
          const data = label.startsWith("^") ? null : definitionEnd(value, index + match[0].length)
          const end = label.startsWith("^") ? index + match[0].length : data?.end
          if (end !== undefined) {
            if (anchor && !labels.has(label)) labels.set(label, `${label.startsWith("^") ? "^" : ""}${anchor}-ref-${labels.size + 1}`)
            let original = value.slice(index, end)
            if (data) {
              const start = data.destinationStart - index, finish = data.destinationEnd - index
              original = original.slice(0, start) + rebaseUrl(original.slice(start, finish), source, destination, mappings) + original.slice(finish)
            }
            result += literal(() => anchor ? original.replace(definition, (_, indent, raw, colon) => `${indent}[${labels.get(normalize(raw))}]${colon}`) : original)
            index = end
            continue
          }
        }
      }
      const char = value[index]
      if (char === slash) { result += literal(value.slice(index, index + 2)); index += 2; continue }
      if (char === tick) {
        const end = codeEnd(value, index)
        if (end >= 0) { result += literal(value.slice(index, end)); index = end; continue }
      }
      if (char === "<") {
        const end = angleEnd(value, index, /^<\/?[a-z][\w:-]*(?:\s|\/?>)/i.test(value.slice(index)))
        if (end >= 0) { result += literal(rebaseHtmlTag(value.slice(index, end + 1), source, destination, mappings)); index = end + 1; continue }
      }
      const atWordStart = index === 0 || !/[a-z0-9+.-]/i.test(value[index - 1])
      const url = atWordStart && /[a-z]/i.test(char) ? value.slice(index).match(/^(?:[a-z][a-z0-9+.-]*:\/\/|mailto:)[^\s<>]+/i) : null
      if (url) { result += literal(url[0]); index += url[0].length; continue }
      const image = char === "!" && value[index + 1] === "["
      const start = image ? index + 1 : index
      if (value[start] === "[") {
        const end = close(value, start, "[", "]")
        const inlineEnd = end >= 0 && value[end + 1] === "(" ? close(value, end + 1, "(", ")") : -1
        if (inlineEnd >= 0) {
          const display = value.slice(start + 1, end)
          const destination = inlineDestination(value.slice(end + 1, inlineEnd + 1))
          result += literal(() => `${image ? "!" : ""}[${image ? display : rewriteUses(display, false)}]${destination}`)
          index = inlineEnd + 1
          continue
        }
      }
      result += char
      index++
    }
    return result
  }
  const pieces = []
  let pending = []
  const flush = () => { if (pending.length) { pieces.push({ code: false, text: protect(pending.join("\n")) }); pending = [] } }
  outsideCode(text, (line) => { pending.push(line); return line }, (line) => { flush(); pieces.push({ code: true, text: line }); return line })
  flush()
  const rewritten = pieces.map((piece) => piece.code ? piece.text : rewriteUses(piece.text)).join("\n")
  const restored = rewritten.replace(new RegExp(`${tokenPrefix}(\\d+)END`, "g"), (_, index) => literals[Number(index)]())
  if (restored.includes(tokenPrefix)) throw new Error("Reference literal restoration failed; source retained")
  return restored
}

function namespaceHtmlAnchors(text, anchor) {
  const transform = (chunk) => chunk.replace(/(?<!`)(`+)(?!`)[\s\S]*?(?<!`)\1(?!`)|<([A-Za-z][\w:-]*)(?:[^"'<>]|"[^"]*"|'[^']*')*>/g, (tag, code, name, offset) => {
    if (code || /^(?: {4}|\t)/.test(chunk.slice(chunk.lastIndexOf("\n", offset) + 1, offset))) return tag
    return tag.replace(/(\s)([^\s"'<>/=]+)(\s*=\s*)(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g, (attribute, space, key, equal, double, single, bare) => {
      const value = double ?? single ?? bare
      const kind = key.toLowerCase()
      let updated
      if (value && (kind === "id" || (kind === "name" && name.toLowerCase() === "a"))) updated = `${anchor}-${value}`
      else if ((kind === "href" || kind === "xlink:href") && value.startsWith("#")) updated = `#${anchor}${value.length > 1 ? `-${value.slice(1)}` : ""}`
      else return attribute
      const quote = double !== undefined ? '"' : single !== undefined ? "'" : ""
      return `${space}${key}${equal}${quote}${updated}${quote}`
    })
  })
  let fence, pending = "", result = ""
  for (const line of text.split(/(?<=\n)/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*?)(?:\r?\n)?$/)
    if (fence) {
      result += line
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = undefined
    } else if (marker) {
      result += transform(pending) + line
      pending = ""
      fence = marker[1]
    } else pending += line
  }
  return result + transform(pending)
}

function headingText(value) {
  let prefix = `AFSHEADING${hash(value)}X`
  while (value.includes(prefix)) prefix += "X"
  const literals = []
  const literal = (text, raw = text) => `${prefix}${literals.push({ text, raw, first: [...raw][0], last: [...raw].at(-1) }) - 1}END`
  let protectedText = "", index = 0
  while (index < value.length) {
    if (value[index] === "\\" && /[!-\x2F:-@\[-\x60{-~]/.test(value[index + 1] ?? "")) {
      protectedText += literal(value[index + 1], value.slice(index, index + 2)); index += 2; continue
    }
    if (value[index] === "`") {
      const end = codeSpanEnd(value, index)
      if (end >= 0) {
        let length = 1
        while (value[index + length] === "`") length++
        let content = value.slice(index + length, end - length).replace(/[\r\n]/g, " ")
        if (content.startsWith(" ") && content.endsWith(" ") && /[^ ]/.test(content)) content = content.slice(1, -1)
        protectedText += literal(content, value.slice(index, end)); index = end; continue
      }
    }
    protectedText += value[index++]
  }
  const linkDisplay = (raw, display) => {
    const original = display.replace(new RegExp(`${prefix}(\\d+)END`, "g"), (_, index) => literals[Number(index)].raw)
    return literal(headingText(original), raw)
  }
  const prose = protectedText.replace(/!?\[([^\]]+)\]\([^)]*\)/g, linkDisplay).replace(/!?\[([^\]]+)\]\[[^\]]*\]/g, linkDisplay).replace(/<[^>]*>/g, (tag) => literal("", tag))
  const neighbor = (text, before) => {
    const token = text.match(new RegExp(before ? `${prefix}(\\d+)END$` : `^${prefix}(\\d+)END`))
    return token ? literals[Number(token[1])][before ? "last" : "first"] : [...text].at(before ? -1 : 0) ?? "\n"
  }
  const runs = [...prose.matchAll(/\*+|_+/g)].map((match) => {
    const before = neighbor(prose.slice(0, match.index), true), after = neighbor(prose.slice(match.index + match[0].length), false)
    const beforeSpace = /\s/u.test(before), afterSpace = /\s/u.test(after)
    const beforePunctuation = /[\p{P}\p{S}]/u.test(before), afterPunctuation = /[\p{P}\p{S}]/u.test(after)
    const left = !afterSpace && (!afterPunctuation || beforeSpace || beforePunctuation)
    const right = !beforeSpace && (!beforePunctuation || afterSpace || afterPunctuation)
    const underscore = match[0][0] === "_"
    return { index: match.index, char: match[0][0], length: match[0].length, remaining: match[0].length, active: true,
      open: left && (!underscore || !right || beforePunctuation), close: right && (!underscore || !left || afterPunctuation) }
  })
  // Match delimiter runs before entity decoding; escaped/code tokens never act as delimiters.
  for (let index = 0; index < runs.length; index++) {
    const closer = runs[index]
    while (closer.close && closer.remaining) {
      let start = index - 1
      for (; start >= 0; start--) {
        const opener = runs[start]
        const odd = (closer.open || opener.close) && closer.length % 3 !== 0 && (opener.length + closer.length) % 3 === 0
        if (opener.active && opener.open && opener.remaining && opener.char === closer.char && !odd) break
      }
      if (start < 0) break
      const opener = runs[start]
      const used = opener.remaining >= 2 && closer.remaining >= 2 ? 2 : 1
      opener.remaining -= used
      closer.remaining -= used
      for (let middle = start + 1; middle < index; middle++) runs[middle].active = false
    }
  }
  let displayed = "", offset = 0
  for (const run of runs) {
    displayed += prose.slice(offset, run.index) + run.char.repeat(run.remaining)
    offset = run.index + run.length
  }
  displayed += prose.slice(offset)
  return decodeUrlCharacters(displayed).replace(new RegExp(`${prefix}(\\d+)END`, "g"), (_, index) => literals[Number(index)].text)
}

function headingAnchors(text, anchor) {
  const counts = new Map()
  const allocated = new Set()
  let fence
  const lines = text.split("\n")
  const result = lines.map((line, index) => {
    const fenced = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/)
    if (fence) {
      if (fenced && fenced[1][0] === fence[0] && fenced[1].length >= fence.length && !fenced[2].trim()) fence = undefined
      return line
    }
    if (fenced && !(fenced[1][0] === "`" && fenced[2].includes("`"))) { fence = fenced[1]; return line }
    const heading = line.match(/^ {0,3}#{1,6}\s+(.+?)(?:\s+#+)?\s*$/) ??
      (line.trim() && /^ {0,3}(?:=+|-+)\s*$/.test(lines[index + 1] ?? "") ? [line, line.trim()] : null)
    if (!heading) return line
    const slug = headingText(heading[1]).toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, "").replace(/\s/g, "-")
    let count = counts.get(slug) ?? 0
    let id = `${slug}${count ? `-${count}` : ""}`
    while (allocated.has(id)) { count++; id = `${slug}-${count}` }
    counts.set(slug, count)
    allocated.add(id)
    return `<a id="${anchor}-${id}"></a>\n${line}`
  }).join("\n")
  return fence ? `${result}${result.endsWith("\n") ? "" : "\n"}${fence}\n` : result
}

async function main() {
  const args = process.argv.slice(2)
  const { target, instructionRoot, profile } = resolveWorkspace(args.find((arg) => !arg.startsWith("--")), args.find((arg) => arg.startsWith("--mode="))?.slice(7))
  await safePath(instructionRoot, target)
  const profilePath = path.join(instructionRoot, ".afs-profile.json")
  const profileInfo = await safePath(instructionRoot, profilePath)
  if (profileInfo) {
    if (!profileInfo.isFile()) throw new Error("AFS profile marker must be a regular file")
    const saved = JSON.parse(await readFile(profilePath, "utf8"))
    if (saved.version !== 1 || saved.profile !== profile) throw new Error("Existing AFS profile differs; review placement before migration")
  } else if (profile === "docs") {
    // Retiring legacy root documents must not erase the selected workspace.
    await writeFile(profilePath, JSON.stringify({ version: 1, profile }) + "\n", { flag: "wx" })
  }
  const mappings = new Map()
  const jobs = []
  const directoryJobs = []
  const directoryRoots = []
  const blockers = []
  const selectedRegistries = new Set(args.filter((arg) => arg.startsWith("--registry=")).map((arg) => path.resolve(instructionRoot, arg.slice(11))))
  const seenRegistries = new Set()
  const date = new Date().toISOString().slice(0, 10)
  const owner = (source, destination) => ({ destination, anchor: `afs-migrated-${hash(path.relative(instructionRoot, source)).slice(0, 20)}` })
  const dated = `${date.slice(0, 4)}/${date.slice(5)}`
  const visionOption = args.find((arg) => arg.startsWith("--vision-owner="))?.split("=")[1]
  if (visionOption && !["COMPANY.md", "PRODUCT.md", "ICP.md"].includes(visionOption)) throw new Error("--vision-owner must be COMPANY.md, PRODUCT.md, or ICP.md")
  const rootOwners = {
    "BRAIN.md": path.join(instructionRoot, "AGENTS.md"),
    "FOCUS.md": path.join(instructionRoot, "ROADMAP.md"),
    "FRICTION.md": path.join(target, "logs", dated, "friction-history.md"),
    "REGRESSIONS.md": path.join(target, "fixes", dated, "regression-history.md"),
    "DECISIONS.md": path.join(target, "decisions", "prior-decisions.md"),
    "RUNBOOK.md": path.join(target, "runbooks", "prior-operations.md"),
  }
  if (visionOption) rootOwners["VISION.md"] = path.join(instructionRoot, visionOption)
  for (const root of new Set([instructionRoot, target])) {
    for (const [name, destination] of Object.entries(rootOwners)) {
      const source = path.join(root, name)
      try {
        if (await safePath(instructionRoot, source)) { mappings.set(source, owner(source, destination)); jobs.push({ source, destination }) }
      } catch (error) { blockers.push(error.message) }
    }
    if (!visionOption && existsSync(path.join(root, "VISION.md"))) blockers.push("VISION.md needs --vision-owner=COMPANY.md, PRODUCT.md, or ICP.md after scope review.")
    if (existsSync(path.join(root, "PREDICTION.md"))) blockers.push("PREDICTION.md needs a relevant research unit, plan, spec, or roadmap owner after content review.")
  }
  if (profile === "docs") {
    for (const name of rootTemplates) {
      const source = path.join(target, name)
      const destination = path.join(instructionRoot, name)
      try {
        if (await safePath(instructionRoot, source)) { mappings.set(source, owner(source, destination)); jobs.push({ source, destination }) }
      } catch (error) { blockers.push(error.message) }
    }
  }
  for (const [dir, registry] of [["references", "REFERENCES.md"], ["sources", "SOURCES.md"]]) {
    let entries
    try { entries = await files(path.join(target, dir), instructionRoot, false, blockers) }
    catch (error) { blockers.push(error.message); continue }
    for (const source of entries) {
      if (!selectedRegistries.has(source)) { blockers.push(`${path.relative(instructionRoot, source)} is retained; select a reviewed registry with --registry, or verify external preservation for a source artifact.`); continue }
      seenRegistries.add(source)
      if (!source.endsWith(".md")) { blockers.push(`${path.relative(target, source)} needs a verified Drive export before removal.`); continue }
      const destination = path.join(instructionRoot, registry)
      mappings.set(source, owner(source, destination))
      jobs.push({ source, destination })
    }
  }
  for (const source of selectedRegistries) {
    if (!seenRegistries.has(source)) throw new Error(`Registry selection is outside the detected registry trees or is not a regular file: ${source}`)
  }
  // Resolve actual conflict destinations before rewriting any referring text.
  const reserved = new Set(jobs.map((job) => job.destination))
  for (const [sourcePath, destinationPath] of [["cookbook", "cookbooks"], ["items", "facts/general"], ["models/decisions", "decisions"], ["models/problems", "problems"]]) {
    const sourceRoot = path.join(target, sourcePath)
    const destinationRoot = path.join(target, destinationPath)
    try {
      const info = await safePath(instructionRoot, sourceRoot)
      if (!info) continue
      if (!info.isDirectory()) throw new Error(`Expected directory: ${sourceRoot}`)
      const destinationInfo = await safePath(instructionRoot, destinationRoot)
      if (destinationInfo && !destinationInfo.isDirectory()) throw new Error(`Expected directory: ${destinationRoot}`)
      const names = await readdir(sourceRoot)
      let admitted = 0
      for (const name of names) {
        const source = path.join(sourceRoot, name)
        try {
          const info = await safePath(instructionRoot, source)
          const before = blockers.length
          const paths = info.isDirectory() ? await files(source, instructionRoot, false, blockers) : [source]
          if (blockers.length !== before) continue
          const destination = uniqueDestination(path.join(destinationRoot, name), reserved)
          await safePath(instructionRoot, destination)
          const markdown = []
          for (const file of paths) if (file.endsWith(".md")) {
            const bytes = await readFile(file)
            markdown.push({ file, text: decode(bytes), sha256: hash(bytes) })
          }
          directoryJobs.push({ source, destination, markdown })
          admitted++
          for (const file of [source, ...paths]) {
            let current = file
            while (current !== sourceRoot) {
              mappings.set(current, { destination: path.join(destination, path.relative(source, current)) })
              if (current === source) break
              current = path.dirname(current)
            }
          }
        } catch (error) { blockers.push(`${source}: ${error.message}`) }
      }
      if (admitted === names.length) {
        mappings.set(sourceRoot, { destination: destinationRoot })
        directoryRoots.push(destinationRoot)
      }
    } catch (error) { blockers.push(error.message) }
  }
  // Preflight every text job before using its mapping in another file.
  const admittedJobs = []
  for (const job of jobs) {
    try {
      if (!(await safePath(instructionRoot, job.source)).isFile()) throw new Error(`Source is not a regular file: ${job.source}`)
      const destination = await safePath(instructionRoot, job.destination)
      if (destination && !destination.isFile()) throw new Error(`Destination is not a regular file: ${job.destination}`)
      job.bytes = await readFile(job.source)
      job.text = decode(job.bytes)
      if (destination) decode(await readFile(job.destination))
      admittedJobs.push(job)
    } catch (error) {
      blockers.push(`${path.relative(instructionRoot, job.source)}: ${error.message}`)
      mappings.delete(job.source)
    }
  }
  // Render and validate the complete text plan before retiring any source.
  const futureDestinations = new Map()
  for (const job of admittedJobs) {
    const origin = path.relative(instructionRoot, job.source)
    const marker = `<!-- afs-migration:${hash(origin + "\0" + hash(job.bytes))} -->`
    const anchor = mappings.get(job.source).anchor
    const section = `\n\n${marker}\n<a id="${anchor}"></a>\n## Migrated context: ${origin}\n\nOriginal content retained for review. Current AFS routing supersedes any retired paths below.\n\n${headingAnchors(namespaceHtmlAnchors(rewriteMarkdown(job.text, anchor, job.source, job.destination, mappings), anchor), anchor)}\n<!-- /afs-migration -->\n`
    const existing = futureDestinations.get(job.destination) ?? (await safePath(instructionRoot, job.destination) ? decode(await readFile(job.destination)) : `# ${path.basename(job.destination, ".md")}\n`)
    if (existing.includes(`<a id="${anchor}"></a>`) && !existing.includes(marker)) throw new Error(`Changed migration source; preserve both versions for review: ${job.source}`)
    if (existing.includes(marker) && !existing.includes(section)) throw new Error(`Partial or changed migration entry; source retained for review: ${job.destination}`)
    job.section = section
    job.destinationBeforeAppend = existing
    futureDestinations.set(job.destination, existing.includes(section) ? existing : existing + section)
  }
  for (const job of directoryJobs) for (const item of job.markdown) item.updated = rebase(item.text, item.file, mappings.get(item.file).destination, mappings)
  const retiredTextSources = new Set([...admittedJobs.map((job) => job.source), ...directoryJobs.flatMap((job) => job.markdown.map((item) => item.file))])
  const retainedRoots = ["references", "sources", "raw", "official-documentation", "goals", "models", "templates", "facts/items", "facts/episodes", "facts/triples"].map((name) => path.join(target, name) + path.sep)
  const preparedUpdates = []
  for (const file of await files(instructionRoot, instructionRoot, true)) {
    if (!file.endsWith(".md") || retiredTextSources.has(file) || futureDestinations.has(file) || retainedRoots.some((root) => file.startsWith(root))) continue
    let original
    try { original = decode(await readFile(file)) }
    catch (error) { blockers.push(`${path.relative(instructionRoot, file)}: ${error.message}`); continue }
    const updated = rebase(original, file, file, mappings)
    if (updated !== original) preparedUpdates.push({ file, original, updated })
  }
  for (const [file, original] of futureDestinations) {
    const updated = rebase(original, file, file, mappings)
    if (updated !== original) preparedUpdates.push({ file, original, updated })
  }
  for (const registry of ["REFERENCES.md", "SOURCES.md"]) {
    try {
      const destination = path.join(instructionRoot, registry)
      if (!await safePath(instructionRoot, destination)) await writeFile(destination, `# ${registry.slice(0, -3)}\n`, { flag: "wx" })
    } catch (error) { blockers.push(error.message) }
  }
  for (const destination of directoryRoots) { await safePath(instructionRoot, destination); await mkdir(destination, { recursive: true }) }
  for (const job of admittedJobs) {
    await safePath(instructionRoot, job.source)
    await safePath(instructionRoot, job.destination)
    if (hash(await readFile(job.source)) !== hash(job.bytes)) throw new Error(`Source changed during migration: ${job.source}`)
    await mkdir(path.dirname(job.destination), { recursive: true })
    if (!await safePath(instructionRoot, job.destination)) await writeFile(job.destination, `# ${path.basename(job.destination, ".md")}\n`, { flag: "wx" })
    const origin = path.relative(instructionRoot, job.source)
    const section = job.section
    const existing = decode(await readFile(job.destination))
    if (existing !== job.destinationBeforeAppend) throw new Error(`Destination changed after transformation preflight: ${job.destination}`)
    if (!existing.includes(section)) {
      await safePath(instructionRoot, job.destination)
      await appendFile(job.destination, section)
      if (!(await readFile(job.destination, "utf8")).endsWith(section)) throw new Error("Migration append verification failed; source retained")
    }
    console.log(`${origin} -> ${path.relative(instructionRoot, job.destination)}`)
  }
  for (const job of directoryJobs) {
    await safePath(instructionRoot, job.source)
    if ((await safePath(instructionRoot, job.source)).isDirectory()) {
      const before = blockers.length
      await files(job.source, instructionRoot, false, blockers)
      if (blockers.length !== before) throw new Error(`Directory changed during migration: ${job.source}`)
    }
    for (const item of job.markdown) if (hash(await readFile(item.file)) !== item.sha256) throw new Error(`Source changed during migration: ${item.file}`)
    if (await safePath(instructionRoot, job.destination)) throw new Error(`Destination appeared during migration: ${job.destination}`)
    await mkdir(path.dirname(job.destination), { recursive: true })
    await rename(job.source, job.destination)
    for (const item of job.markdown) {
      const destination = mappings.get(item.file).destination
      await safePath(instructionRoot, destination)
      const updated = item.updated
      if (updated !== item.text) await writeFile(destination, updated)
    }
    console.log(`${path.relative(target, job.source)} -> ${path.relative(target, job.destination)}`)
  }
  for (const { file, original, updated } of preparedUpdates) {
    await safePath(instructionRoot, file)
    if (decode(await readFile(file)) !== original) throw new Error(`File changed after transformation preflight: ${file}`)
    await writeFile(file, updated)
    if (decode(await readFile(file)) !== updated) throw new Error(`Link rewrite verification failed; sources retained: ${file}`)
  }
  for (const job of admittedJobs) {
    await safePath(instructionRoot, job.source)
    if (hash(await readFile(job.source)) !== hash(job.bytes)) throw new Error(`Source changed before retirement: ${job.source}`)
    await unlink(job.source)
  }
  async function removeEmpty(root) {
    if (!await safePath(instructionRoot, root)) return
    for (const entry of await readdir(root, { withFileTypes: true })) if (entry.isDirectory()) await removeEmpty(path.join(root, entry.name))
    if ((await readdir(root)).length === 0) await rmdir(root)
  }
  for (const dir of ["references", "sources", "models", "items", "cookbook"]) {
    try { await removeEmpty(path.join(target, dir)) } catch (error) { blockers.push(error.message) }
  }
  for (const dir of ["raw", "official-documentation", "goals", "models/goals", "templates", "facts/items", "facts/episodes", "facts/triples"]) {
    if (existsSync(path.join(target, dir))) blockers.push(`${dir}/ requires verified external preservation or an explicit content owner; it has been preserved.`)
  }
  if (blockers.length) {
    for (const blocker of blockers) console.error(`Blocked: ${blocker}`)
    process.exitCode = 2
  } else console.log("Migration finished. Review retained context and validate the complete workspace.")
}

main().catch((error) => { console.error(error.message); process.exitCode = 1 })
