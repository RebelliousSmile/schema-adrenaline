import { z } from "zod";

/**
 * Un vecteur de transmission et sa probabilité.
 *
 * Le nom reste une chaîne libre : morsure, griffure, projection, voie
 * respiratoire relèvent du contenu d'un jeu donné, pas de la mécanique du
 * socle. Une malédiction se transmet par un autre canal et doit tenir ici.
 */
const Vecteur = z.object({
  nom: z.string().min(1),
  probabilite: z.int().min(0).max(100).optional().meta({
    description: "Probabilité de transmission, en pourcentage.",
  }),
  notes: z.string().min(1).optional(),
});

/**
 * Une modulation de la contagion selon le profil de la victime.
 *
 * La tranche est une chaîne libre et non un ensemble énuméré : les découpages
 * varient d'une source à l'autre, et un autre agent en définirait d'autres.
 */
const Modulation = z.object({
  profil: z.string().min(1).meta({
    description: "Tranche d'âge ou profil concerné, en clair.",
  }),
  delaiAvantEffet: z.string().min(1).optional(),
  issue: z.string().min(1).optional(),
});

/**
 * La mécanique de contagion, dégagée de tout agent particulier : un virus, un
 * parasite, une malédiction ou un rituel s'y écrivent également.
 *
 * Le bloc entier est optionnel côté monstre — un monstre non contagieux est un
 * monstre valide.
 */
export const Contagion = z.object({
  agent: z.string().min(1).optional().meta({
    description: "Nom de l'agent transmis.",
  }),
  vecteurs: z.array(Vecteur).optional(),
  delaiAvantEffet: z.string().min(1).optional().meta({
    description: "Délai entre la transmission et le premier effet, en unité de temps libre.",
  }),
  issue: z.string().min(1).optional().meta({
    description: "Ce que devient la victime au terme de l'infection.",
  }),
  modulations: z.array(Modulation).optional().meta({
    description: "Variations du délai ou de l'issue selon le profil de la victime.",
  }),
});
