import type { CatalogIndex, EventCatalogItemFull, EventCatalogFull, TaskDefinition } from "./types";
import { parseXmlString, getAttr, getAttrInt } from "./parseXml";

async function fetchText(path: string): Promise<string> {
  const res = await fetch(path, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

export async function loadCatalogIndex(): Promise<CatalogIndex> {
  const indexPath = `${import.meta.env.BASE_URL}catalog/catalog_index.xml`;
  const xmlText = await fetchText(indexPath);
  const doc = parseXmlString(xmlText);

  const root = doc.documentElement;
  const schemaVersion = Number(root.getAttribute("catalog_schema_version") ?? "1");

  const eventPaths = Array.from(doc.getElementsByTagName("event_ref")).map((el) => getAttr(el, "path"));

  const toolPaths = Array.from(doc.getElementsByTagName("tool_ref")).map((el) => getAttr(el, "path"));

  const progressionModelPaths = Array.from(doc.getElementsByTagName("progression_model_ref")).map((el) => getAttr(el, "path"));

  const sharedPaths = Array.from(doc.getElementsByTagName("shared_ref")).map((el) => getAttr(el, "path"));

  return {
    catalogSchemaVersion: schemaVersion,
    eventPaths,
    toolPaths,
    progressionModelPaths,
    sharedPaths,
  };
}

export async function loadEventSummaries(eventPaths: string[]): Promise<EventCatalogItemFull[]> {
  const events: EventCatalogItemFull[] = [];

  for (const relPath of eventPaths) {
    const fullPath = `${import.meta.env.BASE_URL}${relPath}`;
    const xmlText = await fetchText(fullPath);
    const doc = parseXmlString(xmlText);

    const eventEl = doc.getElementsByTagName("event")[0];
    if (!eventEl) throw new Error(`Missing <event> root in ${relPath}`);

    const tasksEl = eventEl.getElementsByTagName("tasks")[0];
    const guideEl = eventEl.getElementsByTagName("guide")[0];
    const faqEl = eventEl.getElementsByTagName("faq")[0];
    const toolsEl = eventEl.getElementsByTagName("tools")[0];

    const taskCount = tasksEl ? tasksEl.getElementsByTagName("task").length : 0;
    const guideSectionCount = guideEl ? guideEl.getElementsByTagName("section").length : 0;
    const faqCount = faqEl ? faqEl.getElementsByTagName("item").length : 0;
    const toolCount = toolsEl ? toolsEl.getElementsByTagName("tool_ref").length : 0;

    events.push({
      eventId: getAttr(eventEl, "event_id"),
      eventVersion: getAttrInt(eventEl, "event_version"),
      title: getAttr(eventEl, "title"),
      subtitle: eventEl.getAttribute("subtitle") ?? undefined,
      lastVerifiedDate: eventEl.getAttribute("last_verified_date") ?? undefined,
      sections: { taskCount, guideSectionCount, faqCount, toolCount },
    });
  }

  return events;
}

export async function loadEventById(eventPaths: string[], eventId: string): Promise<EventCatalogFull | null> {
  for (const relPath of eventPaths) {
    const fullPath = `${import.meta.env.BASE_URL}${relPath}`;
    const xmlText = await fetchText(fullPath);
    const doc = parseXmlString(xmlText);

    const eventEl = doc.getElementsByTagName("event")[0];
    if (!eventEl) continue;

    const thisId = eventEl.getAttribute("event_id");
    if (thisId !== eventId) continue;

    // ---- parse summary counts
    const tasksEl = eventEl.getElementsByTagName("tasks")[0];
    const guideEl = eventEl.getElementsByTagName("guide")[0];
    const faqEl = eventEl.getElementsByTagName("faq")[0];
    const toolsEl = eventEl.getElementsByTagName("tools")[0];

    const taskNodes = tasksEl ? Array.from(tasksEl.getElementsByTagName("task")) : [];
    const tasks: TaskDefinition[] = taskNodes
      .map((t) => ({
        taskId: getAttr(t, "task_id"),
        displayOrder: getAttrInt(t, "display_order"),

        requirementAction: getAttr(t, "requirement_action"),
        requirementObject: getAttr(t, "requirement_object"),
        requirementScope: getAttr(t, "requirement_scope"),
        requirementTargetValue: getAttrInt(t, "requirement_target_value"),

        rewardType: getAttr(t, "reward_type"),
        rewardAmount: getAttrInt(t, "reward_amount"),
      }))
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const guideSectionCount = guideEl ? guideEl.getElementsByTagName("section").length : 0;
    const faqCount = faqEl ? faqEl.getElementsByTagName("item").length : 0;
    const toolCount = toolsEl ? toolsEl.getElementsByTagName("tool_ref").length : 0;

    const fullEvent: EventCatalogFull = {
      eventId: getAttr(eventEl, "event_id"),
      eventVersion: getAttrInt(eventEl, "event_version"),
      title: getAttr(eventEl, "title"),
      subtitle: eventEl.getAttribute("subtitle") ?? undefined,
      lastVerifiedDate: eventEl.getAttribute("last_verified_date") ?? undefined,
      sections: {
        taskCount: tasks.length,
        guideSectionCount,
        faqCount,
        toolCount,
      },
      tasks,
    };

    return fullEvent;
  }

  return null;
}
