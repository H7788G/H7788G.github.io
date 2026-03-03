# LIFTR — Spécification détaillée de la section Séance active (logging)

## 1) Objectif

La section **Séance active** doit permettre un logging ultra-rapide, sans friction, pendant l'entraînement réel:

- démarrer une séance depuis le Dashboard ou un Programme,
- saisir séries, reps, charge en temps réel,
- déclencher automatiquement le timer de repos,
- afficher les données précédentes utiles à la progression,
- détecter les PR en direct,
- gérer supersets/circuits et ajustements en cours de séance.

---

## 2) Entrées dans le flow

L'utilisateur peut démarrer une séance via:

1. **Dashboard**: `Démarrer la séance du jour` ou `Démarrage rapide`,
2. **Programme**: tap sur un jour d'entraînement,
3. **Historique**: `Relancer la même séance`.

À l'ouverture, la séance active doit créer un objet `WorkoutSession` en statut `in_progress`.

---

## 3) Layout de l'écran (haut -> bas)

## 3.1 Barre supérieure sticky

- Bouton retour (avec confirmation si modifications non sauvegardées).
- Nom de la séance (éditable optionnel).
- Timer de séance global (`00:37:12`) en cours.

## 3.2 Bandeau timer de repos sticky (persistant)

Exigence clé:

- **Toujours visible en haut** dès qu'un repos est actif.

Fonctionnalités:

- démarrage auto quand une série est cochée,
- temps restant,
- modifier le timer pendant le repos (+15s / -15s / champ manuel),
- skip,
- alerte fin de repos (son + vibration si autorisé).

## 3.3 Liste des exercices de séance

Pour chaque exercice:

- nom + groupe musculaire,
- rappel dernière séance (`Dernier: 80 x 8, 80 x 7, 75 x 8`),
- note libre exercice,
- tableau des séries:
  - index set,
  - champs `kg` et `reps`,
  - case `fait`,
  - action annuler/supprimer la série.

Actions au niveau exercice:

- ajouter une série,
- supprimer une série,
- swap exercice en cours,
- ajouter note,
- marquer en superset/circuit.

## 3.4 Actions globales en bas

- `+ Ajouter exercice`
- `Terminer séance`
- `Abandonner` (confirmation forte)

---

## 4) Règles fonctionnelles clés

## 4.1 Autosave

- Chaque modification de set (kg/reps/check) est sauvegardée localement immédiatement.
- Aucune perte de données en cas de fermeture app ou crash.

## 4.2 Logique de check série

Quand une série passe à `faite`:

1. valider set,
2. recalculer volume séance,
3. lancer timer de repos auto selon cible exercice,
4. déclencher check PR en temps réel,
5. feedback visuel immédiat.

Quand décochée:

- annuler son impact sur stats,
- annuler PR éventuel lié à ce set si non valide,
- ne pas relancer timer automatiquement.

## 4.3 Timer de repos

- Valeur par défaut = `restSeconds` de l'exercice.
- Si absent, fallback paramètre profil (`defaultRestSeconds`).
- Le dernier ajustement manuel utilisateur peut devenir la nouvelle valeur du set suivant (option paramétrable).

## 4.4 PR temps réel

Détection à chaque set validé:

- PR charge max absolue,
- PR reps à charge donnée,
- PR volume set.

Feedback:

- badge `NEW PR` sur la ligne set/exercice,
- toast discret,
- marqueur persistant dans résumé fin de séance.

## 4.5 Superset / circuit

- Exercices peuvent partager un `groupId`.
- En superset:
  - les exercices groupés sont visuellement liés,
  - le timer se déclenche à la fin du bloc (ou selon réglage utilisateur).

---

## 5) Interactions détaillées

- Tap champ `kg`/`reps` -> clavier numérique.
- Swipe gauche sur série -> supprimer (avec undo court 5s).
- Appui long exercice -> menu contextuel (`swap`, `dupliquer`, `supprimer`).
- Tap `+ Ajouter exercice` -> modal recherche exercice (base + custom).
- Tap `Terminer séance` -> écran résumé avant validation finale.

---

## 6) Écrans/états spéciaux

## 6.1 État vide (démarrage rapide sans template)

- Liste vide + CTA `Ajouter votre premier exercice`.

## 6.2 État interruption

- Si séance en cours détectée au relancement app:
  - proposition `Reprendre la séance en cours`.

## 6.3 État permissions refusées (son/vibration)

- Timer fonctionne quand même,
- fallback visuel fort (pulse + changement couleur) en fin de repos.

---

## 7) Modèle de données (logique)

```ts
WorkoutSession {
  id: string
  source: "dashboard" | "program" | "history"
  programId?: string
  workoutTemplateId?: string
  name: string
  startedAt: ISODate
  endedAt?: ISODate
  status: "in_progress" | "completed" | "abandoned"
  exercises: SessionExercise[]
  totalVolume: number
  totalSetsCompleted: number
  durationSec: number
}

SessionExercise {
  id: string
  exerciseId: string
  name: string
  note?: string
  restSeconds?: number
  groupType?: "normal" | "superset" | "circuit"
  groupId?: string
  sets: SessionSet[]
}

SessionSet {
  id: string
  order: number
  weight: number
  reps: number
  completed: boolean
  completedAt?: ISODate
  isPR?: boolean
  prTypes?: Array<"weight" | "reps_at_weight" | "volume">
}
```

---

## 8) Résumé de fin de séance

Avant confirmation finale, afficher:

- durée totale,
- volume total,
- nombre de séries complétées,
- PR battus (liste),
- notes globales optionnelles.

Actions:

- `Valider et enregistrer`,
- `Retour à la séance`,
- `Abandonner`.

---

## 9) Performance & robustesse

- Input -> persist local < 50ms ressenti.
- Scroll fluide sur longues séances (20+ exercices).
- Timer repos précis (drift max toléré: <1s par minute).
- Reprise instantanée après background app.

---

## 10) Accessibilité

- Cibles tactiles >= 44x44.
- Contraste élevé en dark mode.
- Labels explicites (`Cocher série 3 développé incliné`).
- Retour haptique non bloquant (toujours doublé d'un signal visuel).

---

## 11) Critères d'acceptation (DoD)

1. Une séance peut être démarrée depuis Dashboard et Programme.
2. L'utilisateur peut saisir kg+reps et cocher chaque série.
3. Le timer de repos se lance automatiquement à la validation d'une série.
4. Le timer est visible en permanence pendant le repos et modifiable.
5. Les données de la séance précédente sont affichées par exercice.
6. Les PR sont détectés et signalés en temps réel.
7. L'utilisateur peut ajouter/swap exercice pendant la séance.
8. L'utilisateur peut annuler/supprimer une série sans corrompre les stats.
9. La séance peut être terminée et enregistrée avec résumé final.
10. La séance en cours est récupérable après fermeture/reouverture app.

---

## 12) Découpage implémentation recommandé

### Lot 1 (MVP logging)

- Démarrer séance + liste exercices + saisie sets.
- Timer séance global.
- Autosave local.

### Lot 2

- Timer repos auto sticky + alertes fin repos.
- Affichage données dernière séance.
- Résumé fin de séance.

### Lot 3

- PR temps réel.
- Supersets/circuits.
- Swap exercice + undo avancé.
