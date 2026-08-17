import { useState, useEffect } from "react";

const EVENTS_URL = "http://localhost:8001";
const PARTICIPANTS_URL = "http://localhost:8002";
const REGISTRATIONS_URL = "http://localhost:8003";

export default function App() {
  const [page, setPage] = useState("events");

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      <nav style={{ backgroundColor: "#1a1a2e", padding: "16px 32px", display: "flex", gap: "24px", alignItems: "center" }}>
        <span style={{ color: "white", fontWeight: "bold", fontSize: "20px", marginRight: "32px" }}>EventHub</span>
        {["events", "participants", "registrations"].map(p => (
          <button key={p} onClick={() => setPage(p)} style={{
            background: page === p ? "#e94560" : "transparent",
            color: "white", border: "none", padding: "8px 16px",
            borderRadius: "6px", cursor: "pointer", fontSize: "14px"
          }}>{p === "events" ? "Événements" : p === "participants" ? "Participants" : "Inscriptions"}</button>
        ))}
      </nav>
      <div style={{ padding: "32px" }}>
        {page === "events" && <Events />}
        {page === "participants" && <Participants />}
        {page === "registrations" && <Registrations />}
      </div>
    </div>
  );
}

// ─── EVENTS ───────────────────────────────────────────────────────────────────
function Events() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", date: "", lieu: "", capacite_max: "" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = () => fetch(`${EVENTS_URL}/events`).then(r => r.json()).then(setEvents).catch(() => setMsg("Impossible de charger les événements."));

  useEffect(() => { load(); }, []);

  const submit = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${EVENTS_URL}/events/${editId}` : `${EVENTS_URL}/events`;
    const body = { ...form, capacite_max: parseInt(form.capacite_max) };
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) { setMsg(editId ? "Événement modifié" : "Événement créé"); setForm({ titre: "", description: "", date: "", lieu: "", capacite_max: "" }); setEditId(null); load(); }
    else setMsg("Erreur");
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer cet événement ?")) return;
    await fetch(`${EVENTS_URL}/events/${id}`, { method: "DELETE" });
    load();
  };

  const edit = (e) => { setEditId(e.id); setForm({ titre: e.titre, description: e.description, date: e.date, lieu: e.lieu, capacite_max: e.capacite_max }); };

  return (
    <div>
      <h2 style={{ marginBottom: "24px" }}>Événements</h2>
      <div style={{ background: "white", padding: "24px", borderRadius: "10px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h3 style={{ marginBottom: "16px" }}>{editId ? "Modifier l'événement" : "Créer un événement"}</h3>
        {[["titre","Titre"],["description","Description"],["date","Date (YYYY-MM-DD)"],["lieu","Lieu"],["capacite_max","Capacité max"]].map(([k,l]) => (
          <div key={k} style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555" }}>{l}</label>
            <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
        ))}
        {msg && <p style={{ color: "#e94560", fontSize: "13px" }}>{msg}</p>}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button onClick={submit} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer" }}>
            {editId ? "Modifier" : "Créer"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({ titre: "", description: "", date: "", lieu: "", capacite_max: "" }); }} style={{ background: "#aaa", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer" }}>Annuler</button>}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {events.map(e => (
          <div key={e.id} style={{ background: "white", borderRadius: "10px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
            <h3 style={{ marginBottom: "8px" }}>{e.titre}</h3>
            <p style={{ color: "#666", fontSize: "13px", marginBottom: "8px" }}>{e.description}</p>
            <p style={{ fontSize: "13px" }}>📅 {e.date} &nbsp; 📍 {e.lieu}</p>
            <p style={{ fontSize: "13px" }}>👥 {e.inscrits} / {e.capacite_max} places</p>
            <div style={{ display: "flex", gap: "8px", marginTop: "16px" }}>
              <button onClick={() => edit(e)} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Modifier</button>
              <button onClick={() => del(e.id)} style={{ background: "#e94560", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PARTICIPANTS ──────────────────────────────────────────────────────────────
function Participants() {
  const [participants, setParticipants] = useState([]);
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", type: "etudiant" });
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState("");

  const load = () => fetch(`${PARTICIPANTS_URL}/participants`).then(r => r.json()).then(setParticipants).catch(() => setMsg("Impossible de charger les participants."));

  useEffect(() => { load(); }, []);

  const submit = async () => {
    const method = editId ? "PUT" : "POST";
    const url = editId ? `${PARTICIPANTS_URL}/participants/${editId}` : `${PARTICIPANTS_URL}/participants`;
    const r = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (r.ok) { setMsg(editId ? "Participant modifié" : "Participant créé"); setForm({ nom: "", email: "", telephone: "", type: "etudiant" }); setEditId(null); load(); }
    else setMsg("Erreur");
  };

  const del = async (id) => {
    if (!window.confirm("Supprimer ce participant ?")) return;
    await fetch(`${PARTICIPANTS_URL}/participants/${id}`, { method: "DELETE" });
    load();
  };

  const edit = (p) => { setEditId(p.id); setForm({ nom: p.nom, email: p.email, telephone: p.telephone, type: p.type }); };

  return (
    <div>
      <h2 style={{ marginBottom: "24px" }}>Participants</h2>
      <div style={{ background: "white", padding: "24px", borderRadius: "10px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <h3 style={{ marginBottom: "16px" }}>{editId ? "Modifier le participant" : "Ajouter un participant"}</h3>
        {[["nom","Nom"],["email","Email"],["telephone","Téléphone"]].map(([k,l]) => (
          <div key={k} style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555" }}>{l}</label>
            <input value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", boxSizing: "border-box" }} />
          </div>
        ))}
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555" }}>Type</label>
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}>
            <option value="etudiant">Étudiant</option>
            <option value="professeur">Professeur</option>
            <option value="externe">Externe</option>
          </select>
        </div>
        {msg && <p style={{ color: "#e94560", fontSize: "13px" }}>{msg}</p>}
        <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
          <button onClick={submit} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer" }}>
            {editId ? "Modifier" : "Ajouter"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setForm({ nom: "", email: "", telephone: "", type: "etudiant" }); }} style={{ background: "#aaa", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer" }}>Annuler</button>}
        </div>
      </div>
      <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a2e", color: "white" }}>
              {["Nom","Email","Téléphone","Type","Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {participants.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? "#fafafa" : "white" }}>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{p.nom}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{p.email}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{p.telephone}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", textTransform: "capitalize" }}>{p.type}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => edit(p)} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px", marginRight: "8px" }}>Modifier</button>
                  <button onClick={() => del(p.id)} style={{ background: "#e94560", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── REGISTRATIONS ─────────────────────────────────────────────────────────────
function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState({ event_id: "", participant_id: "" });
  const [statsEventId, setStatsEventId] = useState("");
  const [msg, setMsg] = useState("");

  const loadAll = () => {
    fetch(`${REGISTRATIONS_URL}/registrations`).then(r => r.json()).then(setRegistrations).catch(() => {});
    fetch(`${EVENTS_URL}/events`).then(r => r.json()).then(setEvents).catch(() => {});
    fetch(`${PARTICIPANTS_URL}/participants`).then(r => r.json()).then(setParticipants).catch(() => {});
  };

  useEffect(() => { loadAll(); }, []);

  const inscrire = async () => {
    if (!form.event_id || !form.participant_id) { setMsg("Sélectionne un événement et un participant"); return; }
    const r = await fetch(`${REGISTRATIONS_URL}/registrations`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event_id: parseInt(form.event_id), participant_id: parseInt(form.participant_id) })
    });
    const data = await r.json();
    if (r.ok) { setMsg("Inscription réussie"); setForm({ event_id: "", participant_id: "" }); loadAll(); }
    else setMsg(data.detail || "Erreur");
  };

  const annuler = async (id) => {
    if (!window.confirm("Annuler cette inscription ?")) return;
    await fetch(`${REGISTRATIONS_URL}/registrations/${id}`, { method: "DELETE" });
    loadAll();
  };

  const voirStats = async () => {
    if (!statsEventId) return;
    const r = await fetch(`${REGISTRATIONS_URL}/registrations/stats/${statsEventId}`);
    if (r.ok) setStats(await r.json());
    else setMsg("Événement introuvable");
  };

  const getEventNom = (id) => events.find(e => e.id === id)?.titre || `#${id}`;
  const getParticipantNom = (id) => { const p = participants.find(p => p.id === id); return p ? p.nom : `#${id}`; };
  const getEventNomById = (id) => events.find(e => e.id === parseInt(id))?.titre || "";

  return (
    <div>
      <h2 style={{ marginBottom: "24px" }}>Inscriptions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        <div style={{ background: "white", padding: "24px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px" }}>Inscrire un participant</h3>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555" }}>Événement</label>
            <select value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}>
              <option value="">-- Choisir un événement --</option>
              {events.map(e => (
                <option key={e.id} value={e.id}>{e.titre} — {e.date} — {e.lieu} ({e.capacite_max - e.inscrits} places restantes)</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", marginBottom: "4px", fontSize: "13px", color: "#555" }}>Participant</label>
            <select value={form.participant_id} onChange={e => setForm({ ...form, participant_id: e.target.value })}
              style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px" }}>
              <option value="">-- Choisir un participant --</option>
              {participants.map(p => (
                <option key={p.id} value={p.id}>{p.nom} — {p.email} ({p.type})</option>
              ))}
            </select>
          </div>

          {msg && <p style={{ color: "#e94560", fontSize: "13px" }}>{msg}</p>}
          <button onClick={inscrire} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer", marginTop: "8px" }}>Inscrire</button>
        </div>

        <div style={{ background: "white", padding: "24px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ marginBottom: "16px" }}>Statistiques d'un événement</h3>
          <select value={statsEventId} onChange={e => setStatsEventId(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", marginBottom: "12px" }}>
            <option value="">-- Choisir un événement --</option>
            {events.map(e => (
              <option key={e.id} value={e.id}>{e.titre}</option>
            ))}
          </select>
          <button onClick={voirStats} style={{ background: "#1a1a2e", color: "white", border: "none", padding: "10px 24px", borderRadius: "6px", cursor: "pointer" }}>Voir les stats</button>
          {stats && (
            <div style={{ marginTop: "16px", fontSize: "13px", lineHeight: "2" }}>
              <p>Capacité max : <strong>{stats.capacite_max}</strong></p>
              <p>Inscriptions confirmées : <strong>{stats.inscriptions_confirmees}</strong></p>
              <p>Inscriptions annulées : <strong>{stats.inscriptions_annulees}</strong></p>
              <p>Places restantes : <strong>{stats.places_restantes}</strong></p>
            </div>
          )}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1a1a2e", color: "white" }}>
              {["Événement","Participant","Date","Statut","Action"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {registrations.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 0 ? "#fafafa" : "white" }}>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{getEventNom(r.event_id)}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{getParticipantNom(r.participant_id)}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>{r.date_inscription?.slice(0,10)}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px" }}>
                  <span style={{ background: r.statut === "confirmee" ? "#d4edda" : "#f8d7da", color: r.statut === "confirmee" ? "#155724" : "#721c24", padding: "2px 8px", borderRadius: "4px" }}>{r.statut}</span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {r.statut === "confirmee" && <button onClick={() => annuler(r.id)} style={{ background: "#e94560", color: "white", border: "none", padding: "4px 12px", borderRadius: "4px", cursor: "pointer", fontSize: "12px" }}>Annuler</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}