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
- ✅ Reinitialisation de mot de passe (self-service par email) :
  - /mot-de-passe-oublie (email) → cree un TokenReinitialisationMotDePasse
    (valable 1h, usage unique) et envoie un lien par email. Le message
    affiche reste generique que le compte existe ou non (anti-enumeration).
  - /reinitialiser-mot-de-passe?token=... : verifie le token (non
    expire, non utilise), met a jour motDePasseHash, marque le token
    utilise.
  - Envoi d'email via Gmail SMTP (nodemailer), identifiants dans .env
    (GMAIL_USER / GMAIL_APP_PASSWORD), lien construit avec APP_URL.
    Couches : domain/services/EnvoyeurEmail.ts (interface) implementee
    par infrastructure/email/EnvoyeurEmailGmail.ts — seul fichier du
    projet qui touche ces identifiants.

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
- ✅ Ecran "Stock" global (/stock) avec l'historique de tous les mouvements
  de l'entreprise, tous produits confondus (ENTREE / SORTIE / AJUSTEMENT),
  avec filtre par date (du/au), par produit et par type de mouvement.
  Complete la vue par produit existante (/produits/[id]/mouvements) par
  une vue transversale.

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

- ✅ Assistant conversationnel (page /assistant) — analyse l'historique et
  repond aux questions en langage naturel, base sur les vraies donnees de
  l'entreprise (produits, commandes, fournisseurs, charges, equipe,
  mouvements de stock, alertes, attributs personnalises).
  - Modele : Groq (llama-3.3-70b-versatile), gratuit. Limite reelle du
    tier gratuit : 12000 tokens/minute — empeche d'envoyer les donnees
    brutes en entier des qu'une entreprise a plusieurs mois d'historique
    (teste et confirme avec 2 ans de donnees reelles). Le contexte reste
    donc des agregats pre-calcules (tendance mensuelle glissante sur tout
    l'historique de l'entreprise, marge par mois, repartition par
    fournisseur/type de charge, catalogue trie par chiffre d'affaires...),
    jamais un dump brut des tables.
  - Historique de conversation persiste (SessionAssistant /
    MessageAssistant), plusieurs sessions par utilisateur, reprise
    possible, titre auto-genere depuis la premiere question.
  - Couches : domain/services/construireContexteAssistant.ts (formatte le
    contexte texte) + AssistantIA.ts (interface) ; application/assistant/
    (poserQuestionAssistant, listerSessionsAssistant, chargerSessionAssistant,
    supprimerSessionAssistant) ; infrastructure/ia/GroqAssistantIA.ts
    (implementation) + PrismaSessionAssistantRepository /
    PrismaMessageAssistantRepository.
- 🚧 Generation de previsions — notebook de validation termine, implementation
  production pas commencee. Exigence explicite (retour utilisateur) : les
  previsions doivent etre concretes et directement actionnables, pas des
  estimations vagues. Doit couvrir au minimum :
  - Quantite a racheter par produit (reapprovisionnement chiffre, pas
    juste une alerte de seuil).
  - Montant a investir / mettre de cote pour la croissance : PAS base sur
    la marge brute du dernier mois seul (trop bruitee, ~33% de coefficient
    de variation observe sur des donnees reelles propres). Base sur la
    marge moyenne lissee des 3 derniers mois (ou la tendance du modele
    gagnant), et force a 0 si les mois recents sont nets negatifs — pas
    de recommandation de reinvestissement tant que l'activite est
    deficitaire.
  - Niveau de stock cible par produit.
  - Un niveau de confiance par produit, pas juste un chiffre : le
    notebook a montre un ecart enorme entre l'erreur du chiffre
    d'affaires global (MAPE ~9.6%) et l'erreur par produit (22% a 136%
    selon le produit). Un chiffre de reapprovisionnement pour un produit
    a forte erreur historique doit etre affiche comme une fourchette
    (a partir de l'ecart-type des residus de backtest) et/ou marque
    "faible confiance", jamais avec la meme autorite qu'un produit fiable.
  - Cadence de recalcul explicite (mensuelle, a la demande, ou declenchee
    apres N nouvelles commandes) — pas une prevision statique presentee
    une fois pour toutes.
  - Detection des scenarios de perte, pas seulement de croissance : on
    projette les ventes ET les charges separement (meme methode), puis on
    soustrait les deux projections. Si la marge projetee devient
    negative ou baisse, c'est le signal de risque — pas un revenu projete
    tout seul, qui peut sembler correct pendant que les charges
    grimpent plus vite en arriere-plan.
  - Un rapport complet regroupant tout ca, pense pour aider concretement
    la croissance de l'entreprise — pas juste des chiffres bruts.
  - Decision technique deja actee : pas de modele pretraine sur un
    dataset externe (Kaggle etc.) ni de modele genre XGBoost/Random
    Forest — les datasets de prevision retail existants (Rossmann,
    Walmart Recruiting, M5...) sont propres a un commerce donne et ne
    generalisent pas a un type d'entreprise different, et les modeles a
    base d'arbres ont besoin de bien plus de donnees que les quelques
    dizaines de points mensuels qu'une seule entreprise aura jamais. Les
    modeles sont reentraines a la volee, par entreprise, a partir de ses
    seules donnees — aucune donnee d'une entreprise n'influence jamais
    la prevision d'une autre, donc le type de commerce utilise pour
    valider la methodologie (voir notebook) n'introduit pas de biais.
    A la place, deux modeles legers compares par entreprise :
    - Regression lineaire (tendance) vs methode de Holt (lissage
      exponentiel double, avec tendance — pas le lissage simple, qui n'a
      pas de terme de tendance et perdrait injustement face a la
      regression). Holt-Winters (terme saisonnier en plus) a besoin
      d'au moins 24 mois pour etre *ajuste*, mais d'au moins ~28 mois
      pour etre *backteste* de facon fiable (confirme par le notebook :
      avec 24 mois exactement, Holt-Winters ne peut pas etre inclus
      dans la comparaison chiffree faute d'origines de backtest valides
      — un ajustement unique illustratif reste possible, mais non valide).
    - Validation par rolling-origin backtesting (entrainement sur les
      mois 1..k, test sur k+1, on avance), erreurs agregees en
      MAE/RMSE/MAPE (ou sMAPE si des mois a tres faible activite faussent
      le MAPE). Le modele gagnant est garde, par entreprise (et peut
      differer d'un produit/serie a l'autre).
    - Garde-fou : sous ~8 mois d'historique, pas de comparaison
      (backtest pas fiable sur si peu de points) — on affiche une simple
      tendance avec un avertissement plutot qu'un chiffre presente comme
      fiable.
    - Implementation prevue en fonctions pures dans domain/services/
      (regression, lissage, scoring), orchestration dans un nouveau
      application/previsions/ — aucune dependance externe, aucun service
      Python, meme approche que le reste de l'app.
  - ✅ Notebook Jupyter de validation academique (rapport de stage) :
    `notebooks/previsions.ipynb`, execute sur les donnees reelles de
    l'entreprise de test (forsa, 24 mois propres, sans anomalie injectee
    volontairement). Conclusions obtenues :
    - Chiffre d'affaires global : Regression lineaire et Holt quasiment
      a egalite (RMSE 541.41 vs 541.42, MAPE ~9.6% les deux) — la
      tendance globale est assez simple pour qu'une droite suffise.
    - Holt-Winters exclu de la comparaison chiffree (voir ci-dessus).
    - Par produit : la regression lineaire gagne sur 8 des 9 produits
      testes, Holt sur 1 seul — mais l'erreur par produit (22% a 136%
      de MAPE) est bien plus elevee que sur l'agrege (~9.6%), surtout
      pour les produits a faible volume ou saisonniers (Écharpe Hiver,
      Maillot de Bain, Ceinture Cuir) : prevoir le total est nettement
      plus fiable que prevoir un produit individuel avec ~24 points.
    - Vit hors de src/ (pas dans l'architecture en couches), sert
      uniquement a documenter/valider l'approche choisie — l'application
      Vantik n'en depend jamais au runtime (aucune dependance
      Python/notebook dans le code de production). Regenerable via
      `notebooks/build_notebook.py` + `notebooks/run_notebook.py`.
