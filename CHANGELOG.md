# Changelog

## 1.2.0
- **Une couleur par groupe** ([#4](https://github.com/kaaribou/holm-covers-card/issues/4)) : `color` colore les icônes et le titre du groupe ; `tint` ajoute un fond teinté (`tint_opacity`) ; `color` aussi possible volet par volet.
- **Volets sans retour d'état** ([#3](https://github.com/kaaribou/holm-covers-card/issues/3)) : `show_state: false` (carte ou volet) masque « Ouvert / Fermé », la position et la jauge ; `state_entity` affiche l'état d'après un capteur d'ouverture (binary_sensor). Les compteurs « ouverts » ne comptent que les volets dont l'état est connu.
- **Appui court** ([#5](https://github.com/kaaribou/holm-covers-card/issues/5)) : `tap_action` au choix (ouvrir / fermer, curseur de position, fiche du volet, aucune action) ; un toucher qui glisse (défilement sur mobile) n'est plus pris pour un appui court ni long.
- **Jauge de position** sur toute la largeur, jusqu'aux boutons ([#5](https://github.com/kaaribou/holm-covers-card/issues/5)).
- Éditeur : appui court et état pour toute la carte, couleur et fond par groupe, **réglages par volet** (nom court, capteur d'ouverture, couleur, état).

## 1.1.2
- **iPhone / iPad : la page ne remonte plus toute seule.** Quand la carte se redessinait (à chaque mouvement d'un volet ou à l'ouverture d'un curseur), la page pouvait remonter d'un coup sur iOS (Safari et application Home Assistant). La carte garde maintenant sa hauteur pendant qu'elle se redessine, et la position de défilement est conservée.

## 1.1.1
- Volet seul dans une demi-colonne : quand la carte est étroite, les boutons ▼ ■ ▲ passent sous le nom au lieu d'être coupés.

## 1.1.0
- **Volet seul** (#1) : option `entity` pour afficher un seul volet, sans titre ni groupe ; choix *Volet seul / Groupes de volets* dans l'éditeur.
- **Position précise dans la tuile** (#2) : à l'appui long, le curseur s'ouvre dans la tuile du volet au lieu de prendre toute la largeur de la carte ; le volet voisin ne bouge plus.

## 1.0.0
Première version publique.

- Volets compacts regroupés par étage, boutons ▼ ■ ▲ et position en clair.
- Résumé ouverts / en mouvement, commandes groupées par maison et par étage.
- Appui court : ouvrir / fermer / stopper ; appui long : curseur de position.
- Éditeur visuel des groupes.
