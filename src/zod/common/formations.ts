import { z } from "zod";
import { Pourcentage } from "./primitives";

/**
 * Les huit caractéristiques, par leur abréviation de feuille.
 *
 * Une compétence en désigne une : c'est elle qui s'ajoute au pourcentage de la
 * compétence pour former le pourcentage testé.
 */
export const AbreviationDeCaracteristique = z
  .enum(["for", "con", "dex", "rap", "log", "vol", "per", "cha"])
  .meta({
    description: "Caractéristique associée, par son abréviation.",
    examples: ["cha", "dex"],
  });

/**
 * Une compétence telle que la fiche la porte.
 *
 * La feuille de PJ écrit `ARME SOCIALE (Apaisement)  30`, la fiche de PNJ écrit
 * `Arme sociale (Négociation) 30 % + CHA  50 %`. Même compétence, deux niveaux
 * de détail : la feuille de PJ laisse le total au jet, la fiche de PNJ le
 * pré-calcule pour le meneur.
 *
 * La spécialité est un champ et non une convention d'écriture : les deux fiches
 * la distinguent typographiquement du nom, par des parenthèses.
 */
export const Competence = z
  .object({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de la compétence. Chaîne libre : le catalogue appartient à chaque jeu.",
        examples: ["Arme sociale", "Athlétisme"],
      }),
    specialite: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Spécialité, notée entre parenthèses après le nom sur la fiche.",
        examples: ["Négociation"],
      }),
    pourcentage: Pourcentage.meta({
      description: "Pourcentage de la compétence seule, hors caractéristique.",
      examples: [30],
    }),
    caracteristique: AbreviationDeCaracteristique.optional().meta({
      description:
        "Caractéristique qui s'ajoute au pourcentage. Notée sur la fiche de PNJ, laissée au jet sur la feuille de PJ.",
      examples: ["cha"],
    }),
    total: Pourcentage.optional().meta({
      description:
        "Pourcentage testé, compétence plus caractéristique. Pré-calculé sur la fiche de PNJ ; se recalcule à tout instant. Le schéma ne vérifie pas la somme — la caractéristique vit dans un autre bloc et draft-7 ne sait pas exprimer cette dépendance : un consommateur doit recalculer la valeur plutôt que la croire.",
      examples: [50],
    }),
    avantages: z
      .array(z.string().min(1).meta({ description: "Un avantage, en une ligne." }))
      .optional()
      .meta({
        description:
          "Avantages rattachés à cette compétence, notés sous elle sur la fiche : gestion du stress, bouclier personnel, équipement favori.",
        examples: [["Gestion du stress"]],
      }),
  })
  .meta({ description: "Une compétence de la fiche, avec sa spécialité et son total éventuel." });

/**
 * Le type d'une formation. Ensemble fermé de trois : la feuille de PJ en
 * imprime trois colonnes, une par type, et n'en prévoit pas de quatrième.
 */
export const TypeDeFormation = z.enum(["classe-sociale", "professionnelle", "personnelle"]).meta({
  description: "Classe sociale, formation professionnelle ou personnelle.",
  examples: ["professionnelle"],
});

/**
 * Une formation : un type, un nom et un pourcentage, plus les compétences
 * qu'elle porte.
 *
 * La feuille écrit `Classe sociale (MOYENNE)  15` : le type est imprimé, le nom
 * est écrit à la main entre parenthèses. Le catalogue des noms reste libre — il
 * appartient à chaque jeu ; le triplet des types, lui, est de la mécanique.
 *
 * Le type n'est pas requis : une fiche de PNJ liste ses formations sans les
 * qualifier.
 */
export const Formation = z
  .object({
    type: TypeDeFormation.optional().meta({
      description:
        "Type de formation, imprimé en tête de colonne sur la feuille de PJ. Absent d'une fiche de PNJ, qui ne qualifie pas ses formations.",
    }),
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Nom de la formation, écrit à la main entre parenthèses sur la feuille.",
        examples: ["Moyenne", "Infirmière"],
      }),
    pourcentage: Pourcentage.meta({
      description: "Pourcentage de la formation.",
      examples: [15, 40],
    }),
    competences: z.array(Competence).optional().meta({
      description:
        "Compétences rattachées à cette formation. La feuille de PJ les imprime sous la colonne de leur formation ; la fiche de PNJ les regroupe hors formation, et cette liste est alors absente.",
    }),
  })
  .meta({ description: "Une formation et les compétences qu'elle porte." });

export type CompetenceValeur = z.infer<typeof Competence>;
export type FormationValeur = z.infer<typeof Formation>;
