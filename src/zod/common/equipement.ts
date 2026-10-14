import { z } from "zod";
import { NatureDeDegats } from "./degats.js";
import { Compte, KIT_JOUEUR, KIT_SOUPLE, Pourcentage, type KitDeValeurs } from "./primitives.js";

/**
 * Les blocs Équipement, construits sur le kit de valeurs de la fiche : le
 * pourcentage d'une arme est un triplet jouable pour le PJ, un nombre simple ou
 * un triplet pour le PNJ et la créature.
 */
function construireEquipement<K extends KitDeValeurs>(k: K) {
  /**
   * Une arme, physique ou psychologique.
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
      pourcentage: k.pourcentage.optional().meta({
        description:
          "Pourcentage jouable auquel l'arme se manie, tel que noté sur la feuille." + k.note,
        examples: [k.exemple(30)],
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
            "Contact ou distance pour une arme physique ; psychologique pour une arme de créature.",
          examples: ["Contact", "Distance", "Psychologique"],
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
    .meta({
      description: "Une arme, physique ou psychologique : toutes se notent pareil.",
    });

  /**
   * Ce que toutes les fiches partagent dans le bloc Équipement.
   *
   * Aucune liste n'est bornée : la feuille imprime deux lignes d'armes et le
   * générateur en propose trois, mais c'est de la place sur le papier, pas une
   * règle. Le versant non physique diffère selon la fiche : une créature a des armes
   * psychologiques, le personnage joueur et le PNJ aucune (les armes sociales
   * sont une table de règles publiée par la présentation, pas une saisie).
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

  /**
   * Arme physique d'un PJ : la feuille n'imprime ni contact ni distance, mais la nature des dégâts
   * (choquante ou blessante), avec le vocabulaire déjà publié pour les créatures. La nature tient
   * lieu de type : `type` n'existe pas sur l'arme PJ, ni `notes` que la feuille n'imprime pas. Le pourcentage est un nombre simple.
   */
  const ArmeDeJoueur = Arme.omit({ type: true, notes: true, pourcentage: true })
    .extend({
      pourcentage: Pourcentage.optional().meta({
        description: "Pourcentage auquel l'arme se manie, tel que noté sur la feuille.",
        examples: [30],
      }),
      nature: NatureDeDegats.optional().meta({
        description: "Nature des dégâts de l'arme : choquante ou blessante. Facultative.",
        examples: ["blessante"],
      }),
    })
    .meta({
      description:
        "Arme physique d'un PJ : pourcentage en nombre simple, nature des dégâts en option.",
    });

  /** Équipement d'un personnage joueur : armes physiques et avantages. */
  const Equipement = z
    .strictObject({
      ...equipementCommun,
      armesPhysiques: z.array(ArmeDeJoueur).optional().meta({
        description:
          "Armes physiques. Liste non bornée : les lignes de la feuille sont de la place sur le papier, pas une règle.",
      }),
      armesSocialesBarrees: z
        .array(
          z.enum([
            "Bluff",
            "Intimidation",
            "Manipulation",
            "Négociation",
            "Persuasion",
            "Provocation",
            "Séduction",
          ]),
        )
        .optional()
        .meta({
          description:
            "Armes sociales que le personnage n'utilise pas : la feuille les raye ou les grise, sans les retirer de la liste. Les autres restent normales.",
          examples: [["Provocation", "Séduction"]],
        }),
      avantagesEtImmunites: z
        .array(
          z.string().min(1).meta({ description: "Un avantage ou une immunité, en une ligne." }),
        )
        .optional()
        .meta({
          description: "Avantages et immunités du personnage. Liste non bornée.",
          examples: [["Immunité au froid"]],
        }),
    })
    .meta({
      description:
        "Bloc Équipement d'un personnage joueur : possessions, équipement favori, armes physiques, avantages et immunités.",
    });

  /** Équipement d'un PNJ : armes physiques seulement. */
  const EquipementDePnj = z.strictObject(equipementCommun).meta({
    description: "Bloc Équipement d'un PNJ : possessions, équipement favori, armes physiques.",
  });

  /** Équipement d'une créature : armes physiques et armes psychologiques. */
  const EquipementDeCreature = z
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

  return { Arme, Equipement, EquipementDePnj, EquipementDeCreature };
}

const joueur = construireEquipement(KIT_JOUEUR);
const souple = construireEquipement(KIT_SOUPLE);

/** Équipement d'un personnage joueur : pourcentage d'arme en nombre simple, sans `type`. */
export const Equipement = joueur.Equipement;
/** Équipement d'un PNJ : pourcentage d'arme en nombre simple ou en triplet. */
export const EquipementDePnj = souple.EquipementDePnj;
/** Équipement d'une créature : pourcentage d'arme en nombre simple ou en triplet. */
export const EquipementDeCreature = souple.EquipementDeCreature;

export type ArmeValeur = z.infer<typeof joueur.Arme>;
export type EquipementValeur = z.infer<typeof Equipement>;
export type EquipementDePnjValeur = z.infer<typeof EquipementDePnj>;
export type EquipementDeCreatureValeur = z.infer<typeof EquipementDeCreature>;
