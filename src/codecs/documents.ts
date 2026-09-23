import { parse as parseToml, stringify as stringifyToml, type TomlTable } from "smol-toml";
import { type ZodType, z } from "zod";
import { Monstre } from "../zod/adrenaline/monstre.js";
import { PersonnageJoueur } from "../zod/adrenaline/pj.js";
import { PersonnageNonJoue } from "../zod/adrenaline/pnj.js";
import { validatePlayableRanges } from "../validation/playable-ranges.js";

/**
 * Schémas Zod de forme seulement. Utiliser les codecs ou validatePlayableRanges
 * pour vérifier l'ordre minimum ≤ current ≤ maximum du contrat complet.
 */
export const ADRENALINE_DOCUMENT_SCHEMAS = {
  pj: PersonnageJoueur,
  pnj: PersonnageNonJoue,
  monstre: Monstre,
} as const;

export type AdrenalineDocumentTarget = keyof typeof ADRENALINE_DOCUMENT_SCHEMAS;
export type Pj = z.infer<typeof PersonnageJoueur>;
export type Pnj = z.infer<typeof PersonnageNonJoue>;
export type MonstreDocument = z.infer<typeof Monstre>;
export type MonstreResolu = Omit<MonstreDocument, "etatActif" | "etatAlternatif" | "etats">;

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
  return validatePlayableRanges(schema.parse(value));
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

function normaliserEtatsMonstre(value: MonstreDocument): MonstreDocument {
  if (!value.etatAlternatif) return value;
  if (value.etats || value.etatActif) {
    throw new Error("A monster cannot mix etatAlternatif with etats or etatActif");
  }

  const { etatAlternatif, ...base } = value;
  const delta = {
    ...(etatAlternatif.caracteristiques
      ? { caracteristiques: { ...base.caracteristiques, ...etatAlternatif.caracteristiques } }
      : {}),
    ...(etatAlternatif.zoneDeDetection ? { zoneDeDetection: etatAlternatif.zoneDeDetection } : {}),
    ...(etatAlternatif.deplacement ? { deplacement: etatAlternatif.deplacement } : {}),
    ...(etatAlternatif.actionsParRound !== undefined
      ? { actionsParRound: etatAlternatif.actionsParRound }
      : {}),
    ...(etatAlternatif.notes ? { notes: etatAlternatif.notes } : {}),
  };

  return {
    ...base,
    etats: [
      {
        id: "alternatif-historique",
        nom: etatAlternatif.nom,
        ...(etatAlternatif.declencheurs ? { declencheurs: etatAlternatif.declencheurs } : {}),
        delta,
      },
    ],
  };
}

function parseMonstre(value: unknown): MonstreDocument {
  return normaliserEtatsMonstre(parseWith(Monstre, value));
}

function codecMonstre(): AdrenalineDocumentCodec<MonstreDocument> {
  return {
    schema: Monstre,
    parse: parseMonstre,
    parseJson: (source) => parseMonstre(JSON.parse(source) as unknown),
    stringifyJson: (value) => `${JSON.stringify(parseMonstre(value), null, 2)}\n`,
    parseToml: (source) => parseMonstre(parseToml(source)),
    stringifyToml: (value) => stringifyToml(parseMonstre(value) as TomlTable),
  };
}

/** Retourne le profil de base ou le remplacement complet de l'état demandé. */
export function resoudreEtatMonstre(
  value: MonstreDocument,
  etatId = value.etatActif ?? "base",
): MonstreResolu {
  const monstre = normaliserEtatsMonstre(value);
  const { etatActif: _etatActif, etatAlternatif: _etatAlternatif, etats, ...base } = monstre;
  if (etatId === "base") return base;
  const etat = etats?.find((candidate) => candidate.id === etatId);
  if (!etat) throw new Error(`Unknown monster state: ${etatId}`);
  return { ...base, ...etat.delta };
}

export const ADRENALINE_DOCUMENT_CODECS: {
  [Target in AdrenalineDocumentTarget]: AdrenalineDocumentCodec<AdrenalineDocumentByTarget[Target]>;
} = {
  pj: codec(PersonnageJoueur),
  pnj: codec(PersonnageNonJoue),
  monstre: codecMonstre(),
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
