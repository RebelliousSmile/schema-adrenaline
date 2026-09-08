---
status: done
---

# Référence des cartouches — Adrenaline System

Document de travail des phases 2 à 4. Il décrit **la forme des fiches**, champ par
champ, pour que les schémas Zod s'écrivent sans rouvrir les sources.

## Limite de droit

`aidd_docs/` est poussé sur un dépôt public. Ce document **ne recopie ni table de
règles, ni valeur chiffrée de catalogue, ni texte du livre de base**. Il note quels
champs existent, leur cardinalité et leur type. Les pages sont citées par référence
pour permettre de rouvrir la source, jamais reproduites.

Deux inclusions sont assumées, parce que le plan les exige explicitement :

- **les quatre dérivations de seuil** — critère 2 de la phase 1. Elles ne sont pas
  un catalogue : elles disent quels champs la fiche doit porter, et pourquoi le
  schéma les stocke plutôt que de les calculer.
- **la caractéristique associée à chaque localisation** — la phase 2, tâche 2.2, la
  reporte en `.meta({ description })`. C'est ce qui justifie la composition de
  l'enum ; sans elle, les douze membres sont arbitraires.

Sont exclus et le restent : la table des traits de caractère, les catalogues
d'armes, d'armures et de boucliers, les profils chiffrés de zombies, les
pourcentages de contamination, les barèmes d'attribution à la création.

## Sources et autorité

| Source | Rôle |
| ------ | ---- |
| `_sources/regles/Z1L01_Zombiology__1_Contamination_Ldb.pdf` | Livre de base. Tranche toute divergence. Non ouvert ici : `zombiology_part_01.pdf` en est l'extrait pertinent. |
| `_sources/regles/zombiology_part_01.pdf` | Création de PJ, 15 pages. **Autorité effective de ce document.** Folio du livre = page PDF + 25 (la p. 13 du PDF porte le folio 38). |
| `_sources/regles/part_01_resume.md` | Résumé de la création de PJ. Dérivé, fidèle sur tous les points recoupés. |
| `_sources/regles/part_04_resume.md`, `part_05_resume.md`, `ZOMBIOLOGY_REGLES_COMPLETES.md` | Localisations et équipement. Deux sources indépendantes concordantes. |
| `_sources/regles/part_06_resume.md` | Profils des infectés. Seule source de forme pour le cartouche monstre. |
| `_sources/regles/template_pnj.md` | Forme du cartouche PNJ, en trois variantes. |
| `_sources/regles/adrenaline-d100.md` | Cheatsheet générique. **Dérivé le moins fiable** — voir les divergences. |

## Divergences relevées

| # | Point | Divergence | Tranché |
| - | ----- | ---------- | ------- |
| D1 | Nom des seuils | `adrenaline-d100.md` nomme les quatre seuils *Light / Moderate / Grave / Profound*, soit un cran de décalage. `part_01_resume.md` dit *Superficiel / Léger / Grave / Profond*. | **PDF part_01, p. 38-39 du livre (p. 13-14 du PDF)** : « superficiel, léger, grave et profond », physiques comme mentaux, énoncé deux fois. `part_01_resume.md` a raison. Les formules des deux résumés sont par ailleurs équivalentes — seul le nommage divergeait. |
| D2 | Nombre de seuils au cartouche PNJ | `template_pnj.md` note la santé sous forme de trois valeurs. Le PDF et `part_06_resume.md` en donnent quatre. | Non tranché. Le cartouche PNJ omet vraisemblablement le seuil superficiel. **Conséquence de schéma : ne pas rendre les quatre seuils requis pour un PNJ.** |
| D3 | Caractéristiques du corps zombie | `part_06_resume.md` et `adrenaline-d100.md` donnent des valeurs et des ND différents pour les mêmes types de corps. | Sans objet : ce sont des valeurs de catalogue, non reproduites et non modélisées. La **forme** — quelles caractéristiques un corps porte — concorde. |
| D4 | Probabilités de contamination | Les deux résumés donnent des pourcentages différents par vecteur. | Sans objet, même raison. Le schéma porte un pourcentage libre, pas une valeur imposée. |
| D5 | Coquille du livre | L'exemple de calcul de la p. 38 imprime un total qui contredit sa propre addition d'une unité. | Sans effet sur la structure. Signalé pour qui rouvrirait la page. |

## Feuille de PJ — six blocs

