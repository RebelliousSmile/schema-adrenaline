import { z } from "zod";
import { Compte, Pourcentage } from "./primitives.js";

/**
 * Une arme, physique ou mentale.
 *
 * La feuille écrit `Arme : JUDO (30 %)  1 d10` : un nom, le pourcentage auquel
 * elle se manie, et des dégâts comptés en d10. Le nom reste une chaîne libre —
 * le catalogue d'armes appartient à chaque jeu, pas au socle.
 */
const Arme = z
  .object({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de l'arme, tel qu'écrit sur la feuille. Chaîne libre.",
        examples: ["Judo", "Batte de baseball", "Sarcasme"],
      }),
    pourcentage: Pourcentage.optional().meta({
      description: "Pourcentage auquel l'arme se manie, tel que noté sur la feuille.",
      examples: [30],
    }),
    desDeDegats: Compte.optional().meta({
      description: "Nombre de d10 de dégâts.",
      examples: [1, 2],
    }),
    type: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Contact ou distance pour une arme physique, psychologique ou sociale pour une arme mentale.",
        examples: ["Contact", "Sociale"],
      }),
    notes: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Ce que la ligne d'arme porte en plus : munitions, portée, contrainte d'emploi.",
        examples: ["Deux mains"],
      }),
  })
  .meta({ description: "Une arme, physique ou mentale : les deux se notent pareil." });

/**
 * Le bloc Équipement.
 *
 * Aucune liste n'est bornée : la feuille imprime deux lignes d'armes et le
 * générateur en propose trois, mais c'est de la place sur le papier, pas une
 * règle.
 */
export const Equipement = z
  .object({
    possessions: z
      .array(z.string().min(1).meta({ description: "Un objet possédé, en une ligne." }))
      .optional()
      .meta({
        description: "Ce que le personnage transporte ou possède. Liste non bornée.",
        examples: [["Trousse de secours", "Lampe torche"]],
      }),
    equipementFavori: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "L'équipement favori, au singulier : la feuille n'en prévoit qu'un, et il ouvre un avantage.",
        examples: ["Trousse de secours"],
      }),
    armesPhysiques: z.array(Arme).optional().meta({
      description:
        "Armes physiques. Liste non bornée : les deux lignes de la feuille sont de la place sur le papier, pas une règle.",
    }),
    armesMentales: z.array(Arme).optional().meta({
      description: "Armes mentales, notées comme les physiques. Liste non bornée.",
    }),
  })
  .meta({
    description: "Bloc Équipement : possessions, équipement favori, armes des deux ordres.",
  });

export type ArmeValeur = z.infer<typeof Arme>;
export type EquipementValeur = z.infer<typeof Equipement>;
