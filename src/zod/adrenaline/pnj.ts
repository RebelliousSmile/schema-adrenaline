import { z } from "zod";
import { Caracteristiques } from "../common/caracteristiques";
import { NiveauDeDanger } from "../common/danger";
import { Equipement } from "../common/equipement";
import { Competence, Formation } from "../common/formations";
import { Identite } from "../common/identite";
import { Meta } from "../common/meta";
import { Narratif } from "../common/narratif";
import { Protections } from "../common/protections";
import { Sante } from "../common/sante";

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
  .object({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom ou rôle, tel qu'il est écrit en en-tête de la fiche.",
        examples: ["Sœur Madeleine", "Le gardien du dépôt"],
      }),
    niveauDeDanger: NiveauDeDanger.optional(),
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
    protections: Protections.partial().optional().meta({
      description:
        "Protections, chaque versant facultatif : une fiche peut ne chiffrer que le physique.",
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
    meta: Meta.optional().meta({
      description: "Attribution et catalogage : d'où vient cette fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pnj.schema.json",
    title: "Personnage non joué — Adrenaline System",
    description:
      "Fiche de personnage non joué du socle Adrenaline System : nom requis, tout le reste optionnel, du figurant nommé au personnage majeur entièrement chiffré.",
  });

export type PersonnageNonJoueValeur = z.infer<typeof PersonnageNonJoue>;