Blocs relevés sur le PDF part_01 (« bloc Paramètres », « bloc Compétence »,
« bloc Caractéristique », « bloc Équipement », « bloc Santé », « bloc Identité »),
correspondant aux étapes 1 à 6 de la création.

### 1. Paramètres de jeu — p. 26 et suivantes

| Champ | Cardinalité | Type |
| ----- | ----------- | ---- |
| Type de création | 0..1 | fermé : équitable (distributif), aléatoire |
| Type de scénario | 0..1 | fermé : one-shot, campagne |
| Déclinaison de campagne | 0..1 | fermé : bac à sable, storyline |

Source : `part_01_resume.md`, étape 1. Ces trois champs décrivent **comment la fiche
a été produite**, pas ce qu'elle est. D'où le bloc `meta` optionnel de la phase 2.

### 2. Compétence

| Champ | Cardinalité | Type |
| ----- | ----------- | ---- |
| Formation | 3 à la création, **non borné** ensuite | objet |
| Formation : nom | 1 | chaîne libre (catalogue éditorial) |
| Formation : pourcentage | 1 | entier |
| Formation : compétences | 1..n | liste d'objets |
| Compétence : nom | 1 | chaîne libre |
| Compétence : pourcentage | 1 | entier |

Trois types de formation à la création — classe sociale, professionnelle,
personnelle (loisirs) — mais **le type n'est pas un enum utilisable** : une
formation professionnelle supplémentaire s'ajoute en campagne et pour un
personnage âgé. La borne à 3 est une borne de création, pas une borne de fiche.

Observation de forme, tirée de `template_pnj.md` : un nom de compétence porte
souvent une spécialisation entre parenthèses. C'est une convention d'écriture dans
la chaîne, pas un second champ — rien dans les sources ne les sépare.

Trois compétences sont acquises par tout PJ du fait de son origine
(`part_01_resume.md`, « compétences natives »). Elles n'ont pas de statut
structurel distinct : ce sont des compétences comme les autres.

### 3. Caractéristique

Huit, en deux groupes fermés de quatre. Valeur en pourcentage entier.

- **Physiques** : FOR (Force), CON (Constitution), DEX (Dextérité), RAP (Rapidité)
- **Mentales** : LOG (Logique), VOL (Volonté), PER (Perception), CHA (Charisme)

Source : `part_01_resume.md` étape 3 et `adrenaline-d100.md`, concordants.

La **qualité** d'une caractéristique est le chiffre de ses dizaines. C'est une
dérivation de test, recalculable à tout instant : **ne pas la stocker.**

### 4. Équipement — p. 37 du livre (p. 12 du PDF)

Relevé sur l'encadré de résumé de l'étape 4.

**Équipement physique**

| Champ | Cardinalité | Type |
| ----- | ----------- | ---- |
| PP de Solidité physique | 1 | entier |
| PP d'Armure | 0..1 | entier |
| Localisations couvertes par l'armure | 0..n | localisations corporelles |
| Bouclier | 0..1 | objet |
| Bouclier : propriétés (type de Couvert) | 0..n | chaîne libre |
| Possessions favorites | 0..n | chaîne libre |

**Équipement mental**

| Champ | Cardinalité | Type |
| ----- | ----------- | ---- |
| PM de Solidité mentale | 1 | entier |
| Trait de Caractère | 0..1 | chaîne libre (catalogue de 18 entrées, non reproduit) |
| Localisations couvertes par le trait | 0..3 | localisations émotionnelles |
| PM de Caractère | 0..1 | entier |
| Bouclier mental | 0..1 | objet |
| Bouclier mental : type de Censure | 0..1 | fermé : habitué, endurci, immunisé |

Les localisations couvertes par le trait **doivent être stockées** : la fiche
demande de les noter, et sans elles les seuils « + Caractère » sont
ininterprétables. Le catalogue des traits reste hors du schéma — le trait est une
chaîne libre.

Les armes sont de l'équipement, physique (contact, distance) comme mental
(psychologique, social). Aucune borne de fiche : le générateur web en affiche trois,
c'est une contrainte de place sur le papier.

### 5. Santé — p. 38-39 du livre (p. 13-14 du PDF)

Le bloc porte **trois zones**, dont une seule est renseignée à la création :

1. Dés de stress — vierge à la création
2. Malus & États encaissés — vierge à la création
3. Seuils de dégât — la seule à remplir

