/* holm-covers-card — https://github.com/kaaribou/holm-covers-card — licence MIT — v1.1.1 */
// holm-covers-card — volets compacts, horizontaux, regroupés par étage
// Boutons ▼ ■ ▲ sur chaque ligne. Appui court sur la ligne : ouvre / ferme (ou stoppe). Appui long : curseur de position.
// type: custom:holm-covers-card
// title: Volets
// all: cover.volets_de_la_maison        (commande « Tous », optionnel)
// groups:
//   - name: Rez-de-chaussée   icon: mdi:home-floor-0
//     entities: [{ entity: cover.salon_1, name: Salon 1 }]
// ou, pour un volet seul :  entity: cover.bureau   name: Volets du bureau
(() => {
const OPEN = "#0abfbf", MOVE = "#e3a21a";
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
    this._c = "entity" in c ? { show_frame: true, ...c, groups: [] } : { title: "Volets", show_frame: true, ...c };
    this._solo = "entity" in c;
    this._open = null; this._sig = null;
    if (this._hass) this._render();
  }
  _ents() { if (this._solo) return [{ entity: this._c.entity, name: this._c.name }]; return this._c.groups.flatMap((g) => (g.entities || []).map((e) => (typeof e === "string" ? { entity: e } : e))); }
  set hass(h) {
    this._hass = h;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    const sig = [this._c.all, ...this._ents().map((e) => e.entity)].map((i) => { const s = h.states[i]; return s ? s.state + s.attributes.current_position : ""; }).join("|");
    if (sig !== this._sig && !this._drag) { this._sig = sig; this._render(); }
  }
  _call(svc, entity, data = {}) { this._hass.callService("cover", svc, { entity_id: entity, ...data }); }
  _toggle(e) {
    const s = this._hass.states[e]; if (!s) return;
    if (moving(s)) return this._call("stop_cover", e);
    const p = pos(s);
    this._call(p !== null && p > 0 ? "close_cover" : "open_cover", e);
  }
  _stateText(s) {
    if (!s) return "introuvable";
    if (s.state === "unavailable") return "indisponible";
    const p = pos(s);
    if (s.state === "opening") return `Ouverture… ${p ?? ""}${p != null ? " %" : ""}`;
    if (s.state === "closing") return `Fermeture… ${p ?? ""}${p != null ? " %" : ""}`;
    if (p === 100) return "Ouvert"; if (p === 0) return "Fermé";
    return p != null ? `Ouvert à ${p} %` : s.state === "open" ? "Ouvert" : "Fermé";
  }
  _row(e) {
    const s = this._hass.states[e.entity], p = pos(s), mv = moving(s), na = !s || s.state === "unavailable";
    const col = mv ? MOVE : p > 0 ? OPEN : "var(--secondary-text-color)";
    const name = e.name || s?.attributes.friendly_name || e.entity;
    const open = this._open === e.entity;
    return `<div class="rw ${open ? "ex" : ""} ${na ? "na" : ""} ${mv ? "mv" : ""}" data-e="${e.entity}" style="--c:${col};--p:${p ?? 0}%">
      <div class="top" data-act="row">
        <div class="ic" style="color:${col}">${shutter(p, col)}</div>
        <div class="tx"><div class="nm">${name}</div><div class="st">${this._stateText(s)}</div><div class="mb"><i></i></div></div>
        <div class="qb"><button class="q" data-act="close" title="Fermer"><ha-icon icon="mdi:arrow-down"></ha-icon></button><button class="q" data-act="stop" title="Stop"><ha-icon icon="mdi:stop"></ha-icon></button><button class="q" data-act="open" title="Ouvrir"><ha-icon icon="mdi:arrow-up"></ha-icon></button></div>
      </div>
      ${open ? `<div class="pn">
        ${canPos(s) ? `<div class="sl" data-act="slide"><div class="tr"><i style="width:${p ?? 0}%"></i></div><b style="left:${p ?? 0}%"><span>${p ?? 0}</span></b></div>
          <div class="prs">${[0, 25, 50, 75, 100].map((v) => `<button class="pr" data-v="${v}">${v}</button>`).join("")}</div>` : `<span class="pl">Position non réglable pour ce volet</span>`}
      </div>` : ""}
    </div>`;
  }
  _render() {
    if (!this.shadowRoot || !this._c || !this._hass) return;
    const c = this._c, all = this._ents();
    const st = all.map((e) => this._hass.states[e.entity]).filter(Boolean);
    const nOpen = st.filter((s) => (pos(s) ?? 0) > 0).length, nMove = st.filter(moving).length;
    const groups = c.groups.map((g, gi) => {
      const ents = (g.entities || []).map((e) => (typeof e === "string" ? { entity: e } : e));
      const o = ents.filter((e) => (pos(this._hass.states[e.entity]) ?? 0) > 0).length;
      return `<div class="gr"><div class="gh"><ha-icon icon="${g.icon || "mdi:home"}"></ha-icon><span>${g.name || ""}</span><em>${o}/${ents.length} ouverts</em>
          <button class="gb" data-g="${gi}" data-act="gclose" title="Tout fermer"><ha-icon icon="mdi:arrow-down"></ha-icon></button>
          <button class="gb" data-g="${gi}" data-act="gopen" title="Tout ouvrir"><ha-icon icon="mdi:arrow-up"></ha-icon></button></div>
        <div class="list">${ents.map((e) => this._row(e)).join("")}</div></div>`;
    }).join("");
    const body = this._solo && !c.entity ? `<div class="hint">Choisissez un volet dans l'éditeur</div>` : this._solo ? `<div class="list">${this._row(all[0])}</div>` : `
      <div class="hd"><div class="tt">${c.title || ""}</div>
        <div class="sm"><b>${nOpen}</b>/${st.length} ouverts${nMove ? ` · <b style="color:${MOVE}">${nMove} en mouvement</b>` : ""}</div>
        ${c.all ? `<div class="all"><button class="ab" data-act="aclose"><ha-icon icon="mdi:arrow-down"></ha-icon>Tous</button><button class="ab" data-act="aopen"><ha-icon icon="mdi:arrow-up"></ha-icon>Tous</button></div>` : ""}
      </div>
      ${groups}
      <div class="hint">Appui long sur un volet : position précise</div>`;
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
      .mb { height:3px; margin-top:4px; max-width:120px; border-radius:3px; background:color-mix(in srgb, var(--primary-text-color) 10%, transparent); overflow:hidden; }
      .mb i { display:block; height:100%; width:var(--p); background:var(--c); border-radius:3px; transition:width .6s ease; }
      .rw { container-type:inline-size; }
      .pn { display:flex; align-items:center; gap:6px 10px; padding:16px 18px 10px; flex-wrap:wrap; }
      .pn .sl { flex:1 1 100%; min-width:0; } .pl { font-size:11px; color:var(--secondary-text-color); }
      .prs { display:flex; gap:6px; flex:1 1 100%; justify-content:space-between; }
      .prs .pr { flex:1; max-width:56px; }
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
    sr.querySelector('[data-act="aclose"]')?.addEventListener("click", () => this._call("close_cover", this._c.all));
    sr.querySelectorAll(".gb").forEach((b) => b.addEventListener("click", () => {
      const g = this._c.groups[+b.dataset.g], ids = (g.entities || []).map((e) => (typeof e === "string" ? e : e.entity));
      this._call(b.dataset.act === "gopen" ? "open_cover" : "close_cover", ids);
    }));
    sr.querySelectorAll(".rw").forEach((rw) => {
      const id = rw.dataset.e, top = rw.querySelector(".top");
      let timer = null, long = false;
      rw.querySelectorAll(".q, .pr").forEach((b) => b.addEventListener("pointerdown", (ev) => ev.stopPropagation()));
      rw.querySelectorAll(".q").forEach((b) => b.addEventListener("pointerup", (ev) => ev.stopPropagation()));
      rw.querySelectorAll(".pr").forEach((b) => b.addEventListener("click", () => this._call("set_cover_position", id, { position: +b.dataset.v })));
      top.addEventListener("pointerdown", () => { long = false; timer = setTimeout(() => { long = true; this._open = this._open === id ? null : id; this._render(); if (navigator.vibrate) navigator.vibrate(15); }, 450); });
      const cancel = () => clearTimeout(timer);
      top.addEventListener("pointerup", () => { cancel(); if (!long) { if (this._open === id) { this._open = null; this._render(); } else this._toggle(id); } });
      top.addEventListener("pointerleave", cancel); top.addEventListener("pointercancel", cancel);
      top.addEventListener("contextmenu", (ev) => ev.preventDefault());
      rw.querySelector('[data-act="open"]')?.addEventListener("click", () => this._call("open_cover", id));
      rw.querySelector('[data-act="close"]')?.addEventListener("click", () => this._call("close_cover", id));
      rw.querySelector('[data-act="stop"]')?.addEventListener("click", () => this._call("stop_cover", id));
      const sl = rw.querySelector(".sl");
      if (sl) {
        const knob = sl.querySelector("b"), fill = sl.querySelector(".tr i"), lab = knob.querySelector("span");
        const val = (ev) => { const r = sl.getBoundingClientRect(); return Math.round(Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * 100); };
        const show = (v) => { knob.style.left = v + "%"; fill.style.width = v + "%"; lab.textContent = v; };
        sl.addEventListener("pointerdown", (ev) => { this._drag = true; sl.setPointerCapture(ev.pointerId); show(val(ev)); });
        sl.addEventListener("pointermove", (ev) => { if (this._drag) show(val(ev)); });
        sl.addEventListener("pointerup", (ev) => { if (!this._drag) return; this._drag = false; const v = val(ev); show(v); this._call("set_cover_position", id, { position: v }); });
      }
    });
  }
  static getConfigElement() { return document.createElement("holm-covers-card-editor"); }
  static getStubConfig() { return { title: "Volets", groups: [{ name: "Rez-de-chaussée", icon: "mdi:home-floor-0", entities: [] }] }; }
  getCardSize() { return this._solo ? 1 : 6; }
  getGridOptions() { return this._solo ? { columns: 6, rows: "auto", min_columns: 4 } : { columns: 12, rows: "auto", min_columns: 4 }; }
}

