import { z } from "zod";
import { LocalisationCorporelle, LocalisationEmotionnelle } from "./localisations.js";
import { Points } from "./primitives.js";

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
 * Protections physiques : solidité propre du personnage, armure éventuelle et
 * localisations qu'elle couvre, bouclier éventuel.
 *
 * Les localisations couvertes sont stockées, et pas seulement la valeur
 * d'armure : sans elles, la seconde valeur de chaque seuil de santé est
 * ininterprétable.
 */
export const ProtectionsPhysiques = z
  .strictObject({
    solidite: Points.meta({
      description: "PP de Solidité physique. Fixe le seuil superficiel.",
      examples: [7],
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
        points: Points.meta({
          description:
            "PP d'Armure. S'ajoutent à la base de chaque seuil sur les localisations couvertes.",
          examples: [2],
        }),
        localisations: z
          .array(LocalisationCorporelle)
          .min(1)
          .meta({
            description:
              "Localisations corporelles couvertes par l'armure. Au moins une : une armure ne couvrant rien rendrait la valeur couverte de chaque seuil ininterprétable.",
            examples: [["torse", "bras-fort"]],
          }),
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
    solidite: Points.meta({
      description: "PM de Solidité mentale. Fixe le seuil mental superficiel.",
      examples: [5],
    }),
    caractere: z
      .strictObject({
        trait: z
          .string()
          .min(1)
          .meta({
            description:
              "Trait de caractère qui protège. Chaîne libre : le catalogue est éditorial.",
            examples: ["Cynique"],
          }),
        points: Points.meta({
          description: "PM de Caractère. S'ajoutent à la base de chaque seuil mental couvert.",
          examples: [2],
        }),
        localisations: z
          .array(LocalisationEmotionnelle)
          .min(1)
          .meta({
            description:
              "Localisations émotionnelles couvertes par le trait de caractère. Au moins une, pour la même raison que l'armure.",
            examples: [["peur", "anxiete"]],
          }),
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

export type BouclierValeur = z.infer<typeof Bouclier>;
export type ProtectionsValeur = z.infer<typeof Protections>;
