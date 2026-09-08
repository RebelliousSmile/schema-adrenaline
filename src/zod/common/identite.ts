import { z } from "zod";

/**
 * Le bloc Identité. Le livre laisse cette partie libre au joueur : seul le nom
 * est requis, tout le reste est facultatif et en chaîne libre.
 */
export const Identite = z.object({
  nom: z.string().min(1),
  prenom: z.string().min(1).optional(),
  surnom: z.string().min(1).optional(),
  nationalite: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  age: z.int().min(0).optional(),
  cheveux: z.string().min(1).optional(),
  yeux: z.string().min(1).optional(),
  peau: z.string().min(1).optional(),
  taille: z.string().min(1).optional(),
  poids: z.string().min(1).optional(),
  signesParticuliers: z.array(z.string().min(1)).optional(),
  description: z.string().min(1).optional(),
  historique: z.string().min(1).optional(),
  momentsMarquants: z.array(z.string().min(1)).optional(),
});
