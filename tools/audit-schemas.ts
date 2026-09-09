import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { TARGETS } from "../src/zod/constants";

/**
 * Mesure la qualité des schémas générés, plutôt que de l'affirmer.
 *
 * Sur les sources, deux tournures qu'aucun autre contrôle n'attrape.
 *
 * Sur chaque schéma généré, cinq contrôles, tous bloquants :
 *
 *  1. le schéma est un draft-7 valide, jugé par son méta-schéma ;
 *  2. Ajv le compile — un schéma insatisfiable passe le méta-schéma sans passer
 *     ici ;
 *  3. il porte un `$id`, sans quoi aucun outil tiers ne peut le citer ;
 *  4. chaque propriété porte une `description` — un consommateur du seul
 *     `schemas/` ne lit rien d'autre ;
 *  5. aucune borne numérique n'est absente : un `z.int()` nu émet un `maximum`
 *     valant Number.MAX_SAFE_INTEGER, ce qui revient à n'en poser aucune.
 *
 * Puis les cas de refus : chaque document de `corpus/refus/<cible>/` doit être
 * rejeté, et le témoin de `corpus/temoins/<cible>/` accepté. Sans le témoin, une
 * série de refus ne prouve rien — un schéma qui rejette tout les passerait tous.
 *
 * Ces documents vivent hors d'`examples/` à dessein : `validate-examples.ts`
 * échouerait dessus, et il ne récurse pas dans les sous-dossiers.
 *
 * `corpus/` suit la structure partagée par les trois dépôts de schéma
 * (`corpus/refus/`, `corpus/temoins/`, un fichier par faute nommé par la
 * faute) : voir `corpus/README.md`.
 */

const MAX_SAFE = Number.MAX_SAFE_INTEGER;
const VERSION: string = JSON.parse(fs.readFileSync("package.json", "utf-8")).version;

type Compte = { total: number; decrits: number; nus: string[] };

/**
 * Les deux tournures interdites dans `src/zod/`.
 *
 * `.refine()` rend un `ZodObject` en Zod 4 — `ZodEffects` n'existe plus —, donc
 * `tsc --noEmit --strict` sort 0 et la contrainte disparaît sans trace du JSON
 * Schema généré. `.default()` atterrit dans `required` en vue output et fait
 * inventer une valeur : un champ réellement optionnel prend `.optional()`.
 */
function controlerLesSources(): string[] {
  const fautes: string[] = [];
  const parcourir = (dossier: string): void => {
    for (const entree of fs.readdirSync(dossier, { withFileTypes: true })) {
      const chemin = path.join(dossier, entree.name);
      if (entree.isDirectory()) {
        parcourir(chemin);
      } else if (entree.name.endsWith(".ts")) {
        const lignes = fs.readFileSync(chemin, "utf-8").split(/\r?\n/);
        lignes.forEach((ligne, i) => {
          if (ligne.includes(".refine(") || ligne.includes(".default(")) {
            fautes.push(`${chemin}:${i + 1} ${ligne.trim()}`);
          }
        });
      }
    }
  };
  parcourir(path.join("src", "zod"));
  return fautes;
}

/** Parcourt les `properties` d'un schéma et compte celles qui portent une description. */
function compterDescriptions(noeud: unknown, chemin: string, compte: Compte): void {
  if (noeud === null || typeof noeud !== "object") return;
  const o = noeud as Record<string, unknown>;

  const props = o.properties;
  if (props && typeof props === "object") {
    for (const [nom, sous] of Object.entries(props as Record<string, unknown>)) {
      compte.total++;
      const s = sous as Record<string, unknown>;
      if (typeof s?.description === "string" && s.description.length > 0) {
        compte.decrits++;
      } else {
        compte.nus.push(`${chemin}.${nom}`);
      }
      compterDescriptions(sous, `${chemin}.${nom}`, compte);
    }
  }

  if (o.items) compterDescriptions(o.items, `${chemin}[]`, compte);
  for (const cle of ["allOf", "anyOf", "oneOf"]) {
    const branche = o[cle];
    if (Array.isArray(branche)) {
      branche.forEach((b, i) => compterDescriptions(b, `${chemin}.${cle}[${i}]`, compte));
    }
  }
}

/** Relève les bornes hautes laissées à MAX_SAFE_INTEGER, donc inexistantes en pratique. */
function releverBornesNues(noeud: unknown, chemin: string, trouvees: string[]): void {
  if (noeud === null || typeof noeud !== "object") return;
  const o = noeud as Record<string, unknown>;

  if (o.type === "integer" || o.type === "number") {
    if (o.maximum === MAX_SAFE || o.maximum === undefined) trouvees.push(chemin);
  }

  for (const [cle, valeur] of Object.entries(o)) {
    if (valeur && typeof valeur === "object") {
      releverBornesNues(valeur, `${chemin}.${cle}`, trouvees);
    }
  }
}

function listerFichiers(dossier: string): string[] {
  if (!fs.existsSync(dossier)) return [];
  return fs
    .readdirSync(dossier)
    .map((n) => path.join(dossier, n))
    .filter((p) => fs.statSync(p).isFile() && p.toLowerCase().endsWith(".json"));
}

