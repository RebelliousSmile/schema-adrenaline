import { z } from "zod";
import { CaracteristiquesMentales, CaracteristiquesPhysiques } from "../common/caracteristiques";
import { Contagion } from "../common/contagion";
import { NiveauDeDanger } from "../common/danger";
import { Equipement } from "../common/equipement";
import { Competence } from "../common/formations";
import { Meta } from "../common/meta";
import { Narratif } from "../common/narratif";
import { Compte } from "../common/primitives";
import { Protections } from "../common/protections";
import { SanteDeCreature } from "../common/sante";

/**
 * Les caractéristiques d'une créature : les quatre physiques requises, les
 * quatre mentales séparément optionnelles.
 *
 * Un profil de corps d'infecté porte les quatre physiques et la seule PER, qui
 * sert la détection des proies ; un prédateur pensant porte les huit et devient
 * cible d'attaques mentales.
 *
 * Composition par `extend` sur la forme partielle, jamais par `and` : une
 * intersection produirait un `allOf` de deux objets fermés qu'aucun document ne
 * satisfait. Vérifié sur Zod 4.3.6.
 */
const CaracteristiquesDeCreature = CaracteristiquesPhysiques.extend(
  CaracteristiquesMentales.partial().shape,
).meta({
  description:
    "Caractéristiques d'une créature : les quatre physiques toujours, les mentales seulement si elle en a. Un corps d'infecté ne porte souvent que PER.",
});

/**
 * L'état alternatif d'une créature — le stimulé du générateur d'infectés.
 *
 * Rejoue les mêmes valeurs, modifiées. Ce qu'il ne redéclare pas reste celui de
 * l'état de base.
 */
const EtatAlternatif = z
  .object({
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
  .meta({
    description:
      "Un état alternatif : les mêmes valeurs, modifiées. Ce qu'il ne redéclare pas reste celui de l'état de base.",
  });

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
  .object({
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
    etatAlternatif: EtatAlternatif.optional().meta({
      description: "État second de la créature, quand elle en a un.",
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
      "Fiche de créature du socle Adrenaline System : nom et caractéristiques physiques requis, caractéristiques mentales optionnelles, état alternatif, contagion générique et bloc narratif facultatifs.",
  });

export type EtatAlternatifValeur = z.infer<typeof EtatAlternatif>;
export type MonstreValeur = z.infer<typeof Monstre>;
