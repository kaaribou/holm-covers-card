/* holm-covers-card — https://github.com/kaaribou/holm-covers-card — licence MIT — v1.4.0 */
// holm-covers-card — volets compacts, horizontaux, regroupés par étage
// Boutons ▼ ■ ▲ sur chaque ligne. Appui court sur la ligne : ouvre / ferme (ou stoppe). Appui long : curseur de position.
// type: custom:holm-covers-card
// title: Volets
// all: cover.volets_de_la_maison        (commande « Tous », optionnel)
// groups:
//   - name: Rez-de-chaussée   icon: mdi:home-floor-0
//     entities: [{ entity: cover.salon_1, name: Salon 1 }]
// ou, pour un volet seul :  entity: cover.bureau   name: Volets du bureau
// Options : show_state (false = ni « Ouvert / Fermé » ni position), tap_action (toggle | none | more-info | position),
//   par groupe : color, tint, tint_opacity ; par volet : state_entity (capteur d'ouverture), color, show_state
(() => {
  // ---- HOLM i18n : textes écrits en français, traduits à l'affichage (en, de, es, it, nl, pt, pl) ----
  // Langue : option `language` de la carte, sinon celle du profil Home Assistant ; anglais si la langue n'est pas traduite.
  const HOLM_LANGS = ["en", "de", "es", "it", "nl", "pt", "pl"];
  const LANG_NAMES = { fr: "Français", en: "English", de: "Deutsch", es: "Español", it: "Italiano", nl: "Nederlands", pt: "Português", pl: "Polski" };
  const LOCALES = { fr: "fr-FR", en: "en-GB", de: "de-DE", es: "es-ES", it: "it-IT", nl: "nl-NL", pt: "pt-PT", pl: "pl-PL" };
  const I18N = {
    "Automatique (profil)": ["Automatic (profile)", "Automatisch (Profil)", "Automático (perfil)", "Automatica (profilo)", "Automatisch (profiel)", "Automático (perfil)", "Automatycznie (profil)"],
    "Langue": ["Language", "Sprache", "Idioma", "Lingua", "Taal", "Idioma", "Język"],
    "Titre": ["Title", "Titel", "Título", "Titolo", "Titel", "Título", "Tytuł"],
    "Titre (optionnel)": ["Title (optional)", "Titel (optional)", "Título (opcional)", "Titolo (facoltativo)", "Titel (optioneel)", "Título (opcional)", "Tytuł (opcjonalnie)"],
    "Nom": ["Name", "Name", "Nombre", "Nome", "Naam", "Nome", "Nazwa"],
    "Nom affiché": ["Display name", "Anzeigename", "Nombre mostrado", "Nome visualizzato", "Weergavenaam", "Nome apresentado", "Wyświetlana nazwa"],
    "Icône": ["Icon", "Symbol", "Icono", "Icona", "Pictogram", "Ícone", "Ikona"],
    "Couleur": ["Colour", "Farbe", "Color", "Colore", "Kleur", "Cor", "Kolor"],
    "Couleurs": ["Colours", "Farben", "Colores", "Colori", "Kleuren", "Cores", "Kolory"],
    "Entité": ["Entity", "Entität", "Entidad", "Entità", "Entiteit", "Entidade", "Encja"],
    "Entités": ["Entities", "Entitäten", "Entidades", "Entità", "Entiteiten", "Entidades", "Encje"],
    "Chargement…": ["Loading…", "Wird geladen…", "Cargando…", "Caricamento…", "Laden…", "A carregar…", "Ładowanie…"],
    "Erreur": ["Error", "Fehler", "Error", "Errore", "Fout", "Erro", "Błąd"],
    "Fermer": ["Close", "Schließen", "Cerrar", "Chiudi", "Sluiten", "Fechar", "Zamknij"],
    "Annuler": ["Cancel", "Abbrechen", "Cancelar", "Annulla", "Annuleren", "Cancelar", "Anuluj"],
    "Enregistrer": ["Save", "Speichern", "Guardar", "Salva", "Opslaan", "Guardar", "Zapisz"],
    "Supprimer": ["Delete", "Löschen", "Eliminar", "Elimina", "Verwijderen", "Eliminar", "Usuń"],
    "Ajouter": ["Add", "Hinzufügen", "Añadir", "Aggiungi", "Toevoegen", "Adicionar", "Dodaj"],
    "Monter": ["Move up", "Nach oben", "Subir", "Sposta su", "Omhoog", "Mover para cima", "W górę"],
    "Descendre": ["Move down", "Nach unten", "Bajar", "Sposta giù", "Omlaag", "Mover para baixo", "W dół"],
    "Afficher le cadre de la carte": ["Show the card frame", "Kartenrahmen anzeigen", "Mostrar el marco de la tarjeta", "Mostra la cornice della scheda", "Kaartkader tonen", "Mostrar a moldura do cartão", "Pokaż ramkę karty"],
    "Indisponible": ["Unavailable", "Nicht verfügbar", "No disponible", "Non disponibile", "Niet beschikbaar", "Indisponível", "Niedostępne"],
    "Aujourd'hui": ["Today", "Heute", "Hoy", "Oggi", "Vandaag", "Hoje", "Dziś"],
    "Hier": ["Yesterday", "Gestern", "Ayer", "Ieri", "Gisteren", "Ontem", "Wczoraj"],
    "Demain": ["Tomorrow", "Morgen", "Mañana", "Domani", "Morgen", "Amanhã", "Jutro"],
    "Batterie": ["Battery", "Batterie", "Batería", "Batteria", "Batterij", "Bateria", "Bateria"],
    "Aucune donnée sur cette période.": ["No data for this period.", "Keine Daten für diesen Zeitraum.", "No hay datos en este periodo.", "Nessun dato per questo periodo.", "Geen gegevens voor deze periode.", "Sem dados neste período.", "Brak danych w tym okresie."],
    "à l'instant": ["just now", "gerade eben", "ahora mismo", "proprio ora", "zojuist", "agora mesmo", "przed chwilą"],
    "il y a {n} min": ["{n} min ago", "vor {n} Min.", "hace {n} min", "{n} min fa", "{n} min geleden", "há {n} min", "{n} min temu"],
    "il y a {n} h": ["{n} h ago", "vor {n} Std.", "hace {n} h", "{n} h fa", "{n} u geleden", "há {n} h", "{n} godz. temu"],
    "il y a {n} j": ["{n} d ago", "vor {n} T.", "hace {n} d", "{n} g fa", "{n} d geleden", "há {n} d", "{n} dni temu"],
    "Volets": ["Shutters", "Rollläden", "Persianas", "Tapparelle", "Rolluiken", "Estores", "Rolety"],
    "Volet": ["Shutter", "Rollladen", "Persiana", "Tapparella", "Rolluik", "Estore", "Roleta"],
    "État inconnu": ["Unknown state", "Status unbekannt", "Estado desconocido", "Stato sconosciuto", "Status onbekend", "Estado desconhecido", "Nieznany stan"],
    "Ouvert": ["Open", "Offen", "Abierta", "Aperta", "Open", "Aberto", "Otwarta"],
    "Fermé": ["Closed", "Geschlossen", "Cerrada", "Chiusa", "Dicht", "Fechado", "Zamknięta"],
    "introuvable": ["not found", "nicht gefunden", "no encontrado", "non trovato", "niet gevonden", "não encontrado", "nie znaleziono"],
    "indisponible": ["unavailable", "nicht verfügbar", "no disponible", "non disponibile", "niet beschikbaar", "indisponível", "niedostępna"],
    "Ouverture… {p}": ["Opening… {p}", "Öffnet… {p}", "Abriendo… {p}", "Apertura… {p}", "Openen… {p}", "A abrir… {p}", "Otwieranie… {p}"],
    "Fermeture… {p}": ["Closing… {p}", "Schließt… {p}", "Cerrando… {p}", "Chiusura… {p}", "Sluiten… {p}", "A fechar… {p}", "Zamykanie… {p}"],
    "Ouvert à {p} %": ["Open at {p}%", "Zu {p} % offen", "Abierta al {p} %", "Aperta al {p}%", "Open op {p}%", "Aberto a {p}%", "Otwarta na {p}%"],
    "Ouvrir": ["Open", "Öffnen", "Abrir", "Apri", "Openen", "Abrir", "Otwórz"],
    "Stop": ["Stop", "Stopp", "Parar", "Stop", "Stop", "Parar", "Stop"],
    "Position non réglable pour ce volet": ["Position can't be set for this shutter", "Position für diesen Rollladen nicht einstellbar", "Posición no ajustable para esta persiana", "Posizione non regolabile per questa tapparella", "Positie niet instelbaar voor dit rolluik", "Posição não ajustável para este estore", "Pozycja tej rolety nie jest regulowana"],
    "{o}/{n} ouverts": ["{o}/{n} open", "{o}/{n} offen", "{o}/{n} abiertas", "{o}/{n} aperte", "{o}/{n} open", "{o}/{n} abertos", "{o}/{n} otwarte"],
    "{n} en mouvement": ["{n} moving", "{n} in Bewegung", "{n} en movimiento", "{n} in movimento", "{n} in beweging", "{n} em movimento", "{n} w ruchu"],
    "Tout fermer": ["Close all", "Alle schließen", "Cerrar todo", "Chiudi tutto", "Alles sluiten", "Fechar tudo", "Zamknij wszystkie"],
    "Tout ouvrir": ["Open all", "Alle öffnen", "Abrir todo", "Apri tutto", "Alles openen", "Abrir tudo", "Otwórz wszystkie"],
    "Choisissez un volet dans l'éditeur": ["Choose a shutter in the editor", "Wählen Sie im Editor einen Rollladen", "Elige una persiana en el editor", "Scegli una tapparella nell'editor", "Kies een rolluik in de editor", "Escolha um estore no editor", "Wybierz roletę w edytorze"],
    "Tous": ["All", "Alle", "Todas", "Tutte", "Alle", "Todos", "Wszystkie"],
    "Toucher un volet : position précise": ["Tap a shutter: exact position", "Rollladen antippen: genaue Position", "Toca una persiana: posición precisa", "Tocca una tapparella: posizione precisa", "Tik op een rolluik: exacte positie", "Toque num estore: posição exata", "Dotknij rolety: dokładna pozycja"],
    "Appui long sur un volet : position précise": ["Long-press a shutter: exact position", "Rollladen lange drücken: genaue Position", "Mantén pulsada una persiana: posición precisa", "Tieni premuta una tapparella: posizione precisa", "Lang drukken op een rolluik: exacte positie", "Pressão longa num estore: posição exata", "Przytrzymaj roletę: dokładna pozycja"],
    "Rez-de-chaussée": ["Ground floor", "Erdgeschoss", "Planta baja", "Piano terra", "Begane grond", "Rés-do-chão", "Parter"],
    "Affichage": ["Display", "Anzeige", "Visualización", "Visualizzazione", "Weergave", "Apresentação", "Wyświetlanie"],
    "Nom affiché (optionnel)": ["Display name (optional)", "Anzeigename (optional)", "Nombre mostrado (opcional)", "Nome visualizzato (facoltativo)", "Weergavenaam (optioneel)", "Nome apresentado (opcional)", "Wyświetlana nazwa (opcjonalnie)"],
    "Commande « Tous » (volet ou groupe, optionnel)": ["“All” control (shutter or group, optional)", "Steuerung „Alle“ (Rollladen oder Gruppe, optional)", "Control «Todas» (persiana o grupo, opcional)", "Comando «Tutte» (tapparella o gruppo, facoltativo)", "Bediening ‘Alle’ (rolluik of groep, optioneel)", "Comando «Todos» (estore ou grupo, opcional)", "Sterowanie „Wszystkie” (roleta lub grupa, opcjonalnie)"],
    "Nom du groupe": ["Group name", "Gruppenname", "Nombre del grupo", "Nome del gruppo", "Groepsnaam", "Nome do grupo", "Nazwa grupy"],
    "Afficher l'état (Ouvert / Fermé, position)": ["Show the state (Open / Closed, position)", "Status anzeigen (Offen / Geschlossen, Position)", "Mostrar el estado (Abierta / Cerrada, posición)", "Mostra lo stato (Aperta / Chiusa, posizione)", "Status tonen (Open / Dicht, positie)", "Mostrar o estado (Aberto / Fechado, posição)", "Pokaż stan (Otwarta / Zamknięta, pozycja)"],
    "Appui court sur un volet": ["Short press on a shutter", "Kurzer Druck auf einen Rollladen", "Pulsación corta en una persiana", "Pressione breve su una tapparella", "Kort drukken op een rolluik", "Pressão curta num estore", "Krótkie naciśnięcie rolety"],
    "Capteur d'ouverture (état d'après ce capteur)": ["Opening sensor (state from this sensor)", "Öffnungssensor (Status von diesem Sensor)", "Sensor de apertura (estado según este sensor)", "Sensore di apertura (stato da questo sensore)", "Openingssensor (status volgens deze sensor)", "Sensor de abertura (estado segundo este sensor)", "Czujnik otwarcia (stan według tego czujnika)"],
    "Couleur du groupe": ["Group colour", "Gruppenfarbe", "Color del grupo", "Colore del gruppo", "Groepskleur", "Cor do grupo", "Kolor grupy"],
    "Fond teinté": ["Tinted background", "Getönter Hintergrund", "Fondo tintado", "Sfondo tinto", "Getinte achtergrond", "Fundo tingido", "Barwione tło"],
    "Opacité du fond": ["Background opacity", "Hintergrunddeckkraft", "Opacidad del fondo", "Opacità dello sfondo", "Achtergronddekking", "Opacidade do fundo", "Krycie tła"],
    "Afficher l'état": ["Show the state", "Status anzeigen", "Mostrar el estado", "Mostra lo stato", "Status tonen", "Mostrar o estado", "Pokaż stan"],
    "Couleur (sinon celle du groupe)": ["Colour (otherwise the group's)", "Farbe (sonst die der Gruppe)", "Color (si no, el del grupo)", "Colore (altrimenti quello del gruppo)", "Kleur (anders die van de groep)", "Cor (senão a do grupo)", "Kolor (w przeciwnym razie grupy)"],
    "Ouvrir / fermer (ou stopper)": ["Open / close (or stop)", "Öffnen / schließen (oder stoppen)", "Abrir / cerrar (o parar)", "Apri / chiudi (o ferma)", "Openen / sluiten (of stoppen)", "Abrir / fechar (ou parar)", "Otwórz / zamknij (lub zatrzymaj)"],
    "Afficher le curseur de position": ["Show the position slider", "Positionsregler anzeigen", "Mostrar el control de posición", "Mostra il cursore di posizione", "Positieschuif tonen", "Mostrar o cursor de posição", "Pokaż suwak pozycji"],
    "Ouvrir la fiche du volet": ["Open the shutter's dialog", "Dialog des Rollladens öffnen", "Abrir la ficha de la persiana", "Apri la scheda della tapparella", "Venster van het rolluik openen", "Abrir a ficha do estore", "Otwórz okno rolety"],
    "Aucune action": ["No action", "Keine Aktion", "Ninguna acción", "Nessuna azione", "Geen actie", "Nenhuma ação", "Brak akcji"],
    "Groupes de volets": ["Shutter groups", "Rollladengruppen", "Grupos de persianas", "Gruppi di tapparelle", "Rolluikgroepen", "Grupos de estores", "Grupy rolet"],
    "Volet seul": ["Single shutter", "Einzelner Rollladen", "Persiana sola", "Tapparella singola", "Eén rolluik", "Estore único", "Pojedyncza roleta"],
    "+ Ajouter un groupe": ["+ Add a group", "+ Gruppe hinzufügen", "+ Añadir un grupo", "+ Aggiungi un gruppo", "+ Groep toevoegen", "+ Adicionar um grupo", "+ Dodaj grupę"],
    "Groupe {n}": ["Group {n}", "Gruppe {n}", "Grupo {n}", "Gruppo {n}", "Groep {n}", "Grupo {n}", "Grupa {n}"],
    "Réglages par volet": ["Per-shutter settings", "Einstellungen pro Rollladen", "Ajustes por persiana", "Impostazioni per tapparella", "Instellingen per rolluik", "Definições por estore", "Ustawienia dla każdej rolety"],
    "HOLM – Volets": ["HOLM – Shutters", "HOLM – Rollläden", "HOLM – Persianas", "HOLM – Tapparelle", "HOLM – Rolluiken", "HOLM – Estores", "HOLM – Rolety"],
    "Volets compacts par étage ou volet seul : appui court ouvre/ferme, appui long affiche le curseur de position, couleurs par groupe, capteurs d'ouverture": ["Compact shutters by floor or a single shutter: short press opens/closes, long press shows the position slider, colours per group, opening sensors", "Kompakte Rollläden pro Etage oder einzeln: kurzer Druck öffnet/schließt, langer Druck zeigt den Positionsregler, Farben pro Gruppe, Öffnungssensoren", "Persianas compactas por planta o persiana sola: pulsación corta abre/cierra, larga muestra el control de posición, colores por grupo, sensores de apertura", "Tapparelle compatte per piano o singole: pressione breve apre/chiude, lunga mostra il cursore di posizione, colori per gruppo, sensori di apertura", "Compacte rolluiken per verdieping of één rolluik: kort drukken opent/sluit, lang drukken toont de positieschuif, kleuren per groep, openingssensoren", "Estores compactos por piso ou estore único: pressão curta abre/fecha, longa mostra o cursor de posição, cores por grupo, sensores de abertura", "Kompaktowe rolety według pięter lub pojedyncza: krótkie naciśnięcie otwiera/zamyka, długie pokazuje suwak pozycji, kolory grup, czujniki otwarcia"],
    "Position la plus fermée : {p} %": ["Most closed position: {p} %", "Am weitesten geschlossene Position: {p} %", "Posición más cerrada: {p} %", "Posizione più chiusa: {p} %", "Meest gesloten stand: {p} %", "Posição mais fechada: {p} %", "Najbardziej zamknięta pozycja: {p} %"],
    "Position la plus fermée (%)": ["Most closed position (%)", "Am weitesten geschlossene Position (%)", "Posición más cerrada (%)", "Posizione più chiusa (%)", "Meest gesloten stand (%)", "Posição mais fechada (%)", "Najbardziej zamknięta pozycja (%)"],
    "Position la plus fermée (%) — 0 : celle du groupe ou de la carte": ["Most closed position (%) — 0: the group's or card's", "Am weitesten geschlossene Position (%) — 0: die der Gruppe oder Karte", "Posición más cerrada (%) — 0: la del grupo o de la tarjeta", "Posizione più chiusa (%) — 0: quella del gruppo o della scheda", "Meest gesloten stand (%) — 0: die van de groep of kaart", "Posição mais fechada (%) — 0: a do grupo ou do cartão", "Najbardziej zamknięta pozycja (%) — 0: grupy lub karty"],
    "Afficher les compteurs « ouverts »": ["Show the “open” counters", "„Offen“-Zähler anzeigen", "Mostrar los contadores «abiertas»", "Mostra i contatori «aperte»", "„Open“-tellers tonen", "Mostrar os contadores «abertos»", "Pokaż liczniki „otwarte”"],
  };
  let LANG = "fr", NUMLOC = "fr-FR";
  const langOf = (hass, c) => { const l = String((c && c.language) || (hass && ((hass.locale && hass.locale.language) || hass.language)) || navigator.language || "en").toLowerCase().split(/[-_]/)[0]; return l === "fr" || HOLM_LANGS.includes(l) ? l : "en"; };
  const setLang = (hass, c) => { LANG = langOf(hass, c); const p = hass && hass.locale && hass.locale.language; NUMLOC = !(c && c.language) && p && p.toLowerCase().startsWith(LANG) ? p : LOCALES[LANG]; return LANG; };
  const _ = (s, v) => { let o = LANG === "fr" ? s : ((I18N[s] && I18N[s][HOLM_LANGS.indexOf(LANG)]) || s); if (v) for (const k in v) o = o.split("{" + k + "}").join(v[k]); return o; };
  // champ « Langue » pour les éditeurs visuels (ha-form)
  const langField = () => ({ name: "language", selector: { select: { mode: "dropdown", options: [{ value: "", label: _("Automatique (profil)") }, ...Object.entries(LANG_NAMES).map(([value, label]) => ({ value, label }))] } } });
  // traduit les titres de sections et les libellés d'options d'un schéma ha-form (écrits en français)
  const locSchema = (sc) => (sc || []).map((x) => { const o = { ...x }; if (o.title) o.title = _(o.title); if (o.schema) o.schema = locSchema(o.schema);
    if (o.selector && o.selector.select && o.name !== "language") o.selector = { ...o.selector, select: { ...o.selector.select, options: (o.selector.select.options || []).map((op) => (typeof op === "string" ? op : { ...op, label: _(op.label) })) } };
    if (o.name === "language" && o.selector && o.selector.select) o.selector = { ...o.selector, select: { ...o.selector.select, options: o.selector.select.options.map((op) => (op.value ? op : { ...op, label: _("Automatique (profil)") })) } };
    return o; });
// Garde la position de défilement pendant un nouveau rendu complet de la carte (iPhone / iPad : WebKit n'a pas de
// « scroll anchoring » et la page remontait d'un coup). On fige la hauteur de la carte et on remet le défilement en place.
const keepScroll = (host, fn) => {
  const saved = [];
  let n = host;
  while (n) {
    n = n.assignedSlot || n.parentNode || n.host;
    if (n && n.nodeType === 1 && n.scrollHeight > n.clientHeight) saved.push([n, n.scrollTop]);
  }
  const se = document.scrollingElement;
  if (se) saved.push([se, se.scrollTop]);
  const h = host.offsetHeight;
  if (h) host.style.minHeight = `${h}px`;
  try { return fn(); } finally {
    const restore = () => saved.forEach(([el, t]) => { if (Math.abs(el.scrollTop - t) > 1) el.scrollTop = t; });
    restore();
    requestAnimationFrame(() => { restore(); host.style.minHeight = ""; requestAnimationFrame(restore); });
    setTimeout(() => { host.style.minHeight = ""; }, 500);   // page en arrière-plan : pas d'image affichée, donc pas de requestAnimationFrame
  }
};
const OPEN = "#0abfbf", MOVE = "#e3a21a";
const hex2rgb = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return undefined; const n = parseInt(m[1], 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = (a) => (Array.isArray(a) ? "#" + a.map((v) => Number(v).toString(16).padStart(2, "0")).join("") : a);
const norm = (e) => (typeof e === "string" ? { entity: e } : e);
const VERSION = "1.4.0";
// position la plus fermée autorisée (#7, d'après la PR #8 de developpeurbox) : volet > groupe > carte, 0 = fermeture complète
const minPos = (c, e) => Math.max(0, Math.min(100, Number(e?.min_position ?? e?._g?.min_position ?? c?.min_position ?? 0) || 0));
const pos = (s) => { if (!s) return null; const p = s.attributes.current_position; if (p !== undefined && p !== null) return Number(p); return s.state === "open" ? 100 : s.state === "closed" ? 0 : null; };
const moving = (s) => s && (s.state === "opening" || s.state === "closing");
const canPos = (s) => s && ((s.attributes.supported_features || 0) & 4) === 4;
// petite fenêtre dont les lames descendent selon la fermeture
const shutter = (p, col) => {
  const closed = p == null ? 50 : 100 - p, h = Math.round((closed / 100) * 16);
  let sl = ""; for (let y = 3; y < 3 + h; y += 3) sl += `<line x1="4" x2="20" y1="${y + 1.5}" y2="${y + 1.5}" stroke="${col}" stroke-opacity=".9" stroke-width="1.6"/>`;
  return `<svg viewBox="0 0 24 24" width="24" height="24"><rect x="3" y="2.5" width="18" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-opacity=".55" stroke-width="1.5"/>
    <rect x="3.8" y="3.3" width="16.4" height="${Math.max(0, h)}" fill="${col}" fill-opacity=".22"/>${sl}<line x1="12" x2="12" y1="${3 + h}" y2="21" stroke="currentColor" stroke-opacity=".25"/></svg>`;
};

class HolmCoversCard extends HTMLElement {
  setConfig(c) {
    if (!c || (!("entity" in c) && (!Array.isArray(c.groups) || !c.groups.length))) throw new Error("holm-covers-card : 'entity' (volet seul) ou 'groups' est requis");
    this._c = "entity" in c ? { show_frame: true, ...c, groups: [] } : { show_frame: true, ...c };
    this._solo = "entity" in c;
    this._c.tap_action = ["toggle", "none", "more-info", "position"].includes(c.tap_action) ? c.tap_action : "toggle";
    this._open = null; this._sig = null;
    if (this._hass) this._render();
  }
  _ents() {
    if (this._solo) { const { entity, name, state_entity, color, show_state } = this._c; return [{ entity, name, state_entity, color, show_state }]; }
    return this._c.groups.flatMap((g) => (g.entities || []).map((e) => ({ ...norm(e), _g: g })));
  }
  // état affiché d'un volet : position du volet, capteur d'ouverture (state_entity), ou rien (show_state: false)
  _info(e) {
    const s = this._hass.states[e.entity], show = e.show_state ?? this._c.show_state ?? true;
    const na = !s || s.state === "unavailable";
    if (e.state_entity) {
      const b = this._hass.states[e.state_entity], on = b && ["on", "open", "true"].includes(b.state);
      const known = !!b && !["unavailable", "unknown"].includes(b.state);
      return { s, na, mv: false, sensor: true, known, p: known ? (on ? 100 : 0) : null, ep: known ? (on ? 100 : 0) : null, text: !known ? _("État inconnu") : on ? _("Ouvert") : _("Fermé") };
    }
    if (!show) return { s, na, mv: moving(s), sensor: false, known: false, p: null, ep: null, text: "" };
    // ep : ouverture « utile » — un volet arrêté à sa position la plus fermée compte comme fermé
    const m = minPos(this._c, e), p = pos(s), ep = p !== null && m > 0 && p <= m ? 0 : p;
    return { s, na, mv: moving(s), sensor: false, known: true, p, ep, m, text: this._stateText(s, m) };
  }
  set hass(h) {
    this._hass = h;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const sig = [LANG = setLang(h, this._c), this._c.all, ...this._ents().flatMap((e) => [e.entity, e.state_entity])].map((i) => { const s = i && h.states[i]; return s ? s.state + s.attributes.current_position : ""; }).join("|");
    if (sig !== this._sig && !this._drag) { this._sig = sig; this._render(); }
  }
  _call(svc, entity, data = {}) { this._hass.callService("cover", svc, { entity_id: entity, ...data }); }
  _ent(id) { return this._ents().find((x) => x.entity === id) || { entity: id }; }
  // fermer : jusqu'à la position la plus fermée autorisée si elle est réglée, sinon fermeture complète
  _close(id) { const m = minPos(this._c, this._ent(id)); if (m > 0) this._call("set_cover_position", id, { position: m }); else this._call("close_cover", id); }
  _clamp(id, v) { return Math.max(minPos(this._c, this._ent(id)), v); }
  _closeMany(ids) {
    if (!ids.some((id) => minPos(this._c, this._ent(id)) > 0)) return this._call("close_cover", ids);
    ids.forEach((id) => this._close(id));
  }
  _toggle(id) {
    const s = this._hass.states[id]; if (!s) return;
    if (moving(s)) return this._call("stop_cover", id);
    const e = this._ent(id), inf = this._info(e), m = minPos(this._c, e);
    if (inf.p !== null && inf.p > m) this._close(id); else this._call("open_cover", id);
  }
  _more(id) { this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId: id }, bubbles: true, composed: true })); }
  _stateText(s, m = 0) {
    if (!s) return _("introuvable");
    if (s.state === "unavailable") return _("indisponible");
    const p = pos(s);
    if (s.state === "opening") return _("Ouverture… {p}", { p: p != null ? p + " %" : "" }).trim();
    if (s.state === "closing") return _("Fermeture… {p}", { p: p != null ? p + " %" : "" }).trim();
    if (p === 100) return _("Ouvert"); if (p === 0 || (m > 0 && p !== null && p <= m)) return _("Fermé");
    return p != null ? _("Ouvert à {p} %", { p }) : s.state === "open" ? _("Ouvert") : _("Fermé");
  }
  _row(e) {
    const inf = this._info(e), s = inf.s, p = inf.p, ep = inf.ep, mv = inf.mv, na = inf.na, m = minPos(this._c, e);
    const accent = e.color || e._g?.color;
    const col = mv ? MOVE : accent ? accent : ep > 0 ? OPEN : "var(--secondary-text-color)";
    const name = e.name || s?.attributes.friendly_name || e.entity;
    const open = this._open === e.entity;
    const bar = inf.known && !inf.sensor && p !== null;
    return `<div class="rw ${open ? "ex" : ""} ${na ? "na" : ""} ${mv ? "mv" : ""} ${accent && !mv && !(ep > 0) ? "dim" : ""}" data-e="${e.entity}" style="--c:${col};--p:${ep ?? 0}%">
      <div class="top" data-act="row">
        <div class="ic" style="color:${col}">${shutter(ep, col)}</div>
        <div class="tx"><div class="nm">${name}</div>${inf.text ? `<div class="st">${inf.text}</div>` : ""}${bar ? `<div class="mb"><i></i></div>` : ""}</div>
        <div class="qb"><button class="q" data-act="close" title="${_("Fermer")}"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button class="q" data-act="stop" title="${_("Stop")}"><ha-icon icon="mdi:stop"></ha-icon></button><button class="q" data-act="open" title="${_("Ouvrir")}"><ha-icon icon="mdi:arrow-up"></ha-icon></button></div>
      </div>
      ${open ? `<div class="pn">
        ${canPos(s) ? `<div class="sl" data-act="slide"><div class="tr"><i style="width:${p ?? 0}%"></i>${m > 0 ? `<em class="lz" style="width:${m}%"></em>` : ""}</div><b style="left:${p ?? 0}%"><span>${p ?? 0}</span></b></div>
          <div class="prs">${[0, 25, 50, 75, 100].map((v) => `<button class="pr ${v < m ? "lim" : ""}" data-v="${v}" ${v < m ? `title="${_("Position la plus fermée : {p} %", { p: m })}"` : ""}>${v}</button>`).join("")}</div>` : `<span class="pl">${_("Position non réglable pour ce volet")}</span>`}
      </div>` : ""}
    </div>`;
  }
  _render() {
    return keepScroll(this, () => this._renderNow());
  }
  _renderNow() {
    if (!this.shadowRoot || !this._c || !this._hass) return;
    const c = this._c, all = this._ents();
    const infos = all.map((e) => this._info(e)).filter((i) => i.s);
    const known = infos.filter((i) => i.known), nOpen = known.filter((i) => (i.ep ?? 0) > 0).length, nMove = infos.filter((i) => i.mv).length;
    const counts = c.show_counts !== false;   // #6 : show_counts: false masque les « x/y ouverts »
    const groups = c.groups.map((g, gi) => {
      const ents = (g.entities || []).map((e) => ({ ...norm(e), _g: g }));
      const ki = ents.map((e) => this._info(e)).filter((i) => i.known), o = ki.filter((i) => (i.ep ?? 0) > 0).length;
      const tint = g.color && g.tint ? ` style="--gc:${g.color};--go:${Math.max(0, Math.min(100, Number(g.tint_opacity ?? 12)))}%"` : g.color ? ` style="--gc:${g.color}"` : "";
      return `<div class="gr ${g.color && g.tint ? "tint" : ""} ${g.color ? "gcol" : ""}"${tint}><div class="gh"><ha-icon icon="${g.icon || "mdi:home"}"></ha-icon><span>${g.name || ""}</span><em>${counts && ki.length ? _("{o}/{n} ouverts", { o, n: ki.length }) : ""}</em>
          <button class="gb" data-g="${gi}" data-act="gclose" title="${_("Tout fermer")}"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
          <button class="gb" data-g="${gi}" data-act="gopen" title="${_("Tout ouvrir")}"><ha-icon icon="mdi:arrow-up"></ha-icon></button></div>
        <div class="list">${ents.map((e) => this._row(e)).join("")}</div></div>`;
    }).join("");
    const body = this._solo && !c.entity ? `<div class="hint">${_("Choisissez un volet dans l'éditeur")}</div>` : this._solo ? `<div class="list">${this._row(all[0])}</div>` : `
      <div class="hd"><div class="tt">${c.title === undefined ? _("Volets") : _(c.title)}</div>
        <div class="sm">${counts && known.length ? _("{o}/{n} ouverts", { o: `<b>${nOpen}</b>`, n: known.length }) : ""}${nMove ? `${counts && known.length ? " · " : ""}<b style="color:${MOVE}">${_("{n} en mouvement", { n: nMove })}</b>` : ""}</div>
        ${c.all ? `<div class="all"><button class="ab" data-act="aclose"><ha-icon icon="mdi:arrow-down"></ha-icon>${_("Tous")}</button><button class="ab" data-act="aopen"><ha-icon icon="mdi:arrow-up"></ha-icon>${_("Tous")}</button></div>` : ""}
      </div>
      ${groups}
      <div class="hint">${c.tap_action === "position" ? _("Toucher un volet : position précise") : _("Appui long sur un volet : position précise")}</div>`;
    this.shadowRoot.innerHTML = `
    <style>
      :host { display:block; }
      ha-card { display:block; padding:14px 14px 10px; box-sizing:border-box; height:100%; container-type:inline-size; }
      ha-card.noframe { background:none !important; box-shadow:none !important; border:none !important; backdrop-filter:none !important; -webkit-backdrop-filter:none !important; }
      ha-card.noframe::before, ha-card.noframe::after { content:none !important; display:none !important; }
      .hd { display:flex; align-items:center; gap:8px; margin:0 2px 10px; }
      .tt { font-size:16px; font-weight:600; color:var(--primary-text-color); }
      .sm { font-size:12px; color:var(--secondary-text-color); margin-right:auto; } .sm b { color:var(--primary-text-color); }
      .all { display:flex; gap:4px; }
      .ab { font:inherit; font-size:12px; font-weight:600; border:none; cursor:pointer; border-radius:10px; padding:6px 10px; display:flex; align-items:center; gap:4px;
            background:color-mix(in srgb, var(--primary-text-color) 7%, transparent); color:var(--primary-text-color); }
      .ab ha-icon, .gb ha-icon, .bt ha-icon { --mdc-icon-size:16px; }
      .ab:hover, .gb:hover, .bt:hover { background:color-mix(in srgb, var(--primary-color, #0abfbf) 22%, transparent); }
      .gr { margin-bottom:8px; }
      .gr.tint { background:color-mix(in srgb, var(--gc) var(--go), transparent); border-radius:14px; padding:2px 6px 6px; }
      .gr.gcol .gh, .gr.gcol .gh > ha-icon { color:var(--gc); }
      .rw.dim .ic { background:color-mix(in srgb, var(--c) 9%, transparent); }
      .gh { display:flex; align-items:center; gap:6px; font-size:11px; font-weight:700; color:var(--secondary-text-color); text-transform:uppercase; letter-spacing:.6px; margin:6px 2px 6px; }
      .gh > ha-icon { --mdc-icon-size:15px; }
      .gh em { font-style:normal; font-weight:500; text-transform:none; letter-spacing:0; margin-left:auto; }
      .gb { border:none; background:color-mix(in srgb, var(--primary-text-color) 6%, transparent); color:var(--primary-text-color); border-radius:8px; width:28px; height:24px; cursor:pointer; display:flex; align-items:center; justify-content:center; }
      .list { display:grid; grid-template-columns:1fr; gap:5px; align-items:start; }
      ha-card.solo { padding:4px; }
      ha-card.solo:not(.noframe) .rw:not(.ex) { background:none; }
      @container (min-width: 620px) { .list { grid-template-columns:1fr 1fr; } }
      .rw { border-radius:12px; background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); border:1px solid transparent; transition:background .2s, border-color .2s; overflow:hidden; }
      .rw.ex { border-color:color-mix(in srgb, var(--c) 45%, transparent); background:color-mix(in srgb, var(--c) 8%, transparent); }
      .rw.na { opacity:.45; }
      .top { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:10px; padding:5px 6px 5px 10px; cursor:pointer; user-select:none; -webkit-user-select:none; touch-action:manipulation; }
      .top:active { background:color-mix(in srgb, var(--primary-text-color) 5%, transparent); }
      .ic { width:30px; height:30px; border-radius:9px; display:flex; align-items:center; justify-content:center; background:color-mix(in srgb, var(--c) 14%, transparent); }
      .rw.mv .ic { animation:mv 1.2s ease-in-out infinite alternate; }
      @keyframes mv { from { opacity:1; } to { opacity:.45; } }
      .nm { font-size:13.5px; font-weight:600; color:var(--primary-text-color); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
      .st { font-size:11.5px; color:var(--secondary-text-color); white-space:nowrap; }
      .mb { height:3px; margin-top:4px; border-radius:3px; background:color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow:hidden; }
      .mb i { display:block; height:100%; width:var(--p); background:var(--c); border-radius:3px; transition:width .6s ease; }
      .rw { container-type:inline-size; }
      .pn { display:flex; align-items:center; gap:6px 10px; padding:16px 18px 10px; flex-wrap:wrap; }
      .pn .sl { flex:1 1 100%; min-width:0; } .pl { font-size:11px; color:var(--secondary-text-color); }
      .prs { display:flex; gap:6px; flex:1 1 100%; justify-content:space-between; }
      .prs .pr { flex:1; max-width:56px; } .prs .pr.lim { opacity:.35; }
      .tr .lz { position:absolute; left:0; top:0; bottom:0; border-radius:inherit; background:repeating-linear-gradient(135deg, color-mix(in srgb, var(--primary-text-color) 25%, transparent) 0 3px, transparent 3px 7px); pointer-events:none; }
      @container (min-width: 520px) { .pn .sl { flex:1 1 auto; } .prs { flex:0 0 auto; } .prs .pr { flex:0 0 auto; } }
      .pr { font:inherit; font-size:11px; font-weight:600; border:none; cursor:pointer; border-radius:8px; padding:4px 7px; background:color-mix(in srgb, var(--primary-text-color) 8%, transparent); color:var(--primary-text-color); }
      .qb { display:flex; gap:4px; align-self:stretch; align-items:center; }
      .q { border:none; cursor:pointer; width:42px; height:36px; border-radius:11px; display:flex; align-items:center; justify-content:center; padding:0;
           background:color-mix(in srgb, var(--primary-text-color) 8%, transparent); color:var(--primary-text-color); transition:background .15s, transform .1s; }
      .q:active { transform:scale(.94); }
      .q ha-icon { --mdc-icon-size:21px; }
      @container (max-width: 380px) { .q { width:36px; } .qb { gap:3px; } }
      @container (max-width: 300px) { .top { grid-template-columns:auto 1fr; row-gap:8px; padding:8px 8px 8px 10px; } .qb { grid-column:1 / -1; align-self:auto; } .qb .q { flex:1; width:auto; height:34px; } .mb { max-width:none; } }
      .q:hover, .pr:hover { background:color-mix(in srgb, var(--primary-color, #0abfbf) 25%, transparent); }
      .bt { border:none; cursor:pointer; width:36px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center;
            background:color-mix(in srgb, var(--primary-text-color) 8%, transparent); color:var(--primary-text-color); }
      .sl { position:relative; height:32px; cursor:pointer; touch-action:none; }
      .sl .tr { position:absolute; left:0; right:0; top:13px; height:6px; border-radius:3px; background:color-mix(in srgb, var(--primary-text-color) 12%, transparent); overflow:hidden; }
      .sl .tr i { display:block; height:100%; background:var(--c, ${OPEN}); }
      .sl b { position:absolute; top:4px; width:24px; height:24px; margin-left:-12px; border-radius:50%; background:var(--primary-text-color); box-shadow:0 2px 8px rgba(0,0,0,.35);
              display:flex; align-items:center; justify-content:center; }
      .sl b span { position:absolute; top:-18px; font-size:11px; font-weight:700; color:var(--primary-text-color); white-space:nowrap; }
      .sp { height:32px; }
      .hint { font-size:10.5px; color:var(--secondary-text-color); text-align:center; margin-top:6px; opacity:.7; }
    </style>
    <ha-card class="${c.show_frame === false ? "noframe" : ""} ${this._solo ? "solo" : ""}">${body}
    </ha-card>`;
    this._bind();
  }
  _bind() {
    const sr = this.shadowRoot;
    sr.querySelector('[data-act="aopen"]')?.addEventListener("click", () => this._call("open_cover", this._c.all));
    sr.querySelector('[data-act="aclose"]')?.addEventListener("click", () => {
      // « Tous » ▼ : si une position la plus fermée est réglée, chaque volet affiché s'arrête à la sienne ; les autres membres du groupe se ferment normalement
      const shown = this._ents().map((e) => e.entity);
      if (!(Number(this._c.min_position) > 0) && !shown.some((id) => minPos(this._c, this._ent(id)) > 0)) return this._call("close_cover", this._c.all);
      const members = this._hass.states[this._c.all]?.attributes?.entity_id;
      const extra = Array.isArray(members) ? members.filter((id) => !shown.includes(id)) : [];
      shown.forEach((id) => this._close(id));
      if (extra.length) this._call("close_cover", extra);
    });
    sr.querySelectorAll(".gb").forEach((b) => b.addEventListener("click", () => {
      const g = this._c.groups[+b.dataset.g], ids = (g.entities || []).map((e) => (typeof e === "string" ? e : e.entity));
      if (b.dataset.act === "gopen") this._call("open_cover", ids); else this._closeMany(ids);
    }));
    sr.querySelectorAll(".rw").forEach((rw) => {
      const id = rw.dataset.e, top = rw.querySelector(".top");
      let timer = null, long = false;
      rw.querySelectorAll(".q, .pr").forEach((b) => b.addEventListener("pointerdown", (ev) => ev.stopPropagation()));
      rw.querySelectorAll(".q").forEach((b) => b.addEventListener("pointerup", (ev) => ev.stopPropagation()));
      rw.querySelectorAll(".pr").forEach((b) => b.addEventListener("click", () => this._call("set_cover_position", id, { position: this._clamp(id, +b.dataset.v) })));
      // un toucher qui glisse (défilement de la page) n'est ni un appui court ni un appui long
      let x0 = 0, y0 = 0, armed = false;
      const cancel = () => { clearTimeout(timer); armed = false; };
      top.addEventListener("pointerdown", (ev) => {
        long = false; armed = true; x0 = ev.clientX; y0 = ev.clientY;
        timer = setTimeout(() => { if (!armed) return; long = true; armed = false; this._open = this._open === id ? null : id; this._render(); if (navigator.vibrate) navigator.vibrate(15); }, 450);
      });
      top.addEventListener("pointermove", (ev) => { if (armed && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) cancel(); });
      top.addEventListener("pointerup", () => {
        const tap = armed && !long; cancel(); if (!tap) return;
        if (this._open === id) { this._open = null; return this._render(); }
        const a = this._c.tap_action;
        if (a === "toggle") this._toggle(id);
        else if (a === "more-info") this._more(id);
        else if (a === "position") { this._open = id; this._render(); }
      });
      top.addEventListener("pointerleave", cancel); top.addEventListener("pointercancel", cancel);
      top.addEventListener("contextmenu", (ev) => ev.preventDefault());
      rw.querySelector('[data-act="open"]')?.addEventListener("click", () => this._call("open_cover", id));
      rw.querySelector('[data-act="close"]')?.addEventListener("click", () => this._close(id));
      rw.querySelector('[data-act="stop"]')?.addEventListener("click", () => this._call("stop_cover", id));
      const sl = rw.querySelector(".sl");
      if (sl) {
        const knob = sl.querySelector("b"), fill = sl.querySelector(".tr i"), lab = knob.querySelector("span");
        const val = (ev) => { const r = sl.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * 100); };
        const show = (v) => { knob.style.left = v + "%"; fill.style.width = v + "%"; lab.textContent = v; };
        sl.addEventListener("pointerdown", (ev) => { this._drag = true; sl.setPointerCapture(ev.pointerId); show(this._clamp(id, val(ev))); });
        sl.addEventListener("pointermove", (ev) => { if (this._drag) show(this._clamp(id, val(ev))); });
        sl.addEventListener("pointerup", (ev) => { if (!this._drag) return; this._drag = false; const v = this._clamp(id, val(ev)); show(v); this._call("set_cover_position", id, { position: v }); });
      }
    });
  }
  static getConfigElement() { return document.createElement("holm-covers-card-editor"); }
  static getStubConfig(h) { setLang(h); return { title: _("Volets"), groups: [{ name: _("Rez-de-chaussée"), icon: "mdi:home-floor-0", entities: [] }] }; }
  getCardSize() { return this._solo ? 1 : 6; }
  getGridOptions() { return this._solo ? { columns: 6, rows: "auto", min_columns: 4 } : { columns: 12, rows: "auto", min_columns: 4 }; }
}

