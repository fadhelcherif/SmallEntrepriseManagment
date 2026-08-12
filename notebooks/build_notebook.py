"""Construit previsions.ipynb cellule par cellule (nbformat), puis il est execute separement."""
import nbformat as nbf

nb = nbf.v4.new_notebook()
cells = []


def md(text):
    cells.append(nbf.v4.new_markdown_cell(text))


def code(text):
    cells.append(nbf.v4.new_code_cell(text))


# ---------------------------------------------------------------------------
md(
"""# Vantik — Prévisions : exploration et comparaison de modèles

**But de ce notebook** : validation académique (rapport de stage) de l'approche de prévision
retenue pour Vantik, *avant* son implémentation en production (TypeScript, `domain/services/`).

Ce notebook n'est **pas** une dépendance de l'application — il vit hors de `src/`, sert
uniquement à explorer les données réelles d'une entreprise et à comparer plusieurs modèles
de prévision de séries temporelles :

1. Exploration des données historiques (ventes, achats, charges, marge, demande par produit).
2. Implémentation de trois modèles : **Régression linéaire**, **Holt** (lissage exponentiel
   double, avec tendance), **Holt-Winters** (avec composante saisonnière).
3. Validation par **rolling-origin backtesting** (entraînement glissant, pas un simple
   split train/test — plus fiable sur peu de données).
4. Comparaison des modèles avec **MAE, RMSE et MAPE/sMAPE**.
5. Visualisation réel vs prédit, et identification du meilleur modèle par série.

Les données proviennent de la base Postgres réelle de l'application (entreprise de test
« forsa », 25 mois d'historique, données propres — pas d'anomalies injectées volontairement,
pour que la comparaison de modèles soit lisible)."""
)

# ---------------------------------------------------------------------------
md("## 1. Imports et connexion à la base de données")

code(
"""import os
import warnings
from pathlib import Path

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from dotenv import load_dotenv
from sqlalchemy import create_engine

warnings.filterwarnings("ignore")
plt.rcParams["figure.figsize"] = (11, 4)
plt.rcParams["axes.grid"] = True
plt.rcParams["grid.alpha"] = 0.3

# Le .env du projet Next.js contient DATABASE_URL — c'est la même base que l'application.
load_dotenv(Path("..") / ".env")
engine = create_engine(os.environ["DATABASE_URL"])
print("Connecté à :", engine.url.database)"""
)

code(
"""# Entreprise de test utilisée pour ce notebook (voir ROADMAP.md).
ENTREPRISE_ID = "16f92815-3d8a-4ca4-b1f6-4141811682ae"
NOM_ENTREPRISE = "forsa" """
)

# ---------------------------------------------------------------------------
md(
"""## 2. Chargement des données brutes

On charge les commandes (avec leurs lignes), les charges, et les produits — les mêmes
tables que celles lues par `poserQuestionAssistant.ts` côté application. Une copie CSV est
sauvegardée dans `data/` pour que ce notebook reste reproductible même sans accès direct
à la base (utile pour joindre les données au rapport de stage)."""
)

code(
"""commandes_sql = \"\"\"
    SELECT c.id, c."type", c.statut, c."dateCommande",
           lc."produitId", lc.quantite, lc."prixApplique"
    FROM commandes c
    JOIN lignes_commande lc ON lc."commandeId" = c.id
    WHERE c."entrepriseId" = %(entreprise_id)s
\"\"\"
lignes = pd.read_sql(commandes_sql, engine, params={"entreprise_id": ENTREPRISE_ID})
lignes["dateCommande"] = pd.to_datetime(lignes["dateCommande"])
lignes["montant"] = lignes["quantite"] * lignes["prixApplique"].astype(float)

charges_sql = \"\"\"
    SELECT id, "type", montant, "dateEcheance", recurrente
    FROM charges
    WHERE "entrepriseId" = %(entreprise_id)s
\"\"\"
charges = pd.read_sql(charges_sql, engine, params={"entreprise_id": ENTREPRISE_ID})
charges["dateEcheance"] = pd.to_datetime(charges["dateEcheance"])
charges["montant"] = charges["montant"].astype(float)

produits_sql = \"\"\"
    SELECT id, nom, "prixAchat", "prixVente", "quantiteStock", "seuilAlerte"
    FROM produits
    WHERE "entrepriseId" = %(entreprise_id)s
\"\"\"
produits = pd.read_sql(produits_sql, engine, params={"entreprise_id": ENTREPRISE_ID})

Path("data").mkdir(exist_ok=True)
lignes.to_csv("data/lignes_commande.csv", index=False)
charges.to_csv("data/charges.csv", index=False)
produits.to_csv("data/produits.csv", index=False)

print(f"{len(lignes)} lignes de commande, {len(charges)} charges, {len(produits)} produits")
lignes.head()"""
)

