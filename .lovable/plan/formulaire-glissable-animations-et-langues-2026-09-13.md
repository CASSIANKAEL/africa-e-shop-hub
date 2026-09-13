# Formulaire glissable, animations et langues

## Résultat attendu
- Remplacer les flèches de déplacement des champs par un glisser-déposer vertical, utilisable à la souris et au tactile, avec un repère visuel pendant le déplacement.
- Ajouter au réglage du bouton « Commander » un choix d’animations : aucune, pulsation, rebond doux, secousse, flottement et brillance.
- Ajouter en haut de l’espace administrateur un sélecteur de langue avec Français, English et Español, le français restant la langue par défaut.
- Conserver le choix de langue pendant la navigation et traduire les éléments communs ainsi que l’éditeur du formulaire de commande.

## Détails techniques
- Utiliser les événements de glisser-déposer du navigateur pour réordonner les champs sans ajouter une dépendance lourde.
- Enregistrer le type d’animation dans la configuration du formulaire et l’appliquer à l’aperçu du bouton.
- Ajouter un petit contexte de langue partagé et un dictionnaire extensible afin que d’autres langues et écrans puissent être ajoutés ensuite.
- Respecter la réduction des animations demandée par les réglages d’accessibilité de l’appareil.
- Vérifier le déplacement, les animations et le changement de langue sur ordinateur et mobile.