const L = { mode: "Affichage", entity: "Volet", vname: "Nom affiché (optionnel)", title: "Titre", all: "Commande « Tous » (volet ou groupe, optionnel)", show_frame: "Afficher le cadre de la carte", name: "Nom du groupe", icon: "Icône", entities: "Volets" };
class HolmCoversCardEditor extends HTMLElement {
  setConfig(c) { const j = JSON.stringify(c); this._config = JSON.parse(j); if (j === this._last && this._built) return; this._build(); }
  set hass(h) { this._hass = h; if (!this._built) this._build(); else this.querySelectorAll("ha-form").forEach((f) => (f.hass = h)); }
  _emit() { this._last = JSON.stringify(this._config); this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: JSON.parse(this._last) }, bubbles: true, composed: true })); }
  _form(schema, data, cb) { const f = document.createElement("ha-form"); f.hass = this._hass; f.schema = schema; f.data = data; f.computeLabel = (s) => L[s.name] || s.name;
    f.addEventListener("value-changed", (ev) => { ev.stopPropagation(); cb(ev.detail.value); }); return f; }
  _build() {
    if (!this._hass || !this._config) return;
    this._built = true; const c = this._config;
    const modeForm = this._form([{ name: "mode", selector: { select: { mode: "box", options: [{ value: "groups", label: "Groupes de volets" }, { value: "single", label: "Volet seul" }] } } }],
      { mode: c.entity !== undefined ? "single" : "groups" }, (v) => {
        const cur = this._config.entity !== undefined ? "single" : "groups"; if (v.mode === cur) return;
        if (v.mode === "single") {
          const first = (this._config.groups || []).flatMap((g) => g.entities || [])[0];
          const fe = first ? (typeof first === "string" ? { entity: first } : first) : null;
          this._config = { type: this._config.type, entity: fe ? fe.entity : "", ...(fe && fe.name ? { name: fe.name } : {}), ...(this._config.show_frame === false ? { show_frame: false } : {}) };
        } else {
          const e = this._config.entity;
          this._config = { type: this._config.type, title: "Volets", groups: [{ name: "", entities: e ? [this._config.name ? { entity: e, name: this._config.name } : { entity: e }] : [] }], ...(this._config.show_frame === false ? { show_frame: false } : {}) };
        }
        this._emit(); this._build(); });
    if (c.entity !== undefined) {
      this.innerHTML = `<div class="mode"></div><div class="gen"></div>`;
      this.querySelector(".mode").appendChild(modeForm);
      this.querySelector(".gen").appendChild(this._form([{ name: "entity", selector: { entity: { domain: ["cover"] } } }, { type: "grid", name: "", schema: [
        { name: "vname", selector: { text: {} } }, { name: "show_frame", selector: { boolean: {} } }] }], { entity: c.entity, vname: c.name || "", show_frame: c.show_frame !== false }, (v) => {
        this._config.entity = v.entity || ""; if (v.vname) this._config.name = v.vname; else delete this._config.name;
        if (v.show_frame === false) this._config.show_frame = false; else delete this._config.show_frame; this._emit(); }));
      return;
    }
    c.groups = c.groups || [];
    this.innerHTML = `<style>.it{border:1px solid var(--divider-color);border-radius:12px;padding:8px 12px 4px;margin:10px 0}.ih{display:flex;justify-content:space-between;font-weight:600;margin-bottom:4px}
      .ih span{display:flex;gap:4px} button{cursor:pointer;background:none;border:1px solid var(--divider-color);color:var(--primary-text-color);border-radius:8px;padding:4px 8px}.add{width:100%;padding:8px}
      .hint{font-size:12px;color:var(--secondary-text-color)}</style><div class="gen"></div><div class="items"></div><button class="add">+ Ajouter un groupe</button>`;
    this.prepend(modeForm);
    this.querySelector(".gen").appendChild(this._form([{ name: "title", selector: { text: {} } }, { type: "grid", name: "", schema: [
      { name: "all", selector: { entity: { domain: ["cover"] } } }, { name: "show_frame", selector: { boolean: {} } }] }], { show_frame: true, ...c }, (v) => {
      Object.assign(this._config, v); if (!v.all) delete this._config.all; if (v.show_frame !== false) delete this._config.show_frame; this._emit(); }));
    const box = this.querySelector(".items");
    c.groups.forEach((g, i) => {
      const w = document.createElement("div"); w.className = "it";
      w.innerHTML = `<div class="ih">${g.name || "Groupe " + (i + 1)}<span><button data-a="up">▲</button><button data-a="down">▼</button><button data-a="del">✕</button></span></div><div class="hint">Les noms courts de chaque volet se règlent en YAML (name), sinon le nom du volet est utilisé.</div>`;
      w.appendChild(this._form([{ type: "grid", name: "", schema: [{ name: "name", selector: { text: {} } }, { name: "icon", selector: { icon: {} } }] },
        { name: "entities", selector: { entity: { multiple: true, domain: ["cover"] } } }], { ...g, entities: (g.entities || []).map((e) => (typeof e === "string" ? e : e.entity)) }, (v) => {
        const prev = Object.fromEntries((g.entities || []).map((e) => (typeof e === "string" ? [e, { entity: e }] : [e.entity, e])));
        const o = { ...g, name: v.name, icon: v.icon, entities: (v.entities || []).map((id) => prev[id] || { entity: id }) }; if (!o.icon) delete o.icon;
        this._config.groups[i] = o; this._emit(); }));
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
window.customCards = window.customCards || [];
window.customCards.push({ type: "holm-covers-card", name: "HOLM – Volets", description: "Volets compacts par étage ou volet seul : appui court ouvre/ferme, appui long affiche le curseur de position", preview: false });
})();