# ---------------------------------------------------------------------------
md(
"""## 3. Séries mensuelles agrégées

Ventes livrées (`VENTE_CLIENT` + `RECUE`), achats reçus (`ACHAT_FOURNISSEUR` + `RECUE`),
charges totales, et marge (ventes − charges), un point par mois calendaire — même logique
que `calculerTendanceMensuelle` côté application."""
)

code(
"""def mois(dt_series):
    return dt_series.dt.to_period("M").dt.to_timestamp()

ventes = lignes[(lignes["type"] == "VENTE_CLIENT") & (lignes["statut"] == "RECUE")].copy()
achats = lignes[(lignes["type"] == "ACHAT_FOURNISSEUR") & (lignes["statut"] == "RECUE")].copy()

ventes["mois"] = mois(ventes["dateCommande"])
achats["mois"] = mois(achats["dateCommande"])
charges["mois"] = mois(charges["dateEcheance"])

ventes_mensuelles = ventes.groupby("mois")["montant"].sum().rename("ventes")
achats_mensuels = achats.groupby("mois")["montant"].sum().rename("achats")
charges_mensuelles = charges.groupby("mois")["montant"].sum().rename("charges")

serie = pd.concat([ventes_mensuelles, achats_mensuels, charges_mensuelles], axis=1).fillna(0.0)
serie = serie.sort_index()
serie["marge"] = serie["ventes"] - serie["charges"]

# On retire le mois en cours s'il est partiel (moins de 25 jours de données) — fausserait
# la fin de la série pour le backtesting.
aujourdhui = pd.Timestamp.today()
if serie.index[-1].to_period("M") == aujourdhui.to_period("M") and aujourdhui.day < 25:
    serie = serie.iloc[:-1]

serie.to_csv("data/serie_mensuelle.csv")
serie"""
)

code(
"""fig, axes = plt.subplots(2, 1, figsize=(11, 7), sharex=True)
axes[0].plot(serie.index, serie["ventes"], marker="o", label="Ventes")
axes[0].plot(serie.index, serie["achats"], marker="o", label="Achats (coût)")
axes[0].set_title(f"{NOM_ENTREPRISE} — ventes et achats mensuels")
axes[0].legend()

axes[1].plot(serie.index, serie["marge"], marker="o", color="tab:green", label="Marge (ventes - charges)")
axes[1].axhline(0, color="black", linewidth=0.8)
axes[1].set_title("Marge mensuelle")
axes[1].legend()

plt.tight_layout()
plt.savefig("data/fig_tendance_globale.png", dpi=150)
plt.show()"""
)

# ---------------------------------------------------------------------------
md(
"""## 4. Demande par produit

On regarde la demande mensuelle (quantité vendue) pour quelques produits représentatifs :
un produit à forte saisonnalité hivernale, un à forte saisonnalité estivale, et les deux
meilleurs vendeurs toutes saisons confondues."""
)

code(
"""# Plusieurs lignes de produits partagent le même nom (variantes Taille/Couleur, ex. 4
# "T-shirt Basique" différents) — on agrège par nom, pas par produitId, pour avoir une
# seule série par nom de produit.
ventes_avec_nom = ventes.merge(produits[["id", "nom"]], left_on="produitId", right_on="id")
ventes_par_produit = ventes_avec_nom.groupby(["mois", "nom"])["quantite"].sum().reset_index()

total_par_produit = ventes_par_produit.groupby("nom")["quantite"].sum().sort_values(ascending=False)
print("Volume total vendu par produit :")
print(total_par_produit)

produits_a_tracer = ["Écharpe Hiver", "Maillot de Bain"] + list(total_par_produit.index[:2])
produits_a_tracer = list(dict.fromkeys(produits_a_tracer))  # dédoublonne en gardant l'ordre

fig, ax = plt.subplots(figsize=(11, 5))
for nom_produit in produits_a_tracer:
    sous_serie = ventes_par_produit[ventes_par_produit["nom"] == nom_produit].set_index("mois")["quantite"]
    sous_serie = sous_serie.reindex(serie.index, fill_value=0)
    ax.plot(sous_serie.index, sous_serie.values, marker="o", label=nom_produit)

ax.set_title("Quantité vendue par mois, par produit")
ax.legend()
plt.tight_layout()
plt.savefig("data/fig_demande_produits.png", dpi=150)
plt.show()"""
)

