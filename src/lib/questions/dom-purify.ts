import DOMPurify from "isomorphic-dompurify";

export const DOM_PURIFY_CONFIG: DOMPurify.Config = {
  ALLOWED_TAGS: ["strong", "u", "em", "p", "sub", "sup", "br"],
  ALLOWED_ATTR: [],
};

export function sanitize(text: string): string {
  return DOMPurify.sanitize(text, {
    ...DOM_PURIFY_CONFIG,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  });
}
