import fs from "node:fs";
import { z } from "zod";
import { TARGETS } from "../src/zod/constants";

/**
 * Écrit deux fichiers par cible.
 *
 * Le premier, `schemas/<jeu>/<cible>.schema.json`, est la dernière version : son
 * `$id` pointe `main` et son contenu bouge à chaque génération.
 *
 * Le second, `schemas/<jeu>/<version>/<cible>.schema.json`, est un gel. Son `$id`
 * porte le numéro de version dans son propre chemin, si bien qu'un consommateur
 * qui l'épingle obtient toujours le même document. Un `$id` sous `main` change
 * de contenu sans changer d'identité — c'est ce que le gel corrige.
 *
 * Le versionnement passe donc par le chemin, jamais par le ref git : servir le
 * même fichier depuis un tag lui laisserait un `$id` déclarant `main`, soit une
 * identité différente de l'URL qui le sert.
 *
 * Un dossier de version déjà publié ne doit plus être réécrit : le bump suivant
 * en crée un autre à côté.
 */

const VERSION: string = JSON.parse(fs.readFileSync("package.json", "utf-8")).version;

for (const t of TARGETS) {
  const json = z.toJSONSchema(t.zod, { target: "draft-7" }) as Record<string, unknown>;

  const dossier = `schemas/${t.game.folder}`;
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(`${dossier}/${t.name}.schema.json`, JSON.stringify(json, null, 2));
  console.log("Wrote", `${dossier}/${t.name}.schema.json`);

  const dossierGele = `${dossier}/${VERSION}`;
  fs.mkdirSync(dossierGele, { recursive: true });
  const gel: Record<string, unknown> = { ...json };
  if (typeof gel.$id === "string") {
    gel.$id = gel.$id.replace(
      `/${t.game.folder}/${t.name}.schema.json`,
      `/${t.game.folder}/${VERSION}/${t.name}.schema.json`,
    );
  }
  fs.writeFileSync(`${dossierGele}/${t.name}.schema.json`, JSON.stringify(gel, null, 2));
  console.log("Wrote", `${dossierGele}/${t.name}.schema.json`);
}
