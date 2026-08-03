# Vantik — direction design

## Objectif

L'application doit avoir l'air d'un vrai produit professionnel concu par
une equipe design, pas d'un prototype genere par une IA. Cette direction a
ete definie a partir de captures d'ecran d'une vraie application
professionnelle (back-office de gestion), adaptees a l'identite et aux
donnees propres a Vantik — aucun contenu ni logique metier n'a ete copie,
seulement le langage visuel (couleurs, formes, typographie, structure).

## Structure generale

- **Barre laterale sombre** (`bg-stone-900`), fixe a gauche, largeur
  `lg:w-64`. Contient : le mot "Vantik" (texte seul, pas d'avatar/logo
  dans la sidebar — l'identite visuelle avec avatar vit dans la barre
  d'en-tete, pas ici), le nom de l'entreprise en petit, puis la
  navigation, puis le bouton de deconnexion en bas.
  - Cette couleur sombre est fixe (pas liee a la couleur de l'entreprise)
    — c'est la structure de l'appli, pas sa marque.
  - Navigation : chaque lien a une icone dans un petit cercle (`h-8 w-8
    rounded-full border`). Au repos, cercle avec juste une bordure fine
    grise, icone grise. Actif : le cercle se remplit de la couleur de
    marque, l'icone devient blanche, le label passe de gris a blanc.
    **Jamais de fond de ligne ni de barre laterale coloree pour l'etat
    actif** — ce pattern (fond + bordure gauche) est trop generique/
    "shadcn par defaut", on s'en ecarte volontairement.
- **Barre d'en-tete persistante** (carte blanche en haut de la zone de
  contenu, sur toutes les pages du dashboard) : avatar rond de
  l'entreprise, nom de l'entreprise, badge de role (Administrateur /
  Employe), puis a droite le nom de l'utilisateur, une icone reglages
  (admin seulement, vers /parametres) et une icone alertes avec un badge
  rouge de comptage (voir `CompteurBadge`).
- **En-tete de page** (`PageHeader`) : titre en gras avec une petite barre
  verticale de couleur primaire a gauche (pas de degrade, pas d'eyebrow
  redondant avec la barre d'en-tete globale), description courte,
  actions a droite.

## Couleurs

- `--color-primary` / `--color-secondary` : couleur de marque de
  l'entreprise (personnalisable dans /parametres), valeur par defaut un
  rouge (`#d64a3c`) si l'entreprise n'a rien choisi. Utilisee pour : les
  boutons primaires, les icones actives de la navigation, les badges
  "info", les cercles d'icone des cartes de statistiques.
  - Elle ne pilote jamais la couleur de la barre laterale (toujours
    sombre) ni les couleurs semantiques (succes/erreur/avertissement).
- Semantique fixe (jamais liee a la marque) : `emerald` = succes/positif,
  `red` = danger/negatif, `amber` = avertissement, `stone` = neutre. Un
  bouton "Supprimer" reste rouge meme si la couleur de marque de
  l'entreprise est aussi rouge — la forme (contour vs plein) differencie
  les deux au besoin.
- Fond de page : gris clair (`--color-surface`, teinte tres legerement
  par la couleur de marque), jamais blanc pur — les cartes blanches
  ressortent dessus.

## Typographie

- Une seule famille : Public Sans, en plusieurs graisses (300 a 800). Pas
  de police serif — la hierarchie se fait par le poids et la taille, pas
  par un changement de police.
- Titres de page/section : gras (`font-bold`), taille clairement
  superieure au corps de texte.
- Petits labels (navigation, boutons, badges) : `text-xs`/`text-[11px]`,
  `uppercase`, `tracking-wide`, `font-semibold` — c'est la signature
  typographique de cette direction, a garder partout ou un label est
  court (2-3 mots max ; jamais sur une phrase complete ou un paragraphe).

## Formes

- Boutons : forme de pilule (`rounded-full`), jamais de coins carres ou
  peu arrondis.
- Cartes/panels/en-tetes/etats vides : `rounded-lg` (rayon modere, pas
  bulbeux), fond blanc, bordure fine `stone-200`, **pas d'ombre**
  (`shadow-sm`/`shadow-lg` partout est le tic visuel le plus reconnaissable
  d'un dashboard genere par IA — ici on s'appuie sur la bordure fine, pas
  sur l'elevation, pour delimiter les blocs). Seule la modale garde une
  ombre (`shadow-xl`) — elle flotte reellement au-dessus du contenu, donc
  l'elevation y a un sens.
- Badges de statut : pilules `rounded-full`, texte petit et en
  majuscules.
- Champs de formulaire : `rounded-lg`, bordure fine, anneau de focus dans
  la couleur de marque.

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
- Ombre + coins tres arrondis sur chaque carte (`rounded-2xl shadow-lg`) :
  c'est la signature visuelle des templates de dashboard generes par IA.
  Prefere une bordure fine sans ombre, rayon modere.
- Etat actif de navigation en fond de ligne pleine largeur + barre
  laterale coloree : trop "composant par defaut d'une librairie UI". Une
  icone qui change d'etat (contour → rempli) est plus sobre et distinctif.
- Avatar/logo duplique a deux endroits (barre laterale ET en-tete) —
  l'identite visuelle globale (avatar, nom d'entreprise) vit a un seul
  endroit (la barre d'en-tete), la barre laterale reste texte seul.

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
direction visuelle que tu vas prendre (ex : "bouton pilule plein avec la
couleur primaire de l'entreprise, carte `rounded-2xl` blanche") et
verifie qu'elle correspond a ce document avant d'ecrire le code. Si tu
introduis un nouveau composant visuel, mets-le a jour ici.
