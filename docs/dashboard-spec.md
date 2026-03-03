# LIFTR — Spécification détaillée de l'écran Accueil / Dashboard

## 1) Objectif de l'écran

L'écran **Accueil / Dashboard** doit offrir en moins de 3 secondes une vue claire de:

- la prochaine action à faire (séance du jour),
- l'état de continuité (streak),
- la charge d'entraînement hebdomadaire (volume semaine),
- le dernier signal fort de progression (dernier PR),
- et un accès direct au démarrage de séance.

Le design cible est **sobre, minimaliste, dark-only**, avec hiérarchie visuelle centrée sur l'action.

---

## 2) Position dans la navigation

- Accessible via l'onglet bas de navigation: **Accueil**.
- C'est l'écran de destination par défaut au lancement de l'app.
- Depuis cet écran, l'utilisateur peut:
  - démarrer une séance planifiée,
  - démarrer une séance rapide,
  - consulter le statut des 7 jours.

---

## 3) Structure UI (ordre de haut en bas)

## 3.1 En-tête

- Titre: `Accueil` (ou `Dashboard`).
- Sous-texte facultatif: date du jour (`Mar. 12 Nov`).
- Actions secondaires optionnelles:
  - bouton vers profil,
  - bouton notifications/rappels (phase ultérieure).

## 3.2 Bloc KPI principal (4 cartes)

Affichage en grille 2x2 sur mobile.

1. **Prochaine séance**
   - Valeur principale: nom de la séance du jour (`Push A`, `Lower`, etc.)
   - Sous-texte: heure prévue ou mention `À faire aujourd'hui`.

2. **Streak**
   - Valeur: nombre de jours consécutifs (`12 jours`).
   - Sous-texte: `Dernière séance: hier`.

3. **Volume semaine**
   - Valeur: total hebdo (`34 250 kg`).
   - Sous-texte: variation vs semaine précédente (`+8%`).

4. **Dernier PR**
   - Valeur: exercice + perf (`Développé couché 90 kg x 5`).
   - Sous-texte: date (`il y a 2 jours`).

## 3.3 Bandeau des 7 jours

- Composant horizontal compact sur 7 colonnes.
- États visuels par jour:
  - **fait** (séance complétée),
  - **à venir** (jour planifié non fait),
  - **repos**,
  - **aujourd'hui** (accent visuel lime).
