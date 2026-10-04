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
    id: "adrenaline-roller",
    label: "Roller",
    aliases: ["roller"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [],
  },
  // A one-line reference to a medium: an icon, a bold label, then the body on
  // the same line. A modifier picks the icon.
  {
    id: "adrenaline-mention",
    label: "Mention en ligne",
    aliases: ["mention"],
    template: "title-body",
    capability: "style:adrenaline",
    modifiers: [
      { id: "video", label: "Icône vidéo" },
      { id: "audio", label: "Icône audio" },
      { id: "livre", label: "Icône livre" },
      { id: "lien", label: "Icône lien" },
    ],
  },
] as const;

export type AdrenalineVisualCallout = (typeof ADRENALINE_VISUAL_CALLOUTS)[number];