**Quatre seuils physiques et quatre seuils mentaux**, mêmes noms de part et
d'autre : superficiel, léger, grave, profond.

Dérivations, telles qu'énoncées p. 38 et p. 39 :

| Seuil | Physique | Mental |
| ----- | -------- | ------ |
| Superficiel | PP de Solidité physique | PM de Solidité mentale |
| Léger | Superficiel + qualité FOR + qualité CON | Superficiel + qualité LOG + qualité VOL |
| Grave | Léger + 5 | Léger + 5 |
| Profond | Léger + 10 | Léger + 10 |

Grave et profond se calculent **depuis le seuil léger**, pas en cascade l'un depuis
l'autre. Les deux formulations donnent le même résultat ; celle du livre est
celle-ci.

**Point structurel décisif.** La feuille porte, pour chaque seuil, **deux valeurs** :
la valeur de base, et une case séparée « + Armure » (physique) ou « + Caractère »
(mental). La seconde ne s'applique qu'aux localisations couvertes. Un schéma qui ne
porterait qu'un nombre par seuil perdrait la moitié de l'information imprimée.

JSON Schema ne calcule pas : ces valeurs sont stockées telles que lues sur la fiche.

### 6. Identité — p. 39 du livre (p. 14 du PDF)

| Champ | Cardinalité |
| ----- | ----------- |
| Nom, prénom, surnom | nom requis, le reste optionnel |
| Nationalité | 0..1 |
| Genre | 0..1 |
| Âge | 0..1 |
| Teinte des cheveux, des yeux, de la peau | 0..1 chacune |
| Taille, poids | 0..1 chacun |
| Signes particuliers | 0..n |
| Description physique courte | 0..1 |
| Historique, moments marquants | 0..n |

Tous en chaîne libre. Le livre note que cette partie est laissée libre au joueur.

## Localisations

Douze en tout, en deux enums fermés de six. Concordance exacte entre
`part_04_resume.md` et `ZOMBIOLOGY_REGLES_COMPLETES.md`.

| Corporelle | Caractéristique | Émotionnelle | Caractéristique |
| ---------- | --------------- | ------------ | --------------- |
| Jambe droite | RAP | Anxiété | CHA |
| Jambe gauche | RAP | Impuissance | CHA |
| Torse ou dos | CON | Colère | LOG |
| Bras faible | DEX | Tristesse | PER |
| Bras fort | FOR | Peur | VOL |
| Tête | PER | Culpabilité | DEX |

La caractéristique associée relève de la résolution d'un jet, **pas de la fiche** :
elle va en `.meta({ description })`, jamais en champ.

Le membre corporel médian couvre « torse **ou dos** » dans les deux sources — le
nommer `torse` seul appauvrit la donnée sans rien simplifier.

## Cartouche PNJ

`template_pnj.md` donne **trois formes** — compacte, narrative, complète — qui ne
diffèrent que par le nombre de champs remplis. Un seul schéma les couvre donc, à
condition que presque tout soit optionnel.

Champs, en union des trois formes :

| Champ | Cardinalité | Note |
| ----- | ----------- | ---- |
| Nom | 1 | seul champ réellement requis |
| Rôle, fonction | 0..1 | |
| Type de PNJ | 0..1 | fermé : figurant, secondaire, majeur |
| ND (niveau de danger) | 0..1 | entier |
| Identité | 0..1 | nom complet, âge, apparence, profession ou statut |
| Historique | 0..1 | |
| Rôle dans le scénario | 0..1 | |
| Personnalité | 0..n | |
| Attitude envers les PJ | 0..1 | favorable, neutre, hostile — voir l'incertitude 2 |
| Évolution possible | 0..1 | |
| Conseils d'interprétation | 0..1 | approche roleplay, tics et manières, réactions émotionnelles |
| Caractéristiques physiques | 0..4 | |
| Caractéristiques mentales | 0..4 | absentes de la forme compacte |
| Santé (SP, SM) | 0..1 | voir D2 : trois valeurs notées, quatre seuils au PDF |
| Compétences principales | 0..n | **hors formation** — d'où la compétence exportée seule |
| Équipement notable | 0..n | |
| Infos MJ | 0..1 | secrets, réactions contextuelles, stratégies, alliés, faiblesses |
| Phrases-types | 0..n | |

