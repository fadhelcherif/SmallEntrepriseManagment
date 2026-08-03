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
- ✅ Modifier/desactiver un utilisateur existant — modale d'edition sur
  /utilisateurs (nom, email, role, actif). Un administrateur ne peut pas
  changer son propre role ou statut, et ne peut modifier que les
  utilisateurs de sa propre entreprise.
- ⬜ Reinitialisation de mot de passe

## Entreprise

- ✅ Parametres de l'entreprise (nom, adresse, devise, typeMetier,
  categorie, logo, couleurs) — reserve aux administrateurs
- ⬜ Modeles par categorie d'entreprise (idee de differenciation produit,
  discutee mais pas commencee). Principe : une table fixe categorie →
  liste de champs par defaut (attributs personnalises) + liste de types
  de charges par defaut. Quand l'utilisateur choisit une categorie
  (ex: "Restaurant"), l'appli copie ce modele dans les donnees de son
  entreprise (des vraies lignes AttributPersonnalise / suggestions de
  types de charge), modifiables librement ensuite. Aucune interface ni
  code specifique par categorie — tout le monde utilise les memes ecrans,
  seules les donnees de depart different. Couches concernees : le modele
  categorie→defauts est une donnee/fonction pure (domain/services), le
  seed est un use case (application), les repositories existants
  suffisent (infrastructure), la presentation appelle le seed une seule
  fois au moment ou la categorie est choisie (signup ou parametres).

## Produits et stock

- ✅ CRUD Produits complet (inclut la definition du seuilAlerte par produit
  — pas un ecran separe, c'est un champ du formulaire produit)
- ✅ Mouvements de stock (ENTREE / SORTIE / AJUSTEMENT)
- ✅ Alertes automatiques sous le seuil
- ⬜ Scan de code-barres pour saisir un mouvement de stock (extension
  optionnelle du formulaire de mouvement, voir diagramme de cas
  d'utilisation — «extend»)
- ✅ Attributs personnalises par produit — modele final (decide apres
  discussion, plus simple que prevu au depart) :
  - Pas d'ecran de configuration a part. Sur le formulaire "Nouveau
    produit" (et sa modale de modification), un bouton "+" ajoute une
    ligne libre nom/valeur (ex: Taille / M). Le premier produit qui
    utilise un nom d'attribut le cree ; les suivants avec le meme nom
    (insensible a la casse) reutilisent le meme attribut (voir
    application/attributs/trouverOuCreerAttribut.ts) — pas de doublon.
  - Une taille/couleur differente = un produit different (ligne separee
    avec son propre stock), pas une variante rattachee a un seul
    produit. Decision explicite : plus simple, aucun changement du
    modele de stock (quantiteStock reste par produit).
  - Le tableau /produits gagne une colonne par attribut utilise.
  - Les selecteurs de produit dans les commandes (fournisseurs et
    clients) affichent les attributs a cote du nom pour distinguer les
    variantes (ex: "T-shirt — Taille : M").
- ⬜ Ecran "Stock" global avec l'historique de tous les mouvements de
  l'entreprise, tous produits confondus (ENTREE / SORTIE / AJUSTEMENT) —
  aujourd'hui l'historique n'existe qu'au niveau d'un produit
  (/produits/[id]/mouvements), pas de vue d'ensemble transversale.

## Fournisseurs et achats

- ✅ CRUD Fournisseurs
- ✅ Commandes fournisseurs : creation avec prix auto-rempli. Le produit
  doit deja exister dans /produits — le formulaire de creation rapide de
  produit directement sur cette page a ete retire (retour explicite :
  un produit avec attributs personnalises merite le vrai formulaire de
  /produits, pas une version minimale a 3 champs qui ne les gere pas).
- ✅ Workflow de statut (BROUILLON → VALIDEE → RECUE / ANNULEE)
- ✅ Reception qui met a jour le stock automatiquement, et cree
  automatiquement la charge "Achat fournisseur" correspondante (voir
  section Finance).
- ℹ️ "Recevoir une commande" (cote fournisseur, dans le diagramme de cas
  d'utilisation) reste conceptuel en V1 — aucune notification reelle
  envoyee au fournisseur, juste le changement de statut cote Vantik.
- ✅ Filtre par date (du/au) sur la page commandes fournisseurs, avec
  regroupement par jour (accordeon — jours passes fermes, aujourd'hui
  ouvert), total journalier fixe dans l'en-tete de chaque jour, et total
  des achats sur la periode filtree.

## Commandes clients

- ✅ Ventes aux clients : creation, validation, livraison (SORTIE de stock)
  et annulation. Pas d'entite Client — une commande vente n'a pas de
  reference client (comme une caisse), uniquement des lignes produit.
- ✅ Filtre par date (du/au) sur la page commandes clients, meme
  principe que commandes fournisseurs (regroupement par jour, total
  journalier fixe, total des ventes sur la periode filtree).

## Finance

- ✅ Charges de l'entreprise — page /charges (admin seulement) :
  - Charge.type reste du texte libre, avec des suggestions qui
    s'enrichissent automatiquement des types deja utilises par
    l'entreprise (datalist), plus une petite liste de depart (Loyer,
    Facture electricite, Facture eau, Emballage, Assurance...).
  - Salaire : champ salaire sur Utilisateur (modifiable via la modale
    d'edition), creer un utilisateur EMPLOYE demande son salaire et cree
    automatiquement sa premiere charge "Salaire" (utilisateurId lie).
  - Achats fournisseurs : PAS saisis a la main. Une commande fournisseur
    receptionnee (RECUE) cree automatiquement sa charge "Achat
    fournisseur" (fournisseurId lie, montant = total de la commande) —
    correction apportee suite a un retour explicite : une commande
    receptionnee EST deja une charge, la re-saisir manuellement aurait
    double-compte la depense. Voir
    application/commandes/receptionnerCommandeFournisseur.ts.
  - "Salaire" et "Achat fournisseur" sont des types reserves/automatiques
    (constantes TYPE_CHARGE_SALAIRE / TYPE_CHARGE_ACHAT_FOURNISSEUR dans
    domain/entities/Charge.ts), exclus des suggestions de saisie manuelle.
  - Charges recurrentes (salaire, loyer) vs variables (factures qui
    changent chaque mois) : les recurrentes se regenerent seules —
    regeneration "auto-guerison" au chargement de /charges (pas de vrai
    cron, l'environnement d'hebergement n'etant pas confirme).
  - Voir aussi "Modeles par categorie d'entreprise" (section Entreprise)
    pour des suggestions de types de charges par defaut selon la
    categorie choisie — pas encore fait.

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

Reinitialisation de mot de passe, pour clore entierement la section
Authentification et comptes. Alternative : Ecran "Stock" global
(historique transversal de tous les mouvements), ou demarrer le module
Rapports / Intelligence artificielle (rien de commence dans ces deux
sections).
