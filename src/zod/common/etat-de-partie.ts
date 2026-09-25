import { z } from "zod";
import { LocalisationCorporelle, LocalisationEmotionnelle } from "./localisations.js";
import { Compte } from "./primitives.js";

const Stress = z
  .strictObject({
    adrenaline: Compte.optional().meta({
      description: "Nombre de dés ou niveau de stress d'adrénaline en cours.",
      examples: [1],
    }),
    panique: Compte.optional().meta({
      description: "Nombre de dés ou niveau de stress de panique en cours.",
      examples: [0],
    }),
  })
  .meta({ description: "Compteurs de stress en cours de scène." });

const Malus = z
  .strictObject({
    physique: Compte.optional().meta({
      description: "Niveau de malus physique actuellement encaissé.",
      examples: [2],
    }),
    mental: Compte.optional().meta({
      description: "Niveau de malus mental actuellement encaissé.",
      examples: [1],
    }),
  })
  .meta({ description: "Niveaux de malus temporaires, séparés par versant." });

const Fatigue = z
  .strictObject({
    rounds: z.int().min(0).max(5).optional().meta({
      description: "Cercles de fatigue cochés sur les cinq emplacements en rounds.",
    }),
    heures: z.int().min(0).max(5).optional().meta({
      description: "Cercles de fatigue cochés sur les cinq emplacements en heures.",
    }),
  })
  .meta({ description: "Fatigue temporaire, notée sur deux séries de cinq cercles." });

const EtatPhysique = z
  .strictObject({
    nom: z.string().min(1).meta({ description: "Nom de l'état encaissé." }),
    versant: z.literal("physique").meta({ description: "Versant physique de l'état." }),
    localisation: LocalisationCorporelle.optional().meta({
      description: "Localisation corporelle concernée, si la fiche la note.",
    }),
    duree: z.string().min(1).optional().meta({
      description: "Durée ou condition de fin de l'état.",
    }),
    notes: z.string().min(1).optional().meta({
      description: "Précision libre sur l'état encaissé.",
    }),
  })
  .meta({ description: "État de partie physique, éventuellement localisé." });

const EtatMental = z
  .strictObject({
    nom: z.string().min(1).meta({ description: "Nom de l'état encaissé." }),
    versant: z.literal("mental").meta({ description: "Versant mental de l'état." }),
    localisation: LocalisationEmotionnelle.optional().meta({
      description: "Localisation émotionnelle concernée, si la fiche la note.",
    }),
    duree: z.string().min(1).optional().meta({
      description: "Durée ou condition de fin de l'état.",
    }),
    notes: z.string().min(1).optional().meta({
      description: "Précision libre sur l'état encaissé.",
    }),
  })
  .meta({ description: "État de partie mental, éventuellement localisé." });

const EtatGeneral = z
  .strictObject({
    nom: z.string().min(1).meta({ description: "Nom de l'état de partie." }),
    versant: z.literal("general").meta({ description: "État indépendant des deux versants." }),
    duree: z.string().min(1).optional().meta({
      description: "Durée ou condition de fin de l'état.",
    }),
    notes: z.string().min(1).optional().meta({
      description: "Précision libre sur l'état de partie.",
    }),
  })
  .meta({ description: "État de partie général, par exemple une immunité temporaire." });

export const EtatEncaissé = z
  .discriminatedUnion("versant", [EtatPhysique, EtatMental, EtatGeneral])
  .meta({
    description:
      "État de partie encaissé, physique, mental ou général. Chaque versant n'accepte que ses localisations publiées.",
  });

/** État temporaire d'une fiche pendant une scène, séparé de son profil durable. */
export const EtatDePartie = z
  .strictObject({
    stress: Stress.optional().meta({ description: "Compteurs de stress de la scène." }),
    malus: Malus.optional().meta({ description: "Malus temporaires de la scène." }),
    fatigue: Fatigue.optional().meta({ description: "Cercles de fatigue rounds et heures." }),
    etats: z.array(EtatEncaissé).optional().meta({
      description: "États encaissés ou temporaires actuellement applicables.",
    }),
  })
  .meta({
    description:
      "État transitoire de partie. Son absence décrit une fiche de référence ou un export hors scène.",
  });

export type EtatDePartieValeur = z.infer<typeof EtatDePartie>;
export type EtatEncaisséValeur = z.infer<typeof EtatEncaissé>;
