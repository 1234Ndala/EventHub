import { useState, useEffect } from "react";
import { LayoutDashboard, Calendar, Users, ClipboardList, Download, Printer, Search, Plus, Pencil, Trash2, CheckCircle, XCircle, ChevronRight } from "lucide-react";

const EVENTS_URL = "http://localhost:8001";
const PARTICIPANTS_URL = "http://localhost:8002";
const REGISTRATIONS_URL = "http://localhost:8003";

const C = {
  sidebar: "#0F3F4E",
  sidebarActive: "#1D5A6B",
  sidebarText: "#7FA8B0",
  bg: "#F5F6F7",
  surface: "#FFFFFF",
  text: "#212529",
  muted: "#6C757D",
  accent: "#0F3F4E",
  border: "#DEE2E6",
  success: "#28A745",
  successBg: "#DCF5E3",
  danger: "#DC3545",
  dangerBg: "#FDECEA",
  tagBg: "#E9ECEF",
  tagText: "#495057",
};

const S = {
  app: { fontFamily: "'Inter','Segoe UI',sans-serif", minHeight: "100vh", display: "flex", backgroundColor: C.bg, color: C.text },
  sidebar: { width: "220px", minHeight: "100vh", backgroundColor: C.sidebar, display: "flex", flexDirection: "column", padding: "0", position: "fixed", top: 0, left: 0, bottom: 0 },
  logoBox: { padding: "24px 20px", borderBottom: `1px solid #1D5A6B` },
  logo: { color: "#FFFFFF", fontWeight: 800, fontSize: "18px", letterSpacing: "-0.5px" },
  logoSub: { color: C.sidebarText, fontSize: "11px", marginTop: "2px" },
  navItem: (a) => ({ display: "flex", alignItems: "center", gap: "10px", padding: "12px 20px", cursor: "pointer", color: a ? "#FFFFFF" : C.sidebarText, background: a ? C.sidebarActive : "transparent", borderLeft: a ? "3px solid #4FC3F7" : "3px solid transparent", fontSize: "14px", fontWeight: a ? 600 : 400, transition: "all 0.15s" }),
  main: { marginLeft: "220px", flex: 1, padding: "36px 40px" },
  pageTitle: { fontSize: "22px", fontWeight: 700, color: C.text, marginBottom: "4px" },
  pageSubtitle: { fontSize: "13px", color: C.muted, marginBottom: "28px" },
  card: { backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "24px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  label: { display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px" },
  input: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${C.border}`, background: "#FAFAFA", color: C.text, fontSize: "14px", boxSizing: "border-box", outline: "none" },
  select: { width: "100%", padding: "10px 14px", borderRadius: "8px", border: `1px solid ${C.border}`, background: "#FAFAFA", color: C.text, fontSize: "14px", boxSizing: "border-box" },
  btnPrimary: { display: "flex", alignItems: "center", gap: "6px", background: C.accent, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px", fontWeight: 600 },
  btnSecondary: { display: "flex", alignItems: "center", gap: "6px", background: C.tagBg, color: C.tagText, border: `1px solid ${C.border}`, padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontSize: "14px" },
  btnEdit: { display: "inline-flex", alignItems: "center", gap: "4px", background: "#E8F4F8", color: C.accent, border: `1px solid #B8D8E4`, padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600, marginRight: "8px" },
  btnDanger: { display: "inline-flex", alignItems: "center", gap: "4px", background: C.dangerBg, color: C.danger, border: `1px solid #F5C6CB`, padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "12px", fontWeight: 600 },
  btnGreen: { display: "flex", alignItems: "center", gap: "6px", background: C.successBg, color: C.success, border: `1px solid #C3E6CB`, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  btnPrint: { display: "flex", alignItems: "center", gap: "6px", background: C.tagBg, color: C.tagText, border: `1px solid ${C.border}`, padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  err: { color: C.danger, fontSize: "13px", marginTop: "8px" },
  ok: { color: C.success, fontSize: "13px", marginTop: "8px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "16px" },
  eventCard: { backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  badge: (ok) => ({ display: "inline-flex", alignItems: "center", gap: "4px", background: ok ? C.successBg : C.dangerBg, color: ok ? C.success : C.danger, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }),
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: `2px solid ${C.border}`, background: "#FAFAFA" },
  td: { padding: "14px 16px", fontSize: "13px", borderBottom: `1px solid ${C.border}`, color: C.text },
  divider: { height: "1px", background: C.border, margin: "16px 0" },
  statGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "24px" },
  statCard: { backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: "12px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" },
  statNum: { fontSize: "30px", fontWeight: 800, color: C.accent, marginTop: "10px" },
  statLabel: { fontSize: "12px", color: C.muted, marginTop: "4px" },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" },
  searchBar: { display: "flex", alignItems: "center", gap: "8px", background: "#FAFAFA", border: `1px solid ${C.border}`, borderRadius: "8px", padding: "0 12px", maxWidth: "300px" },
  toolbar: { display: "flex", gap: "10px", marginBottom: "20px", alignItems: "center" },
};

function Field({ label, children }) {
  return <div style={{ marginBottom: "14px" }}><label style={S.label}>{label}</label>{children}</div>;
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div style={S.searchBar}>
      <Search size={14} color={C.muted} />
      <input style={{ border: "none", background: "transparent", outline: "none", fontSize: "13px", color: C.text, padding: "9px 0", width: "240px" }} placeholder={placeholder} value={value} onChange={onChange} />
    </div>
  );
}

function exportCSV(rows, filename) {
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

function printTable(title, headers, rows) {
  const html = `<html><head><title>${title}</title><style>
    body{font-family:Arial,sans-serif;padding:24px;color:#212529}
    h2{color:#0F3F4E;margin-bottom:16px}
    table{width:100%;border-collapse:collapse}
    th{background:#0F3F4E;color:white;padding:10px;text-align:left;font-size:12px}
    td{padding:10px;border-bottom:1px solid #DEE2E6;font-size:12px}
    .footer{margin-top:24px;font-size:11px;color:#6C757D}
  </style></head><body>
    <h2>${title}</h2>
    <table><thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table>
    <p class="footer">Imprimé le ${new Date().toLocaleDateString("fr-FR")} — EventHub · DIT Dakar</p>
  </body></html>`;
  const w = window.open("","_blank");
  w.document.write(html);
  w.document.close();
  w.print();
}

export default function App() {
  const [page, setPage] = useState("dashboard");
  const nav = [
    ["dashboard", LayoutDashboard, "Tableau de bord"],
    ["events", Calendar, "Événements"],
    ["participants", Users, "Participants"],
    ["registrations", ClipboardList, "Inscriptions"],
  ];
  return (
    <div style={S.app}>
      <aside style={S.sidebar}>
        <div style={S.logoBox}>
          <div style={S.logo}>EventHub</div>
          <div style={S.logoSub}>DIT Dakar · 2026</div>
        </div>
        <nav style={{ padding: "12px 0", flex: 1 }}>
          {nav.map(([p, Icon, label]) => (
            <div key={p} style={S.navItem(page===p)} onClick={() => setPage(p)}>
              <Icon size={16} /><span>{label}</span>
            </div>
          ))}
        </nav>
      </aside>
      <main style={S.main}>
        {page === "dashboard" && <Dashboard setPage={setPage} />}
        {page === "events" && <Events />}
        {page === "participants" && <Participants />}
        {page === "registrations" && <Registrations />}
      </main>
    </div>
  );
}

function Dashboard({ setPage }) {
  const [stats, setStats] = useState({ events: 0, participants: 0, registrations: 0, places: 0 });
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${EVENTS_URL}/events`).then(r=>r.json()).catch(()=>[]),
      fetch(`${PARTICIPANTS_URL}/participants`).then(r=>r.json()).catch(()=>[]),
      fetch(`${REGISTRATIONS_URL}/registrations`).then(r=>r.json()).catch(()=>[]),
    ]).then(([events, participants, registrations]) => {
      setStats({ events: events.length, participants: participants.length, registrations: registrations.filter(r=>r.statut==="confirmee").length, places: events.reduce((a,e)=>a+(e.capacite_max-e.inscrits),0) });
      setRecentEvents(events.slice(-4).reverse());
    });
  }, []);

  const statItems = [
    [Calendar, "Événements", stats.events],
    [Users, "Participants", stats.participants],
    [CheckCircle, "Inscriptions confirmées", stats.registrations],
    [ClipboardList, "Places disponibles", stats.places],
  ];

  return (
    <div>
      <h2 style={S.pageTitle}>Tableau de bord</h2>
      <p style={S.pageSubtitle}>Vue d'ensemble de la plateforme</p>
      <div style={S.statGrid}>
        {statItems.map(([Icon, label, num]) => (
          <div key={label} style={S.statCard}>
            <Icon size={20} color={C.accent} />
            <div style={S.statNum}>{num}</div>
            <div style={S.statLabel}>{label}</div>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <p style={{ fontWeight: 700, fontSize: "15px", marginBottom: "16px" }}>Derniers événements</p>
        {recentEvents.length === 0 && <p style={{ color: C.muted, fontSize: "13px" }}>Aucun événement enregistré.</p>}
        {recentEvents.map(e => (
          <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: `1px solid ${C.border}` }}>
            <div>
              <p style={{ fontWeight: 600, marginBottom: "4px", fontSize: "14px" }}>{e.titre}</p>
              <p style={{ fontSize: "12px", color: C.muted }}>{e.date} · {e.lieu}</p>
            </div>
            <span style={S.badge(e.capacite_max-e.inscrits>0)}>{e.capacite_max-e.inscrits>0 ? `${e.capacite_max-e.inscrits} places` : "Complet"}</span>
          </div>
        ))}
        <button style={{ ...S.btnPrimary, marginTop: "20px" }} onClick={() => setPage("events")}>
          Voir tous les événements <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function Events() {
  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ titre: "", description: "", date: "", lieu: "", capacite_max: "" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const load = () => fetch(`${EVENTS_URL}/events`).then(r=>r.json()).then(d=>{ setEvents(d); setFiltered(d); }).catch(()=>{});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!search) { setFiltered(events); return; }
    setFiltered(events.filter(e=>e.titre.toLowerCase().includes(search.toLowerCase())||e.lieu.toLowerCase().includes(search.toLowerCase())));
  }, [search, events]);

  const submit = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${EVENTS_URL}/events/${editId}` : `${EVENTS_URL}/events`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, capacite_max: parseInt(form.capacite_max) }) });
    if (r.ok) { setMsg({ text: editId ? "Mis à jour." : "Événement créé.", ok: true }); setForm({ titre: "", description: "", date: "", lieu: "", capacite_max: "" }); setEditId(null); load(); }
    else setMsg({ text: "Erreur.", ok: false });
  };

  const del = async (id) => { if (!window.confirm("Supprimer ?")) return; await fetch(`${EVENTS_URL}/events/${id}`, { method: "DELETE" }); load(); };
  const edit = (e) => { setEditId(e.id); setForm({ titre: e.titre, description: e.description, date: e.date, lieu: e.lieu, capacite_max: e.capacite_max }); window.scrollTo(0,0); };

  return (
    <div>
      <h2 style={S.pageTitle}>Événements</h2>
      <p style={S.pageSubtitle}>Créer et gérer les événements du DIT</p>
      <div style={S.card}>
        <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "18px" }}>{editId ? "Modifier l'événement" : "Nouvel événement"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[["titre","Titre"],["date","Date (YYYY-MM-DD)"],["lieu","Lieu"],["capacite_max","Capacité max"]].map(([k,l]) => (
            <Field key={k} label={l}><input style={S.input} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></Field>
          ))}
        </div>
        <Field label="Description"><input style={S.input} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></Field>
        {msg.text && <p style={msg.ok ? S.ok : S.err}>{msg.text}</p>}
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button style={S.btnPrimary} onClick={submit}><Plus size={14} />{editId ? "Enregistrer" : "Créer"}</button>
          {editId && <button style={S.btnSecondary} onClick={() => { setEditId(null); setForm({ titre: "", description: "", date: "", lieu: "", capacite_max: "" }); }}>Annuler</button>}
        </div>
      </div>
      <div style={S.toolbar}>
        <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par titre ou lieu..." />
        <button style={S.btnGreen} onClick={() => exportCSV(["ID,Titre,Description,Date,Lieu,Capacité,Inscrits,Places restantes",...events.map(e=>`${e.id},"${e.titre}","${e.description}","${e.date}","${e.lieu}",${e.capacite_max},${e.inscrits},${e.capacite_max-e.inscrits}`)], "evenements.csv")}><Download size={14} />Exporter</button>
        <button style={S.btnPrint} onClick={() => printTable("Liste des événements",["Titre","Date","Lieu","Capacité","Inscrits","Places"],events.map(e=>[e.titre,e.date,e.lieu,e.capacite_max,e.inscrits,e.capacite_max-e.inscrits]))}><Printer size={14} />Imprimer</button>
      </div>
      <div style={S.grid}>
        {filtered.map(e => (
          <div key={e.id} style={S.eventCard}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <p style={{ fontWeight: 700, fontSize: "15px" }}>{e.titre}</p>
              <span style={S.badge(e.capacite_max-e.inscrits>0)}>{e.capacite_max-e.inscrits>0 ? `${e.capacite_max-e.inscrits} places` : "Complet"}</span>
            </div>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "12px", lineHeight: 1.6 }}>{e.description}</p>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "4px" }}>{e.date}</p>
            <p style={{ fontSize: "13px", color: C.muted, marginBottom: "14px" }}>{e.lieu}</p>
            <p style={{ fontSize: "12px", color: C.muted, marginBottom: "14px" }}>{e.inscrits} / {e.capacite_max} inscrits</p>
            <div style={S.divider} />
            <button style={S.btnEdit} onClick={() => edit(e)}><Pencil size={12} />Modifier</button>
            <button style={S.btnDanger} onClick={() => del(e.id)}><Trash2 size={12} />Supprimer</button>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: C.muted }}>Aucun résultat.</p>}
      </div>
    </div>
  );
}

