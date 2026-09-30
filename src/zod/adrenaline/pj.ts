import { z } from "zod";
import { PJ_PRESENTATION } from "../../presentation.js";
import { Caracteristiques } from "../common/caracteristiques.js";
import { Equipement } from "../common/equipement.js";
import { EtatDePartie } from "../common/etat-de-partie.js";
import { Formation, TypeDeFormation } from "../common/formations.js";
import { Identite } from "../common/identite.js";
import { Meta } from "../common/meta.js";
import { CumulJouable } from "../common/primitives.js";
import { PourcentageJouable } from "../common/primitives.js";
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
  .strictObject({
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
    px: CumulJouable.optional().meta({
      description: "Points d'expérience jouables accumulés depuis la création.",
      examples: [{ minimum: 0, current: 25, maximum: 25 }],
    }),
  })
  .meta({
    description:
      "Bloc « Paramètres du jeu » de la feuille : qui joue, comment la fiche a été produite, PX accumulés. Décrit la partie, pas le fichier.",
  });

/** Plafond d'une caractéristique PJ : la feuille ne dépasse jamais 50 %. */
export const PJ_CARACTERISTIQUE_MAXIMUM = 50;

/**
 * Une caractéristique PJ telle qu'elle sort de la création : la valeur de
 * création est à la fois le plancher et la valeur actuelle, et la borne haute
 * est le plafond de la feuille — la caractéristique ne peut que progresser.
 */
export function caracteristiqueDeCreationPj(valeur: number) {
  return { minimum: valeur, current: valeur, maximum: PJ_CARACTERISTIQUE_MAXIMUM };
}

/** La limite de saisie de la feuille PJ ne s'applique pas aux PNJ ni aux créatures. */
const CaracteristiqueJoueur = PourcentageJouable.extend({
  minimum: z.int().min(0).max(PJ_CARACTERISTIQUE_MAXIMUM).meta({
    description:
      "Valeur de création PJ, affichée dans la première colonne. La caractéristique ne descend pas sous elle.",
  }),
  current: z.int().min(0).max(PJ_CARACTERISTIQUE_MAXIMUM).meta({
    description:
      "Valeur actuelle PJ, affichée dans la seconde colonne. Égale à la valeur de création en début de partie.",
  }),
  maximum: z.int().min(0).max(PJ_CARACTERISTIQUE_MAXIMUM).meta({
    description:
      "Borne haute PJ réservée à l'éditeur, jamais affichée sur la fiche : 50 pour toute caractéristique.",
  }),
}).meta({
  description:
    "Caractéristique PJ : valeur de création (plancher), valeur actuelle et borne haute à 50 %. En début de partie, minimum = current et maximum = 50. La fiche n'affiche pas la borne haute.",
  examples: [caracteristiqueDeCreationPj(30)],
});

const CaracteristiquesJoueur = Caracteristiques.extend({
  for: CaracteristiqueJoueur,
  con: CaracteristiqueJoueur,
  dex: CaracteristiqueJoueur,
  rap: CaracteristiqueJoueur,
  log: CaracteristiqueJoueur,
  vol: CaracteristiqueJoueur,
  per: CaracteristiqueJoueur,
  cha: CaracteristiqueJoueur,
}).meta({ description: "Les huit caractéristiques PJ bornées à 50 %." });

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
 * malus et états encaissés. Les valeurs numériques jouables de la fiche portent
 * leur borne basse, leur état courant et leur borne haute.
 */
/**
 * Une formation de PJ : son type est imprimé en tête de colonne, il est donc
 * requis. La feuille en porte trois, une par type ; aucune ne s'ajoute.
 */
export const FormationJoueur = Formation.extend({
  type: TypeDeFormation.meta({
    description:
      "Type de formation, imprimé en tête de colonne : il désigne la colonne de la feuille.",
  }),
}).meta({ description: "Une formation de PJ, rangée dans la colonne de son type." });

export const PersonnageJoueur = z
  .strictObject({
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
    caracteristiques: CaracteristiquesJoueur,
    sante: Sante,
    protections: Protections,
    formations: z.array(FormationJoueur).max(TypeDeFormation.options.length).optional().meta({
      description:
        "Formations du personnage : trois au plus, une par type — classe sociale, professionnelle, personnelle. La feuille en imprime toujours les trois colonnes ; le type est imprimé, seul l'intitulé s'écrit.",
    }),
    equipement: Equipement.optional().meta({
      description: "Bloc Équipement de la feuille.",
    }),
    parametresDuJeu: ParametresDuJeu.optional(),
    etatDePartie: EtatDePartie.optional().meta({
      description: "Compteurs et états temporaires de la scène, séparés du profil de référence.",
    }),
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pj.schema.json",
    title: "Personnage joueur — Adrenaline System",
    description:
      "Feuille de personnage joueur du socle Adrenaline System : nom, identité, huit caractéristiques en pourcentage, seuils de santé physiques et mentaux, protections, formations et équipement.",
    "x-adrenaline-presentation": PJ_PRESENTATION,
  });

export type ParametresDuJeuValeur = z.infer<typeof ParametresDuJeu>;
export type PersonnageJoueurValeur = z.infer<typeof PersonnageJoueur>;
