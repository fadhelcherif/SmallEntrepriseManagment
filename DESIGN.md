# Vantik — direction design

## Objectif

L'application doit avoir l'air d'un vrai produit professionnel concu par
une equipe design, pas d'un prototype genere par une IA. Evite
systematiquement les patterns "par defaut" listes ci-dessous.

## A eviter absolument (les "tics" visuels d'IA generique)

- Degrade violet-vers-bleu ou violet-vers-rose sur les boutons, headers ou
  fonds. Pas de degrade du tout sauf demande explicite.
- Fond en "glassmorphism" (blanc semi-transparent + flou) par defaut.
- Emojis utilises comme icones dans l'interface (✅ 🚀 📊). Utilise une
  vraie librairie d'icones (lucide-react est deja disponible) ou rien.
- Cartes toutes identiques avec `rounded-xl shadow-lg` partout sans
  variation — ca cree un look "template SaaS generique".
- Police par defaut Inter/system-ui sans reflexion. Choisis une police qui
  correspond au ton de l'app (professionnel, pas ludique).
- Boutons bleus (#3B82F6, la couleur par defaut de Tailwind) partout sans
  lien avec une identite visuelle propre a Vantik.
- Sur-utilisation du centrage : tout centre verticalement et
  horizontalement dans la page donne un look "landing page generee".

## Direction a suivre a la place

- **Couleurs** : utilise `couleurPrimaire` et `couleurSecondaire` de
  l'entreprise connectee (deja dans le modele de donnees) comme base de la
  palette de l'app, avec un fallback neutre (gris fonce / blanc casse) si
  elles ne sont pas definies. Pas de violet par defaut.
- **Typographie** : une police serif ou semi-serif pour les titres (donne
  un ton plus etabli / professionnel qu'une sans-serif generique), une
  sans-serif sobre pour le texte courant. Hierarchie claire : les titres de
  page doivent se distinguer nettement des sous-titres, pas juste par la
  taille mais par le poids et l'espacement.
- **Densite d'information** : Vantik est un outil de gestion utilise au
  quotidien par des employes, pas une landing page. Privilegie des tableaux
  denses et lisibles plutot que des grandes cartes espacees avec peu
  d'information par ecran.
- **Espacement** : utilise une echelle coherente (4px/8px/16px/24px/32px),
  pas des valeurs arbitraires. Aligne les elements sur une vraie grille.
- **Etats** : chaque etat (chargement, vide, erreur, succes) doit avoir un
  traitement visuel pense, pas juste du texte brut. Un etat vide ("Aucun
  produit pour le moment") doit donner envie d'agir, pas juste informer.
- **Coherence** : une fois qu'un pattern est choisi pour un composant
  (ex : le style des boutons, la forme des badges de statut de commande),
  reutilise-le partout — ne varie pas les styles au hasard entre les pages.

## Instruction pour Claude

Avant de creer ou modifier une interface, decris en une phrase la direction
visuelle que tu vas prendre (ex : "boutons pleins avec la couleur primaire
de l'entreprise, coins peu arrondis, police serif pour les titres") et
justifie-la par rapport a ce document, avant d'ecrire le code.
