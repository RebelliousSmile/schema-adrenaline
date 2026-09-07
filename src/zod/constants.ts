import { ZodObject } from "zod";

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

/**
 * Empty on purpose: no schema has been written yet. `npm run check` is green
 * on an empty list — gen writes nothing and validate reports zero files.
 */
export const TARGETS: Array<SchemaTarget> = [];
