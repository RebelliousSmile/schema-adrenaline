import { z } from "zod";

/**
 * Ce qui fait vivre un personnage non joué à la table.
 *
 * Tout y est chaîne ou liste de chaînes libres : un rôle, une attitude ou un
 * conseil d'interprétation est du contenu de scénario, jamais de la mécanique.
 * Le bloc entier est optionnel, et chacun de ses champs l'est aussi — un
 * figurant n'en porte aucun.
 */
export const Narratif = z
  .strictObject({
    role: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Rôle du personnage dans le scénario.",
        examples: ["Médecin du camp"],
      }),
    attitude: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Attitude envers les personnages joueurs. Chaîne libre et non ensemble fermé : les fiches la nuancent volontiers au-delà du triptyque favorable, neutre, hostile.",
        examples: ["Méfiante, mais prête à soigner quiconque le demande"],
      }),
    personnalite: z
      .array(z.string().min(1).meta({ description: "Un trait de personnalité." }))
      .optional()
      .meta({
        description: "Traits de personnalité, un par entrée.",
        examples: [["Obstinée", "Économe de ses mots"]],
      }),
    historique: z.string().min(1).optional().meta({
      description: "D'où vient le personnage, en un paragraphe.",
    }),
    evolutionPossible: z.string().min(1).optional().meta({
      description: "Ce que le personnage peut devenir selon le tour que prend la partie.",
    }),
    interpretation: z
      .array(z.string().min(1).meta({ description: "Un conseil de jeu." }))
      .optional()
      .meta({
        description: "Conseils de jeu : approche, tics et manières, réactions émotionnelles.",
      }),
    repliques: z
      .array(z.string().min(1).meta({ description: "Une réplique, à lancer telle quelle." }))
      .optional()
      .meta({ description: "Répliques types, à lancer telles quelles." }),
    notesMj: z
      .array(z.string().min(1).meta({ description: "Une note réservée au meneur." }))
      .optional()
      .meta({
        description:
          "Réservé au meneur : secrets, faiblesses, alliés, stratégies, réactions contextuelles.",
      }),
  })
  .meta({
    description:
      "Bloc narratif d'un personnage non joué. Entièrement optionnel, chaînes libres : c'est du contenu de scénario, pas de la mécanique.",
  });

export type NarratifValeur = z.infer<typeof Narratif>;
