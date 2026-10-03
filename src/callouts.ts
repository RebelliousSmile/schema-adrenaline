/**
 * Visual intentions for Markdown callouts in Adrenaline System notes, read from
 * the Zombiology booklet layouts.
 *
 * Each entry names a Markdown identifier and its default aliases; a consumer
 * owns the anatomy. A modifier is an Obsidian callout metadata word
 * (`[!formation|fond]`) that switches a variant of the same callout.
 */
export const ADRENALINE_VISUAL_CALLOUTS = [
  {
    id: "adrenaline-exemple",
    label: "Exemple",
    aliases: ["exemple", "example"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
  {
    id: "adrenaline-description",
    label: "Description",
    aliases: ["description"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
  {
    id: "adrenaline-encart",
    label: "Encart",
    aliases: ["encart"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
  {
    id: "adrenaline-formation",
    label: "Formation",
    aliases: ["formation"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [{ id: "fond", label: "Surface grise et accroche" }],
  },
  {
    id: "adrenaline-action",
    label: "Action",
    aliases: ["action"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
  {
    id: "adrenaline-table",
    label: "Table aléatoire",
    aliases: ["table-aleatoire"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
] as const;

export type AdrenalineVisualCallout = (typeof ADRENALINE_VISUAL_CALLOUTS)[number];
