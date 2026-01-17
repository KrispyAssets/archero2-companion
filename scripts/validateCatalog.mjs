import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { DOMParser } from "@xmldom/xmldom";

const ROOT = process.cwd();
const CATALOG_ROOT = join(ROOT, "public", "catalog");
const CATALOG_INDEX = join(CATALOG_ROOT, "catalog_index.xml");

function parseXml(xmlText, filePath) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const parseError = doc.getElementsByTagName("parsererror")[0];
  if (parseError) {
    const detail = parseError.textContent?.trim() ?? "unknown error";
    throw new Error(`XML parse error in ${filePath}: ${detail}`);
  }
  return doc;
}

function requireAttr(el, name, filePath) {
  const value = el.getAttribute(name);
  if (!value) {
    throw new Error(`Missing required attribute "${name}" on <${el.tagName}> in ${filePath}`);
  }
  return value;
}

function requireInt(el, name, filePath) {
  const raw = requireAttr(el, name, filePath);
  const num = Number(raw);
  if (!Number.isFinite(num)) {
    throw new Error(`Attribute "${name}" must be numeric on <${el.tagName}> in ${filePath}; got "${raw}"`);
  }
  return num;
}

async function collectXmlFiles(dir, out = []) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectXmlFiles(abs, out);
    } else if (entry.isFile() && extname(entry.name) === ".xml") {
      out.push(abs);
    }
  }
  return out;
}

function normalizeRel(path) {
  return relative(ROOT, path).replace(/\\/g, "/");
}

function validateCatalogIndex(doc, filePath) {
  const root = doc.documentElement;
  if (root.tagName !== "catalog_index") {
    throw new Error(`Root element must be <catalog_index> in ${filePath}`);
  }
  requireAttr(root, "catalog_schema_version", filePath);
}

function validateEventDoc(doc, filePath, ids) {
  const eventEl = doc.getElementsByTagName("event")[0];
  if (!eventEl) {
    throw new Error(`Missing <event> root in ${filePath}`);
  }

  const eventId = requireAttr(eventEl, "event_id", filePath);
  if (!/^archero2\.event\.[a-z0-9_.-]+\.v\d+$/.test(eventId)) {
    throw new Error(`Invalid event_id "${eventId}" in ${filePath}`);
  }
  if (ids.eventIds.has(eventId)) {
    throw new Error(`Duplicate event_id "${eventId}" in ${filePath}`);
  }
  ids.eventIds.add(eventId);

  requireInt(eventEl, "event_version", filePath);
  requireAttr(eventEl, "title", filePath);

  const tasksEl = eventEl.getElementsByTagName("tasks")[0];
  const taskNodes = tasksEl ? Array.from(tasksEl.getElementsByTagName("task")) : [];
  for (const taskEl of taskNodes) {
    const taskId = requireAttr(taskEl, "task_id", filePath);
    if (!/^[a-z0-9_]+_tier_\d+$/.test(taskId)) {
      throw new Error(`Invalid task_id "${taskId}" in ${filePath}`);
    }
    if (ids.taskIds.has(taskId)) {
      throw new Error(`Duplicate task_id "${taskId}" in ${filePath}`);
    }
    ids.taskIds.add(taskId);

    requireInt(taskEl, "display_order", filePath);
    requireAttr(taskEl, "requirement_action", filePath);
    requireAttr(taskEl, "requirement_object", filePath);
    requireAttr(taskEl, "requirement_scope", filePath);
    requireInt(taskEl, "requirement_target_value", filePath);
    requireAttr(taskEl, "reward_type", filePath);
    requireInt(taskEl, "reward_amount", filePath);
  }

  const guideEl = eventEl.getElementsByTagName("guide")[0];
  if (guideEl) {
    for (const sectionEl of Array.from(guideEl.getElementsByTagName("section"))) {
      requireAttr(sectionEl, "section_id", filePath);
      requireAttr(sectionEl, "title", filePath);
    }
  }

  const faqEl = eventEl.getElementsByTagName("faq")[0];
  if (faqEl) {
    for (const itemEl of Array.from(faqEl.getElementsByTagName("item"))) {
      requireAttr(itemEl, "faq_id", filePath);
      requireAttr(itemEl, "question", filePath);
    }
  }
}

function validateToolDoc(doc, filePath, ids) {
  const toolEl = doc.getElementsByTagName("tool")[0];
  if (!toolEl) {
    throw new Error(`Missing <tool> root in ${filePath}`);
  }

  const toolId = requireAttr(toolEl, "tool_id", filePath);
  if (!/^archero2\.tool\.[a-z0-9_.-]+\.v\d+$/.test(toolId)) {
    throw new Error(`Invalid tool_id "${toolId}" in ${filePath}`);
  }
  if (ids.toolIds.has(toolId)) {
    throw new Error(`Duplicate tool_id "${toolId}" in ${filePath}`);
  }
  ids.toolIds.add(toolId);

  requireAttr(toolEl, "tool_type", filePath);
  requireAttr(toolEl, "title", filePath);
}

async function main() {
  const ids = {
    eventIds: new Set(),
    taskIds: new Set(),
    toolIds: new Set(),
  };

  const indexText = await readFile(CATALOG_INDEX, "utf8");
  const indexDoc = parseXml(indexText, "public/catalog/catalog_index.xml");
  validateCatalogIndex(indexDoc, "public/catalog/catalog_index.xml");

  const files = await collectXmlFiles(CATALOG_ROOT);
  for (const absPath of files) {
    const relPath = normalizeRel(absPath);
    const xmlText = await readFile(absPath, "utf8");
    const doc = parseXml(xmlText, relPath);
    if (relPath.endsWith("catalog_index.xml")) continue;
    if (relPath.includes("/events/")) {
      validateEventDoc(doc, relPath, ids);
    } else if (relPath.includes("/tools/")) {
      validateToolDoc(doc, relPath, ids);
    }
  }

  console.log("Catalog validation passed.");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
