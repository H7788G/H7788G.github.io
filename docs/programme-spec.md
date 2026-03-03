# LIFTR — Spécification détaillée de la section Programme d'entraînement

## 1) Objectif

La section **Programme d'entraînement** permet de:

- visualiser rapidement les programmes existants,
- entrer dans le détail d'un programme au tap,
- créer, modifier, archiver ou supprimer un programme,
- gérer plusieurs programmes en parallèle,
- structurer les jours (entraînement/repos) avec exercices, séries, reps, repos cibles.

Le flux doit rester **mobile-first, simple et rapide**, pour éviter toute friction avant une séance.

---

## 2) Navigation

- Accès via onglet bas: **Programme**.
- Vue par défaut: **liste des programmes**.
- Navigation en 2 niveaux:
  1. Liste des programmes,
  2. Détail d'un programme (tap sur la carte).

---

## 3) Vue liste des programmes

## 3.1 Éléments à afficher par carte

Chaque carte programme affiche:

- **Nom du programme** (`PPL Hypertrophie`, `Full Body 3x`, etc.),
- **Jours associés** (abréviations Lun/Mar/… ou tags `Push A`, `Pull A`, etc.),
- **Nombre d'exercices par jour** (format compact, ex: `Lun: 6 ex · Mar: repos · Mer: 5 ex`).

## 3.2 Statut et badges

- Badge `Actif` / `Archivé`.
- Badge optionnel `Principal` (programme prioritaire pour la suggestion de séance du jour).
- Nombre de séances complétées sur 4 semaines (option v1.1).

## 3.3 Actions rapides

- Tap carte -> ouvrir détail.
- Appui long (optionnel) -> menu rapide:
  - marquer principal,
  - archiver,
  - supprimer.
- Bouton fixe bas de liste: **Créer un programme**.

## 3.4 États de la liste

- **État vide**: message + CTA `Créer mon premier programme`.
- **État avec programmes actifs**: actifs en haut, archivés en bas (ou filtre).
- **État recherche/filtre** (v1.1): recherche par nom et filtre actif/archivé.

---

## 4) Vue détail d'un programme

## 4.1 En-tête détail

- Nom du programme (éditable).
- Meta:
  - nb de jours actifs,
  - nb total d'exercices,
  - date de dernière modification.
- Actions:
  - `Éditer`,
  - `Archiver`/`Désarchiver`,
  - `Supprimer` (confirmation obligatoire).

## 4.2 Structure hebdomadaire

Affichage sectionné par jour de semaine (ou jours custom ordonnés):

- Jour type entraînement:
  - nom du jour (`Push B`),
  - liste d'exercices ordonnable,
  - paramètres cibles par exercice (séries/reps/repos).
- Jour de repos:
  - bloc repos explicite avec style distinct.

## 4.3 Actions dans le détail

- Ajouter un jour (`+ Ajouter un jour`).
- Réordonner les jours.
- Ajouter/supprimer/réordonner exercices d'un jour.
- Modifier paramètres d'un exercice.
- Dupliquer un jour (v1.1).

---

## 5) Création / Édition d'un programme

## 5.1 Champs minimum programme

- `Nom du programme` (obligatoire),
- `Statut` (actif/archivé),
- `Principal` (booléen).

## 5.2 Création d'un jour

Pour chaque jour:

- `Nom` (ex: Push A),
- `Type`: entraînement ou repos,
- `Jour semaine` (facultatif en mode template libre),
- `Exercices[]` (si entraînement).

## 5.3 Paramètres par exercice

- Nom d'exercice,
- Séries cibles (int),
- Reps cibles (`8-12` ou fixe),
- Repos cible (secondes),
- Notes de consigne (optionnel),
- Type groupement (normal / superset / circuit).

## 5.4 Règles de validation

- Impossible d'enregistrer un programme sans nom.
- Un jour entraînement doit contenir >= 1 exercice.
- Séries/reps/repos doivent être > 0 (si renseignés).
- Confirmation obligatoire avant suppression définitive.

---

## 6) Règles métier

## 6.1 Plusieurs programmes en parallèle

- Plusieurs programmes peuvent être actifs simultanément.
- Un seul programme peut être `principal` à un instant donné.
- Si aucun principal n'est défini:
  - fallback sur le plus récemment utilisé.

## 6.2 Séance du jour

La séance proposée au démarrage est issue:

1. du programme principal,
2. puis du jour correspondant à la date,
3. sinon fallback sur démarrage rapide.

## 6.3 Archivage vs suppression

- **Archivage**: conserve l'historique lié et masque de la vue active.
- **Suppression**: retire définitivement la structure du programme (avec confirmation forte).
- Historique de séances passées reste conservé en v1 (découplé du template).

---

## 7) Composants UI nécessaires

- `ProgramCard`
- `ProgramStatusBadge`
- `DayChip`
- `DaySection`
- `ExerciseRowEditable`
- `ReorderHandle`
- `AddProgramButton`
- `ProgramEditorModal` (ou écran dédié)
- `ConfirmDialog`

---

## 8) Modèle de données (logique)

```ts
Program {
  id: string
  name: string
  isActive: boolean
  isArchived: boolean
  isPrimary: boolean
  createdAt: ISODate
  updatedAt: ISODate
  days: ProgramDay[]
}

ProgramDay {
  id: string
  label: string          // Push A, Rest, etc.
  weekday?: number       // 0-6 si planification calendaire
  isRest: boolean
  order: number
  exercises: ProgramExercise[]
}

ProgramExercise {
  id: string
  exerciseId: string
  customName?: string
  setsTarget: number
  repsTarget: string     // ex: "8-12"
  restSeconds: number
  note?: string
  groupType?: "normal" | "superset" | "circuit"
  order: number
}
```

---

## 9) UX & performance

- Ouverture liste < 200ms (données locales).
- Édition sans latence perceptible (<100ms action UI).
- Autosave local à chaque modification significative.
- Undo court (5–10s) après suppression d'exercice/jour (v1.1).

---

## 10) Accessibilité

- Cibles tactiles >= 44x44.
- Ordre de tab cohérent en édition.
- Labels explicites pour lecteurs d'écran (`Supprimer exercice Développé couché`).
- Confirmation avec texte clair sur action destructive.

---

## 11) Critères d'acceptation (DoD)

1. L'utilisateur peut créer un programme complet depuis zéro.
2. L'utilisateur peut ouvrir la liste puis accéder au détail au tap.
3. Les cartes affichent nom + jours + nombre d'exercices/jour.
4. L'utilisateur peut ajouter/réordonner/supprimer des exercices dans un jour.
5. L'utilisateur peut définir séries/reps/repos cibles par exercice.
6. L'utilisateur peut archiver et supprimer un programme.
7. La section gère plusieurs programmes actifs en parallèle.
8. Les données persistent en local après fermeture/réouverture de l'app.

---

## 12) Découpage implémentation recommandé

### Lot 1 (MVP Programme)

- Liste + détail au tap.
- Création programme + ajout jours + ajout exercices.
- Édition paramètres séries/reps/repos.

### Lot 2

- Réordonnancement jours/exercices.
- Archivage/suppression avec confirmations.
- Gestion du programme principal.

### Lot 3

- Filtres/recherche.
- Dupliquer jour / dupliquer programme.
- Undo avancé et optimisations UX.
