import { readFileSync } from "node:fs"

const named = JSON.parse(readFileSync(new URL("../references/html-named-character-references.json", import.meta.url), "utf8"))
const maxNameLength = Math.max(...Object.keys(named).map((name) => name.length))
const htmlNumericReplacements = new Map([
  [0x80, 0x20ac], [0x82, 0x201a], [0x83, 0x0192], [0x84, 0x201e],
  [0x85, 0x2026], [0x86, 0x2020], [0x87, 0x2021], [0x88, 0x02c6],
  [0x89, 0x2030], [0x8a, 0x0160], [0x8b, 0x2039], [0x8c, 0x0152],
  [0x8e, 0x017d], [0x91, 0x2018], [0x92, 0x2019], [0x93, 0x201c],
  [0x94, 0x201d], [0x95, 0x2022], [0x96, 0x2013], [0x97, 0x2014],
  [0x98, 0x02dc], [0x99, 0x2122], [0x9a, 0x0161], [0x9b, 0x203a],
  [0x9c, 0x0153], [0x9e, 0x017e], [0x9f, 0x0178],
])

export function decodeUrlCharacters(value, markdown = true) {
  let result = "", index = 0
  while (index < value.length) {
    const char = value[index]
    if (char === "&") {
      const rest = value.slice(index)
      const numeric = rest.match(markdown ? /^&#(?:[xX][0-9a-fA-F]{1,6}|[0-9]{1,7});/ : /^&#(?:[xX][0-9a-fA-F]+|[0-9]+);?/)
      if (numeric) {
        const digits = numeric[0].slice(2).replace(/;$/, "")
        let point = /^[xX]/.test(digits) ? parseInt(digits.slice(1), 16) : Number(digits)
        if (!(point > 0 && point <= 0x10ffff) || (point >= 0xd800 && point <= 0xdfff)) point = 0xfffd
        else if (!markdown) point = htmlNumericReplacements.get(point) ?? point
        result += String.fromCodePoint(point)
        index += numeric[0].length
        continue
      }
      let name
      if (markdown) {
        const candidate = rest.match(/^&[A-Za-z][A-Za-z0-9]*;/)?.[0]
        if (candidate && Object.hasOwn(named, candidate)) name = candidate
      } else {
        for (let length = Math.min(maxNameLength, rest.length); length >= 2; length--) {
          const candidate = rest.slice(0, length)
          if (!Object.hasOwn(named, candidate)) continue
          if (!candidate.endsWith(";") && /[A-Za-z0-9=]/.test(rest[length] ?? "")) break
          name = candidate
          break
        }
      }
      if (name) { result += named[name]; index += name.length; continue }
    }
    result += char
    index++
  }
  // cmark URL cleanup decodes references before unescaping punctuation.
  return markdown ? result.replace(/\\([!-\x2F:-@\[-\x60{-~])/g, "$1") : result
}
