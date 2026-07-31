# Vantik — feuille de route

Ce fichier liste chaque fonctionnalite du cahier des charges avec son statut
reel. A mettre a jour a chaque fois qu'une fonctionnalite avance — c'est ce
qui permet a Claude Code de savoir exactement ou en est le projet sans
qu'on ait a tout re-expliquer a chaque session.

Legende : ✅ termine et teste | 🚧 en cours | ⬜ pas commence

## Fondations

- ✅ Projet Next.js scaffolde, connecte a GitHub
- ✅ Schema Prisma complet (voir prisma/schema.prisma)
- ✅ Architecture clean architecture en place (voir CLAUDE.md)
- ✅ Direction design definie (voir DESIGN.md)

## Authentification et comptes

- ✅ Inscription (creer une entreprise + son premier administrateur)
- ✅ Connexion / deconnexion, session par cookie JWT
- ✅ Protection des routes (dashboard) via middleware
- ✅ Ajouter un utilisateur EMPLOYE a une entreprise existante (admin
  seulement) — page /utilisateurs, liste des membres + creation
- ⬜ Modifier/desactiver un utilisateur existant
- ⬜ Reinitialisation de mot de passe

## Entreprise

- ✅ Parametres de l'entreprise (nom, adresse, devise, typeMetier,
  categorie, logo, couleurs) — reserve aux administrateurs

## Produits et stock

- ✅ CRUD Produits complet (inclut la definition du seuilAlerte par produit
  — pas un ecran separe, c'est un champ du formulaire produit)
- ✅ Mouvements de stock (ENTREE / SORTIE / AJUSTEMENT)
- ✅ Alertes automatiques sous le seuil
- ⬜ Scan de code-barres pour saisir un mouvement de stock (extension
  optionnelle du formulaire de mouvement, voir diagramme de cas
  d'utilisation — «extend»)
- ⬜ Attributs personnalises par produit (le champ existe dans le schema,
  pas encore d'interface)
- ⬜ Ecran "Stock" global avec l'historique de tous les mouvements de
  l'entreprise, tous produits confondus (ENTREE / SORTIE / AJUSTEMENT) —
  aujourd'hui l'historique n'existe qu'au niveau d'un produit
  (/produits/[id]/mouvements), pas de vue d'ensemble transversale.

## Fournisseurs et achats

- ✅ CRUD Fournisseurs
- ✅ Commandes fournisseurs : creation avec prix auto-rempli, creation de
  produit a la volee
- ✅ Workflow de statut (BROUILLON → VALIDEE → RECUE / ANNULEE)
- ✅ Reception qui met a jour le stock automatiquement
- ℹ️ "Recevoir une commande" (cote fournisseur, dans le diagramme de cas
  d'utilisation) reste conceptuel en V1 — aucune notification reelle
  envoyee au fournisseur, juste le changement de statut cote Vantik.
- ⬜ Filtre par date sur la page commandes fournisseurs, avec un total
  journalier et le total des achats sur la periode filtree.

## Commandes clients

- ✅ Ventes aux clients : creation, validation, livraison (SORTIE de stock)
  et annulation. Pas d'entite Client — une commande vente n'a pas de
  reference client (comme une caisse), uniquement des lignes produit.
- ⬜ Filtre par date sur la page commandes clients, avec un total
  journalier et le total des ventes sur la periode filtree.

## Finance

- ⬜ Charges de l'entreprise — pas commence

## Intelligence artificielle

- ⬜ Analyse de l'historique — pas commence
- ⬜ Generation de previsions — pas commence
- ⬜ Recommandations de reapprovisionnement — pas commence
- ⬜ Detection d'anomalies — pas commence

## Rapports

- ⬜ Rapports operationnels (employe) — pas commence
- ⬜ Rapports globaux (administrateur) — pas commence

## Navigation et UX

- ✅ Layout avec menu, utilisateur/entreprise affiches, deconnexion
- ✅ Ecran d'accueil avec chiffres cles simples
- ✅ Refonte visuelle des pages existantes selon DESIGN.md (couleurs de
  l'entreprise, typographie serif/sans, composants UI partages dans
  src/app/_components/ui/)

## Prochaine etape recommandee

Modifier/desactiver un utilisateur existant (suite logique de l'ajout
d'utilisateur), ou Charges de l'entreprise (module Finance, pas encore
commence).
