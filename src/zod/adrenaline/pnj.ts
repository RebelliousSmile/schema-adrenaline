import { z } from "zod";
import { Caracteristiques } from "../common/caracteristiques";
import { Equipement } from "../common/equipement";
import { Competence, Formation } from "../common/formations";
import { Identite } from "../common/identite";
import { Narratif } from "../common/narratif";
import { Protections } from "../common/protections";
import { SeuilsMentaux, SeuilsPhysiques } from "../common/sante";

/**
 * Les seuils d'un cartouche non joué : chaque palier séparément optionnel.
 *
 * Un cartouche de scénario en note souvent trois là où une feuille de PJ en
 * porte quatre. Exiger les quatre rejetterait des cartouches parfaitement
 * lisibles.
 */
const SanteAllegee = z.object({
  physique: SeuilsPhysiques.partial().optional(),
  mental: SeuilsMentaux.partial().optional(),
});

/**
 * Un humain non joué : le même socle qu'un personnage joueur, moins la
 * machinerie de création.
 *
 * Seule l'identité est requise. Un cartouche de figurant tient en un nom ; un
 * cartouche de personnage majeur porte tout le reste. Le bloc des paramètres de
 * création est délibérément absent : un PNJ ne passe pas par la procédure de
 * création d'un PJ.
 */
export const PersonnageNonJoue = z
  .object({
    identite: Identite,
    caracteristiques: Caracteristiques.partial().optional(),
    sante: SanteAllegee.optional().meta({
      description:
        "Seuils de santé. Chaque palier est séparément optionnel : un cartouche allégé n'en note qu'une partie.",
    }),
    protections: Protections.partial().optional(),
    formations: z.array(Formation).optional(),
    competences: z.array(Competence).optional().meta({
      description:
        "Compétences rattachées directement au personnage, hors formation : un cartouche de scénario en donne souvent sans passer par les trois formations d'un PJ.",
    }),
    equipement: Equipement.optional(),
    niveauDeDanger: z.int().min(0).optional().meta({
      description: "ND. Mesure l'opposition que le personnage représente.",
    }),
    narratif: Narratif.optional(),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/pnj.schema.json",
    title: "Personnage non joué — Adrenaline System",
    description:
      "Cartouche de personnage non joué du socle Adrenaline System : identité requise, tout le reste optionnel, du figurant nommé au personnage majeur entièrement chiffré.",
  });
