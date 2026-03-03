# LIFTR — Spécification détaillée de la section Historique des séances

## 1) Objectif

La section **Historique des séances** doit permettre de:

- retrouver rapidement les séances passées,
- comprendre le contenu d'une séance en un coup d'œil,
- ouvrir le détail complet au tap,
- relancer une séance précédente,
- modifier, annoter ou supprimer une séance.

Objectif UX: rendre la revue des entraînements aussi fluide que le logging.

---

## 2) Navigation & positionnement

- Accès via onglet bas: **Historique**.
- Affichage par défaut: **liste simple** (plus récent en haut).
- Interaction principale:
  - tap sur carte -> écran détail séance.

Entrées secondaires:

- depuis Dashboard (kpi/quick link),
- depuis Stats (tap sur un point/une semaine),
- retour depuis détail séance vers liste en conservant la position scroll.

---

## 3) Vue liste — cartes de séance

## 3.1 Données visibles sur chaque carte

Chaque carte affiche:

1. **Date + nom séance**
   - ex: `Lun 12 Mai · Push A`
2. **Durée + volume total**
   - ex: `52 min · 18 340 kg`
3. **Nombre de séries**
   - ex: `24 séries`
4. **PR battus pendant la séance**
   - ex: `2 PR`
5. **Exercices réalisés (liste courte)**
   - ex: `DC, Dév incliné, Élév latérales...`
6. **Note séance** (aperçu 1 ligne, optionnel)

## 3.2 Actions rapides par carte

- Tap carte -> détail complet.
- Menu `...`:
  - `Modifier la séance`,
  - `Ajouter / éditer une note`,
  - `Relancer la séance`,
  - `Supprimer` (confirmation).

## 3.3 État de liste

- Ordre: `dateStart DESC`.
- Pagination/chargement progressif à partir de 30 éléments (v1.1).
- Si aucun historique:
  - message vide + CTA `Démarrer ma première séance`.

---

## 4) Vue détail d'une séance passée

## 4.1 Header détail

- Nom séance
- Date/heure début-fin
- Durée
- Actions:
  - `Relancer`,
  - `Modifier`,
  - `Supprimer`

## 4.2 Résumé haut de page

- Volume total
- Nombre de séries complétées
- Nombre d'exercices
- PR obtenus (liste courte)

## 4.3 Bloc exercices & sets

Pour chaque exercice:

- nom exercice,
- note exercice (si existe),
- tableau des sets historiques:
  - set #,
  - kg,
  - reps,
  - marqueur PR si applicable.

## 4.4 Notes

- Note globale séance (texte libre)
- édition inline ou via modal.

---

## 5) Règles métier

## 5.1 Suppression séance

- Action destructive avec confirmation en 2 étapes:
  1. confirmation simple,
  2. rappel impact stats (`volume`, `streak`, `PR éventuels`).
- Suppression retire la séance des:
  - Historique,
  - agrégats Stats,
  - sources de calcul Dashboard.

## 5.2 Modification séance

Deux stratégies possibles (à figer):

1. **Overwrite** (v1 recommandé): la séance est modifiée directement.
2. **Versionnée** (v2): conserver un log d'édition.

Règle v1:

- après modification, recalculer immédiatement:
  - volume séance,
  - PR liés,
  - métriques hebdo.

## 5.3 Relancer la même séance

- Crée une nouvelle `WorkoutSession` pré-remplie avec:
  - même liste d'exercices,
  - mêmes cibles sets/reps/repos si disponibles,
  - sans recopier les résultats passés.

## 5.4 Notes

- Notes autorisées:
  - note globale séance,
  - note par exercice.
- Taille max recommandée: 2 000 caractères par champ (v1).

---

## 6) Filtres & recherche (v1.1)

- Recherche texte:
  - nom séance,
  - nom exercice,
  - note.
- Filtres:
  - période (7j, 4 semaines, 3 mois, personnalisé),
  - programme,
  - séance avec PR uniquement.

---

## 7) Modèle de données (logique)

```ts
WorkoutHistoryItem {
  id: string
  workoutSessionId: string
  name: string
  dateStart: ISODate
  dateEnd: ISODate
  durationSec: number
  totalVolume: number
  totalSetsCompleted: number
  totalExercises: number
  prCount: number
  exercisePreview: string[]
  note?: string
  programId?: string
}

WorkoutSessionDetail {
  id: string
  name: string
  dateStart: ISODate
  dateEnd: ISODate
  durationSec: number
  note?: string
  exercises: Array<{
    exerciseId: string
    name: string
    note?: string
    sets: Array<{
      order: number
      weight: number
      reps: number
      completed: boolean
      isPR?: boolean
      prTypes?: Array<"weight" | "reps_at_weight" | "volume">
    }>
  }>
}
```

---

## 8) États spéciaux

## 8.1 État vide

- Illustration/placeholder minimal,
- texte: `Aucune séance enregistrée pour le moment`,
- CTA principal: `Démarrer une séance`.

## 8.2 État erreur données corrompues

- Message explicite + bouton `Restaurer depuis export` (si disponible),
- fallback lecture seule si reconstruction partielle possible.

## 8.3 État hors ligne

- Fonctionnement 100% local (IndexedDB/localStorage),
- aucune dépendance réseau en v1.

---

## 9) Performance

- Temps d'affichage de la liste initiale < 250ms (données locales).
- Ouverture détail séance < 150ms perçues.
- Scroll fluide sur 500+ séances (virtualisation v1.2 si nécessaire).

---

## 10) Accessibilité

- Cartes cliquables >= 44x44 min par zone actionnable.
- Labels lecteurs d'écran:
  - `Séance Push A du 12 mai, 52 minutes, 24 séries`.
- Ne pas dépendre uniquement de la couleur pour PR (ajouter texte/icône).
- Support police système agrandie sans casser la carte.

---

## 11) Critères d'acceptation (DoD)

1. L'historique affiche les séances en ordre décroissant de date.
2. Chaque carte contient date+nom, durée+volume, nb séries, PR, aperçu exos.
3. Le tap sur carte ouvre un détail complet avec tous les sets.
4. L'utilisateur peut supprimer une séance avec confirmation.
5. L'utilisateur peut modifier une séance passée.
6. L'utilisateur peut relancer la même séance en 1 action.
7. L'utilisateur peut ajouter/modifier une note de séance.
8. Les suppressions/modifications mettent à jour Dashboard + Stats.
9. L'écran reste fonctionnel sans connexion réseau.

---

## 12) Découpage implémentation recommandé

### Lot 1 (MVP Historique)

- Liste simple + ordre décroissant
- Carte avec informations clés
- Détail séance (lecture)
- Relancer séance

### Lot 2

- Modification séance + notes
- Suppression avec confirmations et recalculs
- Mise à jour temps réel Dashboard/Stats

### Lot 3

- Filtres & recherche
- Pagination/virtualisation avancée
- Résilience corruption + restauration améliorée
