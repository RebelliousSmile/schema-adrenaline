import { z } from "zod";
import { ActionDeCreature, DefenseDeCreature } from "../common/combat.js";
import { Contagion } from "../common/contagion.js";
import { NiveauDeDanger } from "../common/danger.js";
import { Equipement } from "../common/equipement.js";
import {
  CaracteristiquesDeCreature,
  DeltaEtatDeCreature,
  EtatDeCreature,
} from "../common/etat-monstre.js";
import { Competence } from "../common/formations.js";
import { Meta } from "../common/meta.js";
import { Narratif } from "../common/narratif.js";
import { Compte } from "../common/primitives.js";
import { Protections } from "../common/protections.js";
import { SanteDeCreature } from "../common/sante.js";

/** Ancien état alternatif, lu pour compatibilité puis normalisé par les codecs. */
const EtatAlternatifHistorique = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de l'état, par exemple stimulé.",
        examples: ["Stimulé"],
      }),
    declencheurs: z
      .array(z.string().min(1).meta({ description: "Un déclencheur ou une condition de fin." }))
      .optional()
      .meta({
        description: "Ce qui déclenche l'état, et ce qui y met fin.",
        examples: [["Odeur de sang frais"]],
      }),
    caracteristiques: CaracteristiquesDeCreature.partial().optional().meta({
      description:
        "Caractéristiques modifiées par l'état. Ce qui n'est pas redéclaré garde la valeur de l'état de base.",
    }),
    zoneDeDetection: z.string().min(1).optional().meta({
      description: "Distance de détection dans cet état, si elle change.",
    }),
    deplacement: z.string().min(1).optional().meta({
      description: "Distance parcourue par action dans cet état, si elle change.",
    }),
    actionsParRound: Compte.optional().meta({
      description: "Nombre d'actions par round dans cet état, s'il change.",
      examples: [2],
    }),
    notes: z.string().min(1).optional().meta({
      description: "Ce que l'état change en plus des valeurs chiffrées.",
    }),
  })
  .meta({ description: "Ancien format d'état alternatif, conservé pour lecture uniquement." });

/**
 * Une créature du socle Adrenaline System.
 *
 * Un zé sans conscience et un prédateur pensant tiennent dans la même forme.
 *
 * Le nom est un champ local et non le bloc identité : une créature n'a ni
 * profession, ni nationalité, ni signes particuliers. Elle porte en revanche un
 * niveau de danger, qu'un personnage joueur n'a pas, et jamais de formation ni
 * de paramètres de création.
 *
 * Contrainte non validable, énoncée ici faute de pouvoir l'exprimer : des seuils
 * mentaux n'ont de sens que sur une créature portant des caractéristiques
 * mentales. Draft-7 n'a pas de `dependentSchemas`, et un `refine`
 * disparaîtrait sans trace du schéma généré.
 */
export const Monstre = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description:
          "Nom de la créature. Champ local et non bloc identité : elle n'a ni nationalité ni signes particuliers.",
        examples: ["Zé lent", "Traqueur"],
      }),
    typeDeCorps: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Corps servant de base à la créature. Chaîne libre : le catalogue des corps appartient à chaque jeu.",
        examples: ["Corps humain adulte"],
      }),
    instinct: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Instinct qui gouverne son comportement. Chaîne libre : un meneur en ajoute.",
        examples: ["Dévorer"],
      }),
    typeInfecte: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Type d'infecté, quand le jeu en distingue plusieurs. Chaîne libre.",
        examples: ["Type 1"],
      }),
    description: z.string().min(1).optional().meta({
      description: "Ce qu'on perçoit de la créature au premier regard.",
    }),
    niveauDeDanger: NiveauDeDanger.optional(),
    caracteristiques: CaracteristiquesDeCreature,
    sante: SanteDeCreature.optional().meta({
      description:
        "Seuils de dégât. Les mentaux n'ont de sens que si la créature a des caractéristiques mentales.",
    }),
    protections: Protections.partial().optional().meta({
      description: "Protections, chaque versant facultatif.",
    }),
    zoneDeDetection: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Distance à laquelle la créature repère une proie.",
        examples: ["20 m"],
      }),
    deplacement: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Distance parcourue par action.",
        examples: ["5 m par action"],
      }),
    actionsParRound: Compte.optional().meta({
      description: "Nombre d'actions par round.",
      examples: [1],
    }),
    defense: DefenseDeCreature.optional().meta({
      description: "Défense de la créature quand elle en possède une.",
    }),
    actions: z.array(ActionDeCreature).optional().meta({
      description: "Actions de combat ou capacités propres à la créature.",
    }),
    etatActif: z.string().min(1).optional().meta({
      description:
        "Identifiant de l'état actuellement actif. Absent ou `base` désigne le profil de base.",
    }),
    etats: z.array(EtatDeCreature).optional().meta({
      description: "États identifiés de la créature, chacun portant un delta complet de profil.",
    }),
    etatAlternatif: EtatAlternatifHistorique.optional().meta({
      description: "Ancien format lu pour compatibilité. Les nouveaux documents utilisent `etats`.",
    }),
    comportement: z
      .array(z.string().min(1).meta({ description: "Un trait de comportement." }))
      .optional()
      .meta({
        description: "Comment la créature agit, un trait par entrée.",
        examples: [["Suit le bruit", "N'escalade pas"]],
      }),
    traitsSpeciaux: z
      .array(z.string().min(1).meta({ description: "Un trait spécial." }))
      .optional()
      .meta({
        description: "Insensibilités, immunités, capacités hors du commun. Liste non bornée.",
      }),
    competences: z.array(Competence).optional().meta({
      description:
        "Compétences rattachées directement à la créature : elle ne passe par aucune formation.",
    }),
    equipement: Equipement.optional().meta({
      description: "Ce dont la créature se sert, quand elle se sert de quelque chose.",
    }),
    contagion: Contagion.optional().meta({
      description: "Mécanique de transmission. Absente sur une créature non contagieuse.",
    }),
    narratif: Narratif.optional().meta({
      description:
        "Une créature nommée et jouée mérite le même traitement qu'un personnage non joué.",
    }),
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/monstre.schema.json",
    title: "Créature — Adrenaline System",
    description:
      "Fiche de créature du socle Adrenaline System : nom et caractéristiques physiques requis, caractéristiques mentales optionnelles, états identifiés, combat structuré, contagion générique et bloc narratif facultatifs.",
  });

export type MonstreValeur = z.infer<typeof Monstre>;
