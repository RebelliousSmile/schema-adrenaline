import { z } from "zod";
import { Degats } from "./degats.js";
import { Competence } from "./formations.js";
import { Compte } from "./primitives.js";

/**
 * Niveau de défense imprimé sur une carte de créature : `oui`, `exposé` ou
 * `non`. Le niveau est saisi tel qu'imprimé ; la fiche n'en déduit rien.
 */
export const NiveauDeDefense = z.enum(["oui", "expose", "non"]).meta({
  description: "Défense imprimée : oui, exposé ou non.",
  examples: ["non"],
});

/** La défense telle qu'elle est notée sur une carte de créature. */
export const DefenseDeCreature = z
  .strictObject({
    active: z
      .boolean()
      .optional()
      .meta({
        description:
          "Forme historique : vrai si la créature peut opposer une défense active. Préférer `niveau`.",
        examples: [false],
      }),
    niveau: NiveauDeDefense.optional(),
    bonus: Compte.optional().meta({
      description:
        "Bonus imprimé à côté de la défense, tel que saisi (bonus accordé aux attaquants).",
      examples: [4],
    }),
    notes: z.string().min(1).optional().meta({
      description: "Précision libre sur la défense ou ses conditions.",
    }),
  })
  .meta({ description: "Défense d'une créature, telle qu'imprimée sur sa carte." });

/** Les champs communs d'une action de créature et de ses suites. */
const champsDAction = {
  nom: z
    .string()
    .min(1)
    .optional()
    .meta({
      description:
        "Nom de l'action, tel qu'il est présenté sur la fiche. Attendu quand l'action n'a pas de test qui la nomme.",
      examples: ["Morsure"],
    }),
  test: Competence.optional().meta({
    description: "Test associé à l'action, quand elle en demande un.",
  }),
  degats: Degats.optional().meta({
    description: "Dégâts imprimés de l'action : versant, badges, propriétés.",
  }),
  desDeDegats: Compte.optional().meta({
    description: "Forme historique : nombre de d10 de dégâts. Préférer `degats`.",
    examples: [1],
  }),
  modificateurDeDegats: z
    .int()
    .min(-100)
    .max(100)
    .optional()
    .meta({
      description: "Forme historique : modificateur ajouté aux dégâts. Préférer `degats`.",
      examples: [2],
    }),
  effets: z
    .array(z.string().min(1).meta({ description: "Un effet produit par l'action." }))
    .optional()
    .meta({ description: "Effets mécaniques ou narratifs produits par l'action." }),
  conditions: z
    .array(z.string().min(1).meta({ description: "Une condition d'emploi ou de déclenchement." }))
    .optional()
    .meta({ description: "Conditions qui limitent ou déclenchent l'action." }),
  notes: z.string().min(1).optional().meta({
    description: "Précision libre qui ne correspond pas à une propriété structurée.",
  }),
};

/** Une suite d'action : même forme qu'une action, sans suites à son tour. */
export const SuiteDAction = z.strictObject(champsDAction).meta({
  description: "Action enchaînée à une autre, imprimée sous elle. Pas de suite imbriquée.",
});

/** Une action de créature, distincte d'une compétence générique. */
export const ActionDeCreature = z
  .strictObject({
    ...champsDAction,
    suites: z.array(SuiteDAction).min(1).optional().meta({
      description: "Actions enchaînées, imprimées sous l'action dans l'ordre. Un seul niveau.",
    }),
  })
  .meta({ description: "Action de combat ou capacité d'une créature." });

export type ActionDeCreatureValeur = z.infer<typeof ActionDeCreature>;
export type SuiteDActionValeur = z.infer<typeof SuiteDAction>;
export type DefenseDeCreatureValeur = z.infer<typeof DefenseDeCreature>;