const L = { language: _("Langue"), mode: _("Affichage"), entity: _("Volet"), vname: _("Nom affiché (optionnel)"), title: _("Titre"), all: _("Commande « Tous » (volet ou groupe, optionnel)"), show_frame: _("Afficher le cadre de la carte"), name: _("Nom du groupe"), icon: _("Icône"), entities: _("Volets"),
  show_state: _("Afficher l'état (Ouvert / Fermé, position)"), tap_action: _("Appui court sur un volet"), state_entity: _("Capteur d'ouverture (état d'après ce capteur)"),
  color: _("Couleur"), gcolor: _("Couleur du groupe"), tint: _("Fond teinté"), tint_opacity: _("Opacité du fond"), vstate: _("Afficher l'état"), vcolor: _("Couleur (sinon celle du groupe)"),
  min_position: _("Position la plus fermée (%)"), vmin: _("Position la plus fermée (%) — 0 : celle du groupe ou de la carte"), show_counts: _("Afficher les compteurs « ouverts »") };
const MINSEL = { number: { min: 0, max: 90, step: 5, mode: "slider", unit_of_measurement: "%" } };
const TAP = { select: { mode: "dropdown", options: [{ value: "toggle", label: _("Ouvrir / fermer (ou stopper)") }, { value: "position", label: _("Afficher le curseur de position") },
  { value: "more-info", label: _("Ouvrir la fiche du volet") }, { value: "none", label: _("Aucune action") }] } };
