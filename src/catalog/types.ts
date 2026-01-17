export type CatalogIndex = {
  catalogSchemaVersion: number;
  eventPaths: string[];
  toolPaths: string[];
  progressionModelPaths: string[];
  sharedPaths: string[];
};

export type EventSectionSummary = {
  taskCount: number;
  guideSectionCount: number;
  faqCount: number;
  toolCount: number;
};

export type TaskDefinition = {
  taskId: string;
  displayOrder: number;

  requirementAction: string;
  requirementObject: string;
  requirementScope: string;
  requirementTargetValue: number;

  rewardType: string;
  rewardAmount: number;
};

/** Summary (used for Events list) */
export type EventCatalogItemFull = {
  eventId: string;
  eventVersion: number;
  title: string;
  subtitle?: string;
  lastVerifiedDate?: string;
  sections: EventSectionSummary;
};

/** Full (used for Event Detail) */
export type EventCatalogFull = EventCatalogItemFull & {
  tasks: TaskDefinition[];
  // Later: guide sections, faq items, tool refs
};
