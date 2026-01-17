export function parseXmlString(xmlText: string): Document {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  // Basic parse error detection
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent ?? "unknown error"}`);
  }

  return doc;
}

export function getAttr(el: Element, name: string, required = true): string {
  const v = el.getAttribute(name);
  if ((v === null || v === "") && required) {
    throw new Error(`Missing required attribute "${name}" on <${el.tagName}>`);
  }
  return v ?? "";
}

export function getAttrInt(el: Element, name: string, required = true): number {
  const raw = getAttr(el, name, required);
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    throw new Error(`Attribute "${name}" must be a number on <${el.tagName}>; got "${raw}"`);
  }
  return n;
}
