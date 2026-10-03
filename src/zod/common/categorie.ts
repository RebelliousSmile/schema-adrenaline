import { z } from "zod";

/**
 * Catégorie imprimée dans le bandeau d'une fiche abrégée (`PNJ`, `Police`,
 * `Animal`, `Zombie`). Chaîne libre : la présentation associe une couleur et une
 * icône aux valeurs qu'elle connaît et retombe sur un défaut pour les autres.
 */
export const Categorie = z
  .string()
  .min(1)
  .meta({
    description:
      "Catégorie imprimée dans le bandeau de la fiche. Chaîne libre ; la présentation colore les valeurs connues.",
    examples: ["PNJ", "Police", "Animal", "Zombie"],
  });
