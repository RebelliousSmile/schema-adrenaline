import { z } from "zod";

/**
 * Une compétence : un nom libre et un pourcentage.
 *
 * Exportée seule, et pas seulement à travers la formation qui la contient : un
 * PNJ de scénario porte des compétences sans passer par les trois formations,
 * et un infecté en porte sans en avoir aucune.
 *
 * Une spécialisation s'écrit entre parenthèses dans le nom. C'est une
 * convention d'écriture, non un second champ : aucune source ne les sépare.
 */
export const Competence = z.object({
  nom: z.string().min(1),
  pourcentage: z.int().min(0),
});

/**
 * Une formation : classe sociale, formation professionnelle ou personnelle.
 *
 * Le type n'est pas un ensemble fermé utilisable : un personnage en acquiert
 * d'autres en campagne. La borne à trois est une borne de création, pas une
 * borne de fiche — la liste qui les porte n'est donc pas bornée.
 */
export const Formation = z.object({
  nom: z.string().min(1),
  pourcentage: z.int().min(0),
  competences: z.array(Competence),
});
