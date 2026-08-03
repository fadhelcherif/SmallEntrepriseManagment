# Comment le code de Vantik est organisé (guide simple)

Ce fichier explique l'architecture du projet en langage simple, sans
supposer que tu es développeur. Le but : que tu comprennes pourquoi le
code est rangé comme il l'est, et pourquoi c'est utile pour toi (même si
tu ne codes pas toi-même).

## L'idée en une phrase

Le code est rangé en 4 tiroirs, et chaque tiroir a une seule règle : il ne
regarde jamais dans le tiroir "extérieur" à lui. Ça évite que tout devienne
un gros tas où une petite modification casse dix choses ailleurs.

## L'analogie du restaurant

Imagine Vantik comme un restaurant :

- **Le livre de recettes** (`domain/`) : les règles de cuisine qui ne
  changent jamais, peu importe le restaurant. "Un burger a besoin d'un
  pain et d'une viande." "Si le stock d'un produit passe sous le seuil,
  il faut une alerte." Ces règles n'ont besoin d'aucun four précis, d'aucun
  fournisseur précis — c'est juste la logique pure.
- **Le serveur** (`application/`) : il prend la commande, suit les étapes
  ("d'abord vérifier le stock, puis créer la commande, puis prévenir la
  cuisine"), mais ne cuisine pas lui-même et n'invente pas de nouvelles
  règles.
- **La cuisine réelle** (`infrastructure/`) : le vrai four, le vrai
  fournisseur, la vraie base de données (Prisma/PostgreSQL). C'est ici que
  les recettes deviennent des plats concrets.
- **La salle et le menu** (`app/`) : ce que le client voit et touche — les
  pages, les boutons, les formulaires.

La règle d'or : **le livre de recettes ne sait pas qu'un four existe.** Le
domain ne sait rien de Next.js, ni de Prisma, ni de la base de données.

## Les 4 dossiers, en détail

### `src/domain/` — les règles du métier

Ce dossier contient uniquement des règles pures, écrites en TypeScript
simple, sans aucune dépendance à Next.js ou à la base de données.

- `domain/entities/` : la description des "choses" de l'app (`Produit`,
  `Commande`, `Utilisateur`...). Juste des formes de données, pas de
  logique.
- `domain/services/` : les règles elles-mêmes.

**Exemple réel** : [`domain/services/directionMouvementCommande.ts`](src/domain/services/directionMouvementCommande.ts)
contient une seule règle : une commande fournisseur (achat) fait
**entrer** du stock, une commande client (vente) fait **sortir** du
stock. Cette règle est écrite une seule fois, à un seul endroit. Si un
jour la règle change, on la change ici — pas dans 5 fichiers différents.

Pourquoi c'est séparé : cette règle ne dépend d'aucun écran ni d'aucune
base de données. On peut la tester toute seule, sans lancer l'application.

### `src/application/` — le chef d'orchestre

Ce dossier organise les étapes d'une action métier, en utilisant les
règles du domain. Un fichier = une action ("créer un produit", "livrer
une commande").

**Exemple réel** : [`application/commandes/receptionnerCommande.ts`](src/application/commandes/receptionnerCommande.ts)
fait, dans l'ordre : vérifier que la commande a le bon statut → demander
au domain "ENTREE ou SORTIE ?" → enregistrer le mouvement de stock →
changer le statut de la commande. Il ne décide jamais lui-même de la
règle ENTREE/SORTIE — il la demande au domain.

### `src/infrastructure/` — la vraie cuisine

Ce dossier contient tout ce qui touche à des outils externes concrets :
Prisma (la base de données), le hachage des mots de passe, les sessions.

**Exemple réel** : [`infrastructure/repositories/PrismaProduitRepository.ts`](src/infrastructure/repositories/PrismaProduitRepository.ts)
sait comment parler à PostgreSQL pour sauvegarder un produit. Si un jour
Vantik change de base de données, c'est le seul dossier à réécrire — le
domain et l'application n'en sauraient rien.

### `src/app/` — ce que tu vois

Les pages, les formulaires, les boutons. Cette partie ne doit **jamais**
contenir de règle métier ni parler directement à la base de données —
elle appelle juste l'application, qui appelle le domain.

## La règle de dépendance (le sens des flèches)

```
app  →  application  →  domain
                          ↑
              infrastructure (implémente les interfaces du domain)
```

- `app` peut appeler `application`.
- `application` peut appeler `domain`.
- `domain` n'appelle **jamais** personne — il ne connaît que lui-même.
- `infrastructure` fournit les "vrais outils" (Prisma...) que `domain`
  a demandés sous forme d'interface, sans jamais que `domain` sache que
  Prisma existe.

## Un exemple du début à la fin : "Livrer une commande client"

Quand un administrateur clique sur "Livrer" pour une commande client,
voici le trajet exact du clic à la base de données :

1. **`app/(dashboard)/commandes-clients/page.tsx`** — le bouton appelle
   une server action.
2. **`app/(dashboard)/commandes-clients/actions.ts`** — l'action lit les
   données du formulaire et appelle l'application.
3. **`application/commandes/receptionnerCommande.ts`** — vérifie le
   statut, puis demande au domain la direction du mouvement de stock.
4. **`domain/services/directionMouvementCommande.ts`** — répond
   "SORTIE" (une vente fait sortir du stock). Règle pure, zéro base de
   données.
5. **`application/stock/enregistrerMouvement.ts`** — utilise cette
   réponse pour calculer le nouveau stock et vérifier qu'il ne devient
   pas négatif (règle dans `domain/services/appliquerMouvementStock.ts`).
6. **`infrastructure/repositories/PrismaMouvementStockRepository.ts`**
   — écrit vraiment la ligne dans PostgreSQL.

Chaque fichier a un seul travail. Si demain la règle "une vente fait
sortir du stock" doit changer, on touche **une seule ligne**, dans un
**seul fichier** (`directionMouvementCommande.ts`), et tout le reste
continue de fonctionner sans y toucher.

## Pourquoi c'est une bonne architecture (concrètement, pas juste en théorie)

- **Un bug est plus facile à trouver** : si le stock est mal calculé, tu
  sais que ça vient forcément de `domain/services/`, pas besoin de
  fouiller dans 50 fichiers de pages.
- **On peut tester les règles sans lancer l'app** : `domain/` ne dépend
  de rien, donc on peut vérifier "est-ce que 5 - 10 lève bien une erreur
  de stock négatif ?" sans base de données, sans serveur.
- **Changer un outil ne casse pas les règles** : changer de base de
  données, de librairie d'e-mail, etc., ne touche que
  `infrastructure/` — les règles métier ne bougent pas.
- **Ça rend possible l'idée des "modèles par catégorie"** dont on a
  parlé : parce que la règle "un produit a un seuil d'alerte" est isolée
  proprement, on peut ajouter des champs personnalisés par entreprise
  sans avoir à toucher à cette règle ni la dupliquer.

## Le contre-exemple à éviter

Si un jour tu vois une page (`app/`) qui calcule elle-même un prix, ou
qui appelle directement Prisma — c'est une erreur d'architecture. C'est
exactement ce que `CLAUDE.md` interdit, et ce que je corrige
systématiquement en déplaçant la règle dans `domain/services/`.
