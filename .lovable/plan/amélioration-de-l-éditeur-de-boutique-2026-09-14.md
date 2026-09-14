# Amélioration de l’éditeur de boutique

## Objectif
Transformer l’espace « Boutique » en un véritable éditeur visuel : les réglages restent simples, chaque modification apparaît immédiatement, et les sections de la boutique peuvent être organisées librement.

## Changements prévus

### 1. Polices et couleurs enrichies
- Étendre les associations de polices proposées et afficher leur rendu directement dans le sélecteur.
- Conserver les réglages séparés pour titres et textes, avec taille des titres et option majuscules.
- Ajouter des palettes prêtes à l’emploi en complément des sélecteurs de couleurs précis.
- Continuer à permettre la modification manuelle de chaque couleur : principale, fond, cartes, texte, texte secondaire et accent.

### 2. Aperçu en direct
- Installer un aperçu complet et permanent de la boutique à côté des réglages sur ordinateur.
- Proposer un basculement téléphone/ordinateur pour contrôler les deux formats.
- Mettre l’aperçu à jour instantanément pendant les changements de couleurs, polices, boutons, contenus et disposition.
- Garder le bouton ouvrant la vraie boutique dans un nouvel onglet.

### 3. Blocs modulables
- Remplacer la simple liste d’interrupteurs par des blocs de sections manipulables.
- Permettre de réorganiser les blocs par glisser-déposer, sans flèches.
- Permettre d’activer ou masquer chaque bloc directement depuis sa ligne.
- Gérer au minimum : bandeau d’annonce, bannière d’accueil, arguments de confiance, catégories, produits et pied de page.
- Appliquer le même ordre et la même visibilité dans l’aperçu et sur la boutique publique.

## Détails techniques
- Étendre le thème de boutique avec un ordre de sections persistant et rétrocompatible avec les thèmes déjà enregistrés.
- Extraire un rendu partagé de la boutique afin que l’aperçu et la vitrine publique utilisent la même structure.
- Utiliser le glisser-déposer natif, avec une alternative accessible au clavier.
- Préserver les deux modèles existants, WhatsApp flottant et les personnalisations déjà enregistrées.
- Vérifier le rendu sur téléphone et ordinateur, le déplacement des blocs et la persistance après actualisation.
