import { z } from "zod";
import { Degats } from "./degats.js";
import { KIT_JOUEUR, KIT_SOUPLE, Pourcentage, type KitDeValeurs } from "./primitives.js";

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
 * Le type d'une formation. Ensemble fermé de trois : la feuille de PJ en
 * imprime trois colonnes, une par type, et n'en prévoit pas de quatrième.
 */
export const TypeDeFormation = z.enum(["classe-sociale", "professionnelle", "personnelle"]).meta({
  description: "Classe sociale, formation professionnelle ou personnelle.",
  examples: ["professionnelle"],
});

/**
 * Compétences et formations, construites sur le kit de valeurs de la fiche :
 * pourcentages en nombre simple pour le PJ, en nombre simple ou en triplet
 * pour le PNJ et la créature.
 */
function construireFormations<K extends KitDeValeurs>(k: K, detaillee: boolean) {
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
  const Competence = z
    .strictObject({
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
      pourcentage: k.pourcentage.meta({
        description: "Pourcentage jouable de la compétence seule, hors caractéristique." + k.note,
        examples: [k.exemple(30)],
      }),
      /*
       * La feuille de PJ n'imprime qu'un nom, une spécialité et un pourcentage par compétence : le
       * meneur choisit à la table la caractéristique qui s'y associe. Le reste (caractéristique,
       * total, ligne d'arme, action, avantages, note) n'existe que sur la fiche de PNJ.
       */
      ...(detaillee
        ? {
            caracteristique: AbreviationDeCaracteristique.optional().meta({
              description:
                "Caractéristique qui s'ajoute au pourcentage, notée sur la fiche de PNJ. Absente de la feuille de PJ : le meneur la choisit à la table.",
              examples: ["cha"],
            }),
            total: k.pourcentage.optional().meta({
              description:
                "Pourcentage testé, compétence plus caractéristique. Pré-calculé sur la fiche de PNJ ; se recalcule à tout instant. Le schéma ne vérifie pas la somme — la caractéristique vit dans un autre bloc et draft-7 ne sait pas exprimer cette dépendance : un consommateur doit recalculer la valeur plutôt que la croire." +
                k.note,
              examples: [k.exemple(50)],
            }),
            degats: Degats.optional().meta({
              description:
                "Ligne d'arme de la compétence : dégâts, munitions et portée, imprimés sous elle sans retrait.",
            }),
            action: z
              .string()
              .min(1)
              .optional()
              .meta({
                description:
                  "Ligne d'action libre imprimée sous la compétence, précédée de « Action : ».",
                examples: ["Charger, puis renverser sa cible"],
              }),
            avantages: z
              .array(z.string().min(1).meta({ description: "Un avantage, en une ligne." }))
              .optional()
              .meta({
                description:
                  "Avantages rattachés à cette compétence, notés sous elle sur la fiche : gestion du stress, bouclier personnel, équipement favori.",
                examples: [["Gestion du stress"]],
              }),
            notes: z
              .string()
              .min(1)
              .optional()
              .meta({
                description:
                  "Note libre rattachée à la compétence, en une ligne : arme utilisée, contexte, précision laissée à l'utilisateur.",
                examples: ["Judo"],
              }),
          }
        : {}),
    })
    .meta({ description: "Une compétence de la fiche, avec sa spécialité et son total éventuel." });

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
  const Formation = z
    .strictObject({
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
      pourcentage: k.pourcentage.meta({
        description: "Pourcentage jouable de la formation." + k.note,
        examples: [k.exemple(15)],
      }),
      competences: z.array(Competence).optional().meta({
        description:
          "Compétences rattachées à cette formation. La feuille de PJ les imprime sous la colonne de leur formation ; la fiche de PNJ les regroupe hors formation, et cette liste est alors absente.",
      }),
    })
    .meta({ description: "Une formation et les compétences qu'elle porte." });

  return { Competence, Formation };
}

/*
 * Un pourcentage de formation ou de compétence ne varie pas en cours de partie : le PJ le porte en
 * nombre simple, sans minimum ni maximum. Seules les valeurs qui bougent en jeu (caractéristiques,
 * santé, protections, points d'expérience) restent des triplets jouables.
 */
const joueur = construireFormations(
  {
    ...KIT_JOUEUR,
    pourcentage: Pourcentage,
    exemple: (nombre: number) => nombre,
  },
  false,
);
const souple = construireFormations(KIT_SOUPLE, true);

/** Compétence d'un personnage joueur : pourcentages en nombre simple. */
export const Competence = joueur.Competence;
/** Formation d'un personnage joueur : pourcentage en nombre simple. */
export const Formation = joueur.Formation;
/** Compétence d'un PNJ ou d'une créature : nombre simple ou triplet. */
export const CompetenceSouple = souple.Competence;
/** Formation d'un PNJ : nombre simple ou triplet. */
export const FormationSouple = souple.Formation;

export type CompetenceValeur = z.infer<typeof Competence>;
export type FormationValeur = z.infer<typeof Formation>;