# ---------------------------------------------------------------------------
md(
"""## 5. Modèles de prévision

Trois modèles, du plus simple au plus riche :

- **Régression linéaire** — une droite de tendance sur l'index temporel. Rapide, interprétable,
  aucune notion de saisonnalité.
- **Holt** (lissage exponentiel double) — capture le niveau *et* la tendance, s'adapte plus vite
  qu'une régression si la tendance change de pente en cours de route. Pas de saisonnalité.
- **Holt-Winters** (lissage exponentiel triple) — ajoute une composante saisonnière. Nécessite
  au moins deux cycles complets pour l'estimer correctement (nous exigeons ≥ 24 points)."""
)

code(
"""from sklearn.linear_model import LinearRegression
from statsmodels.tsa.holtwinters import ExponentialSmoothing, Holt


def prevoir_regression_lineaire(historique, horizon=1):
    x = np.arange(len(historique)).reshape(-1, 1)
    y = historique.values.astype(float)
    modele = LinearRegression().fit(x, y)
    x_futur = np.arange(len(historique), len(historique) + horizon).reshape(-1, 1)
    return modele.predict(x_futur)


def prevoir_holt(historique, horizon=1):
    modele = Holt(historique.values.astype(float), initialization_method="estimated").fit()
    return modele.forecast(horizon)


def prevoir_holt_winters(historique, horizon=1, periode_saisonniere=12):
    modele = ExponentialSmoothing(
        historique.values.astype(float),
        trend="add",
        seasonal="add",
        seasonal_periods=periode_saisonniere,
        initialization_method="estimated",
    ).fit()
    return modele.forecast(horizon)"""
)

# ---------------------------------------------------------------------------
md(
"""## 6. Validation : rolling-origin backtesting

Avec seulement ~24 points mensuels, un simple split train/test (par ex. les 3 derniers mois en
test) donnerait une erreur mesurée sur 3 points seulement — bien trop bruité pour être fiable.

À la place : **rolling-origin backtesting**. On entraîne sur les mois `1..k`, on prédit le mois
`k+1`, on avance l'origine d'un mois, on recommence — jusqu'à épuiser la série. Chaque modèle
est ainsi testé sur autant de prévisions à 1 mois que l'historique le permet, ce qui donne une
mesure d'erreur bien plus stable.

Garde-fou : on n'entraîne jamais sur moins de 8 mois (`TAILLE_MIN_ENTRAINEMENT`) — sous ce seuil,
même le backtest n'est pas fiable, donc on ne compare pas de modèles du tout (voir ROADMAP.md)."""
)

code(
"""TAILLE_MIN_ENTRAINEMENT = 8


def backtest_rolling_origin(serie_valeurs, fonction_prevision, taille_min_entrainement=TAILLE_MIN_ENTRAINEMENT, horizon=1):
    # NB : la fenetre d'entrainement grandit progressivement depuis taille_min_entrainement.
    # Un modele qui a besoin de plus de points (ex. Holt-Winters, >= 2 cycles saisonniers)
    # doit recevoir un taille_min_entrainement plus eleve, sinon ses premieres iterations
    # echoueront systematiquement (voir section 8).
    \"\"\"serie_valeurs : pd.Series indexée par mois. Retourne un DataFrame origine/date_cible/reel/predit.\"\"\"
    resultats = []
    n = len(serie_valeurs)
    for fin_entrainement in range(taille_min_entrainement, n - horizon + 1):
        entrainement = serie_valeurs.iloc[:fin_entrainement]
        reel = serie_valeurs.iloc[fin_entrainement:fin_entrainement + horizon]
        try:
            predit = fonction_prevision(entrainement, horizon=horizon)
        except Exception:
            continue
        for i, (date_cible, valeur_reelle) in enumerate(reel.items()):
            resultats.append({
                "origine": serie_valeurs.index[fin_entrainement - 1],
                "date_cible": date_cible,
                "reel": valeur_reelle,
                "predit": predit[i],
            })
    return pd.DataFrame(resultats)"""
)

# ---------------------------------------------------------------------------
md("## 7. Métriques d'erreur : MAE, RMSE, MAPE, sMAPE")

