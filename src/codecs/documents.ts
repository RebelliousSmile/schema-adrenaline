import { parse as parseToml, stringify as stringifyToml, type TomlTable } from "smol-toml";
import { type ZodType, z } from "zod";
import { Monstre } from "../zod/adrenaline/monstre.js";
import { PersonnageJoueur } from "../zod/adrenaline/pj.js";
import { PersonnageNonJoue } from "../zod/adrenaline/pnj.js";

export const ADRENALINE_DOCUMENT_SCHEMAS = {
  pj: PersonnageJoueur,
  pnj: PersonnageNonJoue,
  monstre: Monstre,
} as const;

export type AdrenalineDocumentTarget = keyof typeof ADRENALINE_DOCUMENT_SCHEMAS;
export type Pj = z.infer<typeof PersonnageJoueur>;
export type Pnj = z.infer<typeof PersonnageNonJoue>;
export type MonstreDocument = z.infer<typeof Monstre>;

export interface AdrenalineDocumentByTarget {
  pj: Pj;
  pnj: Pnj;
  monstre: MonstreDocument;
}

export interface AdrenalineDocumentCodec<T> {
  schema: ZodType<T>;
  parse(value: unknown): T;
  parseJson(source: string): T;
  stringifyJson(value: unknown): string;
  parseToml(source: string): T;
  stringifyToml(value: unknown): string;
}

function parseWith<T>(schema: ZodType<T>, value: unknown): T {
  return schema.parse(value);
}

function parseJsonWith<T>(schema: ZodType<T>, source: string): T {
  return parseWith(schema, JSON.parse(source) as unknown);
}

function stringifyJsonWith<T>(schema: ZodType<T>, value: unknown): string {
  return `${JSON.stringify(parseWith(schema, value), null, 2)}\n`;
}

function parseTomlWith<T>(schema: ZodType<T>, source: string): T {
  return parseWith(schema, parseToml(source));
}

function stringifyTomlWith<T>(schema: ZodType<T>, value: unknown): string {
  return stringifyToml(parseWith(schema, value) as TomlTable);
}

function codec<T>(schema: ZodType<T>): AdrenalineDocumentCodec<T> {
  return {
    schema,
    parse: (value) => parseWith(schema, value),
    parseJson: (source) => parseJsonWith(schema, source),
    stringifyJson: (value) => stringifyJsonWith(schema, value),
    parseToml: (source) => parseTomlWith(schema, source),
    stringifyToml: (value) => stringifyTomlWith(schema, value),
  };
}

export const ADRENALINE_DOCUMENT_CODECS: {
  [Target in AdrenalineDocumentTarget]: AdrenalineDocumentCodec<AdrenalineDocumentByTarget[Target]>;
} = {
  pj: codec(PersonnageJoueur),
  pnj: codec(PersonnageNonJoue),
  monstre: codec(Monstre),
};

export const parsePjJson = ADRENALINE_DOCUMENT_CODECS.pj.parseJson;
export const stringifyPjJson = ADRENALINE_DOCUMENT_CODECS.pj.stringifyJson;
export const parsePjToml = ADRENALINE_DOCUMENT_CODECS.pj.parseToml;
export const stringifyPjToml = ADRENALINE_DOCUMENT_CODECS.pj.stringifyToml;

export const parsePnjJson = ADRENALINE_DOCUMENT_CODECS.pnj.parseJson;
export const stringifyPnjJson = ADRENALINE_DOCUMENT_CODECS.pnj.stringifyJson;
export const parsePnjToml = ADRENALINE_DOCUMENT_CODECS.pnj.parseToml;
export const stringifyPnjToml = ADRENALINE_DOCUMENT_CODECS.pnj.stringifyToml;

export const parseMonstreJson = ADRENALINE_DOCUMENT_CODECS.monstre.parseJson;
export const stringifyMonstreJson = ADRENALINE_DOCUMENT_CODECS.monstre.stringifyJson;
export const parseMonstreToml = ADRENALINE_DOCUMENT_CODECS.monstre.parseToml;
export const stringifyMonstreToml = ADRENALINE_DOCUMENT_CODECS.monstre.stringifyToml;
