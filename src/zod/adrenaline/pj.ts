import { z } from "zod";
import { Caracteristiques } from "../common/caracteristiques.js";
import { Equipement } from "../common/equipement.js";
import { Formation } from "../common/formations.js";
import { Identite } from "../common/identite.js";
import { Meta } from "../common/meta.js";
import { Cumul } from "../common/primitives.js";
import { Protections } from "../common/protections.js";
import { Sante } from "../common/sante.js";

/**
 * Le bloc « Paramètres du jeu », en haut à droite de la feuille : qui joue le
 * personnage, comment la fiche a été produite, et les PX accumulés.
 *
 * Jamais requis — une fiche reprise d'ailleurs n'en porte rien.
 *
 * À ne pas confondre avec le bloc `meta` : celui-ci décrit une partie, l'autre
 * décrit le fichier et sa provenance.
 */
const ParametresDuJeu = z
  .object({
    joueur: z.string().min(1).optional().meta({
      description: "Personne qui joue le personnage.",
    }),
    typeDeCreation: z
      .enum(["equitable", "aleatoire"])
      .optional()
      .meta({
        description: "Attribution distributive ou tirage aléatoire.",
        examples: ["equitable"],
      }),
    typeDeScenario: z
      .enum(["one-shot", "campagne"])
      .optional()
      .meta({
        description: "Format de la partie pour laquelle la fiche a été produite.",
        examples: ["campagne"],
      }),
    declinaisonDeCampagne: z
      .enum(["bac-a-sable", "storyline"])
      .optional()
      .meta({
        description:
          "Déclinaison de la campagne. Proposée par le générateur officiel ; la feuille imprimée ne porte pas cette case.",
        examples: ["storyline"],
      }),
    px: Cumul.optional().meta({
      description: "Points d'expérience accumulés depuis la création.",
      examples: [0, 25],
    }),
  })
  .meta({
    description:
      "Bloc « Paramètres du jeu » de la feuille : qui joue, comment la fiche a été produite, PX accumulés. Décrit la partie, pas le fichier.",
  });

/**
 * Un personnage joueur du socle Adrenaline System.
 *
 * La feuille telle qu'on la lit en jeu, bloc par bloc : nom en en-tête,
 * paramètres du jeu, compétence, identité, caractéristique, équipement, santé.
 *
 * Est requis ce qu'une feuille jouable porte toujours : le nom, les huit
 * caractéristiques, les seuils de santé et les solidités. Le bloc identité est
 * facultatif, le livre le laissant libre au joueur.
 *
 * Ne sont pas stockés les compteurs qui se remplissent en jeu : dés de stress,
 * malus, états encaissés, colonne « Actuel » des caractéristiques.
 */
export const PersonnageJoueur = z
  .object({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom du personnage, en en-tête de la feuille.",
        examples: ["Claire Vasseur"],
      }),
    identite: Identite.optional().meta({
      description: "Bloc Identité de la feuille. Facultatif : le livre le laisse libre au joueur.",
    }),
    caracteristiques: Caracteristiques,
    sante: Sante,
    protections: Protections,
    formations: z.array(Formation).optional().meta({
      description:
        "Formations du personnage. La feuille en imprime trois colonnes — classe sociale, professionnelle, personnelle — mais la liste n'est pas bornée : d'autres s'acquièrent en campagne.",
    }),
    equipement: Equipement.optional().meta({
      description: "Bloc Équipement de la feuille.",
    }),
    parametresDuJeu: ParametresDuJeu.optional(),
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pj.schema.json",
    title: "Personnage joueur — Adrenaline System",
    description:
      "Feuille de personnage joueur du socle Adrenaline System : nom, identité, huit caractéristiques en pourcentage, seuils de santé physiques et mentaux, protections, formations et équipement.",
  });

export type ParametresDuJeuValeur = z.infer<typeof ParametresDuJeu>;
export type PersonnageJoueurValeur = z.infer<typeof PersonnageJoueur>;