code(
"""def mae(reel, predit):
    reel, predit = np.asarray(reel, dtype=float), np.asarray(predit, dtype=float)
    return float(np.mean(np.abs(reel - predit)))


def rmse(reel, predit):
    reel, predit = np.asarray(reel, dtype=float), np.asarray(predit, dtype=float)
    return float(np.sqrt(np.mean((reel - predit) ** 2)))


def mape(reel, predit):
    reel, predit = np.asarray(reel, dtype=float), np.asarray(predit, dtype=float)
    masque = reel != 0
    if not masque.any():
        return np.nan
    return float(np.mean(np.abs((reel[masque] - predit[masque]) / reel[masque])) * 100)


def smape(reel, predit):
    \"\"\"Symétrique : plus stable que le MAPE quand des mois ont un réel proche de 0.\"\"\"
    reel, predit = np.asarray(reel, dtype=float), np.asarray(predit, dtype=float)
    denom = np.abs(reel) + np.abs(predit)
    masque = denom != 0
    if not masque.any():
        return np.nan
    return float(np.mean(2 * np.abs(reel[masque] - predit[masque]) / denom[masque]) * 100)


def calculer_metriques(bt):
    if bt.empty:
        return {"MAE": np.nan, "RMSE": np.nan, "MAPE (%)": np.nan, "sMAPE (%)": np.nan, "points_testes": 0}
    return {"MAE": mae(bt["reel"], bt["predit"]), "RMSE": rmse(bt["reel"], bt["predit"]),
            "MAPE (%)": mape(bt["reel"], bt["predit"]), "sMAPE (%)": smape(bt["reel"], bt["predit"]),
            "points_testes": len(bt)}"""
)

# ---------------------------------------------------------------------------
md(
"""## 8. Comparaison sur le chiffre d'affaires global

On backteste chaque modèle sur la série mensuelle des ventes de l'entreprise, puis on compare.

**Point méthodologique important** : Holt-Winters a besoin d'au moins `2 * periode_saisonniere`
points (24 pour une saisonnalité annuelle) pour être *ajusté* — mais pour le *backtester*
correctement, il faut en plus plusieurs points *après* ce minimum, sinon il n'y a quasiment
aucune origine valide sur laquelle l'évaluer. Avec ~24-25 mois de données au total, ce
notebook exige au moins `MIN_POINTS_BACKTEST_HW` origines valides pour inclure Holt-Winters
dans la comparaison chiffrée ci-dessous — sinon il est exclu de la comparaison (mais un
ajustement unique, illustratif, est quand même montré plus bas)."""
)

code(
"""PERIODE_SAISONNIERE = 12
MIN_POINTS_BACKTEST_HW = 4  # nombre minimal d'origines de backtest exigees pour Holt-Winters


def modeles_disponibles(longueur_serie, periode_saisonniere=PERIODE_SAISONNIERE, min_points_backtest_hw=MIN_POINTS_BACKTEST_HW):
    \"\"\"Retourne {nom_modele: (fonction_prevision, taille_min_entrainement)}.\"\"\"
    modeles = {
        "Régression linéaire": (prevoir_regression_lineaire, TAILLE_MIN_ENTRAINEMENT),
        "Holt": (prevoir_holt, TAILLE_MIN_ENTRAINEMENT),
    }
    minimum_hw = 2 * periode_saisonniere
    if longueur_serie - minimum_hw >= min_points_backtest_hw:
        fonction_hw = lambda h, horizon=1: prevoir_holt_winters(h, horizon=horizon, periode_saisonniere=periode_saisonniere)
        modeles["Holt-Winters"] = (fonction_hw, minimum_hw)
    return modeles


modeles = modeles_disponibles(len(serie))
print(f"Série de {len(serie)} mois. Modèles inclus dans le backtest :", list(modeles.keys()))
if "Holt-Winters" not in modeles:
    print(
        f"Holt-Winters exclu de la comparaison chiffrée : il faudrait au moins "
        f"{2 * PERIODE_SAISONNIERE + MIN_POINTS_BACKTEST_HW} mois d'historique pour le "
        f"backtester de façon fiable (contre {len(serie)} disponibles)."
    )

backtests_ventes = {
    nom: backtest_rolling_origin(serie["ventes"], fonction, taille_min_entrainement=taille_min)
    for nom, (fonction, taille_min) in modeles.items()
}
comparaison_ventes = pd.DataFrame({nom: calculer_metriques(bt) for nom, bt in backtests_ventes.items()}).T
comparaison_ventes.sort_values("RMSE")"""
)

code(
"""# Holt-Winters : ajustement unique sur toute la série, à titre illustratif seulement —
# non validé par backtesting si la série est trop courte (voir avertissement ci-dessus).
if "Holt-Winters" not in modeles:
    previsions_hw_illustratives = prevoir_holt_winters(serie["ventes"], horizon=3, periode_saisonniere=PERIODE_SAISONNIERE)
    print("Prévision Holt-Winters (illustrative, non backtestée) pour les 3 prochains mois :")
    print(np.round(previsions_hw_illustratives, 2))"""
)

