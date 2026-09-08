import { z } from "zod";
import {
  CaracteristiquesMentales,
  CaracteristiquesPhysiques,
} from "../common/caracteristiques";
import { Contagion } from "../common/contagion";
import { Equipement } from "../common/equipement";
import { Competence } from "../common/formations";
import { Narratif } from "../common/narratif";
import { Protections } from "../common/protections";
import { SeuilsMentaux, SeuilsPhysiques } from "../common/sante";

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
);

/**
 * L'état alternatif d'une créature — le stimulé du générateur d'infectés.
 *
 * Rejoue les mêmes valeurs, modifiées. Ce qu'il ne redéclare pas reste celui de
 * l'état de base.
 */
const EtatAlternatif = z.object({
  nom: z.string().min(1).meta({ description: "Nom de l'état, par exemple stimulé." }),
  declencheurs: z.array(z.string().min(1)).optional().meta({
    description: "Ce qui déclenche l'état, et ce qui y met fin.",
  }),
  caracteristiques: CaracteristiquesDeCreature.partial().optional(),
  zoneDeDetection: z.string().min(1).optional(),
  deplacement: z.string().min(1).optional(),
  actionsParRound: z.int().min(0).optional(),
  notes: z.string().min(1).optional(),
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
    nom: z.string().min(1),
    typeDeCorps: z.string().min(1).optional().meta({
      description: "Corps servant de base à la créature. Chaîne libre : le catalogue des corps appartient à chaque jeu.",
    }),
    instinct: z.string().min(1).optional().meta({
      description: "Instinct qui gouverne son comportement. Chaîne libre : un meneur en ajoute.",
    }),
    typeDInfecte: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    niveauDeDanger: z.int().min(0).optional().meta({
      description:
        "ND. Se construit en additionnant ceux du corps, de l'instinct et du type ; le cartouche final n'en porte qu'un.",
    }),
    caracteristiques: CaracteristiquesDeCreature,
    sante: z
      .object({
        physique: SeuilsPhysiques,
        mental: SeuilsMentaux.partial().optional().meta({
          description:
            "Seuils mentaux. Optionnels : une créature sans caractéristiques mentales est insensible aux attaques mentales et n'en porte aucun.",
        }),
      })
      .optional(),
    protections: Protections.partial().optional(),
    zoneDeDetection: z.string().min(1).optional().meta({
      description: "Distance à laquelle la créature repère une proie.",
    }),
    deplacement: z.string().min(1).optional().meta({
      description: "Distance parcourue par action.",
    }),
    actionsParRound: z.int().min(0).optional(),
    etatAlternatif: EtatAlternatif.optional(),
    comportement: z.array(z.string().min(1)).optional(),
    traitsSpeciaux: z.array(z.string().min(1)).optional().meta({
      description: "Insensibilités, immunités, capacités hors du commun. Liste non bornée.",
    }),
    competences: z.array(Competence).optional().meta({
      description:
        "Compétences rattachées directement à la créature : elle ne passe par aucune formation.",
    }),
    equipement: Equipement.optional(),
    contagion: Contagion.optional().meta({
      description: "Mécanique de transmission. Absente sur une créature non contagieuse.",
    }),
    narratif: Narratif.optional().meta({
      description: "Une créature nommée et jouée mérite le même traitement qu'un personnage non joué.",
    }),
  })
  .meta({
    $id: "https://raw.githubusercontent.com/RebelliousSmile/schema-adrenaline/main/schemas/adrenaline/monstre.schema.json",
    title: "Créature — Adrenaline System",
    description:
      "Cartouche de créature du socle Adrenaline System : nom et caractéristiques physiques requis, caractéristiques mentales optionnelles, état alternatif, contagion générique et bloc narratif facultatifs.",
  });
