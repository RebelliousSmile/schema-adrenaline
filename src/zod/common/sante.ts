import { z } from "zod";

/**
 * Les quatre paliers de dégât, physiques comme mentaux. Libellés attestés par
 * le livre de base, non par le générateur web, qui en décale le nommage.
 */
export const NiveauDeSeuil = z
  .enum(["superficiel", "leger", "grave", "profond"])
  .meta({ description: "Palier de dégât : superficiel, léger, grave ou profond." });

const ValeurDeSeuil = z.int().min(0);

/**
 * Un palier tel qu'il est imprimé sur la feuille : une valeur de base, et une
 * seconde valeur qui ne vaut que sur les localisations couvertes — par une
 * armure côté physique, par un trait de caractère côté mental.
 */
const Palier = z.object({
  base: ValeurDeSeuil.meta({ description: "Valeur du palier sur une localisation non couverte." }),
  couvert: ValeurDeSeuil.optional().meta({
    description:
      "Valeur du palier sur une localisation couverte par une armure ou un trait de caractère.",
  }),
});

/**
 * Les quatre paliers physiques.
 *
 * Dérivation : superficiel vaut les PP de Solidité physique ; léger vaut le
 * superficiel augmenté des qualités de FOR et de CON ; grave vaut le léger
 * augmenté de 5 et profond le léger augmenté de 10 — tous deux depuis le léger,
 * pas en cascade. JSON Schema ne calcule pas : les valeurs sont stockées telles
 * que lues sur la feuille.
 */
export const SeuilsPhysiques = z.object({
  superficiel: Palier,
  leger: Palier,
  grave: Palier,
  profond: Palier,
});

/**
 * Les quatre paliers mentaux, dérivés de la Solidité mentale et des qualités de
 * LOG et de VOL, selon la même mécanique.
 */
export const SeuilsMentaux = z.object({
  superficiel: Palier,
  leger: Palier,
  grave: Palier,
  profond: Palier,
});

/**
 * Le bloc Santé de la feuille. Les dés de stress et les états encaissés sont
 * vierges à la création et n'appartiennent pas à la fiche de personnage : ils
 * relèvent de l'état de partie.
 */
export const Sante = z.object({
  physique: SeuilsPhysiques,
  mental: SeuilsMentaux,
});
