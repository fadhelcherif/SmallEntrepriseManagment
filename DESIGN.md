# Vantik — direction design

## Objectif

L'application doit avoir l'air d'un vrai produit professionnel concu par
une equipe design, pas d'un prototype genere par une IA. Cette direction
(v2) a ete definie a partir d'une capture d'ecran d'une vraie application
fintech professionnelle, adaptee a l'identite et aux donnees propres a
Vantik — aucun contenu ni logique metier n'a ete copie, seulement le
langage visuel (couleurs, formes, typographie, structure). Elle remplace
la direction v1 (barre laterale sombre, cartes plates sans ombre) — voir
l'historique git de ce fichier si besoin de retrouver l'ancienne version.

## Structure generale

- **Barre laterale claire** (`bg-white`), fixe a gauche, largeur `lg:w-60`.
  Contient, du haut vers le bas : le logo/l'identite de l'entreprise
  (logo uploade ou initiale dans un badge `rounded-2xl` de la couleur de
  marque, avec le nom de l'entreprise en gras et "Vantik" en petit
  dessous), la navigation, puis en bas une carte sombre d'appel a
  l'assistant IA (`bg-[#1c1917]`, `rounded-2xl`) et le bouton de
  deconnexion.
  - C'est l'identite de l'ENTREPRISE cliente qui est mise en avant ici
    (comme un espace de travail dans un outil SaaS classique), pas celle
    de Vantik — Vantik reste en petit, en signature.
  - Navigation : pilules pleine largeur (`rounded-full`). Actif : fond
    plein de la couleur de marque, texte blanc, `font-semibold`. Inactif :
    texte `stone-500`, fond transparent, `hover:bg-stone-50`.
- **Barre d'en-tete** (au-dessus du contenu, sur toutes les pages) :
  identite de l'UTILISATEUR connecte (avatar generique rond + "Bienvenue"
  + son nom), puis a droite le badge de role (Administrateur / Employe)
  et des boutons icone ronds (`rounded-full`, fond blanc, bordure fine,
  `shadow-card`) pour les reglages (admin) et les alertes (badge de
  comptage rouge, voir `CompteurBadge`).
  - L'identite entreprise vit dans la sidebar, l'identite utilisateur
    dans l'en-tete — jamais les deux au meme endroit (pas de duplication).
- **En-tete de page** (`PageHeader`) : titre en gras avec une petite barre
  verticale de couleur primaire a gauche, description courte, actions a
  droite.
- **Largeur de page** : pas de `max-w` sur le conteneur de contenu (juste
  `px-5 sm:px-8`) — le contenu remplit l'espace disponible a cote de la
  sidebar plutot que de laisser un vide a droite sur grand ecran.

## Couleurs

- `--color-primary` / `--color-secondary` : couleur de marque de
  l'entreprise (personnalisable dans /parametres), valeur par defaut un
  rouge (`#d64a3c`) si l'entreprise n'a rien choisi. Utilisee pour : les
  boutons primaires, l'etat actif de la navigation (fond plein de la
  pilule), les cercles d'icone des cartes de statistiques, le badge de
  l'assistant IA.
  - Elle ne pilote jamais les couleurs semantiques (succes/erreur/
    avertissement) ni la couleur de la carte d'appel a l'assistant
    (toujours sombre, `#1c1917`).
- Semantique fixe (jamais liee a la marque) : `emerald` = succes/positif,
  `red` = danger/negatif, `amber` = avertissement, `stone` = neutre.
- Variete pastel pour les badges d'icone des cartes de statistiques
  (`StatCard`, prop `couleur`) : chaque carte peut avoir sa propre teinte
  (ambre, bleu ciel, violet, rose...) pour distinguer visuellement
  plusieurs metriques cote a cote sur un tableau de bord — ce n'est pas
  la couleur de marque, juste une palette decorative fixe.
- Fond de page : creme chaud (`--color-surface`, `#f6f2ea` teinte
  legerement par la couleur de marque), jamais blanc pur — les cartes
  blanches ressortent dessus.

## Typographie

- Une seule famille : Plus Jakarta Sans, en plusieurs graisses (300 a
  800). Pas de police serif — la hierarchie se fait par le poids et la
  taille, pas par un changement de police.
