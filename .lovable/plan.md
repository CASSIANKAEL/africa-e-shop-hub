# Mapping des colonnes Google Sheets

## Objectif
Permettre à chaque boutique de choisir précisément quelle donnée de commande est envoyée dans chaque colonne de son fichier Google Sheets, ou de laisser une colonne vide.

## Modifications prévues
- Ajouter une section « Mapping des colonnes » sous la connexion du fichier.
- Fournir une liste de colonnes configurable avec : lettre de colonne, nom d’en-tête et donnée associée.
- Proposer les données utiles : référence, date, nom, téléphone, ville, adresse, produits, quantités, montant, devise, paiement, statut, commentaire et suivi livreur.
- Ajouter l’option « Laisser vide » pour toute colonne.
- Permettre d’ajouter, supprimer et réordonner les colonnes simplement.
- Afficher un aperçu d’une ligne pour rendre le résultat immédiatement compréhensible.
- Enregistrer un mapping différent pour chaque boutique et conserver une configuration prête à l’emploi par défaut.
- Désactiver le mapping tant qu’aucun fichier Google Sheets n’est connecté.

## Détails techniques
- Étendre la configuration Google Sheets avec une liste typée de correspondances de colonnes.
- Conserver ces correspondances avec les réglages Google Sheets existants de la boutique.
- Construire les valeurs d’aperçu depuis une commande fictive sans modifier les commandes ni les autres intégrations.
- Vérifier le rendu et les interactions sur ordinateur et téléphone.
