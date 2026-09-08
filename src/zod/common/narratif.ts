import { z } from "zod";

/**
 * Ce qui fait vivre un personnage non joué à la table.
 *
 * Tout y est chaîne ou liste de chaînes libres : un rôle, une attitude ou un
 * conseil d'interprétation est du contenu de scénario, jamais de la mécanique.
 * Le bloc entier est optionnel, et chacun de ses champs l'est aussi — un
 * figurant n'en porte aucun.
 */
export const Narratif = z.object({
  role: z.string().min(1).optional().meta({
    description: "Rôle du personnage dans le scénario.",
  }),
  attitude: z.string().min(1).optional().meta({
    description:
      "Attitude envers les personnages joueurs. Chaîne libre et non ensemble fermé : les cartouches la nuancent volontiers au-delà du triptyque favorable, neutre, hostile.",
  }),
  personnalite: z.array(z.string().min(1)).optional(),
  historique: z.string().min(1).optional(),
  evolutionPossible: z.string().min(1).optional().meta({
    description: "Ce que le personnage peut devenir selon le tour que prend la partie.",
  }),
  interpretation: z.array(z.string().min(1)).optional().meta({
    description: "Conseils de jeu : approche, tics et manières, réactions émotionnelles.",
  }),
  repliques: z.array(z.string().min(1)).optional().meta({
    description: "Répliques types, à lancer telles quelles.",
  }),
  notesMj: z.array(z.string().min(1)).optional().meta({
    description:
      "Réservé au meneur : secrets, faiblesses, alliés, stratégies, réactions contextuelles.",
  }),
});