- Titres de page/section : gras (`font-bold`), taille clairement
  superieure au corps de texte.
- Petits labels (badges, boutons) : `text-xs`/`text-[11px]`, `uppercase`,
  `tracking-wide`, `font-semibold` pour les badges de statut et les
  boutons. Les labels de navigation restent en casse normale, taille
  `text-sm`, `font-medium` (pas de majuscules dans la sidebar v2).

## Formes

- Boutons : forme de pilule (`rounded-full`), jamais de coins carres ou
  peu arrondis. Petits boutons d'action (icone seule dans un tableau,
  ex. modifier/supprimer une ligne) : `rounded-md`, taille reduite —
  c'est la seule exception a la pilule, reservee aux actions secondaires
  denses dans des listes.
- Cartes/panels/en-tetes/etats vides (`Panel`, `StatCard`, `PageHeader`,
  `EmptyState`) : `rounded-3xl`, fond blanc, **`shadow-card`** (ombre
  douce et diffuse definie dans `globals.css` — pas les ombres Tailwind
  par defaut `shadow-sm`/`shadow-lg`, trop dures). Badges d'icone dans
  les `StatCard` : `rounded-2xl`.
  - Elements imbriques dans une carte deja ombragee (tableaux, cartes de
    liste) : `rounded-2xl border border-stone-200`, sans ombre propre —
    l'ombre reste reservee aux conteneurs de premier niveau, pour ne pas
    empiler les elevations.
  - La modale (`Modal`) garde `shadow-xl` (plus marquee que `shadow-card`)
    et `rounded-3xl` — elle flotte reellement au-dessus du contenu.
- Badges de statut : pilules `rounded-full`, texte petit et en
  majuscules.
- Champs de formulaire : `rounded-xl`, bordure fine, anneau de focus
  dans la couleur de marque.

## A eviter absolument (les "tics" visuels d'IA generique)

- Degrade violet-vers-bleu ou violet-vers-rose sur les boutons, headers
  ou fonds. Pas de degrade du tout sauf demande explicite.
- Fond en "glassmorphism" (blanc semi-transparent + flou) par defaut.
- Emojis utilises comme icones dans l'interface (✅ 🚀 📊). Utilise une
  vraie librairie d'icones (lucide-react est deja disponible) ou rien.
- Boutons bleus (#3B82F6, la couleur par defaut de Tailwind) sans lien
  avec l'identite visuelle de Vantik.
- Sur-utilisation du centrage : tout centre verticalement et
  horizontalement dans la page donne un look "landing page generee".
- Melanger les formes de boutons (pilule ici, rectangle arrondi la) —
  une fois la forme choisie, elle est fixe partout.
- Ombre Tailwind par defaut (`shadow-md`/`shadow-lg` bruts) sur les
  cartes — toujours passer par le token `shadow-card` (plus douce,
  plus diffuse), jamais les valeurs par defaut qui ont un bord trop net.
- Avatar/logo duplique a deux endroits (barre laterale ET en-tete) —
  l'identite entreprise vit dans la sidebar, l'identite utilisateur dans
  l'en-tete ; jamais les deux memes avatars aux deux endroits.

## Densite d'information

Vantik est un outil de gestion utilise au quotidien par des employes, pas
une landing page. Privilegie des tableaux denses et lisibles plutot que
des grandes cartes espacees avec peu d'information par ecran. Les cartes
avec icone + titre + description (comme les tuiles de statistiques ou les
etats vides) restent reservees aux resumes, jamais aux listes de
donnees elles-memes.

## Coherence

Une fois qu'un pattern est choisi pour un composant (forme des boutons,
rayon des cartes, style des badges), il vit dans
`src/app/_components/ui/` et est reutilise partout — ne pas recreer un
style variant a la main dans une page. Si un nouveau pattern visuel est
necessaire, il doit d'abord etre ajoute ou modifie dans ce dossier, puis
consomme par les pages.

## Instruction pour Claude

Avant de creer ou modifier une interface, decris en une phrase la
direction visuelle que tu vas prendre (ex : "carte `rounded-3xl` blanche
avec `shadow-card`, badge d'icone `rounded-2xl` en couleur pastel") et
verifie qu'elle correspond a ce document avant d'ecrire le code. Si tu
introduis un nouveau composant visuel, mets-le a jour ici.
