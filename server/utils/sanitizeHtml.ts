import sanitize from "sanitize-html"

export const sanitizeHtml = (html: string) =>
  sanitize(html, {
    allowedTags: sanitize.defaults.allowedTags.filter(
      tag => tag !== "script"
    ),
    allowedAttributes: {
      "*": ["class", "style", "id"],
      a: ["href", "name", "target"],
      img: ["src", "alt"]
    },
    disallowedTagsMode: "discard"
  })
