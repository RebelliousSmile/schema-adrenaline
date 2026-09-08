import { z } from "zod";

/**
 * Une arme, physique ou mentale. Le nom est une chaîne libre : le catalogue
 * d'armes appartient à chaque jeu, pas au socle.
 */
const Arme = z.object({
  nom: z.string().min(1),
  type: z.string().min(1).optional().meta({
    description:
      "Contact ou distance pour une arme physique, psychologique ou sociale pour une arme mentale.",
  }),
  degats: z.string().min(1).optional().meta({ description: "Dégâts, tels que notés sur la feuille." }),
  notes: z.string().min(1).optional(),
});

/**
 * L'équipement porté.
 *
 * Aucune liste n'est bornée : la limite à trois armes du générateur vient de la
 * place disponible sur la feuille imprimée, pas d'une règle.
 */
export const Equipement = z.object({
  armesPhysiques: z.array(Arme).optional(),
  armesMentales: z.array(Arme).optional(),
  possessionsFavorites: z.array(z.string().min(1)).optional(),
});