code(
"""fig, ax = plt.subplots(figsize=(8, 4))
comparaison_ventes[["MAE", "RMSE"]].plot.bar(ax=ax)
ax.set_title("Erreur de prévision par modèle — chiffre d'affaires mensuel")
ax.set_ylabel("Erreur (montant)")
plt.tight_layout()
plt.savefig("data/fig_comparaison_modeles.png", dpi=150)
plt.show()"""
)

code(
"""meilleur_modele_ventes = comparaison_ventes["RMSE"].idxmin()
print("Meilleur modèle pour le chiffre d'affaires :", meilleur_modele_ventes)

fig, ax = plt.subplots(figsize=(11, 4))
ax.plot(serie.index, serie["ventes"], marker="o", label="Réel", color="black")
for nom, bt in backtests_ventes.items():
    style = "-" if nom == meilleur_modele_ventes else "--"
    ax.plot(bt["date_cible"], bt["predit"], style, marker=".", label=f"Prédit ({nom})", alpha=0.8)
ax.set_title("Réel vs prédit (1 mois à l'avance, rolling-origin) — chiffre d'affaires")
ax.legend()
plt.tight_layout()
plt.savefig("data/fig_reel_vs_predit_ventes.png", dpi=150)
plt.show()"""
)

# ---------------------------------------------------------------------------
md(
"""## 9. Comparaison par produit

Même méthodologie, appliquée à la demande mensuelle (quantité vendue) de chaque produit
individuellement — le modèle gagnant peut différer d'un produit à l'autre (ex. un produit
saisonnier peut favoriser Holt-Winters, un produit à demande stable favorise la régression)."""
)

code(
"""resultats_par_produit = []

for nom_produit in total_par_produit.index:
    sous_serie = ventes_par_produit[ventes_par_produit["nom"] == nom_produit].set_index("mois")["quantite"]
    sous_serie = sous_serie.reindex(serie.index, fill_value=0).astype(float)

    modeles_produit = modeles_disponibles(len(sous_serie))
    meilleure_ligne = None
    for nom_modele, (fonction, taille_min) in modeles_produit.items():
        bt = backtest_rolling_origin(sous_serie, fonction, taille_min_entrainement=taille_min)
        if bt.empty:
            continue
        metriques = calculer_metriques(bt)
        if meilleure_ligne is None or metriques["RMSE"] < meilleure_ligne["RMSE"]:
            meilleure_ligne = {"produit": nom_produit, "modèle_gagnant": nom_modele, **metriques}

    if meilleure_ligne:
        resultats_par_produit.append(meilleure_ligne)

resume_produits = pd.DataFrame(resultats_par_produit).set_index("produit")
resume_produits.to_csv("data/resume_meilleur_modele_par_produit.csv")
resume_produits"""
)

code(
"""fig, ax = plt.subplots(figsize=(8, 4))
resume_produits["modèle_gagnant"].value_counts().plot.bar(ax=ax, color="tab:blue")
ax.set_title("Nombre de produits où chaque modèle l'emporte")
ax.set_ylabel("Nombre de produits")
plt.tight_layout()
plt.savefig("data/fig_modele_gagnant_par_produit.png", dpi=150)
plt.show()"""
)

# ---------------------------------------------------------------------------
md(
"""## 10. Conclusion

- Le modèle gagnant sur le chiffre d'affaires global sert de référence pour la prévision
  « revenu global » de l'application.
- Le tableau par produit (section 9) montre que le meilleur modèle peut varier — c'est
  attendu, et c'est justement pourquoi la comparaison est refaite par entreprise (et par
  série) plutôt que fixée une fois pour toutes dans le code.
- Pour la marge (risque de perte), l'approche retenue est de projeter séparément les ventes
  et les charges avec le même modèle gagnant, puis de soustraire les deux projections —
  voir ROADMAP.md, section Intelligence artificielle.
- Cette méthodologie (régression / Holt / Holt-Winters, backtesting rolling-origin,
  MAE/RMSE/MAPE/sMAPE) est celle qui sera reproduite en TypeScript pur dans
  `domain/services/` pour la production — ce notebook ne sert qu'à la valider et à produire
  les graphes et chiffres de ce rapport de stage."""
)

nb["cells"] = cells

with open("previsions.ipynb", "w", encoding="utf-8") as f:
    nbf.write(nb, f)

print(f"Notebook créé avec {len(cells)} cellules.")