- Interaction:
  - tap sur un jour = ouvre le détail de la journée (ou redirection Programme/Historique selon l'état).

## 3.4 CTA principal

- Bouton pleine largeur: **Démarrer la séance du jour**.
- Si aucune séance prévue: bouton devient **Démarrage rapide**.
- Position: visible sans scroll sur la plupart des écrans mobiles.

## 3.5 Zone contexte (optionnelle v1)

- Message court intelligent:
  - `Tu es à 1 séance de battre ton streak.`
  - `Objectif volume hebdo atteint à 72%.`

---

## 4) États fonctionnels du Dashboard

## 4.1 État nominal (avec données)

Tous les blocs sont alimentés: prochaine séance, streak, volume, PR, bande 7 jours, CTA actif.

## 4.2 État premier lancement (aucune donnée)

- KPI affichent valeurs neutres:
  - prochaine séance: `Aucune séance planifiée`,
  - streak: `0 jour`,
  - volume: `0 kg`,
  - PR: `Aucun record`.
- Bande 7 jours en mode neutre.
- CTA principal: `Créer mon premier programme` (redirige vers Programme).

## 4.3 État sans programme mais avec historique

- Prochaine séance: `Non planifiée`.
- KPI streak/volume/PR calculés depuis l'historique.
- CTA: `Démarrage rapide`.

## 4.4 État hors ligne

- Aucune dépendance serveur obligatoire en v1.
- Badge discret `Mode local` possible.
- Toutes les données affichées depuis stockage local.

---

## 5) Règles métier (calcul des KPI)

## 5.1 Prochaine séance

1. Chercher une séance planifiée pour aujourd'hui dans les programmes actifs.
2. Si plusieurs programmes actifs ont un jour aujourd'hui:
   - priorité à celui marqué `principal`;
   - sinon le plus récemment utilisé.
3. Si aucune séance planifiée:
   - proposer `Démarrage rapide`.

## 5.2 Streak

- Définition: nombre de jours consécutifs avec au moins une séance validée.
- Un jour sans séance planifiée de type repos **n'interrompt pas** le streak.
- Un jour planifié entraînement sans séance validée **interrompt** le streak.

## 5.3 Volume semaine

- Somme sur semaine courante (lundi -> dimanche) de `poids * reps` par set validé.
- Pour exercices poids du corps sans charge:
  - volume = `0` en v1, ou
  - option v2: charge équivalente estimée (non activée par défaut).

## 5.4 Dernier PR

- PR détecté lors de validation de set/séance.
- Priorité d'affichage:
  1. PR de charge max absolue,
  2. PR de reps à charge donnée,
  3. PR de volume exercice.
- Afficher le **plus récent** parmi les PR détectés.

---

## 6) Interactions détaillées

- Tap KPI `Prochaine séance` -> ouvre détail du jour de programme.
- Tap KPI `Streak` -> ouvre Historique filtré sur continuité (option v1.1).
- Tap KPI `Volume` -> ouvre Statistiques (vue hebdo).
- Tap KPI `Dernier PR` -> ouvre Profil/Records ou Stats PR.
- Tap CTA principal -> lance flow `Séance active`.

Micro-interactions:

- animation légère (150–250ms) au chargement des KPI,
- retour haptique léger sur CTA (si supporté),
- accent couleur lime pour l'élément actionnable principal.

---

## 7) Spécifications visuelles (mobile-first)

- **Theme**: dark-only.
- **Palette**:
  - fond `#0C0C0E`,
  - surface `#111114`,
  - texte principal `#E8E8F0`,
  - accent `#C8F060`.
- **Typo**:
  - Titres: Syne (700),
  - métriques: Geist Mono (500 possible).
- **Spacing**:
  - grille base 4px,
  - paddings carte 12–16px,
  - gap vertical sections 12–20px.
- **Rayons**:
  - cartes 14–20px.
- **Lisibilité**:
  - contraste WCAG AA minimum sur texte d'information.

---

## 8) Données nécessaires (schéma logique)

## 8.1 Entrées minimales

- `programs[]`
  - id, name, active, days[] (weekday, workoutTemplateId, isRest)
- `workouts[]`
  - id, dateStart, dateEnd, programId?, workoutName, sets[]
- `sets[]`
  - exerciseId, reps, weight, isCompleted, createdAt
- `prs[]`
  - exerciseId, type, value, reps?, weight?, achievedAt
- `bodyMetrics[]` (non utilisé directement ici mais disponible)

## 8.2 Sorties calculées Dashboard

- `nextWorkout`
- `currentStreak`
- `weeklyVolume`
- `weeklyVolumeDelta`
- `lastPR`
- `weekStrip[7]`
- `primaryCTA` (`start_planned` | `quick_start` | `create_program`)

---

## 9) Performance & UX technique

- Temps de rendu cible dashboard: < 300ms après ouverture écran (données locales).
- Calcul KPI via sélecteurs mémorisés (éviter recalcul complet à chaque rendu).
- Chargement progressif:
  1. shell UI,
  2. KPI,
  3. bande 7 jours.
- Fallback sans animation si appareil en mode économie (`prefers-reduced-motion`).

---

## 10) Accessibilité

- Taille cible touch: minimum 44x44 px.
- Libellés accessibles (aria-label) sur toutes cartes cliquables.
- Ne pas coder l'état uniquement par couleur (ajouter icône/texte pour fait/repos/à venir).
- Support lecteurs d'écran pour valeurs KPI (`Streak: 12 jours consécutifs`).

---

## 11) Tracking produit (optionnel, privacy-first)

Événements recommandés:

- `dashboard_viewed`
- `dashboard_cta_tapped`
- `dashboard_kpi_open_next_workout`
- `dashboard_weekstrip_day_tapped`

Contraintes:

- opt-in analytics,
- aucune donnée sensible en clair,
- mode local sans tracking externe par défaut en v1.

---

## 12) Critères d'acceptation (Definition of Done)

1. Le Dashboard affiche correctement les 4 KPI demandés.
2. Le bouton principal est toujours cohérent avec l'état de planification.
3. La bande 7 jours distingue clairement fait/à venir/repos/aujourd'hui.
4. Les KPI se mettent à jour immédiatement après la fin d'une séance.
5. Le rendu reste lisible sur largeur 320px.
6. Aucun blocage si aucune donnée n'existe (état vide complet).
7. L'écran est utilisable hors ligne avec données locales.

---

## 13) Découpage implémentation recommandé

### Lot 1 (MVP Dashboard)

- UI statique + navigation CTA
- calcul `nextWorkout`, `currentStreak`, `weeklyVolume`
- bande 7 jours simple

### Lot 2

- `lastPR` + delta hebdo
- états vides avancés
- interactions vers écrans détaillés

### Lot 3

- micro-animations
- tracking analytics opt-in
- optimisations perf avancées
