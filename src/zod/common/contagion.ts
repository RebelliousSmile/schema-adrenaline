import { z } from "zod";

/**
 * Un vecteur de transmission et sa probabilité.
 *
 * Le nom reste une chaîne libre : morsure, griffure, projection, voie
 * respiratoire relèvent du contenu d'un jeu donné, pas de la mécanique du
 * socle. Une malédiction se transmet par un autre canal et doit tenir ici.
 */
const Vecteur = z
  .strictObject({
    nom: z
      .string()
      .min(1)
      .meta({
        description: "Canal de transmission, en clair. Chaîne libre.",
        examples: ["Morsure", "Regard soutenu"],
      }),
    probabilite: z
      .int()
      .min(0)
      .max(100)
      .optional()
      .meta({
        description:
          "Probabilité de transmission, en pourcentage. Bornée à 100, contrairement aux pourcentages de d100 : c'est une probabilité.",
        examples: [80],
      }),
    notes: z.string().min(1).optional().meta({
      description: "Conditions ou réserves attachées à ce vecteur.",
    }),
  })
  .meta({ description: "Un vecteur de transmission et sa probabilité." });

/**
 * Une modulation de la contagion selon le profil de la victime.
 *
 * La tranche est une chaîne libre et non un ensemble énuméré : les découpages
 * varient d'une source à l'autre, et un autre agent en définirait d'autres.
 */
const Modulation = z
  .strictObject({
    profil: z
      .string()
      .min(1)
      .meta({
        description: "Tranche d'âge ou profil concerné, en clair.",
        examples: ["Enfant", "Personne âgée"],
      }),
    delaiAvantEffet: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Délai propre à ce profil, en unité de temps libre.",
        examples: ["2 à 4 heures"],
      }),
    issue: z.string().min(1).optional().meta({
      description: "Issue propre à ce profil.",
    }),
  })
  .meta({ description: "Ce que le profil de la victime change au délai ou à l'issue." });

/**
 * La mécanique de contagion, dégagée de tout agent particulier : un virus, un
 * parasite, une malédiction ou un rituel s'y écrivent également.
 *
 * Le bloc entier est optionnel côté monstre — un monstre non contagieux est un
 * monstre valide.
 */
export const Contagion = z
  .strictObject({
    agent: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Nom de l'agent transmis.",
        examples: ["Souche R-7"],
      }),
    vecteurs: z.array(Vecteur).optional().meta({
      description: "Par quoi l'agent se transmet, et avec quelle probabilité.",
    }),
    delaiAvantEffet: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Délai entre la transmission et le premier effet, en unité de temps libre.",
        examples: ["6 à 12 heures"],
      }),
    issue: z
      .string()
      .min(1)
      .optional()
      .meta({
        description: "Ce que devient la victime au terme de l'infection.",
        examples: ["Bascule en infecté de type 1"],
      }),
    modulations: z.array(Modulation).optional().meta({
      description: "Variations du délai ou de l'issue selon le profil de la victime.",
    }),
  })
  .meta({
    description:
      "Mécanique de contagion, indépendante de l'agent : un virus, un parasite ou une malédiction s'y écrivent également.",
  });

export type VecteurValeur = z.infer<typeof Vecteur>;
export type ContagionValeur = z.infer<typeof Contagion>;
