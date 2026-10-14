# Relevé des écarts : feuille de PJ à jour et contrat `pj`

Tâche 1 de la phase 5 du plan `adrenaline-cartes-et-fiche-pj` (dépôt `obsidian-handbook`, `aidd_docs/tasks/2026_10/2026_10_10_adrenaline-cartes-et-fiche-pj/phase-5.md`). Rien n'est modifié dans `src/`, `schemas/`, `examples/` ni `tools/`.

## Sources lues

- Feuille : coffre Zombiology, `_sources/aides-de-jeu/Z1A01_Feuille de PJ pretires.pdf`, 12 pages, six prétirés, chacun une page de portrait puis une page « Feuille de PJ ». Lues ligne à ligne : p. 2 (Mary Sauvé, feuille) et p. 1 (son portrait) ; p. 4 (Darryl Bylilly) et p. 3 (son portrait) ; zone Équipement et Santé des p. 6, 8, 10 et 12 pour contrôler les variantes (armure renseignée, listes d'armes, seuils). Les p. 5, 7, 9, 11 (portraits des quatre autres) n'ont pas été lues.
- Page déposée : `fiche-pj-a-jour.jpg` est la page 2 du PDF (Mary Sauvé), 150 ppp.
- Contrat : `src/zod/adrenaline/pj.ts` et `src/zod/common/{identite,etat-de-partie,protections,sante,equipement,formations,degats,localisations}.ts` ; présentation : `PJ_PRESENTATION` dans `src/presentation.ts` (lignes 360 à 643). Pour ce que la forme imprime réellement, lecture seule du rendu de Handbook (`src/features/adrenalinePj/renderer.ts`) : la présentation ne publie ni libellés de niveau de seuil ni textes de légende, ils sont dans le consommateur.
- Convention de nommage du dossier : `AAAA_MM/AAAA_MM_JJ_slug` (même convention que `2026_10_02_fiche-monstre-maquette`).

## Décisions du plan prises comme acquises (non rouvertes)

Dés de la table des armes sociales tous jaunes ; identité fermée par défaut et en fin de fiche ; champ `parametresDuJeu.scenario` ; lignes de possessions et d'armes physiques réglées par l'alignement ; blessures recopiées de la feuille ; la feuille fait foi sur la présentation publiée (dés de stress près des caractéristiques, choc en cinq cercles « round », total 1 à 9 puis « HS », divers en quatre cercles, « Avantages et immunités ») ; l'identité garde tous ses champs et reçoit contraintes, historique, personnalité ; `equipement.armesMentales` sort du contrat PJ, la table des armes sociales prend sa place.

## 1. Zone par zone : la feuille (page « Feuille de PJ »)

Légende : « Tranché » = couvert par une décision du plan. « Écart » = la feuille et le contrat ou la présentation divergent. Chemins du contrat relatifs à `/`.

### Zone 1, Paramètres de jeu (haut gauche) et en-tête

| Zone de la feuille | Champ du contrat | Bloc `PJ_PRESENTATION` | Constat |
| --- | --- | --- | --- |
| « Joueuse / Joueur » (ligne libre) | `/parametresDuJeu/joueur` | `entete` > `parametres-jeu` | Conforme. |
| « Type de création » (écrit : ÉQUITABLE) | `/parametresDuJeu/typeDeCreation` (`equitable` ou `aleatoire`) | `parametres-jeu` | Conforme. |
| « Type de scénario » (écrit : ONE-SHOT) | `/parametresDuJeu/typeDeScenario` (`one-shot` ou `campagne`) | `parametres-jeu` (libellé « Type de scénario ») | Conforme au libellé de la feuille. Le croquis du plan l'appelle « Format » : la feuille imprime « Type de scénario ». |
| Cadre « PX » (vide) | `/parametresDuJeu/px` | `entete` > `px` | Conforme. |
| Sous-titre fixe « FORMAT : « ONE-SHOT » 1 PAGE PORTRAIT » sous le logo | absent | absent | Texte imprimé fixe de cette édition ; aucun champ ne le porte. Voir point ouvert 10. |
| Aucune zone « Scénario » en texte libre | `parametresDuJeu.scenario` à créer (tâche 2) | libellé « Scénario » à ajouter (tâche 3) | Tranché le 2026-10-11, non rouvert. À noter : cette feuille n'imprime aucun champ de ce nom ; il vient de la demande #101. |
| (rien) | `/parametresDuJeu/declinaisonDeCampagne` | masqué (`hiddenPaths`) | Présent au contrat, absent de la feuille ; le commentaire du contrat le dit déjà. Rien à faire. |
| Cartouche « Nom du PJ » (6) | `/nom` | `entete` > `nom` | Conforme. |

### Zone 2, Compétences

| Zone de la feuille | Champ du contrat | Bloc | Constat |
| --- | --- | --- | --- |
| Trois colonnes « Formation ① ② ③ » : en-tête avec nom entre parenthèses et pourcentage. Libellés imprimés : « Classe sociale ( … ) », « Professionnelle ( … ) », « Loisirs » | `/formations[].type` (`classe-sociale`, `professionnelle`, `personnelle`), `.nom`, `.pourcentage` | `competence` > `formations-competences` (forme `formation-columns`, `formationTypes` des trois types) | Conforme en structure. Deux détails : la troisième colonne s'intitule « Loisirs » sans parenthèses à remplir (`nom` est requis au contrat, l'exemple publié écrit `nom = "Loisirs"`), voir point ouvert 13 ; trois colonnes, une par type, conforme. |
| Cinq lignes de compétences par colonne : « NOM (Spécialité) » et pourcentage | `/formations[].competences[].nom`, `.specialite`, `.pourcentage` | `formation-columns`, `formationFields.competence` | Conforme. Le contrat n'a pas de borne de cinq lignes (place sur le papier). |
| (aucune caractéristique ni total par compétence) | `.caracteristique`, `.total` | `formationFields.competence` imprime `caracteristique` | Présent au contrat et à la présentation, absent de la feuille. Écart nouveau, couvert par le principe « la feuille fait foi » : ne pas imprimer la caractéristique. Le champ reste déclaré. |
| (rien sous la compétence) | `.degats`, `.action`, `.notes` | non imprimés | Présents au contrat, absents de la feuille (usage PNJ). |
| (aucune ligne d'avantages sous la compétence) | `.avantages` | non imprimé | Présent au contrat, absent de la feuille ; la feuille range les avantages dans « Avantages et immunités » (zone 4). Voir point ouvert 8. |
| Note fixe sous le bloc : « Si vous utilisez une compétence de substitution, le test subit un malus de -10 % » | absent | absent | Texte de règle imprimé. Voir point ouvert 10. |

### Zone 3, Caractéristiques et Stress

| Zone de la feuille | Champ du contrat | Bloc | Constat |
| --- | --- | --- | --- |
| « Carac. physiques » : Force, Constitution, Dextérité, Rapidité, une seule case de pourcentage chacune | `/caracteristiques/{for,con,dex,rap}` (triplet `minimum`, `current`, `maximum`) | `caracteristique` > `caracteristiques-physiques`, `rangeDisplay: [minimum, current]` | Écart nouveau : la feuille imprime une seule valeur, la présentation en imprime deux (création, actuelle). Voir point ouvert 2. |
| « Carac. mentales » : Logique, Volonté, Perception, Charisme | `/caracteristiques/{log,vol,per,cha}` | `caracteristiques-mentales` | Idem. |
| Note fixe « Marcher (qualité de RAP) ; Courir (Marcher × 3) » sous la colonne physique | absent | absent | Texte de règle imprimé. Voir point ouvert 10. |
| « Stress, dés de stress » à droite des caractéristiques : colonne « Adrénaline » (+1d100 Favorable, +2d100 Favorable) et colonne « Panique » (+1d100 Défavorable, +2d100 Défavorable), un cercle par ligne | `/etatDePartie/stress/adrenaline`, `/panique` (compteurs) | `sante` > `stress` (forme `stress-dice`) | Écart confirmé : le bloc est dans la santé sur la présentation, à côté des caractéristiques sur la feuille (tranché). Écart nouveau : la feuille imprime « +1d100 / +2d100 » dans les deux colonnes, y compris « Défavorable » ; la présentation publie `-1d100`, `-2d100` pour le défavorable. Couvert par le principe « la feuille fait foi ». Voir aussi point ouvert 7. |

### Zone 4, Équipement

| Zone de la feuille | Champ du contrat | Bloc | Constat |
| --- | --- | --- | --- |
| « Armes physiques » : trois lignes, ex. « MAINS NUES 1d10 Choquante », « ARME DE POING (6) 3d10 (Blessante, Perforante, Fatale 9+, Discrète) 40 m » | `/equipement/armesPhysiques[]` : `nom`, `pourcentage`, `desDeDegats` (nombre), `type`, `notes` | `equipement` > `armes-physiques` (`weapon-lines`, décoration d10) | La ligne de la feuille ne porte aucun pourcentage (présent au contrat, absent de la feuille) et porte une nature des dégâts (Choquante, Blessante) et des propriétés que `Arme` ne sait mettre que dans `notes` : `Arme` n'a pas de champ de nature (elle existe dans `NatureDeDegats`, pour les profils de `Degats` des compétences). Voir point ouvert 9. |
| « Armes mentales » : trois lignes, « SOCIALE 1d10 (Choquante, Influence) » | `/equipement/armesMentales[]` | `armes-mentales` | Tranché : le champ sort du contrat, la table des armes sociales prend sa place. Cette feuille imprime encore la colonne (confirmé). |
| « Possessions » : trois lignes pointillées | `/equipement/possessions[]` et `/equipement/equipementFavori` | `possessions` (`ruled-list`) | Conforme. La feuille ne distingue pas l'équipement favori : il apparaît dans « Avantages et immunités » sous la mention « (favorite) ». |
| « Protections physiques » : « Armure : » une ligne libre (ex. « PROTÈGE AVANT-BRAS (T&P -3) ») | `/protections/physiques/armure` : `nom`, `des`, `points`, `localisations`, `couverture`, `proprietes`, `reduction` | `protections-physiques` (`protection-lines`) | Contrat plus riche que la feuille, qui ne porte qu'une ligne de texte. |
| « Localisations corporelles » : six lignes, plage de d10 (1, 2, 3-4, 5-6, 7-8, 9-0), nom (Jambe D, Jambe G, Torse, Bras faible, Bras fort, Tête), trois cases, la case couverte est croisée | `/protections/physiques/armure/localisations[]` (énumération des six) | `protection-lines` imprime la liste des localisations en texte (« torse, bras fort ») sur la ligne Armure, d'après `renderProtectionLines` ; aucune grille des six localisations, aucun d10, aucune case | Écart confirmé : le contrat porte la donnée, la forme `protection-lines` n'imprime pas la grille de la feuille. Les plages de d10 ne sont ni au contrat ni à la présentation (texte fixe). Voir points ouverts 10 et 11. |
| « Protections mentales » : « Caractère : TIMIDE » (ligne libre) | `/protections/mentales/caractere` : `trait`, `des`, `points`, `localisations`, `emotions`, `proprietes`, `reduction` | `protections-mentales` (`protection-lines`) | Le nom du trait est imprimé (« Caractère » avec le trait puis les localisations en texte) : confirmé. |
| « Localisations émotionnelles » : six lignes, plage de d10, trois cases, croisées si couvertes. Ordre imprimé : Culpabilité 1, Tristesse 2, Colère 3-4, Impuissance 5-6, Anxiété 7-8, Peur 9-0 | `/protections/mentales/caractere/localisations[]` (énumération des six) | idem | Même constat que les corporelles. L'ordre de l'énumération du contrat (anxiété, impuissance, colère, tristesse, peur, culpabilité) n'est pas l'ordre imprimé : sans conséquence tant que le bloc imprime selon l'ordre de la feuille. |
| (aucune zone Solidité) | `/protections/{physiques,mentales}/solidite` (requis) | `protection-lines` imprime « Solidité » | Présent au contrat et à la présentation, absent de la feuille : sur toutes les feuilles lues, le premier seuil (« LÉGER ») vaut la Solidité (Mary : 8 en physique ; Darryl 5, 5). Voir point ouvert 1. |
| (aucune zone Bouclier) | `/protections/*/bouclier` : `nom`, `proprietes` | `protection-lines` imprime « Bouclier » | Présent au contrat et à la présentation, absent de la feuille : le bouclier y figure comme avantage (« Bouclier personnel (Censure Intimidation) », p. 6 ; « Bouclier personnel (Censure Négociation) », p. 10). Voir point ouvert 8. |
| « Avantages et immunités » : liste numérotée ①②③ plus deux lignes libres, à droite des protections | aucun champ au niveau de l'équipement. Voisins : `/formations[].competences[].avantages[]`, `/equipement/equipementFavori`, `/protections/*/bouclier` | absent (aucun bloc) | Écart confirmé : bloc de l'équipement sur la feuille, absent de la présentation. Voir point ouvert 8. |

### Zone 5, Santé

| Zone de la feuille | Champ du contrat | Bloc | Constat |
| --- | --- | --- | --- |
| « Seuils physiques » : quatre lignes, « LÉGER 1 malus », « MODÉRÉ 2 malus », « GRAVE 3 malus », « PROFOND 4 malus », une seule valeur par ligne (Mary : 8, 17, 22, 27) | `/sante/physique/{superficiel,leger,grave,profond}` : `base`, `couvert` | `sante` > `seuils-physiques` (`threshold-rows`) | Écart nouveau, voir « Seuils à quatre niveaux » plus bas : noms des niveaux, nombre de malus, et une seule valeur imprimée là où le contrat a `base` et `couvert` (Handbook imprime les colonnes « Base » et « + Armure »). Points ouverts 1 et 3. |
| « Seuils mentaux » : mêmes quatre niveaux (Mary : 5, 10, 15, 20) | `/sante/mental/{…}` | `seuils-mentaux` | Idem (colonne « + Caractère » côté Handbook). |
| « États » : grand cadre blanc vide | `/etatDePartie/etats[]` (physique, mental, général) | `sante` > `etats-encaisses` (`status-frames`) | Conforme. |
| « Malus » > « Blessures physiques » : un cadre rouge, deux colonnes de quatre cercles (HEURE, JOUR, SEMAINE, MOIS), grand espace blanc sous les cercles | aucun champ. `Malus` dit seulement que « les blessures et les états ont leur propre emplacement » ; `EtatEncaissé.duree` est un texte libre | aucun bloc | Écart confirmé : aucun champ ni bloc. Le relevé montre donc un champ de blessure manquant (`etat-de-partie.ts`, tâche 2.3). Voir point ouvert 6. |
| « Blessures mentales » : même cadre | aucun champ | aucun bloc | Idem. |
| « Choc » (jaune) : cinq cercles verticaux, légende « ROUND » en pied | `/etatDePartie/malus/choc/rounds` (0 à 5) et `/heures` (0 à 5) | `choc` (`shock-circles`, deux groupes `rounds` et `heures`, cinq cercles chacun) | Écart confirmé : cinq cercles « round » sur la feuille, deux groupes sur la présentation. Le champ `heures` n'a aucune contrepartie sur la feuille : voir point ouvert 5. |
| « Divers » (brun) : quatre cercles verticaux, aucune ligne de texte | `/etatDePartie/malus/divers` (texte libre) | `divers` (`status-frames`, cadre de texte) | Écart nouveau : quatre cercles imprimés, contre un texte libre au contrat. Voir point ouvert 4. |
| « Total des malus » : 1 2 3 / 4 5 6 / 7 8 9 / HS, mention « 1 malus = -10 % » | `/etatDePartie/malus/total` (0 à 10, « à 10 malus, le personnage subit l'état HS ») | `total-malus` (`malus-scale`, `from 1`, `to 10`) | Écart confirmé : la feuille va de 1 à 9 puis « HS », la présentation de 1 à 10. Le contrat est compatible (10 = HS) : seul l'échelle de la présentation change. |
| Pied de page fixe (mention légale Zombiology) | absent | absent | Texte imprimé fixe, hors périmètre. |

### Seuils à quatre niveaux, vérifiés contre la feuille

| Feuille (physique et mental) | Malus imprimés | Clé du contrat | Libellé imprimé par Handbook |
| --- | --- | --- | --- |
| LÉGER | 1 malus | `superficiel` | Superficiel |
| MODÉRÉ | 2 malus | `leger` | Léger |
| GRAVE | 3 malus | `grave` | Grave |
| PROFOND | 4 malus | `profond` | Profond |

Vérifié sur Mary (physique 8, 17, 22, 27 ; Solidité physique inférée de la première valeur, FOR 40, CON 50 : 8 + 4 + 5 = 17, puis +5 et +10) et sur Darryl (5, 10, 15, 20 ; FOR 20, CON 30 : 5 + 2 + 3 = 10). La correspondance est donc positionnelle : le premier niveau de la feuille est `superficiel`, le deuxième est `leger`. Conséquences : quatre niveaux, comme au contrat ; les noms de la feuille (Léger, Modéré, Grave, Profond) ne sont pas ceux du contrat ni de Handbook (le mot « léger » désigne le premier niveau sur la feuille et le deuxième au contrat) ; le nombre de malus (1, 2, 3, 4) n'est publié nulle part. La présentation ne publie pas de libellés de niveau : ils sont codés dans le consommateur.

## 2. Page de portrait (une par prétiré)

| Zone du portrait | Champ du contrat | Bloc | Constat |
| --- | --- | --- | --- |
| Nom en titre | `/nom` | `nom` | Conforme. |
| Étiquette de profil (« GRIMPEUSE », « SAGE-FEMME ») | absent (la formation professionnelle porte le même mot sur la feuille : « Professionnelle ( GRIMPEUSE ) ») | absent | Absent. Voir point ouvert 12. |
| Phrase fétiche entre guillemets (« Comme toujours, ma vie ne tient qu'à un fil. ») | absent | absent | Absent. Voir point ouvert 12. |
| « Description physique » : paragraphe libre (âge, corpulence, visage, cheveux) | absent comme texte ; voisins : les neuf champs d'`identite` (nationalité, genre, cheveux, âge, yeux, taille, peau, poids, signes particuliers) | `identite` (`identity-fields`) | Absent comme paragraphe. Aucun champ d'identité n'est imprimé sur la feuille, seulement des fragments dans ce texte. Voir point ouvert 12. |
| « Historique » : paragraphe libre | `identite.historique` à créer (tâche 2) | à créer (tâche 3) | Tranché : ajout facultatif. |
| Section titrée sur un objet emblématique (« La corde », « La trousse de soins ») avec illustration | absent | absent | Absent. Voir point ouvert 12. |
| (aucune zone « contraintes », aucune zone « personnalité ») | `identite.contraintes`, `identite.personnalite` à créer | à créer | Tranché le 2026-10-11, non rouvert. À noter : le portrait et la feuille des six prétirés lus n'ont pas de telles zones (la source est #101). |
| Neuf champs d'identité (nationalité…) | `/identite/*` | `identite` | Présents au contrat, absents de la feuille et du portrait en tant que champs. Tranché : ils restent dans la section Identité. |

## 3. Dans l'autre sens : chaque champ du contrat `pj`

| Champ du contrat | Sur la feuille ? | Bloc qui le porte |
| --- | --- | --- |
| `nom` | oui (6) | `nom` |
| `identite.{nationalite, genre, cheveux, age, yeux, taille, peau, poids, signesParticuliers}` | non (texte libre du portrait) | `identite` |
| `caracteristiques.<8>.{minimum, current, maximum}` | oui, une seule valeur ; `maximum` jamais imprimé (le contrat le dit) | `caracteristiques-physiques`, `caracteristiques-mentales` |
| `sante.{physique,mental}.<4 niveaux>.base` | oui, une valeur par niveau | `seuils-physiques`, `seuils-mentaux` |
| `sante.{physique,mental}.<4 niveaux>.couvert` | non | `threshold-rows` (colonne « + Armure » ou « + Caractère » côté Handbook) |
| `protections.physiques.solidite`, `protections.mentales.solidite` | non (valeur du premier seuil) | `protection-lines` |
| `protections.physiques.armure.nom`, `.des`, `.points`, `.proprietes`, `.reduction`, `.couverture` | une ligne de texte « Armure : » | `protection-lines` |
| `protections.physiques.armure.localisations` | oui (six lignes avec cases) | `protection-lines`, en texte seulement |
| `protections.mentales.caractere.trait` | oui (« Caractère : ») | `protection-lines` |
| `protections.mentales.caractere.localisations` | oui (six lignes avec cases) | `protection-lines`, en texte seulement |
| `protections.mentales.caractere.{des, points, emotions, proprietes, reduction}` | non | `protection-lines` (points) |
| `protections.*.bouclier.{nom, proprietes}` | non (rangé dans les avantages) | `protection-lines` |
| `formations[].{type, nom, pourcentage}` | oui | `formations-competences` |
| `formations[].competences[].{nom, specialite, pourcentage}` | oui | idem |
| `formations[].competences[].{caracteristique, total, degats, action, avantages, notes}` | non | idem (imprime `caracteristique`) |
| `equipement.possessions` | oui | `possessions` |
| `equipement.equipementFavori` | non (mention « (favorite) » dans les avantages) | `possessions` |
| `equipement.armesPhysiques[].{nom, desDeDegats, type, notes}` | oui (texte libre) | `armes-physiques` |
| `equipement.armesPhysiques[].pourcentage` | non | `armes-physiques` |
| `equipement.armesMentales` | oui (colonne imprimée) | sort du contrat |
| `parametresDuJeu.{joueur, typeDeCreation, typeDeScenario, px}` | oui | `parametres-jeu`, `px` |
| `parametresDuJeu.declinaisonDeCampagne` | non | masqué |
| `etatDePartie.stress.{adrenaline, panique}` | oui (quatre cercles) | `stress` |
| `etatDePartie.malus.choc.rounds` | oui (cinq cercles) | `choc` |
| `etatDePartie.malus.choc.heures` | non | `choc` (second groupe) |
| `etatDePartie.malus.divers` | oui (quatre cercles, pas de texte) | `divers` |
| `etatDePartie.malus.total` | oui (1 à 9, HS) | `total-malus` |
| `etatDePartie.etats[]` | oui (cadre « États ») | `etats-encaisses` |
| `meta` | non | masqué |

Note de documentation : le commentaire de `PersonnageJoueur` dit que les « dés de stress, malus et états encaissés » ne sont pas stockés, alors que `etatDePartie` les déclare tous trois. À rectifier en tâche 2 si l'on touche à ce fichier.

## 4. Écarts « déjà vus » du plan : confirmés ou infirmés

| Écart du plan | Verdict | Constat |
| --- | --- | --- |
| Dés de stress à côté des caractéristiques sur la feuille, dans la santé sur la présentation | Confirmé | Bloc « Stress » à droite des caractéristiques (zone 3). Nouveau : signe « + » imprimé pour le défavorable, présentation en `-1d100`, `-2d100`. |
| Choc : cinq cercles « round » ; deux groupes (rounds, heures) sur la présentation | Confirmé | Un seul groupe de cinq cercles sur la feuille. Reste le champ `heures` (point ouvert 5). |
| Total des malus de 1 à 9 puis « HS » ; 1 à 10 sur la présentation | Confirmé | Le contrat (0 à 10, 10 = HS) n'a pas à changer. |
| « Avantages et immunités » bloc de l'équipement, absent de la présentation | Confirmé, et aggravé | Absent aussi du contrat comme champ propre (point ouvert 8). |
| Blessures par durée : aucun bloc publié | Confirmé, et aggravé | Aucun champ non plus (point ouvert 6). |
| Localisations cochées et caractère dans `protection-lines` | Partiellement infirmé | Le caractère (trait) est imprimé. Les localisations sont imprimées en liste de texte sur la ligne Armure ou Caractère, jamais comme les six lignes de la feuille avec plage de d10 et trois cases. Le contrat porte bien la donnée. |

## 5. Écarts nouveaux, non listés au plan

1. Stress défavorable : « +1d100 / +2d100 » sur la feuille, `-1d100 / -2d100` à la présentation.
2. Caractéristiques : une seule valeur imprimée (la présentation en imprime deux).
3. Seuils : noms des niveaux, nombre de malus, une valeur au lieu de `base` plus `couvert`.
4. Divers : quatre cercles imprimés, texte libre au contrat.
5. Competence : la feuille n'imprime ni caractéristique ni total par compétence.
6. Armes physiques : la feuille porte la nature (Choquante, Blessante) et les propriétés, `Arme` n'a pas de champ de nature ; aucun pourcentage sur la feuille.
7. Solidité et bouclier : contrat et présentation les portent, la feuille non.
8. Troisième formation intitulée « Loisirs » (sans nom à remplir).
9. Trois cases par localisation : sémantique de la 2e et de la 3e case non établie.

## 6. Points ouverts

Ce que la feuille montre et qu'aucune décision du plan ne tranche. Rien n'est choisi ici. Chaque point attend un arbitrage de l'utilisateur, à reporter au tableau « Decisions » du plan.

**1. Libellés et malus des seuils (quatre niveaux).**
La feuille imprime Léger (1 malus), Modéré (2), Grave (3), Profond (4). Le contrat nomme `superficiel`, `leger`, `grave`, `profond` ; la correspondance est positionnelle (`superficiel` imprimé « Léger », `leger` imprimé « Modéré »). La présentation ne publie ni libellé ni nombre de malus : Handbook code « Superficiel, Léger, Grave, Profond ».
Question : comment la présentation publiée doit-elle dire les niveaux ?
- a. Garder les clés du contrat et publier dans la présentation un libellé et un nombre de malus par niveau (Léger 1, Modéré 2, Grave 3, Profond 4).
- b. Renommer les clés du contrat sur la feuille (rupture de contrat, avec chemin de lecture de l'ancien nom).
- c. Ne rien publier : le consommateur garde ses libellés actuels, qui divergent de la feuille.

**2. Caractéristiques : une seule valeur sur la feuille.**
La feuille imprime une case par caractéristique ; le contrat a `minimum` (création), `current`, `maximum` ; la présentation affiche `minimum` et `current`.
Question : que doit imprimer la fiche publiée ?
- a. Seulement la valeur actuelle (`current`).
- b. Seulement la valeur de création (`minimum`).
- c. Les deux, comme aujourd'hui, au risque de s'écarter de la feuille.

**3. Seuils : la valeur « couverte ».**
La feuille imprime une valeur par niveau ; le contrat porte `base` et `couvert` (Handbook imprime « Base » et « + Armure » ou « + Caractère »).
Question : la fiche publiée imprime-t-elle la colonne couverte ?
- a. Non : une valeur (`base`) par niveau, `couvert` reste déclaré mais n'est pas imprimé.
- b. Oui, comme aujourd'hui, en s'écartant de la feuille.
- c. Oui, mais seulement quand `couvert` est saisi.

**4. Divers : quatre cercles, mais un texte libre au contrat.**
La feuille imprime quatre cercles dans « Divers », sans ligne de texte ; le contrat porte `divers` en texte libre. Aucun champ ne dit combien de cercles sont cochés.
Question : que porte le contrat ?
- a. Un compteur facultatif de 0 à 4 en plus du texte `divers`.
- b. Le compteur remplace le texte (rupture).
- c. Les cercles s'impriment vides et le texte reste le seul champ.

**5. Choc : le champ `heures`.**
La feuille ne montre que cinq cercles « round » ; le contrat a `choc.rounds` et `choc.heures` (cinq cercles « heure »).
Question : que devient `heures` ?
- a. Il reste déclaré, non imprimé.
- b. Il sort du contrat (rupture, avec chemin de lecture de l'ancienne forme).
- c. Il reste déclaré et la présentation continue de l'imprimer en second groupe.

**6. Blessures par durée : forme du champ, et sens des cercles.**
Deux cadres (physiques, mentales), chacun en deux colonnes de quatre cercles (heure, jour, semaine, mois) plus un grand espace blanc sous les cercles. Aucun champ au contrat. La feuille ne dit pas ce qu'un cercle compte, ni ce que l'espace blanc accueille ; la règle est dans le livre, que ce relevé n'a pas consulté.
Question : quelle forme de saisie ?
- a. Des compteurs par durée (jusqu'à deux cochés par durée, d'après les deux colonnes), par versant.
- b. Une liste d'entrées par versant, avec la durée et un texte libre (l'espace blanc).
- c. Les deux : compteurs pour les cercles, texte libre pour l'espace.
- d. Autre forme, à indiquer.

**7. Dés de stress : correspondance cercles et compteurs.**
La feuille a quatre cercles : deux par colonne (+1d100 et +2d100). Le contrat porte un compteur par colonne (`adrenaline`, `panique`) ; le rendu de Handbook coche le cercle d'indice inférieur au compteur (compteur 2 : les deux cercles).
Question : un compteur de 2 coche-t-il les deux cercles ou seulement le second ?
- a. Les deux (comportement actuel).
- b. Seulement le cercle du niveau (1 = +1d100, 2 = +2d100).

**8. « Avantages et immunités » : où vit la donnée.**
Le bloc imprime une liste numérotée de lignes libres (« Gestion du stress (Athlétisme) », « Matériel d'escalade (favorite) », « Bouclier personnel (Censure Intimidation) »). Le contrat n'a pas de champ de ce niveau. Voisins : `competences[].avantages`, `equipementFavori`, `protections.*.bouclier`.
Question : de quoi le bloc se nourrit-il ?
- a. Un champ neuf facultatif, `equipement.avantages` (liste de lignes), le bloc le lit seul.
- b. Le bloc agrège `competences[].avantages`, `equipementFavori` et les boucliers déjà déclarés, sans champ neuf.
- c. Un champ neuf, et l'agrégation en plus.

**9. Armes physiques : nature et propriétés des dégâts.**
Les lignes de la feuille portent « Choquante » ou « Blessante » et des propriétés (Perforante, Fatale 9+, Discrète…). `Arme` ne sait mettre cela que dans `notes` ou `type`. Aucun pourcentage n'est imprimé.
Question : comment saisir la nature d'une arme physique ?
- a. Un champ `nature` facultatif sur `Arme` (énumération `choquante`, `blessante` existante).
- b. Dans `notes`, texte libre, sans champ neuf.
- c. Aucun changement : la feuille de PJ n'est pas la référence pour ces lignes.

**10. Quatre ensembles de textes fixes de la feuille.**
La feuille imprime : « Si vous utilisez une compétence de substitution, le test subit un malus de -10 % » ; « Marcher (qualité de RAP) ; Courir (Marcher × 3) » ; « 1 malus = -10 % » ; les plages de d10 (1, 2, 3-4, 5-6, 7-8, 9-0) devant les localisations ; et le sous-titre « FORMAT : « ONE-SHOT » 1 PAGE PORTRAIT ». Aucun n'est publié.
Question : la présentation publiée porte-t-elle ces textes ?
- a. Oui, comme la note de la table des armes sociales (contenu publié).
- b. Non : seule la structure est publiée, les textes restent au consommateur.
- c. Une partie seulement (à désigner).

**11. Grille des localisations (six lignes, trois cases).**
La feuille imprime six lignes avec trois cases ; seule la première case est croisée sur toutes les feuilles lues, jamais la deuxième ou la troisième ; le sens des deux autres cases n'est pas établi. La forme `protection-lines` n'imprime qu'une liste de texte.
Question : que doit publier la présentation ?
- a. Un bloc dédié de six lignes avec trois cases, la première croisée selon `localisations`.
- b. Compléter `protection-lines` pour imprimer la grille.
- c. Ne rien changer : la liste de texte suffit.
- d. Autre ; à préciser avec le sens des trois cases (non lu).

**12. Page de portrait : ce qui n'a pas de champ.**
Le portrait porte en plus de l'historique : une étiquette de profil (« GRIMPEUSE »), une phrase fétiche, un paragraphe « Description physique » et un objet emblématique (« La corde ») avec son texte. Le plan ne retient que l'historique, les contraintes et la personnalité.
Question : lesquels de ces quatre éléments le contrat doit-il porter ?
- a. Aucun de plus que les trois champs décidés.
- b. Description physique en texte libre (les neuf champs d'identité restent).
- c. Description physique, phrase fétiche, étiquette de profil, objet emblématique, tous facultatifs (à désigner un par un).

**13. Troisième formation intitulée « Loisirs ».**
Le troisième type du contrat est `personnelle` ; la feuille l'imprime « Loisirs » et ne prévoit pas de nom à saisir (la case est remplie de « Loisirs » dans l'exemple publié). `nom` est requis.
Question : que porte la fiche ?
- a. Le libellé de la présentation devient « Loisirs » pour ce type ; `nom` reste requis.
- b. Le libellé est « Loisirs » et `nom` devient facultatif pour ce type seul.
- c. Rien ne change : `nom` saisi à la main, libellé non publié.

Les écarts qui suivent un principe déjà tranché (la feuille fait foi) ne sont pas des points ouverts : signe du défavorable, caractéristique par compétence non imprimée, échelle du total, un seul groupe de cercles pour le choc, bloc stress près des caractéristiques.

## 7. Ce qui n'a pas pu être lu ou fait

- Cases à cocher des localisations : seul le premier cercle est croisé, la signification des deux autres cases est illisible depuis la feuille (renvoi au livre).
- Les portraits des prétirés 3 à 6 (p. 5, 7, 9, 11 du PDF) n'ont pas été lus ; les quatre pages de feuille correspondantes (p. 6, 8, 10, 12) l'ont été sur Équipement et Santé seulement (choc, divers, total et blessures sont identiques à ceux de la p. 2).
- Aucune règle du livre n'a été consultée : le sens des cercles de blessures, la règle du stress et celle de l'armure sont à confirmer par l'utilisateur.
