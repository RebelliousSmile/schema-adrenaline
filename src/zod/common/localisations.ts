import { z } from "zod";

/**
 * Les six localisations corporelles.
 *
 * La caractéristique associée à chacune sert la résolution d'un jet, pas la
 * fiche : elle est reportée en description et n'est jamais un champ.
 */
export const LocalisationCorporelle = z
  .enum(["jambe-droite", "jambe-gauche", "torse", "bras-faible", "bras-fort", "tete"])
  .meta({
    description:
      "Localisation corporelle. Caractéristique associée : jambe droite RAP, jambe gauche RAP, torse ou dos CON, bras faible DEX, bras fort FOR, tête PER.",
    examples: ["torse", "tete"],
  });

/**
 * Les six localisations émotionnelles. Le socle pose une symétrie stricte entre
 * conflit physique et conflit mental : autant de localisations de part et
 * d'autre, mêmes seuils, mêmes protections.
 */
export const LocalisationEmotionnelle = z
  .enum(["anxiete", "impuissance", "colere", "tristesse", "peur", "culpabilite"])
  .meta({
    description:
      "Localisation émotionnelle. Caractéristique associée : anxiété CHA, impuissance CHA, colère LOG, tristesse PER, peur VOL, culpabilité DEX.",
    examples: ["peur", "colere"],
  });

export type LocalisationCorporelleValeur = z.infer<typeof LocalisationCorporelle>;
export type LocalisationEmotionnelleValeur = z.infer<typeof LocalisationEmotionnelle>;