Le cartouche PNJ **ne porte jamais de bloc Paramètres de jeu** : un PNJ n'est pas
créé par la procédure des étapes 1 à 7.

## Cartouche monstre

`part_06_resume.md` donne un format standardisé et, surtout, un système
**modulaire** à trois composants : type de corps, instinct, type d'infecté. Le ND
total s'obtient en additionnant les ND de chaque composant — c'est une dérivation de
construction, **le cartouche final ne porte qu'un ND**.

| Champ | Cardinalité | Note |
| ----- | ----------- | ---- |
| Nom | 1 | le générateur impose un « nom du corps » ; un bestiaire sans identifiant est inexploitable |
| Type de corps | 0..1 | chaîne libre — le catalogue de corps est éditorial |
| Instinct | 0..1 | chaîne libre — cinq entrées connues, mais extensibles par le MJ |
| Type d'infecté | 0..1 | chaîne libre |
| ND | 0..1 | entier |
| Description narrative | 0..1 | |
| Caractéristiques | voir ci-dessous | |
| Seuils de santé physiques | 4 | quatre valeurs relevées dans les profils |
| Seuils de santé mentaux | 0..4 | un zombie est immunisé aux attaques mentales |
| Zone de détection | 0..1 | distance en mètres |
| Déplacement | 0..1 | distance en mètres par action |
| Nombre d'actions par round | 0..1 | entier |
| État stimulé | 0..1 | **rejoue les mêmes valeurs, modifiées** |
| Déclencheurs | 0..n | conditions d'activation et de désactivation de l'état stimulé |
| Comportement, actions | 0..n | chaîne libre |
| Traits spéciaux | 0..n | chaîne libre — insensibilité, immunités |
| Équipement | 0..n | |
| Compétences | 0..n | hors formation, comme le PNJ |
| Contagion | 0..1 | voir plus bas |

**Quelles caractéristiques un cartouche zombie porte réellement.** Les profils de
corps donnent les **quatre physiques — FOR, CON, DEX, RAP — plus PER**, et aucune
autre mentale. PER sert la détection des proies. C'est exactement le cas que couvre
une composition « physiques requises, mentales partielles » : elle accepte le zé qui
ne porte que PER comme le prédateur pensant qui porte les huit.

**Un monstre ne porte ni formation, ni classe sociale, ni équipement de départ, ni
bloc Paramètres de jeu.** Il porte en revanche un ND, que le PJ n'a pas.

### Bloc contagion

Dégagé du virus Y, dont il n'est qu'une instance. `part_06_resume.md` documente
d'autres agents — une variante vampirique, un rituel de nécromancie qui n'est pas
viral du tout : le bloc doit donc rester générique.

| Champ | Cardinalité | Note |
| ----- | ----------- | ---- |
| Nom de l'agent | 0..1 | |
| Vecteurs de transmission | 0..n | nom en chaîne libre et probabilité |
| Délai avant effet | 0..1 | |
| Issue de l'infection | 0..1 | |
| Modulation par profil | 0..n | tranche d'âge **ouverte**, pas énumérée |

Les tranches d'âge restent ouvertes : elles diffèrent déjà entre les deux résumés,
et un autre agent en définirait d'autres. La modulation porte un délai de mort et un
délai de réveil, tous deux exprimés en unité de temps libre.

Un monstre non contagieux est un monstre valide : **le bloc entier est optionnel.**

## Incertitudes restantes

1. **D2 — trois ou quatre seuils au cartouche PNJ.** Non tranché. Le schéma
   n'impose pas les quatre.
2. **Attitude du PNJ** — enum fermé ou chaîne libre. Le triplet est donné dans les
   trois formes, mais les exemples le nuancent en clair (« neutre tendance
   méfiant »). Pencher vers la chaîne libre.
3. **Cases « + Armure » et « + Caractère »** — la forme exacte de leur notation sur
   la feuille imprimée n'a pas été relevée ; seule leur existence l'est. Le schéma
   les porte comme une seconde valeur par seuil, ce qui est fidèle au fond sans
   l'être forcément à la présentation.
4. **Le livret PNJ et animaux** (`Z1L05`) n'a pas été ouvert : `template_pnj.md`
   couvrait la forme du cartouche champ par champ. Un profil d'animal pourrait
   porter des champs que ce document ignore.
5. **Ordre des membres d'enum** — aucune source ne le fixe autrement que par la
   table de résolution du d100. L'ordre de cette table est retenu.
