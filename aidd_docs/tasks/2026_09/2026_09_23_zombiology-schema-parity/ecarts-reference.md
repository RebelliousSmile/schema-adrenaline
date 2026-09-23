# Matrice de parité — références Zombiology et contrat Adrenaline

## Périmètre et convention

Cette matrice compare les trois captures `Design/pj.jpg`, `Design/pnj.jpg` et
`Design/monstre.jpg` au contrat Adrenaline `2.0.0`. Elle ne reproduit ni tables
de règles, ni profils chiffrés, ni texte éditorial. Une ligne est :

- **couverte** quand le contrat porte la donnée durable ;
- **normalisée** quand une valeur écrite simplement devient une plage jouable
  `minimum/current/maximum` à l'import ;
- **état de partie** quand elle évolue pendant une scène et ne doit pas remplacer
  le profil ;
- **rendu** quand elle n'est qu'un choix de mise en page du consommateur ;
- **manque** quand aucune forme portable actuelle ne peut préserver la donnée.

## PJ

| Référence | Contrat actuel | Statut | Décision |
| --- | --- | --- | --- |
| Nom en en-tête | `nom` | couverte | Conserver hors bloc identité. |
| Joueuse/joueur, création, scénario, PX | `parametresDuJeu` | couverte | Conserver optionnel. |
| Trois formations et compétences spécialisées | `formations[]`, `competences[]` | couverte | Les formations portent type, pourcentage et compétences. |
| Total de compétence et caractéristique associée | `competence.caracteristique`, `competence.total` | couverte | Le total est une donnée lue, pas une somme imposée par JSON Schema. |
| Identité imprimée | `identite` | couverte | Conserver les champs libres et facultatifs. |
| Huit caractéristiques et colonne actuelle | `caracteristiques.*` | normalisée | Importer la valeur écrite dans une plage ; documenter la colonne comme état courant, non mise en page. |
| Possessions, armes et équipement favori | `equipement` | couverte | Conserver les listes et armes structurées. |
| Solidité, armure, caractère, boucliers et localisations | `protections` | couverte | Conserver les deux versants et les localisations. |
| Seuils physiques et mentaux, base/couvert | `sante` | couverte | Conserver les seuils lus ; ne pas recalculer. |
| Dés d'adrénaline et de panique | absent | état de partie | Ajouter une couche transitoire commune. |
| Pistes de malus | absent | état de partie | Ajouter des niveaux bornés par versant. |
| États encaissés, localisation et durée | absent | état de partie | Ajouter des entrées localisées et datées/qualifiées. |
| Bandes, colonnes, cases et couleurs | pack Handbook / consommateur | rendu | Ne jamais les encoder dans un document PJ. |

## PNJ

| Référence | Contrat actuel | Statut | Décision |
| --- | --- | --- | --- |
| Rôle ou nom et ND | `nom`, `niveauDeDanger` | couverte | Les deux restent les seuls invariants d'un figurant. |
| Présentation narrative | `description`, `narratif` | couverte | Conserver le contenu MJ séparé des valeurs mécaniques. |
| Caractéristiques complètes ou partielles | `caracteristiques` partiel | couverte | Un figurant peut ne chiffrer qu'une partie. |
| Santé, protections et seuils | `sante`, `protections` optionnels | couverte | Dès que la santé existe, elle reste complète. |
| Formations et compétences hors formation | `formations[]`, `competences[]` | couverte | La séparation correspond à la carte. |
| Équipement notable | `equipement` | couverte | Conserver structuré. |
| Stress, malus et états pendant la scène | absent | état de partie | Réutiliser la couche commune PJ/PNJ/Monstre. |
| Carte compacte, titrage et hiérarchie | pack Handbook / consommateur | rendu | Aucun champ métier ne dépend du gabarit. |

## Monstre

| Référence | Contrat actuel | Statut | Décision |
| --- | --- | --- | --- |
| Nom, corps, instinct, type infecté, ND et description | `nom`, `typeDeCorps`, `instinct`, `typeInfecte`, `niveauDeDanger`, `description` | couverte | Conserver des catalogues ouverts. |
| Physiques et perception, avec mentales facultatives | `caracteristiques` de créature | couverte | Conserver les quatre physiques requises et le mental partiel. |
| Santé, détection, déplacement et actions par round | `sante`, `zoneDeDetection`, `deplacement`, `actionsParRound` | couverte | Conserver le profil de base. |
| Équipement, compétences, comportement, traits et contagion | champs homonymes | couverte | Conserver le contenu de base structuré ou libre selon sa nature. |
| Insensibilité permanente | `traitsSpeciaux` | couverte | Une immunité de profil reste un trait. |
| État actuellement coché | absent | manque | Ajouter un identifiant d'état actif. |
| Plusieurs états nommés et leurs déclencheurs | `etatAlternatif` unique | manque | Remplacer par une collection identifiée, avec compatibilité de lecture. |
| Santé, protections, défense, comportements, équipement, compétences, traits et contagion propres à un état | delta réduit | manque | Autoriser ces remplacements dans un delta explicite. |
| Défense et bonus | absent | manque | Ajouter une défense de créature structurée. |
| Attaque, test, dégâts, effet et condition | seulement texte ou compétence générique | manque | Ajouter des actions de créature structurées ; préserver `competences` pour les tests génériques. |
| État insensible, malus et jauges pendant un combat | `traitsSpeciaux` seulement pour le permanent | état de partie | Porter l'état temporaire dans la couche commune. |
| Présentation à deux cartes, icônes et décor | pack Handbook / consommateur | rendu | Le consommateur utilise l'état résolu et ses capacités publiées. |

## Frontières retenues

1. Le profil est portable, versionné et indépendant de la scène en cours.
2. L'état de partie est optionnel, portable, et ne modifie jamais silencieusement
   le profil de référence.
3. Le fournisseur exporte le résolveur déterministe d'un état de créature ; les
   consommateurs rendent sa sortie sans refaire l'héritage.
4. La mise en page reste déclarée par les packs et appliquée par les consommateurs.