- ⬜ Recommandations de reapprovisionnement — pas commence. Lie au point
  precedent : une fois la prevision de demande calculee, en deduire une
  quantite de commande suggeree par produit, en tenant compte du
  seuilAlerte et du delaiLivraisonJours du fournisseur.
- 🚧 Detection d'anomalies — pas de detection statistique dediee (pas de
  calcul de type z-score), mais l'assistant conversationnel signale deja
  les anomalies qu'il repere dans les donnees fournies (pics/chutes,
  taux d'annulation eleve, marge negative...) sans qu'on ait besoin de le
  demander explicitement (consigne dans le system prompt de
  GroqAssistantIA.ts).

## Rapports

- ✅ Pas d'ecran separe : les rapports vivent sur l'ecran Accueil (/) pour
  qu'ils soient vus au quotidien plutot qu'ignores dans un onglet a part.
  - Rapports operationnels (visibles par tous) : ventes livrees du mois,
    achats recus du mois, valeur du stock actuel (quantiteStock x
    prixAchat), top 5 des produits les plus vendus du mois (sur les
    commandes clients RECUE).
  - Rapports globaux (administrateur seulement, meme logique d'acces que
    /charges) : donut "Repartition des ventes du mois" (achats
    fournisseurs / autres charges / benefice), benefice = ventes livrees
    − charges du mois. Le calcul ne soustrait pas les achats separement
    car la charge "Achat fournisseur" les inclut deja (voir section
    Finance — eviter le double-comptage).
  - Donut "Ventes par produit" (visible par tous) : part de chaque
    produit dans les ventes livrees du mois, top 4 + "Autres produits".
  - Couches : domain/services/calculerValeurStock.ts et
    calculerVentesParProduit.ts (fonctions pures) ; composants visuels
    partages GraphiqueDonut (src/app/_components/ui/) ; le reste reutilise
    les listers application existants (listerCommandes, listerProduits,
    listerCharges), pas de nouveau cas d'usage dedie.
  - Periode fixe au mois en cours pour l'instant (pas de selecteur de
    date) ; a etendre si un besoin de comparer d'autres periodes apparait.

## Navigation et UX

- ✅ Layout avec menu, utilisateur/entreprise affiches, deconnexion
- ✅ Ecran d'accueil avec chiffres cles simples
- ✅ Refonte visuelle des pages existantes selon DESIGN.md (couleurs de
  l'entreprise, typographie serif/sans, composants UI partages dans
  src/app/_components/ui/)

## Prochaine etape recommandee

L'assistant conversationnel est en place. Prochain chantier logique dans
le module Intelligence artificielle : la generation de previsions
(regression/moyenne mobile par entreprise, voir notes ci-dessus), qui
debloque ensuite les recommandations de reapprovisionnement. Sinon,
"Modeles par categorie d'entreprise" reste une option plus petite (idee
deja documentee mais jamais implementee).
