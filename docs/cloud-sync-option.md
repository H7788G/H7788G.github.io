# LIFTR — Option cloud (auth + sync multi-appareils)

## Objectif

Ajouter un mode cloud optionnel sans casser le mode local-first.

## Architecture recommandée (phase 2)

- Auth: Supabase Auth (email + social)
- DB: Postgres (Supabase)
- Stratégie sync: offline-first avec file d'ops (`pendingOps[]`)
- Conflits: Last-write-wins + horodatage serveur

## Entités à synchroniser

- profile
- settings
- programs
- history
- prs
- metrics
- customExercises

## Sécurité

- Row-level security par `user_id`
- Chiffrement TLS en transit
- Export local toujours disponible

## Rollout

1. Ajouter login optionnel
2. Créer endpoint sync pull/push
3. Ajouter résolution de conflits
4. Activer sync auto paramétrable
