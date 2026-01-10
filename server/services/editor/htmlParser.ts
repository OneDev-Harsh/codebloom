import { JSDOM } from "jsdom"
import { v4 as uuid } from "uuid"
import type { ComponentNode } from "../../types/componentTree.js"

export const parseHtmlToTree = (html: string): ComponentNode => {
  const dom = new JSDOM(html)
  const body = dom.window.document.body

  return {
    id: uuid(),
    type: "page",
    children: Array.from(body.children).map(parseElement)
  }
}

const parseElement = (el: Element): ComponentNode => {
  const tag = el.tagName.toLowerCase()

  // TEXT
  if (tag === "p" || tag === "span" || tag === "h1") {
    return {
      id: uuid(),
      type: "text",
      props: { text: el.textContent || "" },
      styles: extractStyles(el)
    }
  }

  // IMAGE
  if (tag === "img") {
    return {
      id: uuid(),
      type: "image",
      props: { src: el.getAttribute("src") || "" },
      styles: extractStyles(el)
    }
  }

  // BUTTON / LINK
  if (tag === "button" || tag === "a") {
    return {
      id: uuid(),
      type: "button",
      props: {
        text: el.textContent || "",
        href: el.getAttribute("href") || undefined
      },
      styles: extractStyles(el)
    }
  }

  // CONTAINERS
  return {
    id: uuid(),
    type: tag === "section" ? "section" : "container",
    styles: extractStyles(el),
    children: Array.from(el.children).map(parseElement)
  }
}

const extractStyles = (el: Element): Record<string, string> => {
  const style = el.getAttribute("style")
  if (!style) return {}

  return Object.fromEntries(
    style.split(";")
      .map(r => r.trim())
      .filter(Boolean)
      .map(rule => rule.split(":").map(v => v.trim()))
  )
}