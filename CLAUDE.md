@AGENTS.md
# Vantik — instructions pour Claude

Application de gestion intelligente d'entreprise. Stack : Next.js (App Router,
TypeScript) + PostgreSQL + Prisma.

## Architecture obligatoire : clean architecture en couches

Structure de dossiers a respecter STRICTEMENT :

- `src/app/` — **Presentation**. Pages, layouts, composants React.
  Ne contient JAMAIS de logique metier ni d'acces direct a la base de donnees.
- `src/application/` — **Application** (use cases / orchestration), ex :
  `creerProduit.ts`, `ajusterStock.ts`, `genererRecommandationReappro.ts`.
  Appelle le domain. Ne contient pas la logique metier elle-meme.
  Ne connait pas Prisma directement.
- `src/domain/` — **Domain**. Entites, regles metier pures (ex : calcul du
  seuil d'alerte, calcul de la quantite de reapprovisionnement), et
  interfaces de repositories (ex : `ProduitRepository`). AUCUNE dependance
  vers Next.js, Prisma, ou toute autre librairie d'infrastructure.
  Uniquement du TypeScript pur.
- `src/infrastructure/` — **Infrastructure**. Implementations concretes :
  client Prisma, repositories qui implementent les interfaces du domain,
  jobs planifies (previsions IA).

## Regle de dependance (a respecter strictement)

Les imports ne vont que vers l'interieur : `app` → `application` → `domain`.

- Le `domain` n'importe JAMAIS depuis `application`, `infrastructure` ou `app`.
- L'`infrastructure` implemente les interfaces definies dans le `domain`,
  mais le `domain` n'importe jamais l'infrastructure directement
  (inversion de dependance).
- Aucun import de Prisma ni de la base de donnees dans `app/` ou
  `application/` — toujours passer par une interface de repository du
  domain, implementee dans `infrastructure/`.

## Contexte metier

Application multi-tenant : chaque entreprise cliente a son propre espace de
donnees, isole via une colonne `entrepriseId` sur (presque) toutes les tables.
Modules principaux : utilisateurs et roles, produits et categories (attribut
simple sur Entreprise, pas une table separee), stock et mouvements,
fournisseurs et commandes (achats et ventes), charges, alertes, et un module
IA qui genere des previsions de demande et des recommandations de
reapprovisionnement.

Le modele de donnees complet est dans `prisma/schema.prisma` — toujours s'y
referer avant de creer une nouvelle entite.

## Comportement attendu de Claude

1. Avant d'ecrire du code, dire explicitement dans quelle couche il va vivre.
2. Si une regle metier apparait dans une Server Action ou un composant React,
   c'est une erreur : la deplacer dans `src/domain/services/`.
3. Ne jamais importer Prisma ou la base de donnees directement dans `app/`
   ou `application/`.
4. Le domain doit rester testable sans base de donnees ni serveur.
5. Si on demande d'ajouter une fonctionnalite, proposer d'abord dans
   quelle(s) couche(s) elle doit etre implementee avant d'ecrire le code.
