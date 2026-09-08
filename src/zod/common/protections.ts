import { z } from "zod";
import { LocalisationCorporelle, LocalisationEmotionnelle } from "./localisations";

const Points = z.int().min(0);

/**
 * Un bouclier, physique ou mental. Ses propriétés — type de couvert côté
 * physique, type de censure côté mental — sont des chaînes libres : ce sont des
 * catalogues éditoriaux, pas des mécaniques fermées.
 */
const Bouclier = z.object({
  nom: z.string().min(1),
  proprietes: z.array(z.string().min(1)).optional().meta({
    description: "Type de couvert (bouclier physique) ou de censure (bouclier mental).",
  }),
});

/**
 * Protections physiques : solidité propre du personnage, armure éventuelle et
 * localisations qu'elle couvre, bouclier éventuel.
 *
 * Les localisations couvertes sont stockées, et pas seulement la valeur
 * d'armure : sans elles, la seconde valeur de chaque palier de santé est
 * ininterprétable.
 */
export const ProtectionsPhysiques = z.object({
  solidite: Points.meta({ description: "PP de Solidité physique." }),
  armure: z
    .object({
      nom: z.string().min(1).optional(),
      points: Points.meta({ description: "PP d'Armure." }),
      localisations: z.array(LocalisationCorporelle).meta({
        description: "Localisations corporelles couvertes par l'armure.",
      }),
    })
    .optional(),
  bouclier: Bouclier.optional(),
});

/**
 * Protections mentales, strictement symétriques des physiques. Le trait de
 * caractère y tient le rôle de l'armure ; son nom reste une chaîne libre, le
 * catalogue des traits étant éditorial.
 */
export const ProtectionsMentales = z.object({
  solidite: Points.meta({ description: "PM de Solidité mentale." }),
  caractere: z
    .object({
      trait: z.string().min(1).meta({ description: "Trait de caractère." }),
      points: Points.meta({ description: "PM de Caractère." }),
      localisations: z.array(LocalisationEmotionnelle).meta({
        description: "Localisations émotionnelles couvertes par le trait de caractère.",
      }),
    })
    .optional(),
  bouclier: Bouclier.optional(),
});

export const Protections = z.object({
  physiques: ProtectionsPhysiques,
  mentales: ProtectionsMentales,
});
