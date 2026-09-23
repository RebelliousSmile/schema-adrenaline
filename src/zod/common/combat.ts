import { z } from "zod";
import { Competence } from "./formations.js";
import { Compte } from "./primitives.js";

/** La défense telle qu'elle est notée sur une carte de créature. */
export const DefenseDeCreature = z
  .strictObject({
    active: z.boolean().meta({
      description: "Indique si la créature peut opposer une défense active.",
      examples: [false],
    }),
    bonus: Compte.optional().meta({
      description: "Bonus de défense applicable lorsque la défense est active.",
      examples: [4],
    }),
    notes: z.string().min(1).optional().meta({
      description: "Précision libre sur la défense ou ses conditions.",
    }),
  })
  .meta({ description: "Défense d'une créature, active ou indisponible." });

/** Une action de créature, distincte d'une compétence générique. */
export const ActionDeCreature = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de l'action, tel qu'il est présenté sur la fiche de créature.",
        examples: ["Morsure"],
      }),
    test: Competence.optional().meta({
      description: "Test associé à l'action, quand elle en demande un.",
    }),
    desDeDegats: Compte.optional().meta({
      description: "Nombre de d10 de dégâts infligés par l'action.",
      examples: [1],
    }),
    modificateurDeDegats: z
      .int()
      .min(-100)
      .max(100)
      .optional()
      .meta({
        description: "Modificateur entier ajouté aux dégâts de l'action.",
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
  })
  .meta({ description: "Action de combat ou capacité d'une créature." });

export type ActionDeCreatureValeur = z.infer<typeof ActionDeCreature>;
export type DefenseDeCreatureValeur = z.infer<typeof DefenseDeCreature>;
