import { z } from "zod";
import { PNJ_PRESENTATION } from "../../presentation.js";
import { Caracteristiques } from "../common/caracteristiques.js";
import { Categorie } from "../common/categorie.js";
import {
  NiveauDeDanger,
  NiveauDeDangerAlternatif,
  NoteDeNiveauDeDanger,
} from "../common/danger.js";
import { Equipement } from "../common/equipement.js";
import { EtatDePartie } from "../common/etat-de-partie.js";
import { Competence, Formation } from "../common/formations.js";
import { Identite } from "../common/identite.js";
import { Meta } from "../common/meta.js";
import { Narratif } from "../common/narratif.js";
import { Compte } from "../common/primitives.js";
import { ProtectionsAbregees } from "../common/protections.js";
import { Sante } from "../common/sante.js";

/**
 * Un humain non joué : le même socle qu'un personnage joueur, moins la
 * machinerie de création.
 *
 * La fiche publiée porte un en-tête — le rôle en capitales et un niveau de
 * danger —, un paragraphe de description, puis les mêmes blocs qu'une feuille de
 * PJ : caractéristiques, santé, formations, compétences, équipement.
 *
 * Seul le nom est requis : une fiche de figurant tient en une ligne, une fiche
 * de personnage majeur porte tout le reste. Les deux fiches publiées en exemple
 * portent leurs huit caractéristiques et leurs quatre seuils de chaque côté :
 * quand le bloc santé est là, il est complet.
 *
 * Le bloc des paramètres du jeu est délibérément absent : un PNJ ne passe pas
 * par la procédure de création d'un PJ et n'accumule pas de PX.
 */
export const PersonnageNonJoue = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom ou rôle, tel qu'il est écrit en en-tête de la fiche.",
        examples: ["Sœur Madeleine", "Le gardien du dépôt"],
      }),
    categorie: Categorie.optional(),
    niveauDeDanger: NiveauDeDanger.optional(),
    niveauDeDangerAlternatif: NiveauDeDangerAlternatif.optional(),
    niveauDeDangerNote: NoteDeNiveauDeDanger.optional(),
    description: z.string().min(1).optional().meta({
      description:
        "Le paragraphe de présentation, tel qu'il est lu à la table : silhouette, allure, ce qu'on perçoit au premier regard.",
    }),
    identite: Identite.optional().meta({
      description: "Bloc Identité, quand la fiche en porte un.",
    }),
    caracteristiques: Caracteristiques.partial().optional().meta({
      description:
        "Caractéristiques, chacune facultative : une fiche de figurant n'en chiffre qu'une ou deux, une fiche de personnage majeur les porte toutes les huit.",
    }),
    sante: Sante.optional().meta({
      description:
        "Bloc Santé. Absent ou complet : les fiches publiées portent leurs quatre seuils de chaque côté dès qu'elles en portent un.",
    }),
    protections: ProtectionsAbregees.optional().meta({
      description:
        "Protections, chaque versant et chaque champ facultatif : une fiche de PNJ n'imprime pas la Solidité.",
    }),
    pistes: z
      .strictObject({
        stress: Compte.optional().meta({
          description: "Nombre de cercles de stress imprimés en gras, tel que saisi.",
          examples: [2],
        }),
        malusChoquants: Compte.optional().meta({
          description: "Nombre de cercles de malus choquants imprimés en gras, tel que saisi.",
        }),
        malusBlessants: Compte.optional().meta({
          description: "Nombre de cercles de malus blessants imprimés en gras, tel que saisi.",
        }),
      })
      .optional()
      .meta({
        description:
          "Pistes de stress et de malus imprimées sous la santé : nombre de cercles en gras. Rien n'y est calculé.",
      }),
    formations: z.array(Formation).optional().meta({
      description:
        "Formations, quand la fiche les nomme. Souvent absentes : la fiche de PNJ liste plus volontiers les compétences seules.",
    }),
    competences: z.array(Competence).optional().meta({
      description:
        "Compétences du personnage. La fiche publiée les regroupe sous un bloc unique, hors des formations, et note pour chacune sa caractéristique et son total.",
    }),
    equipement: Equipement.optional().meta({
      description: "Ce que le personnage porte sur lui et ce dont il se sert.",
    }),
    narratif: Narratif.optional().meta({
      description: "Bloc narratif : rôle, attitude, répliques, notes réservées au meneur.",
    }),
    etatDePartie: EtatDePartie.optional().meta({
      description: "Compteurs et états temporaires de la scène, séparés du profil de référence.",
    }),
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pnj.schema.json",
    title: "Personnage non joué — Adrenaline System",
    description:
      "Fiche de personnage non joué du socle Adrenaline System : nom requis, tout le reste optionnel, du figurant nommé au personnage majeur entièrement chiffré.",
    "x-adrenaline-presentation": PNJ_PRESENTATION,
  });

export type PersonnageNonJoueValeur = z.infer<typeof PersonnageNonJoue>;
