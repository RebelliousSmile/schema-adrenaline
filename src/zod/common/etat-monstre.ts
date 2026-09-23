import { z } from "zod";
import { ActionDeCreature, DefenseDeCreature } from "./combat.js";
import { CaracteristiquesMentales, CaracteristiquesPhysiques } from "./caracteristiques.js";
import { Contagion } from "./contagion.js";
import { Equipement } from "./equipement.js";
import { Competence } from "./formations.js";
import { Compte } from "./primitives.js";
import { Protections } from "./protections.js";
import { SanteDeCreature } from "./sante.js";

/** Caractéristiques permanentes d'une créature : physiques requises, mentales facultatives. */
export const CaracteristiquesDeCreature = CaracteristiquesPhysiques.extend(
  CaracteristiquesMentales.partial().shape,
).meta({
  description:
    "Caractéristiques d'une créature : les quatre physiques toujours, les mentales seulement si elle en a.",
});

/** Les remplacements complets appliqués par un état identifié de créature. */
export const DeltaEtatDeCreature = z
  .strictObject({
    caracteristiques: CaracteristiquesDeCreature.optional().meta({
      description: "Caractéristiques complètes qui remplacent celles de l'état de base.",
    }),
    sante: SanteDeCreature.optional().meta({
      description: "Santé complète qui remplace celle de l'état de base.",
    }),
    protections: Protections.partial().optional().meta({
      description: "Protections qui remplacent celles de l'état de base.",
    }),
    defense: DefenseDeCreature.optional().meta({
      description: "Défense qui remplace celle de l'état de base.",
    }),
    zoneDeDetection: z.string().min(1).optional().meta({
      description: "Distance de détection qui remplace celle de l'état de base.",
    }),
    deplacement: z.string().min(1).optional().meta({
      description: "Déplacement qui remplace celui de l'état de base.",
    }),
    actionsParRound: Compte.optional().meta({
      description: "Nombre d'actions par round qui remplace celui de l'état de base.",
    }),
    actions: z.array(ActionDeCreature).optional().meta({
      description: "Actions qui remplacent celles de l'état de base.",
    }),
    comportement: z
      .array(z.string().min(1).meta({ description: "Un trait de comportement." }))
      .optional()
      .meta({ description: "Comportement qui remplace celui de l'état de base." }),
    traitsSpeciaux: z
      .array(z.string().min(1).meta({ description: "Un trait spécial." }))
      .optional()
      .meta({ description: "Traits spéciaux qui remplacent ceux de l'état de base." }),
    competences: z.array(Competence).optional().meta({
      description: "Compétences qui remplacent celles de l'état de base.",
    }),
    equipement: Equipement.optional().meta({
      description: "Équipement qui remplace celui de l'état de base.",
    }),
    contagion: Contagion.optional().meta({
      description: "Contagion qui remplace celle de l'état de base.",
    }),
    notes: z.string().min(1).optional().meta({
      description: "Effet additionnel de l'état qui ne se prête pas à un champ structuré.",
    }),
  })
  .meta({
    description:
      "Delta complet d'un état de créature. Toute propriété présente remplace entièrement la propriété homonyme de l'état de base.",
  });

/** Un état nommé et déclenchable d'une créature. */
export const EtatDeCreature = z
  .strictObject({
    id: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .meta({
        description: "Identifiant stable de l'état, en minuscules séparées par des tirets.",
        examples: ["stimule"],
      }),
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom lisible de l'état.",
        examples: ["Stimulé"],
      }),
    declencheurs: z
      .array(z.string().min(1).meta({ description: "Un déclencheur ou une condition de fin." }))
      .optional()
      .meta({ description: "Ce qui active, maintient ou termine l'état." }),
    delta: DeltaEtatDeCreature.meta({
      description: "Propriétés qui remplacent celles de l'état de base.",
    }),
  })
  .meta({ description: "État nommé d'une créature et son delta de profil." });

export type CaracteristiquesDeCreatureValeur = z.infer<typeof CaracteristiquesDeCreature>;
export type DeltaEtatDeCreatureValeur = z.infer<typeof DeltaEtatDeCreature>;
export type EtatDeCreatureValeur = z.infer<typeof EtatDeCreature>;
