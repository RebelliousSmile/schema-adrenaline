import { z } from "zod";

/**
 * Le bloc Identité, tel qu'il est imprimé sur la feuille : nationalité, genre,
 * cheveux, âge, yeux, taille, peau, poids, signes particuliers. Rien de plus.
 *
 * Le nom du personnage n'en fait pas partie — la feuille le porte en en-tête,
 * au-dessus de tout le reste. Il est donc un champ de la fiche, pas de ce bloc.
 *
 * Tout y est facultatif : le livre laisse cette partie libre au joueur.
 */
export const Identite = z
  .strictObject({
    nationalite: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Nationalité, en clair.",
        examples: ["Française"],
      }),
    genre: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Genre, en clair. Chaîne libre : la feuille n'impose aucune liste.",
        examples: ["Femme"],
      }),
    cheveux: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Couleur ou aspect des cheveux.",
        examples: ["Bruns, coupés court"],
      }),
    age: z
      .int()
      .min(0)
      .max(200)
      .optional()
      .meta({
        description: "Âge en années.",
        examples: [34],
      }),
    yeux: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Couleur des yeux.",
        examples: ["Verts"],
      }),
    taille: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Taille, telle qu'écrite sur la feuille, unité comprise. Chaîne libre et non un nombre : la feuille est manuscrite et n'impose pas d'unité, deux fiches ne sont donc pas comparables sur ce champ.",
        examples: ["1,72 m"],
      }),
    peau: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Teint ou aspect de la peau.",
        examples: ["Mate"],
      }),
    poids: z
      .string()
      .min(1)
      .optional()
      .meta({
        description:
          "Poids, tel qu'écrit sur la feuille, unité comprise. Même réserve que la taille : chaîne libre, non comparable d'une fiche à l'autre.",
        examples: ["64 kg"],
      }),
    signesParticuliers: z
      .array(z.string().min(1).meta({ description: "Un signe particulier, en une ligne." }))
      .optional()
      .meta({
        description: "Signes particuliers : cicatrices, tatouages, tout ce qui se remarque.",
        examples: [["Cicatrice à l'arcade gauche"]],
      }),
  })
  .meta({
    description:
      "Bloc Identité de la feuille : les neuf champs imprimés, tous facultatifs. Le nom du personnage n'en fait pas partie, il est en en-tête de fiche.",
  });

export type IdentiteValeur = z.infer<typeof Identite>;

const texteLibre = (description: string) => z.string().min(1).optional().meta({ description });

/**
 * Les contraintes de la feuille de PJ : trois lignes libres, ce qui retient le
 * personnage dans sa vie de tous les jours.
 */
const Contraintes = z
  .strictObject({
    professionnelles: texteLibre("Contraintes professionnelles : horaires, hiérarchie, secret."),
    familiales: texteLibre("Contraintes familiales : proches à charge, obligations."),
    engagementsExterieurs: texteLibre(
      "Engagements extérieurs : association, dette, serment, tout ce qui prend du temps hors du métier.",
    ),
  })
  .meta({
    description:
      "Contraintes du personnage, en trois lignes libres : professionnelles, familiales, engagements extérieurs.",
  });

/**
 * Identité d'un personnage joueur : les neuf champs de l'identité commune, plus
 * les contraintes, l'historique et la personnalité de la feuille de PJ. Le PNJ
 * garde `Identite` telle quelle.
 */
export const IdentiteDeJoueur = Identite.extend({
  contraintes: Contraintes.optional(),
  historique: texteLibre("Historique du personnage, en texte libre."),
  personnalite: texteLibre("Personnalité du personnage, en texte libre."),
}).meta({
  description:
    "Bloc Identité de la feuille de PJ : les neuf champs imprimés, les contraintes, l'historique et la personnalité, tous facultatifs. Le nom est en en-tête de fiche.",
});

export type IdentiteDeJoueurValeur = z.infer<typeof IdentiteDeJoueur>;
