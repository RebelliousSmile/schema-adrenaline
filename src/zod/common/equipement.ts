import { z } from "zod";
import { Compte, PourcentageJouable } from "./primitives.js";

/**
 * Une arme, physique, mentale ou psychologique.
 *
 * La feuille écrit `Arme : JUDO (30 %)  1 d10` : un nom, le pourcentage auquel
 * elle se manie, et des dégâts comptés en d10. Le nom reste une chaîne libre —
 * le catalogue d'armes appartient à chaque jeu, pas au socle.
 */
const Arme = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de l'arme, tel qu'écrit sur la feuille. Chaîne libre.",
        examples: ["Judo", "Batte de baseball", "Sarcasme"],
      }),
    pourcentage: PourcentageJouable.optional().meta({
      description: "Pourcentage jouable auquel l'arme se manie, tel que noté sur la feuille.",
      examples: [{ minimum: 0, current: 30, maximum: 30 }],
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
          "Contact ou distance pour une arme physique ; sociale pour une arme mentale ; psychologique pour une arme de créature.",
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
  .meta({ description: "Une arme, physique, mentale ou psychologique : toutes se notent pareil." });

/**
 * Ce que toutes les fiches partagent dans le bloc Équipement.
 *
 * Aucune liste n'est bornée : la feuille imprime deux lignes d'armes et le
 * générateur en propose trois, mais c'est de la place sur le papier, pas une
 * règle. Le versant non physique diffère selon la fiche : un personnage joueur
 * a des armes mentales, une créature des armes psychologiques, un PNJ aucune.
 */
const equipementCommun = {
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
};

/** Équipement d'un personnage joueur : armes physiques et armes mentales. */
export const Equipement = z
  .strictObject({
    ...equipementCommun,
    armesMentales: z.array(Arme).optional().meta({
      description: "Armes mentales, notées comme les physiques. Liste non bornée.",
    }),
  })
  .meta({
    description:
      "Bloc Équipement d'un personnage joueur : possessions, équipement favori, armes des deux ordres.",
  });

/** Équipement d'un PNJ : armes physiques seulement. */
export const EquipementDePnj = z.strictObject(equipementCommun).meta({
  description: "Bloc Équipement d'un PNJ : possessions, équipement favori, armes physiques.",
});

/** Équipement d'une créature : armes physiques et armes psychologiques. */
export const EquipementDeCreature = z
  .strictObject({
    ...equipementCommun,
    armesPsychologiques: z.array(Arme).optional().meta({
      description:
        "Armes psychologiques de la créature, notées comme les armes physiques. Liste non bornée.",
    }),
  })
  .meta({
    description:
      "Bloc Équipement d'une créature : possessions, équipement favori, armes physiques et psychologiques.",
  });

export type ArmeValeur = z.infer<typeof Arme>;
export type EquipementValeur = z.infer<typeof Equipement>;
export type EquipementDePnjValeur = z.infer<typeof EquipementDePnj>;
export type EquipementDeCreatureValeur = z.infer<typeof EquipementDeCreature>;