function Participants() {
  const [participants, setParticipants] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", type: "etudiant" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState({ text: "", ok: true });

  const load = () => fetch(`${PARTICIPANTS_URL}/participants`).then(r=>r.json()).then(d=>{ setParticipants(d); setFiltered(d); }).catch(()=>{});
  useEffect(() => { load(); }, []);
  useEffect(() => {
    if (!search) { setFiltered(participants); return; }
    setFiltered(participants.filter(p=>p.nom.toLowerCase().includes(search.toLowerCase())||p.email.toLowerCase().includes(search.toLowerCase())));
  }, [search, participants]);

  const submit = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${PARTICIPANTS_URL}/participants/${editId}` : `${PARTICIPANTS_URL}/participants`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setMsg({ text: editId ? "Mis à jour." : "Participant ajouté.", ok: true }); setForm({ nom: "", email: "", telephone: "", type: "etudiant" }); setEditId(null); load(); }
    else setMsg({ text: "Erreur.", ok: false });
  };

  const del = async (id) => { if (!window.confirm("Supprimer ?")) return; await fetch(`${PARTICIPANTS_URL}/participants/${id}`, { method: "DELETE" }); load(); };
  const edit = (p) => { setEditId(p.id); setForm({ nom: p.nom, email: p.email, telephone: p.telephone, type: p.type }); window.scrollTo(0,0); };
  const typeStyle = { etudiant: { bg: "#E3F2FD", color: "#0F3F4E" }, professeur: { bg: "#FDECEA", color: "#C62828" }, externe: { bg: "#FFF8E1", color: "#F57F17" } };

  return (
    <div>
      <h2 style={S.pageTitle}>Participants</h2>
      <p style={S.pageSubtitle}>Gérer les comptes participants</p>
      <div style={S.card}>
        <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "18px" }}>{editId ? "Modifier le participant" : "Nouveau participant"}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
          {[["nom","Nom complet"],["email","Email"],["telephone","Téléphone"]].map(([k,l]) => (
            <Field key={k} label={l}><input style={S.input} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></Field>
          ))}
          <Field label="Type">
            <select style={S.select} value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
              <option value="etudiant">Étudiant</option>
              <option value="professeur">Professeur</option>
              <option value="externe">Externe</option>
            </select>
          </Field>
        </div>
        {msg.text && <p style={msg.ok ? S.ok : S.err}>{msg.text}</p>}
        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button style={S.btnPrimary} onClick={submit}><Plus size={14} />{editId ? "Enregistrer" : "Ajouter"}</button>
          {editId && <button style={S.btnSecondary} onClick={() => { setEditId(null); setForm({ nom: "", email: "", telephone: "", type: "etudiant" }); }}>Annuler</button>}
        </div>
      </div>
      <div style={S.toolbar}>
        <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom ou email..." />
        <button style={S.btnGreen} onClick={() => exportCSV(["ID,Nom,Email,Téléphone,Type",...participants.map(p=>`${p.id},"${p.nom}","${p.email}","${p.telephone}","${p.type}"`)], "participants.csv")}><Download size={14} />Exporter</button>
        <button style={S.btnPrint} onClick={() => printTable("Liste des participants",["Nom","Email","Téléphone","Type"],participants.map(p=>[p.nom,p.email,p.telephone,p.type]))}><Printer size={14} />Imprimer</button>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={S.table}>
          <thead><tr>{["Nom","Email","Téléphone","Type","Actions"].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map(p => {
              const ts = typeStyle[p.type] || typeStyle.etudiant;
              return (
                <tr key={p.id}>
                  <td style={{ ...S.td, fontWeight: 600 }}>{p.nom}</td>
                  <td style={{ ...S.td, color: C.muted }}>{p.email}</td>
                  <td style={{ ...S.td, color: C.muted }}>{p.telephone}</td>
                  <td style={S.td}><span style={{ background: ts.bg, color: ts.color, padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 700 }}>{p.type}</span></td>
                  <td style={S.td}>
                    <button style={S.btnEdit} onClick={() => edit(p)}><Pencil size={12} />Modifier</button>
                    <button style={S.btnDanger} onClick={() => del(p.id)}><Trash2 size={12} />Supprimer</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ event_id: "", participant_id: "" });
  const [statsEventId, setStatsEventId] = useState("");
  const [msg, setMsg] = useState({ text: "", ok: true });

  const loadAll = () => {
    fetch(`${REGISTRATIONS_URL}/registrations`).then(r=>r.json()).then(setRegistrations).catch(()=>{});
    fetch(`${EVENTS_URL}/events`).then(r=>r.json()).then(setEvents).catch(()=>{});
    fetch(`${PARTICIPANTS_URL}/participants`).then(r=>r.json()).then(setParticipants).catch(()=>{});
  };
  useEffect(() => { loadAll(); }, []);

  const inscrire = async () => {
    if (!form.event_id || !form.participant_id) { setMsg({ text: "Sélectionne un événement et un participant.", ok: false }); return; }
    const r = await fetch(`${REGISTRATIONS_URL}/registrations`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event_id: parseInt(form.event_id), participant_id: parseInt(form.participant_id) }) });
    const data = await r.json();
    if (r.ok) { setMsg({ text: "Inscription confirmée.", ok: true }); setForm({ event_id: "", participant_id: "" }); loadAll(); }
    else setMsg({ text: data.detail || "Erreur.", ok: false });
  };

  const annuler = async (id) => { if (!window.confirm("Annuler ?")) return; await fetch(`${REGISTRATIONS_URL}/registrations/${id}`, { method: "DELETE" }); loadAll(); };
  const voirStats = async () => {
    if (!statsEventId) return;
    const r = await fetch(`${REGISTRATIONS_URL}/registrations/stats/${statsEventId}`);
    if (r.ok) setStats(await r.json()); else setMsg({ text: "Introuvable.", ok: false });
  };

  const getEventNom = (id) => events.find(e=>e.id===id)?.titre || `#${id}`;
  const getParticipantNom = (id) => { const p = participants.find(p=>p.id===id); return p ? p.nom : `#${id}`; };

  return (
    <div>
      <h2 style={S.pageTitle}>Inscriptions</h2>
      <p style={S.pageSubtitle}>Gérer les inscriptions aux événements</p>
      <div style={S.twoCol}>
        <div style={S.card}>
          <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "18px" }}>Nouvelle inscription</p>
          <Field label="Événement">
            <select style={S.select} value={form.event_id} onChange={e=>setForm({...form,event_id:e.target.value})}>
              <option value="">Choisir un événement</option>
              {events.map(e=><option key={e.id} value={e.id}>{e.titre} — {e.lieu} ({e.capacite_max-e.inscrits} places)</option>)}
            </select>
          </Field>
          <Field label="Participant">
            <select style={S.select} value={form.participant_id} onChange={e=>setForm({...form,participant_id:e.target.value})}>
              <option value="">Choisir un participant</option>
              {participants.map(p=><option key={p.id} value={p.id}>{p.nom} — {p.type}</option>)}
            </select>
          </Field>
          {msg.text && <p style={msg.ok ? S.ok : S.err}>{msg.text}</p>}
          <button style={{ ...S.btnPrimary, marginTop: "12px" }} onClick={inscrire}><Plus size={14} />Confirmer l'inscription</button>
        </div>
        <div style={S.card}>
          <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "18px" }}>Statistiques</p>
          <Field label="Événement">
            <select style={S.select} value={statsEventId} onChange={e=>setStatsEventId(e.target.value)}>
              <option value="">Choisir un événement</option>
              {events.map(e=><option key={e.id} value={e.id}>{e.titre}</option>)}
            </select>
          </Field>
          <button style={{ ...S.btnPrimary, marginTop: "12px" }} onClick={voirStats}>Voir les statistiques</button>
          {stats && (
            <div style={{ border: `1px solid ${C.border}`, borderRadius: "8px", padding: "12px", marginTop: "16px" }}>
              {[["Capacité max",stats.capacite_max],["Confirmées",stats.inscriptions_confirmees],["Annulées",stats.inscriptions_annulees],["Places restantes",stats.places_restantes]].map(([k,v])=>(
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontSize: "13px" }}>
                  <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 700, color: C.accent }}>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={S.toolbar}>
        <button style={S.btnGreen} onClick={() => exportCSV(["Événement,Participant,Date,Statut",...registrations.map(r=>`"${getEventNom(r.event_id)}","${getParticipantNom(r.participant_id)}","${r.date_inscription?.slice(0,10)}","${r.statut}"`)], "inscriptions.csv")}><Download size={14} />Exporter</button>
        <button style={S.btnPrint} onClick={() => printTable("Liste des inscriptions",["Événement","Participant","Date","Statut"],registrations.map(r=>[getEventNom(r.event_id),getParticipantNom(r.participant_id),r.date_inscription?.slice(0,10),r.statut]))}><Printer size={14} />Imprimer</button>
      </div>
      <div style={{ ...S.card, padding: 0, overflow: "hidden" }}>
        <table style={S.table}>
          <thead><tr>{["Événement","Participant","Date","Statut",""].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
          <tbody>
            {registrations.map(r=>(
              <tr key={r.id}>
                <td style={{ ...S.td, fontWeight: 600 }}>{getEventNom(r.event_id)}</td>
                <td style={S.td}>{getParticipantNom(r.participant_id)}</td>
                <td style={{ ...S.td, color: C.muted }}>{r.date_inscription?.slice(0,10)}</td>
                <td style={S.td}>
                  <span style={S.badge(r.statut==="confirmee")}>
                    {r.statut==="confirmee" ? <CheckCircle size={12} /> : <XCircle size={12} />}
                    {r.statut==="confirmee" ? "Confirmée" : "Annulée"}
                  </span>
                </td>
                <td style={S.td}>{r.statut==="confirmee" && <button style={S.btnDanger} onClick={()=>annuler(r.id)}><XCircle size={12} />Annuler</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
