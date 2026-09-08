import { ZodObject } from "zod";

import { PersonnageJoueur } from "./adrenaline/pj";
import { PersonnageNonJoue } from "./adrenaline/pnj";
import { Monstre } from "./adrenaline/monstre";

type Game = {
  name: string;
  folder: string;
  abbr: string;
};

type GameDictionary = {
  [index: string]: Game;
};

type SchemaTarget = {
  name: string;
  zod: ZodObject;
  game: Game;
};

/**
 * Games running on the Adrenaline System. Editable starting list: an entry with
 * no matching TARGETS entry creates no folder and no file.
 */
export const GAMES: GameDictionary = {
  /**
   * The engine itself, holder of the common ground shared by every game running
   * on it. Games listed below carry only what is specific to them.
   */
  adrenaline: {
    name: "Adrenaline System",
    folder: "adrenaline",
    abbr: "adrenaline",
  },
  zombiology: {
    name: "Zombiology",
    folder: "zombiology",
    abbr: "zombiology",
  },
  rdt: {
    name: "La Roue du Temps (adaptation d100)",
    folder: "roue-du-temps",
    abbr: "rdt",
  },
};

export const TARGETS: Array<SchemaTarget> = [
  {
    name: "pj",
    zod: PersonnageJoueur,
    game: GAMES.adrenaline,
  },
  {
    name: "pnj",
    zod: PersonnageNonJoue,
    game: GAMES.adrenaline,
  },
  {
    name: "monstre",
    zod: Monstre,
    game: GAMES.adrenaline,
  },
];
