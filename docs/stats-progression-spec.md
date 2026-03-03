# LIFTR — Spécification détaillée de la section Statistiques & Progression

## 1) Objectif

La section **Statistiques & Progression** doit transformer les données de séances en insights actionnables:

- visualiser les tendances d'entraînement,
- suivre les progrès par exercice,
- comparer les périodes (semaine vs semaine),
- centraliser les records personnels (PR),
- rendre les métriques compréhensibles en un coup d'œil mobile.

Période par défaut demandée: **4 dernières semaines**.

---

## 2) Navigation

- Accès via onglet bas: **Stats**.
- Entrées secondaires:
  - depuis Dashboard (tap KPI volume / PR),
  - depuis Historique (filtre par période).
- La période active est persistée localement (`lastStatsRange`).

---

## 3) Structure UI (haut -> bas)

## 3.1 Barre de contrôle

- Sélecteur période:
  - `4 semaines` (défaut),
  - `8 semaines`,
  - `3 mois`,
  - `Personnalisé`.
- Filtres optionnels:
  - programme,
  - groupe musculaire,
  - exercice spécifique.

## 3.2 Cartes synthèse

- **Volume total période**
- **Nombre de séances**
- **Fréquence moyenne** (jours/semaine)
- **Variation vs période précédente**

## 3.3 Graphiques principaux (obligatoires)

1. **Volume par semaine** (bar chart)
2. **Charge max par exercice** (line chart)
3. **Fréquence d'entraînement** (jours/semaine)
4. **Répartition musculaire** (bar/stacked chart)

## 3.4 Comparaison semaine vs semaine

Bloc comparatif:

- volume semaine N vs N-1,
- nb séances N vs N-1,
- delta absolu + delta %,
- tendance (`en hausse`, `stable`, `en baisse`).

## 3.5 Progression exercice ciblé

- Sélecteur exercice
- Courbe de progression:
  - charge max,
  - volume,
  - reps à charge donnée (si applicable)
- Affichage des meilleurs sets récents.

## 3.6 Liste des PR

- Liste chronologique des PR sur la période
- Détail: exercice, type PR, valeur, date
- Tap -> ouvre séance source dans Historique

---

## 4) Règles métier des métriques

## 4.1 Volume

- Volume set = `weight * reps` si `set.completed=true`.
- Volume séance = somme des sets validés.
- Volume semaine = somme des séances de la semaine ISO.

Cas poids du corps:

- v1: volume = 0 si charge absente,
- v1.1: option "charge estimée" paramétrable.

## 4.2 Fréquence d'entraînement

- Nombre de jours distincts contenant >= 1 séance complétée.
- Calculé par semaine.

## 4.3 Charge max par exercice

- Pour chaque exercice: max(`weight`) sur sets complétés.
- En cas d'égalité, conserver le plus récent en référence.

## 4.4 Répartition musculaire

- Agrégation par groupe musculaire principal de l'exercice.
- Pondération v1: par **nombre de sets complétés**.
- Option v2: pondération par volume.

## 4.5 Comparaison semaine vs semaine

- Semaine courante = semaine ISO de la date locale utilisateur.
- Semaine précédente = ISO -1.
- Delta %:

`deltaPct = ((current - previous) / max(previous, 1)) * 100`

## 4.6 PR consolidés

Types de PR supportés:

- `weight` (charge absolue),
- `reps_at_weight`,
- `volume` (set ou exercice selon règle commune).

---

## 5) États d'écran

## 5.1 État nominal

- Tous les graphiques rendus avec données période.

## 5.2 État peu de données

- Message: `Pas assez de données pour cette période`.
- Fallback visuel simplifié (cartes + mini graphes).

## 5.3 État vide total

- CTA: `Commencer une séance`.
- Messages pédagogiques sur les métriques qui apparaîtront.

## 5.4 État hors ligne

- Fonctionnement local complet,
- badge discret `Mode local` optionnel.

---

## 6) Interactions clés

- Tap barre d'une semaine -> filtre Historique sur la semaine.
- Tap point courbe exercice -> affiche set source + bouton `Voir séance`.
- Changement de période -> recalcul instantané des agrégats.
- Changement exercice ciblé -> mise à jour de la courbe sans rechargement global.

---

## 7) Modèle de données (sorties calculées)

```ts
StatsViewModel {
  range: { start: ISODate; end: ISODate; preset: string }
  summary: {
    totalVolume: number
    totalWorkouts: number
    avgFrequencyPerWeek: number
    volumeDeltaPct: number
  }
  weeklyVolume: Array<{ weekKey: string; volume: number }>
  weeklyFrequency: Array<{ weekKey: string; daysTrained: number }>
  maxLoadByExercise: Array<{ exerciseId: string; exerciseName: string; points: Array<{ date: ISODate; maxWeight: number }> }>
  muscleDistribution: Array<{ muscleGroup: string; setCount: number; sharePct: number }>
  weekOverWeek: {
    current: { volume: number; workouts: number }
    previous: { volume: number; workouts: number }
    delta: { volumeAbs: number; volumePct: number; workoutsAbs: number; workoutsPct: number }
  }
  prs: Array<{ date: ISODate; exerciseId: string; exerciseName: string; type: string; value: number; workoutSessionId: string }>
}
```

---

## 8) Performance

- Changement de période < 200ms perçu (données locales).
- Rendering des graphes principaux < 300ms.
- Métriques calculées via sélecteurs memoïzés.
- Cache des séries temporelles par période/exercice.

---

## 9) Accessibilité

- Contraste AA min sur axes, labels et courbes.
- Chaque graphe possède une alternative texte résumée.
- Navigation clavier/lecteur écran sur filtres et listes PR.
- Les tendances ne reposent pas uniquement sur la couleur (icône + texte).

---

## 10) Tracking produit (optionnel)

Événements utiles:

- `stats_viewed`
- `stats_range_changed`
- `stats_exercise_selected`
- `stats_pr_opened`
- `stats_week_bar_tapped`

Respect privacy:

- opt-in analytics,
- pas de PII dans payload.

---

## 11) Critères d'acceptation (DoD)

1. La période par défaut est `4 dernières semaines`.
2. Les 4 graphiques demandés sont disponibles et lisibles.
3. Le volume et la fréquence sont cohérents avec l'Historique brut.
4. La comparaison semaine vs semaine est correctement calculée.
5. L'utilisateur peut suivre la progression d'un exercice choisi.
6. Les PR sont listés et reliés à leur séance source.
7. L'écran fonctionne hors ligne avec données locales.
8. Les états vide/peu de données sont pris en charge sans erreur UI.

---

## 12) Découpage implémentation recommandé

### Lot 1 (MVP Stats)

- Cartes synthèse + volume hebdo + fréquence
- Période par défaut 4 semaines
- Comparaison semaine vs semaine (volume/séances)

### Lot 2

- Charge max par exercice
- Répartition musculaire
- Liste PR consolidée + lien vers historique

### Lot 3

- Filtres avancés (programme/muscle)
- Période personnalisée
- Optimisations performance/cache + a11y renforcée