function run(): void {
  let echecs = 0;
  let totalProps = 0;
  let totalDecrits = 0;

  console.log("-- sources --");
  const fautesSource = controlerLesSources();
  if (fautesSource.length === 0) {
    console.log("  ✓ aucun .refine() ni .default() dans src/zod/");
  } else {
    for (const f of fautesSource) console.error(`  ✗ ${f}`);
    echecs += fautesSource.length;
  }

  for (const t of TARGETS) {
    const cheminSchema = path.join("schemas", t.game.folder, `${t.name}.schema.json`);
    if (!fs.existsSync(cheminSchema)) {
      console.error(`✗ ${t.name} : schéma absent (${cheminSchema}). Lancer « npm run gen ».`);
      echecs++;
      continue;
    }
    const schema = JSON.parse(fs.readFileSync(cheminSchema, "utf-8"));
    console.log(`\n-- ${t.name} --`);

    // 1. validité draft-7
    const ajvMeta = new Ajv({ allErrors: true, strict: false });
    addFormats(ajvMeta);
    if (ajvMeta.validateSchema(schema)) {
      console.log("  ✓ draft-7 valide");
    } else {
      console.error("  ✗ draft-7 invalide", ajvMeta.errors);
      echecs++;
    }

    // 2. compilation — instance neuve, l'$id interdit une seconde compilation
    let valider: ReturnType<Ajv["compile"]> | null = null;
    try {
      const ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(ajv);
      valider = ajv.compile(schema);
      console.log("  ✓ compilé par Ajv");
    } catch (e) {
      console.error(`  ✗ compilation refusée : ${(e as Error).message}`);
      echecs++;
    }

    // 3. identité
    if (typeof schema.$id === "string" && schema.$id.length > 0) {
      console.log("  ✓ $id présent");
    } else {
      console.error("  ✗ $id absent ou vide — le schéma n'a pas d'identité citable");
      echecs++;
    }

    // 3b. gel versionne : meme contenu, identite propre
    const cheminGel = path.join("schemas", t.game.folder, VERSION, `${t.name}.schema.json`);
    if (!fs.existsSync(cheminGel)) {
      console.error(
        `  ✗ gel absent (${cheminGel}) — un consommateur ne peut epingler aucune version`,
      );
      echecs++;
    } else {
      const gel = JSON.parse(fs.readFileSync(cheminGel, "utf-8"));
      const attendu = schema.$id?.replace(
        `/${t.game.folder}/${t.name}.schema.json`,
        `/${t.game.folder}/${VERSION}/${t.name}.schema.json`,
      );
      const memeContenu =
        JSON.stringify({ ...gel, $id: undefined }) ===
        JSON.stringify({ ...schema, $id: undefined });
      if (gel.$id === attendu && memeContenu) {
        console.log(`  ✓ gel ${VERSION} conforme, identite propre`);
      } else {
        if (gel.$id !== attendu) {
          console.error(`  ✗ gel ${VERSION} : $id attendu ${attendu}, trouve ${gel.$id}`);
        }
        if (!memeContenu) {
          console.error(`  ✗ gel ${VERSION} : le contenu differe du schema courant hors $id`);
        }
        echecs++;
      }
    }

    // 4. couverture des descriptions
    const compte: Compte = { total: 0, decrits: 0, nus: [] };
    compterDescriptions(schema, t.name, compte);
    totalProps += compte.total;
    totalDecrits += compte.decrits;
    const pct = compte.total === 0 ? 100 : Math.round((compte.decrits / compte.total) * 100);
    if (compte.nus.length === 0) {
      console.log(`  ✓ descriptions ${compte.decrits}/${compte.total} (100 %)`);
    } else {
      console.error(`  ✗ descriptions ${compte.decrits}/${compte.total} (${pct} %)`);
      for (const n of compte.nus.slice(0, 20)) console.error(`      sans description : ${n}`);
      if (compte.nus.length > 20) console.error(`      … et ${compte.nus.length - 20} autres`);
      echecs++;
    }

    // 5. bornes hautes
    const bornesNues: string[] = [];
    releverBornesNues(schema, t.name, bornesNues);
    if (bornesNues.length === 0) {
      console.log("  ✓ toute valeur numérique est bornée des deux côtés");
    } else {
      console.error(`  ✗ ${bornesNues.length} valeur(s) numérique(s) sans borne haute réelle`);
      for (const b of bornesNues.slice(0, 20)) console.error(`      ${b}`);
      echecs++;
    }

    if (!valider) continue;

    // 6. témoin : un document légitime, qui doit être accepté
    const temoins = listerFichiers(path.join("corpus", "temoins", t.name));
    if (temoins.length === 0) {
      console.error(
        `  ✗ aucun témoin dans corpus/temoins/${t.name} — les refus ne prouveraient rien`,
      );
      echecs++;
    }
    for (const f of temoins) {
      const data = JSON.parse(fs.readFileSync(f, "utf-8"));
      if (valider(data)) {
        console.log(`  ✓ témoin accepté : ${path.basename(f)}`);
      } else {
        console.error(`  ✗ témoin refusé : ${path.basename(f)}`, valider.errors);
        echecs++;
      }
    }

    // 7. cas de refus : chacun doit être rejeté
    const refus = listerFichiers(path.join("corpus", "refus", t.name));
    if (refus.length === 0) {
      console.error(`  ✗ aucun cas de refus dans corpus/refus/${t.name}`);
      echecs++;
    }
    for (const f of refus) {
      const data = JSON.parse(fs.readFileSync(f, "utf-8"));
      if (valider(data)) {
        console.error(`  ✗ accepté à tort : ${path.basename(f)}`);
        echecs++;
      } else {
        console.log(`  ✓ refusé comme prévu : ${path.basename(f)}`);
      }
    }
  }

  const pctGlobal = totalProps === 0 ? 100 : Math.round((totalDecrits / totalProps) * 100);
  console.log(`\nCouverture des descriptions : ${totalDecrits}/${totalProps} (${pctGlobal} %)`);

  if (echecs > 0) {
    console.error(`\n❌ Audit : ${echecs} contrôle(s) en échec.`);
    process.exit(1);
  }
  console.log("\n✅ Audit : tous les contrôles passent.");
}

run();
