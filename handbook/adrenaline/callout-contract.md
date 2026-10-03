# Callouts visuels Adrenaline

Le pack Adrenaline reconnaît six callouts Markdown, relevés sur la maquette du livret Zombiology. Leur contenu est libre : le pack ne change que leur mise en page. Ils n'ajoutent aucune mécanique et ne touchent à aucun document `pj`, `pnj` ou `monstre`.

La liste fait foi dans `ADRENALINE_VISUAL_CALLOUTS`, exporté par `schema-adrenaline` et par `schema-adrenaline/presentation`. Chaque entrée porte la capability `style:adrenaline`. Un consommateur n'affiche un callout que si le pack actif la déclare dans `requires`.

| Identifiant              | Alias par défaut     | Usage de présentation                                                                                                                                  |
| ------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `adrenaline-exemple`     | `exemple`, `example` | Exemple de jeu. Filets pointillés en haut et en bas, sans fond. L'étiquette est en cartouche sombre calée à droite, et le corps en italique.           |
| `adrenaline-description` | `description`        | Texte à lire aux joueurs. Filets pointillés en haut et en bas, sans fond. L'étiquette est en cartouche grenat calée à droite, et le corps reste droit. |
| `adrenaline-encart`      | `encart`             | Encart de règle ou de conseil. Titre sur un bandeau grenat ajusté au texte, corps sur une surface rosée bordée d'un filet grenat.                      |
| `adrenaline-formation`   | `formation`          | Paquetage ou formation. Bandeau sombre pleine largeur, puis le corps sans fond, qui porte en général une liste.                                        |
| `adrenaline-action`      | `action`             | Action de combat. Carte à coins arrondis, titre sur un bandeau pêche. Le **premier paragraphe** du corps devient la bande grenat de la ligne de test.  |
| `adrenaline-table`       | `table-aleatoire`    | Table aléatoire. Titre centré sur un cartouche grenat biseauté, à cheval sur le cadre, puis un tableau à lignes alternées.                             |

## Modificateurs

Un modificateur est un mot de métadonnée Obsidian, placé après une barre verticale : `[!alias|mot]`.

| Callout                | Modificateur | Effet                                                                                                                                    |
| ---------------------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `adrenaline-formation` | `fond`       | Le corps passe sur la surface grise `--adrenaline-formation-surface`, et son premier paragraphe devient une accroche en italique grenat. |

```md
> [!formation|fond] Trafic
> La formation de trafic dispense un apprentissage de la discrétion et de la négociation.
>
> - Art martial (Bagarre)
> - Discrétion
```

## Callouts natifs

Trois types natifs d'Obsidian reprennent une mise en page du livret de scénario. Ils ne sont pas dans `ADRENALINE_VISUAL_CALLOUTS` : leur identifiant appartient à Obsidian, le pack n'en fixe que les valeurs.

| Type   | Usage de présentation                                                                                                                         | Jetons                                                                         |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `note` | Document trouvé. Feuille claire tenue par un trombone, ombre portée, titre centré en majuscules, titre et corps dans la police manuscrite.    | `--adrenaline-note-surface`, `--adrenaline-note-ink`, `--adrenaline-note-font` |
| `info` | Scène ou test. Même anatomie que `adrenaline-action` : titre sur bandeau pêche, premier paragraphe en bande grenat, corps sur surface claire. | ceux de `adrenaline-action`                                                    |
| `tip`  | Aide de jeu courte (phase, musique). Petite carte arrondie pêche à bord grenat, lignes compactes.                                             | `--adrenaline-callout-tip`, `-ink`, `-border`                                  |

## Titres et texte courant

| Élément       | Mise en page                                                                                  | Jetons                                                   |
| ------------- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Titre 1       | Police d'affichage, majuscules, encre du texte, sans cartouche.                               | `--h1-*`                                                 |
| Titre 2       | Comme le titre 1, plus petit, sur un filet fin.                                               | `--h2-*`, `--adrenaline-h2-rule`                         |
| Titre 3       | Serif du corps, gras, casse normale, sur une bande grise soulignée d'un filet grenat.         | `--h3-*`, `--adrenaline-h3-band`, `--adrenaline-h3-rule` |
| Gras          | Encre du texte.                                                                               | `--bold-color`                                           |
| Code en ligne | Balisage entre accents graves : majuscules grasses grenat dans la police du corps, sans fond. | `--adrenaline-inline-code-*`                             |
| Liste à puces | Glyphe du pack dans l'encre du texte.                                                         | `--adrenaline-list-marker-glyph`, `--list-marker-color`  |

## Éléments en ligne

Ce ne sont pas des callouts, mais ils appartiennent au même vocabulaire et le pack les habille.

| Balise                                                                           | Usage                                                                                 |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `<span class="adrenaline-keyword">Mot-clé.</span>`                               | Mot-clé en tête de paragraphe : majuscules grasses grenat (`--adrenaline-keyword-*`). |
| `<mark class="adrenaline-status-yellow">3 malus</mark>`, `adrenaline-status-red` | Badge de seuil (`--adrenaline-status-*`).                                             |
| `<mark class="adrenaline-result-success">A</mark>`, `adrenaline-result-failure`  | Pastille de résultat d'une action (`--adrenaline-result-*`).                          |

## Jetons

Le pack porte toutes les valeurs, et le consommateur ne fournit que les sélecteurs. Chaque paire encre/fond est vérifiée en light et en dark par `npm run validate:pack`.

| Callout         | Jetons                                                                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| exemple         | `--adrenaline-example-rule`, `--adrenaline-callout-cartouche-bg`/`-ink`, `--adrenaline-emphasis-*`                           |
| description     | `--adrenaline-description-rule`, `--adrenaline-description-label-bg`/`-ink`                                                  |
| encart          | `--adrenaline-band`/`-ink`, `--adrenaline-callout-surface`, `--adrenaline-callout-ink`, `--adrenaline-callout-border`        |
| formation       | `--adrenaline-callout-cartouche-bg`/`-ink`, `--adrenaline-formation-surface`, `--adrenaline-emphasis-color`                  |
| action          | `--adrenaline-action-title-bg`/`-ink`, `--adrenaline-action-border`, `--adrenaline-band`/`-ink`, `--adrenaline-card-surface` |
| table aléatoire | `--adrenaline-band`/`-ink`, `--adrenaline-callout-border`, `--adrenaline-table-stripe`                                       |

Voir `callouts-example.md` pour une note qui couvre chaque callout, les titres h1 à h5 et une liste imbriquée.