const STATE_SEL = { entity: { domain: ["binary_sensor", "input_boolean", "switch"] } };
class HolmCoversCardEditor extends HTMLElement {
  setConfig(c) { const j = JSON.stringify(c); this._config = JSON.parse(j); if (j === this._last && this._built) return; this._build(); }
  set hass(h) { this._hass = h; setLang(h, this._config); if (!this._built) this._build(); else this.querySelectorAll("ha-form").forEach((f) => (f.hass = h)); }
  _emit() { this._last = JSON.stringify(this._config); this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: JSON.parse(this._last) }, bubbles: true, composed: true })); }
  _form(schema, data, cb) { const f = document.createElement("ha-form"); f.hass = this._hass; f.schema = locSchema(schema); f.data = data; f.computeLabel = (s) => (L[s.name] ? _(L[s.name]) : s.name);
    f.addEventListener("value-changed", (ev) => { ev.stopPropagation(); cb(ev.detail.value); }); return f; }
  _build() {
    if (!this._hass || !this._config) return;
    this._built = true; const c = this._config;
    const modeForm = this._form([{ name: "mode", selector: { select: { mode: "box", options: [{ value: "groups", label: _("Groupes de volets") }, { value: "single", label: _("Volet seul") }] } } }],
      { mode: c.entity !== undefined ? "single" : "groups" }, (v) => {
        const cur = this._config.entity !== undefined ? "single" : "groups"; if (v.mode === cur) return;
        if (v.mode === "single") {
          const first = (this._config.groups || []).flatMap((g) => g.entities || [])[0];
          const fe = first ? (typeof first === "string" ? { entity: first } : first) : null;
          this._config = { type: this._config.type, entity: fe ? fe.entity : "", ...(fe && fe.name ? { name: fe.name } : {}), ...(this._config.show_frame === false ? { show_frame: false } : {}) };
        } else {
          const e = this._config.entity;
          this._config = { type: this._config.type, title: _("Volets"), groups: [{ name: "", entities: e ? [this._config.name ? { entity: e, name: this._config.name } : { entity: e }] : [] }], ...(this._config.show_frame === false ? { show_frame: false } : {}) };
        }
        this._emit(); this._build(); });
    if (c.entity !== undefined) {
      this.innerHTML = `<div class="mode"></div><div class="gen"></div>`;
      this.querySelector(".mode").appendChild(modeForm);
      this.querySelector(".gen").appendChild(this._form([{ name: "entity", selector: { entity: { domain: ["cover"] } } }, { type: "grid", name: "", schema: [
        { name: "vname", selector: { text: {} } }, { name: "show_frame", selector: { boolean: {} } }] },
        { name: "tap_action", selector: TAP }, { name: "show_state", selector: { boolean: {} } }, { name: "state_entity", selector: STATE_SEL }, { name: "color", selector: { color_rgb: {} } }, { name: "min_position", selector: MINSEL }, langField()],
        { language: c.language || "", min_position: c.min_position ?? 0, entity: c.entity, vname: c.name || "", show_frame: c.show_frame !== false, tap_action: c.tap_action || "toggle", show_state: c.show_state !== false, state_entity: c.state_entity || "", color: hex2rgb(c.color) }, (v) => {
        this._config.entity = v.entity || ""; if (v.vname) this._config.name = v.vname; else delete this._config.name;
        if (v.show_frame === false) this._config.show_frame = false; else delete this._config.show_frame;
        if (v.tap_action && v.tap_action !== "toggle") this._config.tap_action = v.tap_action; else delete this._config.tap_action;
        if (v.show_state === false) this._config.show_state = false; else delete this._config.show_state;
        if (v.state_entity) this._config.state_entity = v.state_entity; else delete this._config.state_entity;
        const relang = (v.language || "") !== (this._config.language || ""); if (v.language) this._config.language = v.language; else delete this._config.language; if (relang) setTimeout(() => this._build());
        if (Number(v.min_position) > 0) this._config.min_position = Number(v.min_position); else delete this._config.min_position;
        if (v.color) this._config.color = rgb2hex(v.color); else delete this._config.color; this._emit(); }));
      return;
    }
    c.groups = c.groups || [];
    this.innerHTML = `<style>.it{border:1px solid var(--divider-color);border-radius:12px;padding:8px 12px 4px;margin:10px 0}.ih{display:flex;justify-content:space-between;font-weight:600;margin-bottom:4px}
      .ih span{display:flex;gap:4px} button{cursor:pointer;background:none;border:1px solid var(--divider-color);color:var(--primary-text-color);border-radius:8px;padding:4px 8px}.add{width:100%;padding:8px}
      .hint{font-size:12px;color:var(--secondary-text-color)} .per{margin:6px 0 8px} .per summary{cursor:pointer;font-weight:600;padding:4px 0}
      .pv{border-top:1px solid var(--divider-color);padding:6px 0} .pvh{font-size:13px;font-weight:600;margin-bottom:2px}</style><div class="gen"></div><div class="items"></div><button class="add">${_("+ Ajouter un groupe")}</button>`;
    this.prepend(modeForm);
    this.querySelector(".gen").appendChild(this._form([{ name: "title", selector: { text: {} } }, { type: "grid", name: "", schema: [
      { name: "all", selector: { entity: { domain: ["cover"] } } }, { name: "show_frame", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "tap_action", selector: TAP }, { name: "show_state", selector: { boolean: {} } }] },
      { type: "grid", name: "", schema: [{ name: "min_position", selector: MINSEL }, { name: "show_counts", selector: { boolean: {} } }] }, langField()],
      { show_frame: true, show_state: true, show_counts: true, min_position: 0, tap_action: "toggle", language: "", ...c }, (v) => {
      if ((v.language || "") !== (this._config.language || "")) { if (v.language) this._config.language = v.language; else delete this._config.language; this._emit(); return setTimeout(() => this._build()); }
      const { title, all, show_frame, tap_action, show_state } = v;
      Object.assign(this._config, { title, all, show_frame, tap_action, show_state });
      if (!all) delete this._config.all; if (show_frame !== false) delete this._config.show_frame;
      if (!tap_action || tap_action === "toggle") delete this._config.tap_action; if (show_state !== false) delete this._config.show_state;
      if (Number(v.min_position) > 0) this._config.min_position = Number(v.min_position); else delete this._config.min_position;
      if (v.show_counts === false) this._config.show_counts = false; else delete this._config.show_counts; this._emit(); }));
    const box = this.querySelector(".items");
    c.groups.forEach((g, i) => {
      const w = document.createElement("div"); w.className = "it";
      w.innerHTML = `<div class="ih">${g.name || _("Groupe {n}", { n: i + 1 })}<span><button data-a="up">▲</button><button data-a="down">▼</button><button data-a="del">✕</button></span></div>`;
      w.appendChild(this._form([{ type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { type: "grid", name: "", schema: [{ name: "gcolor", selector: { color_rgb: {} } }, { name: "tint", selector: { boolean: {} } },
          { name: "tint_opacity", selector: { number: { min: 3, max: 60, step: 1, mode: "slider", unit_of_measurement: "%" } } }] },
        { name: "min_position", selector: MINSEL },
        { name: "entities", selector: { entity: { multiple: true, domain: ["cover"] } } }],
        { ...g, gcolor: hex2rgb(g.color), tint: !!g.tint, tint_opacity: g.tint_opacity ?? 12, min_position: g.min_position ?? 0, entities: (g.entities || []).map((e) => (typeof e === "string" ? e : e.entity)) }, (v) => {
        const cur = this._config.groups[i];
        const prev = Object.fromEntries((cur.entities || []).map((e) => (typeof e === "string" ? [e, { entity: e }] : [e.entity, e])));
        const o = { ...cur, name: v.name, icon: v.icon, entities: (v.entities || []).map((id) => prev[id] || { entity: id }) };
        if (!o.icon) delete o.icon;
        if (Number(v.min_position) > 0) o.min_position = Number(v.min_position); else delete o.min_position;
        if (v.gcolor) o.color = rgb2hex(v.gcolor); else delete o.color;
        if (v.tint) o.tint = true; else delete o.tint;
        if (v.tint && Number(v.tint_opacity) !== 12) o.tint_opacity = Number(v.tint_opacity); else delete o.tint_opacity;
        const changedList = JSON.stringify((cur.entities || []).map((e) => norm(e).entity)) !== JSON.stringify(v.entities || []);
        this._config.groups[i] = o; this._emit(); if (changedList) this._build(); }));
      // réglages volet par volet (nom court, capteur d'ouverture, couleur, état)
      const per = document.createElement("details"); per.className = "per";
      per.innerHTML = `<summary>${_("Réglages par volet")}</summary>`;
      (g.entities || []).forEach((raw, j) => {
        const e = norm(raw), st = this._hass.states[e.entity];
        const row = document.createElement("div"); row.className = "pv";
        row.innerHTML = `<div class="pvh">${st?.attributes.friendly_name || e.entity}</div>`;
        row.appendChild(this._form([{ type: "grid", name: "", schema: [{ name: "vname", selector: { text: {} } }, { name: "vcolor", selector: { color_rgb: {} } }] },
          { name: "state_entity", selector: STATE_SEL }, { name: "vstate", selector: { boolean: {} } }, { name: "vmin", selector: MINSEL }],
          { vname: e.name || "", vcolor: hex2rgb(e.color), state_entity: e.state_entity || "", vstate: e.show_state ?? (this._config.show_state !== false), vmin: e.min_position ?? 0 }, (v) => {
          const o = { entity: e.entity };
          if (v.vname) o.name = v.vname; if (v.vcolor) o.color = rgb2hex(v.vcolor); if (v.state_entity) o.state_entity = v.state_entity; if (Number(v.vmin) > 0) o.min_position = Number(v.vmin);
          if (v.vstate !== (this._config.show_state !== false)) o.show_state = !!v.vstate;
          this._config.groups[i].entities[j] = Object.keys(o).length === 1 ? e.entity : o; this._emit(); }));
        per.appendChild(row);
      });
      if ((g.entities || []).length) w.appendChild(per);
      w.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { const a = b.dataset.a, arr = this._config.groups;
        if (a === "del") arr.splice(i, 1); if (a === "up" && i > 0) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; if (a === "down" && i < arr.length - 1) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
        this._emit(); this._build(); }));
      box.appendChild(w);
    });
    this.querySelector(".add").addEventListener("click", () => { this._config.groups.push({ name: "", entities: [] }); this._emit(); this._build(); });
  }
}
if (!customElements.get("holm-covers-card-editor")) customElements.define("holm-covers-card-editor", HolmCoversCardEditor);
if (!customElements.get("holm-covers-card")) customElements.define("holm-covers-card", HolmCoversCard);
console.info(`%c HOLM-COVERS-CARD %c ${VERSION} `, "background:#0abfbf;color:#06191b;border-radius:3px 0 0 3px", "background:#123;color:#fff;border-radius:0 3px 3px 0");
window.customCards = window.customCards || [];
setLang(document.querySelector("home-assistant")?.hass);
window.customCards.push({ type: "holm-covers-card", name: _("HOLM – Volets"), description: _("Volets compacts par étage ou volet seul : appui court ouvre/ferme, appui long affiche le curseur de position, couleurs par groupe, capteurs d'ouverture"), preview: false });
})();
