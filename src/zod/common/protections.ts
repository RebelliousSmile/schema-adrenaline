import { z } from "zod";
import { LocalisationCorporelle, LocalisationEmotionnelle } from "./localisations.js";
import { Points, PointsJouables } from "./primitives.js";

/**
 * Un bouclier, physique ou mental. Ses propriétés — type de couvert côté
 * physique, type de censure côté mental — sont des chaînes libres : ce sont des
 * catalogues éditoriaux, pas des mécaniques fermées.
 */
const Bouclier = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom du bouclier, tel qu'écrit sur la fiche.",
        examples: ["Portière de voiture", "Déni"],
      }),
    proprietes: z
      .array(z.string().min(1).meta({ description: "Une propriété, en un mot ou deux." }))
      .optional()
      .meta({
        description: "Type de couvert (bouclier physique) ou de censure (bouclier mental).",
        examples: [["Couvert partiel"]],
      }),
  })
  .meta({
    description: "Un bouclier, physique ou mental.",
  });

/**
 * Le badge de dés d'une armure ou d'un trait de caractère, tel qu'imprimé
 * (`-2d10`) : les dés que la protection retire aux dégâts encaissés.
 */
const DesDeProtection = z
  .string()
  .min(1)
  .meta({
    description: "Dés retirés aux dégâts, tels qu'imprimés dans le badge gris.",
    examples: ["-1d10", "-2d10"],
  });

/**
 * Une réduction fixe contre certains types de dégâts : `Réduction (Tranchante,
 * Perforante) -5`. La valeur est saisie positive et imprimée précédée du signe
 * moins.
 */
const Reduction = z
  .strictObject({
    contre: z
      .array(z.string().min(1).meta({ description: "Un type de dégâts réduit." }))
      .min(1)
      .meta({
        description: "Types de dégâts que la réduction concerne, imprimés entre parenthèses.",
        examples: [["Tranchante", "Perforante"]],
      }),
    valeur: Points.meta({
      description: "Points retirés, saisis positifs et imprimés précédés du signe moins.",
      examples: [5],
    }),
  })
  .meta({ description: "Réduction fixe contre certains types de dégâts." });

const ProprietesDeProtection = z
  .array(z.string().min(1).meta({ description: "Une propriété, en un mot ou deux." }))
  .meta({ description: "Propriétés de la protection.", examples: [["Discrète"]] });

/**
 * Protections physiques : solidité propre du personnage, armure éventuelle et
 * localisations qu'elle couvre, bouclier éventuel.
 *
 * Les localisations couvertes sont stockées, et pas seulement la valeur
 * d'armure : sans elles, la seconde valeur de chaque seuil de santé est
 * ininterprétable.
 */
export const ProtectionsPhysiques = z
  .strictObject({
    solidite: PointsJouables.meta({
      description: "PP de Solidité physique. Fixe le seuil superficiel.",
      examples: [{ minimum: 0, current: 7, maximum: 7 }],
    }),
    armure: z
      .strictObject({
        nom: z
          .string()
          .min(1)
          .optional()
          .meta({
            description: "Nom de l'armure, tel qu'écrit sur la fiche.",
            examples: ["Blouson de cuir"],
          }),
        des: DesDeProtection.optional(),
        points: PointsJouables.optional().meta({
          description:
            "PP d'Armure, sur la feuille de PJ. S'ajoutent à la base de chaque seuil sur les localisations couvertes.",
          examples: [{ minimum: 0, current: 2, maximum: 2 }],
        }),
        localisations: z
          .array(LocalisationCorporelle)
          .min(1)
          .optional()
          .meta({
            description:
              "Localisations corporelles couvertes par l'armure, quand elles relèvent du catalogue publié.",
            examples: [["torse", "bras-fort"]],
          }),
        couverture: z
          .string()
          .min(1)
          .optional()
          .meta({
            description: "Couverture en texte libre, telle qu'imprimée sur une fiche de PNJ.",
            examples: ["Torse, Bras, Jambe", "Pieds uniquement"],
          }),
        proprietes: ProprietesDeProtection.optional(),
        reduction: Reduction.optional(),
      })
      .optional()
      .meta({ description: "Armure portée, si le personnage en a une." }),
    bouclier: Bouclier.optional().meta({
      description: "Bouclier physique : ce que le personnage interpose entre lui et le coup.",
    }),
  })
  .meta({ description: "Protections physiques : solidité, armure, bouclier." });

/**
 * Protections mentales, strictement symétriques des physiques. Le trait de
 * caractère y tient le rôle de l'armure ; son nom reste une chaîne libre, le
 * catalogue des traits étant éditorial.
 */
export const ProtectionsMentales = z
  .strictObject({
    solidite: PointsJouables.meta({
      description: "PM de Solidité mentale. Fixe le seuil mental superficiel.",
      examples: [{ minimum: 0, current: 5, maximum: 5 }],
    }),
    caractere: z
      .strictObject({
        trait: z
          .string()
          .min(1)
          .optional()
          .meta({
            description:
              "Trait de caractère qui protège. Chaîne libre : le catalogue est éditorial. Absent quand la fiche n'en nomme pas.",
            examples: ["Cynique", "Calme"],
          }),
        des: DesDeProtection.optional(),
        points: PointsJouables.optional().meta({
          description:
            "PM de Caractère, sur la feuille de PJ. S'ajoutent à la base de chaque seuil mental couvert.",
          examples: [{ minimum: 0, current: 2, maximum: 2 }],
        }),
        localisations: z
          .array(LocalisationEmotionnelle)
          .min(1)
          .optional()
          .meta({
            description:
              "Localisations émotionnelles couvertes, quand elles relèvent du catalogue publié.",
            examples: [["peur", "anxiete"]],
          }),
        emotions: z
          .array(z.string().min(1).meta({ description: "Une émotion couverte." }))
          .min(1)
          .optional()
          .meta({
            description:
              "Émotions couvertes en texte libre, telles qu'imprimées sur une fiche de PNJ.",
            examples: [["Anxiété"]],
          }),
        proprietes: ProprietesDeProtection.optional(),
        reduction: Reduction.optional(),
      })
      .optional()
      .meta({ description: "Trait de caractère protecteur, si le personnage en a un." }),
    bouclier: Bouclier.optional().meta({
      description: "Bouclier mental : la censure derrière laquelle le personnage se réfugie.",
    }),
  })
  .meta({ description: "Protections mentales : solidité, trait de caractère, bouclier." });

export const Protections = z
  .strictObject({
    physiques: ProtectionsPhysiques,
    mentales: ProtectionsMentales,
  })
  .meta({
    description:
      "Les deux versants de la protection. Symétriques par construction : le socle traite le conflit mental comme le conflit physique.",
  });

/**
 * Les protections d'une fiche abrégée — PNJ ou créature : chaque versant et
 * chacun de ses champs est facultatif. Une fiche de PNJ n'imprime pas la
 * Solidité, seulement les seuils qui en découlent.
 */
export const ProtectionsAbregees = z
  .strictObject({
    physiques: ProtectionsPhysiques.partial().optional().meta({
      description: "Protections physiques, chaque champ facultatif.",
    }),
    mentales: ProtectionsMentales.partial().optional().meta({
      description: "Protections mentales, chaque champ facultatif.",
    }),
  })
  .meta({
    description:
      "Protections d'une fiche abrégée : chaque versant et chacun de ses champs facultatif, Solidité comprise.",
  });

export type ProtectionsAbregeesValeur = z.infer<typeof ProtectionsAbregees>;
export type BouclierValeur = z.infer<typeof Bouclier>;
export type ProtectionsValeur = z.infer<typeof Protections>;
