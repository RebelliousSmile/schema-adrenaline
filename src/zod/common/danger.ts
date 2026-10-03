import { z } from "zod";
import { Compte } from "./primitives.js";

/**
 * Le Niveau de Danger, déclaré une fois pour toutes.
 *
 * Il vaut pour un personnage non joué comme pour une créature : c'est une
 * mécanique du socle, pas une propriété d'une cible. Il était déclaré deux fois,
 * avec deux descriptions ; il l'est désormais ici, avec celle qui couvre les
 * deux emplois.
 *
 * Il n'est pas borné à 5 : les composants publiés courent de 0 à 5 et le ND
 * final les additionne.
 */
export const NiveauDeDanger = Compte.meta({
  description:
    "ND, imprimé en en-tête de fiche. Mesure l'opposition représentée. Sur une créature, il s'obtient en additionnant les ND du corps, de l'instinct et du type ; il n'est donc pas borné par le 5 de chaque composant.",
  examples: [1, 3, 8],
});

/**
 * Un second ND, quand la fiche en imprime deux (`ND 13* / 3`). L'entier principal
 * reste `niveauDeDanger` : un consommateur qui ne lit que lui garde une valeur.
 */
export const NiveauDeDangerAlternatif = Compte.meta({
  description: "Second ND imprimé après une barre oblique, quand la fiche en donne deux.",
  examples: [3],
});

/** La note qui explique un ND alternatif ou conditionnel. */
export const NoteDeNiveauDeDanger = z
  .string()
  .min(1)
  .meta({
    description: "Précision imprimée sur le ND, appelée par un astérisque.",
    examples: ["13 s'il a son arc, sinon 3"],
  });

export type NiveauDeDangerValeur = z.infer<typeof NiveauDeDanger>;
