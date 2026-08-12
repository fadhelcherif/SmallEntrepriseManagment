"""Execute previsions.ipynb en pilotant nbclient directement (evite le dispatch CLI `jupyter execute`,
qui sur cette machine resout un mauvais interpreteur pour le kernel)."""
import sys

import nbformat
from nbclient import NotebookClient

path = "previsions.ipynb"
nb = nbformat.read(path, as_version=4)

client = NotebookClient(nb, timeout=300, kernel_name="python3", resources={"metadata": {"path": "."}})
client.execute()

nbformat.write(nb, path)
print("Exécution terminée sans erreur.")
