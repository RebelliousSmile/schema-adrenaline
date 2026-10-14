import { z } from "zod";
import { PJ_PRESENTATION } from "../../presentation.js";
import { Caracteristiques } from "../common/caracteristiques.js";
import { Equipement } from "../common/equipement.js";
import { EtatDePartieDeJoueur } from "../common/etat-de-partie.js";
import { Formation, TypeDeFormation } from "../common/formations.js";
import { IdentiteDeJoueur } from "../common/identite.js";
import { Meta } from "../common/meta.js";
import { CumulJouable } from "../common/primitives.js";
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
    scenario: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Scénario de la partie pour laquelle la fiche a été produite, en texte libre.",
        examples: ["Les Veilleurs"],
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
      "Bloc « Paramètres du jeu » de la feuille : qui joue, scénario, comment la fiche a été produite, PX accumulés. Décrit la partie, pas le fichier.",
  });

/** Plafond d'une caractéristique PJ : la feuille ne dépasse jamais 50 %. */
export const PJ_CARACTERISTIQUE_MAXIMUM = 50;

/**
 * Une caractéristique PJ : la feuille n'en imprime qu'une valeur, en pourcentage. Le plafond de la
 * feuille (50 %) est la seule borne ; il n'y a ni minimum ni maximum à saisir.
 */
const CaracteristiqueJoueur = z.int().min(0).max(PJ_CARACTERISTIQUE_MAXIMUM).meta({
  description:
    "Caractéristique PJ : pourcentage de d100, de 0 à 50 %. La feuille n'imprime que cette valeur.",
  examples: [30],
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
 * caractéristiques et les seuils de santé. Le bloc identité est
 * facultatif, le livre le laissant libre au joueur.
 *
 * Les compteurs qui se remplissent en jeu (dés de stress, malus, blessures par
 * durée, états encaissés) sont facultatifs et rangés sous `etatDePartie`. Les valeurs numériques jouables de la fiche portent
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
    identite: IdentiteDeJoueur.optional().meta({
      description: "Bloc Identité de la feuille. Facultatif : le livre le laisse libre au joueur.",
    }),
    caracteristiques: CaracteristiquesJoueur,
    sante: Sante,
    protections: Protections.optional().meta({
      description:
        "Protections : l'armure et le trait de caractère avec leurs localisations couvertes. La feuille n'imprime ni Solidité ni bouclier.",
    }),
    formations: z.array(FormationJoueur).max(TypeDeFormation.options.length).optional().meta({
      description:
        "Formations du personnage : trois au plus, une par type — classe sociale, professionnelle, personnelle. La feuille en imprime toujours les trois colonnes ; le type est imprimé, seul l'intitulé s'écrit.",
    }),
    equipement: Equipement.optional().meta({
      description: "Bloc Équipement de la feuille.",
    }),
    parametresDuJeu: ParametresDuJeu.optional(),
    etatDePartie: EtatDePartieDeJoueur.optional().meta({
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
      "Feuille de personnage joueur du socle Adrenaline System : nom, identité, huit caractéristiques en pourcentage, seuils de santé physiques et mentaux, protections, formations, équipement, avantages et immunités ; en option, les contraintes, l'historique, la personnalité et l'état de partie.",
    "x-adrenaline-presentation": PJ_PRESENTATION,
  });

export type ParametresDuJeuValeur = z.infer<typeof ParametresDuJeu>;
export type PersonnageJoueurValeur = z.infer<typeof PersonnageJoueur>;
