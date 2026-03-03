# LIFTR — Prochaines étapes (plan produit & implémentation)

Ce document définit la suite après les spécifications déjà validées:

- Accueil / Dashboard
- Programme d'entraînement
- Séance active (logging)

Objectif: avancer **section par section**, avec validation à chaque étape, jusqu'à une app mobile utilisable (PWA).

---

## 1) Sections à spécifier ensuite (ordre recommandé)

## Étape 4 — Historique des séances

### Livrables attendus

- Liste chronologique (plus récent en haut)
- Carte séance: date, nom, durée, volume, nb sets, PR, aperçu exos
- Détail complet d'une séance passée
- Actions: relancer séance, modifier, ajouter note, supprimer

### Points métier à figer

- Stratégie d'édition d'une séance passée (versionnement ou overwrite)
- Impact d'une suppression sur les statistiques historiques
- Format de note séance (texte libre + tags optionnels)

### Critère de validation

- L'utilisateur retrouve n'importe quelle séance en < 10s et peut la relancer en 1 tap.

---

## Étape 5 — Statistiques & progression

### Livrables attendus

- Graphiques: volume hebdo, charge max/exercice, fréquence, répartition musculaire
- Période par défaut: 4 dernières semaines
- Comparaison semaine vs semaine (volume + nb séances)
- Focus progression d'un exercice choisi
- Liste PR consolidée

### Points métier à figer

- Définition unique des métriques (volume, fréquence, progression)
- Règles d'agrégation (sets incomplets, exercices poids du corps)
- Politique timezone/date pour les calculs hebdo

### Critère de validation

- Les métriques clés affichées sont cohérentes avec l'historique brut (écart 0).

---

## Étape 6 — Profil & records perso

### Livrables attendus

- Infos personnelles de base
- Suivi métriques corporelles (poids + mensurations)
- Paramètres app (repos défaut, unités kg/lb)
- Export données (JSON/CSV)
- Bouton reset / vider les données

### Points métier à figer

- Fréquence de saisie des métriques corporelles
- Version du format d'export (pour compatibilité future)
- Niveau de confirmation sécurité avant reset global

### Critère de validation

- L'utilisateur peut exporter/importer ses données localement sans perte.

---

## 2) Chantiers transverses après les specs d'écrans

## 2.1 Modèle de données unifié (priorité haute)

- Normaliser les entités communes:
  - Exercise, Program, WorkoutSession, SessionSet, PR, BodyMetric
- Définir IDs stables + migrations de schéma (version de storage)
- Prévoir la compatibilité future backend/sync

## 2.2 Stockage local robuste

- Passer sur IndexedDB (plutôt que localStorage pour volume + fiabilité)
- Mettre en place autosave transactionnel
- Ajouter backup manuel export JSON

## 2.3 Moteur de calcul centralisé

- Isoler les calculateurs:
  - streak,
  - volume,
  - PR,
  - agrégats stats.
- Ajouter tests unitaires sur calculs métier critiques

## 2.4 UX mobile / PWA

- Manifest + icônes + splash
- Service worker offline-first
- Gestion reprise session en background
- Permissions notifications (rappels séances)

---

## 3) Plan d'implémentation concret (sprints)

## Sprint A — Base fonctionnelle utilisable

- Finaliser specs Historique
- Implémenter Historique + détail séance
- Stabiliser modèle de données local

**Résultat attendu:** l'utilisateur peut s'entraîner et revoir ses séances proprement.

## Sprint B — Progression

- Finaliser specs Stats
- Implémenter graphiques + comparaison semaine vs semaine
- Vérifier cohérence calculs avec tests

**Résultat attendu:** l'utilisateur visualise clairement sa progression.

## Sprint C — Personnalisation & données

- Finaliser specs Profil
- Implémenter métriques corporelles + paramètres unités/repos
- Implémenter export JSON/CSV + reset sécurisé

**Résultat attendu:** l'utilisateur contrôle ses données personnelles de bout en bout.

## Sprint D — Qualité app mobile

- PWA installable complète
- Notifications/rappels
- Optimisations performance + accessibilité

**Résultat attendu:** sensation “app normale” sur mobile.

---

## 4) Hébergement & exploitation (coût minimal)

## Phase 1 (low cost)

- Hébergement statique: Cloudflare Pages / Netlify / Vercel
- Données 100% locales (IndexedDB)
- Zéro backend, zéro coût serveur

## Phase 2 (quand sync multi-appareils nécessaire)

- Auth + DB managée (ex: Supabase)
- Sync cloud optionnelle
- Backup automatique chiffré (si activé)

---

## 5) Définition de prêt pour dev (DoR) par section

Avant implémentation d'une section, il faut:

1. User flow validé,
2. États vides/erreurs définis,
3. Règles métier figées,
4. Données d'entrée/sortie listées,
5. Critères d'acceptation testables.

---

## 6) Prochaine section immédiate proposée

### Recommandation

**Commencer maintenant par `Historique des séances`**, car:

- dépend directement de Séance active,
- alimente ensuite les statistiques,
- apporte vite de la valeur utilisateur (revue + relance séance).

### Livrable suivant

- ✅ `docs/historique-spec.md` (créé)
- ✅ `docs/stats-progression-spec.md` (créé)
- Prochain livrable recommandé: `docs/profil-records-spec.md`.
