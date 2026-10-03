import { z } from "zod";

/**
 * Nature des dégâts, par la couleur de leur badge : jaune pour des dégâts
 * choquants, rouge pour des dégâts blessants. Ensemble fermé : la fiche
 * n'imprime que ces deux badges.
 */
export const NatureDeDegats = z.enum(["choquante", "blessante"]).meta({
  description: "Choquante (badge jaune) ou blessante (badge rouge).",
  examples: ["blessante"],
});

/** Versant touché : physique (DP) ou mental (DM). */
export const VersantDeDegats = z.enum(["physique", "mental"]).meta({
  description: "Versant des dégâts : physique, imprimé DP, ou mental, imprimé DM.",
  examples: ["physique"],
});

/**
 * Un profil de dégâts : une expression de dés telle qu'imprimée, sa nature, et
 * la condition qui le rend applicable.
 *
 * L'expression reste une chaîne : la fiche écrit `3d10 + 5` ou `1d10`, et le
 * schéma ne la recompose pas — il l'affiche telle quelle.
 */
const ProfilDeDegats = z
  .strictObject({
    des: z
      .string()
      .min(1)
      .meta({
        description: "Expression des dégâts, telle qu'imprimée dans le badge.",
        examples: ["1d10", "3d10 + 5"],
      }),
    nature: NatureDeDegats.optional(),
    condition: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Condition qui rend ce profil applicable, imprimée après le badge.",
        examples: ["si la cible est au contact", "sur ✓✓"],
      }),
  })
  .meta({ description: "Un profil de dégâts : dés, nature et condition éventuelle." });

/**
 * Les dégâts d'une arme, d'une compétence ou d'une action de créature.
 *
 * Un seul type pour les trois emplois : la fiche les imprime de la même façon —
 * un versant, un ou plusieurs badges reliés par un mot, puis les propriétés.
 * Rien n'y est calculé : chaque valeur imprimée est une valeur saisie.
 */
export const Degats = z
  .strictObject({
    versant: VersantDeDegats.optional(),
    profils: z.array(ProfilDeDegats).min(1).meta({
      description: "Profils de dégâts, dans l'ordre d'impression. Au moins un.",
    }),
    liant: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Mot qui relie les profils successifs, imprimé entre deux badges.",
        examples: ["ou", "mais"],
      }),
    proprietes: z
      .array(z.string().min(1).meta({ description: "Une propriété, en un mot ou deux." }))
      .optional()
      .meta({
        description:
          "Propriétés des dégâts. Chaînes libres : le catalogue est éditorial, pas une mécanique fermée.",
        examples: [["Perforante", "Fatale 9+"]],
      }),
    munitions: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Munitions de l'arme, telles qu'écrites sur la fiche.",
        examples: ["12", "5 doses"],
      }),
    portee: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Portée de l'arme, telle qu'écrite sur la fiche.",
        examples: ["60 m"],
      }),
  })
  .meta({
    description:
      "Dégâts tels qu'imprimés : versant, badges reliés par un liant, propriétés, munitions et portée.",
  });

export type DegatsValeur = z.infer<typeof Degats>;
