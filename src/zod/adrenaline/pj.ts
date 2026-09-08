import { z } from "zod";
import { Caracteristiques } from "../common/caracteristiques";
import { Equipement } from "../common/equipement";
import { Formation } from "../common/formations";
import { Identite } from "../common/identite";
import { Protections } from "../common/protections";
import { Sante } from "../common/sante";

/**
 * Les paramètres de création : comment la fiche a été produite, non ce qu'elle
 * est. Jamais requis — une fiche reprise d'ailleurs ne les porte pas.
 */
const ParametresDeCreation = z.object({
  typeDeCreation: z
    .enum(["equitable", "aleatoire"])
    .optional()
    .meta({ description: "Attribution distributive ou tirage aléatoire." }),
  typeDeScenario: z.enum(["one-shot", "campagne"]).optional(),
  declinaisonDeCampagne: z.enum(["bac-a-sable", "storyline"]).optional(),
});

/**
 * Un personnage joueur du socle Adrenaline System.
 *
 * La fiche telle qu'on la lit en jeu. Est requis ce qu'une fiche jouable porte
 * toujours : le nom, les huit caractéristiques, les seuils de santé et les
 * solidités. Le reste — formations, équipement, armure, paramètres de création —
 * est facultatif.
 */
export const PersonnageJoueur = z
  .object({
    identite: Identite,
    caracteristiques: Caracteristiques,
    sante: Sante,
    protections: Protections,
    formations: z.array(Formation).optional().meta({
      description:
        "Formations du personnage. Trois à la création — classe sociale, professionnelle, personnelle — mais la liste n'est pas bornée : d'autres s'acquièrent en campagne.",
    }),
    equipement: Equipement.optional(),
    meta: ParametresDeCreation.optional().meta({
      description: "Paramètres ayant présidé à la création de la fiche.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pj.schema.json",
    title: "Personnage joueur — Adrenaline System",
    description:
      "Fiche de personnage joueur du socle Adrenaline System : identité, huit caractéristiques en pourcentage, seuils de santé physiques et mentaux, protections, formations et équipement.",
  });
