import { useState, useEffect, useCallback } from "react";
import { ModeracionAPI, ParchesAPI, PersonasAPI } from "./services/api";
import type { ModerationRequest, Parche, Persona } from "./services/api";

type Vista  = "razones" | "parches" | "usuarios";
type Filtro = "todo" | "pendiente" | "aprobado" | "rechazado";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function formatDate(str?: string | null) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

function categoriaColor(cat: string) {
  const m: Record<string, string> = {
    parche:  "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    deporte: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    estudio: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    fiesta:  "bg-pink-500/15 text-pink-400 border-pink-500/30",
    comida:  "bg-amber-500/15 text-amber-400 border-amber-500/30",
    otro:    "bg-zinc-500/15 text-zinc-400 border-zinc-500/30",
  };
  return m[cat] ?? m.otro;
}

// ─────────────────────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "pendiente") return <span className="badge-pending">⏳ Pendiente</span>;
  if (status === "aprobado")  return <span className="badge-approved">✓ Aprobado</span>;
  return <span className="badge-rejected">✕ Bloqueado</span>;
}

// ─────────────────────────────────────────────────────────────
// ActionButtons
// ─────────────────────────────────────────────────────────────
function ActionButtons({ status, onAprobar, onRechazar, onPendiente, loading }: {
  status: string; onAprobar: ()=>void; onRechazar: ()=>void; onPendiente: ()=>void; loading?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {status !== "aprobado"  && <button onClick={onAprobar}   disabled={loading} title="Aprobar"           className="action-btn action-btn-approve"><span className="material-symbols-outlined text-[18px]">check_circle</span></button>}
      {status !== "rechazado" && <button onClick={onRechazar}  disabled={loading} title="Rechazar"          className="action-btn action-btn-reject"><span className="material-symbols-outlined text-[18px]">cancel</span></button>}
      {status !== "pendiente" && <button onClick={onPendiente} disabled={loading} title="Volver a pendiente" className="action-btn action-btn-ghost"><span className="material-symbols-outlined text-[18px]">undo</span></button>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// FilterTabs
// ─────────────────────────────────────────────────────────────
function FilterTabs({ filtro, setFiltro, counts }: {
  filtro: Filtro; setFiltro: (f: Filtro)=>void;
  counts: { pendiente: number; aprobado: number; rechazado: number; total: number };
}) {
  const tabs: { key: Filtro; label: string; cls: string; count: number }[] = [
    { key: "todo",      label: "Todos",      cls: "tab-all",      count: counts.total },
    { key: "pendiente", label: "Pendientes", cls: "tab-pending",  count: counts.pendiente },
    { key: "aprobado",  label: "Aprobados",  cls: "tab-approved", count: counts.aprobado },
    { key: "rechazado", label: "Rechazados", cls: "tab-rejected", count: counts.rechazado },
  ];
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/5 border border-white/10 w-fit flex-wrap">
      {tabs.map((t) => (
        <button key={t.key} onClick={() => setFiltro(t.key)}
          className={`filter-tab ${t.cls} ${filtro === t.key ? "active" : ""}`}>
          {t.label}<span className="ml-1.5 opacity-60 text-[10px] font-black">{t.count}</span>
        </button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal de confirmación genérico
// ─────────────────────────────────────────────────────────────
function ConfirmModal({ title, message, onConfirm, onCancel, danger = true, confirmLabel = "Confirmar", requirePassword = false }: {
  title: string; message: string; onConfirm: (password?: string)=>void; onCancel: ()=>void; danger?: boolean; confirmLabel?: string; requirePassword?: boolean;
}) {
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm bg-[#18181b] border border-white/10 rounded-2xl p-6 shadow-2xl animate-scale-up">
        <h3 className="font-black text-base text-white mb-2">{title}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed mb-4">{message}</p>
        {requirePassword && (
          <div className="mb-5">
            <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-500 mb-2">Contraseña de administrador</label>
            <div className="relative">
              <input
                autoFocus
                type={show ? "text" : "password"}
                placeholder="Ingresa la contraseña..."
                value={pwd}
                onChange={e => setPwd(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && pwd) onConfirm(pwd); }}
                className="input-field pr-10"
              />
              <button type="button" onClick={() => setShow(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition">
                <span className="material-symbols-outlined text-base">{show ? "visibility_off" : "visibility"}</span>
              </button>
            </div>
          </div>
        )}
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-zinc-400 font-bold text-sm hover:bg-white/10 transition">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(requirePassword ? pwd : undefined)}
            disabled={requirePassword && !pwd.trim()}
            className={`px-4 py-2 rounded-xl font-bold text-sm text-white transition disabled:opacity-40 disabled:cursor-not-allowed ${danger ? "bg-rose-600 hover:bg-rose-500" : "bg-orange-500 hover:bg-orange-400"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VISTA RAZONES
// ─────────────────────────────────────────────────────────────
function VistaRazones() {
  const [items,         setItems]         = useState<ModerationRequest[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [filtro,        setFiltro]        = useState<Filtro>("pendiente");
  const [search,        setSearch]        = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  // Confirmación de borrar persona también (con contraseña)
  const [confirmBorrar, setConfirmBorrar] = useState<{ razonId: number; personaId: number; nombre: string } | null>(null);

  const fetchData = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await ModeracionAPI.getPendientes()); }
    catch (e: any) { setError(e.message || "Error al conectar con la API"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /**
   * Rechaza una razón. Si era la ÚNICA razón de esa persona,
   * pregunta si también quiere borrar la persona.
   */
  const handleRechazar = async (razonId: number, personaId: number, personaNombre: string) => {
    // Contar cuántas razones tiene esa persona en el listado actual
    const razonesDePersona = items.filter(r => r.persona_id === personaId);
    if (razonesDePersona.length === 1) {
      // Solo queda esta razón → ofrecer borrar la persona
      setConfirmBorrar({ razonId, personaId, nombre: personaNombre });
    } else {
      await ejecutarRechazo(razonId);
    }
  };

  const ejecutarRechazo = async (razonId: number) => {
    setActionLoading(razonId);
    try {
      await ModeracionAPI.updateStatus(razonId, "rechazado");
      setItems(prev => prev.map(r => r.id === razonId ? { ...r, status: "rechazado" } : r));
    } catch (e: any) { alert("Error: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const ejecutarRechazoYBorrarPersona = async () => {
    if (!confirmBorrar) return;
    const { razonId, personaId } = confirmBorrar;
    setConfirmBorrar(null);
    setActionLoading(razonId);
    try {
      await ModeracionAPI.updateStatus(razonId, "rechazado");
      await PersonasAPI.delete(personaId);
      setItems(prev => prev.filter(r => r.persona_id !== personaId));
    } catch (e: any) { alert("Error: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const handleStatus = async (id: number, status: "aprobado" | "pendiente") => {
    setActionLoading(id);
    try {
      await ModeracionAPI.updateStatus(id, status);
      setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e: any) { alert("Error: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const counts = {
    total:     items.length,
    pendiente: items.filter(r => r.status === "pendiente").length,
    aprobado:  items.filter(r => r.status === "aprobado").length,
    rechazado: items.filter(r => r.status === "rechazado").length,
  };

  const filtered = items.filter(r => {
    const matchFilter = filtro === "todo" || r.status === filtro;
    const q = search.toLowerCase();
    const matchSearch = !q || r.nombre?.toLowerCase().includes(q) ||
      r.carrera?.toLowerCase().includes(q) || r.razon?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <>
      {/* Modal borrar persona */}
      {confirmBorrar && (
        <ConfirmModal
          title="¿Borrar persona también?"
          message={`Esta es la única razón de "${confirmBorrar.nombre}". Al rechazarla la persona quedaría sin registros. ¿Quieres eliminarla también del ranking?`}
          confirmLabel="Rechazar + Borrar persona"
          onCancel={() => { setConfirmBorrar(null); ejecutarRechazo(confirmBorrar.razonId); }}
          onConfirm={() => ejecutarRechazoYBorrarPersona()}
        />
      )}

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <FilterTabs filtro={filtro} setFiltro={setFiltro} counts={counts} />
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-base">search</span>
              <input type="text" placeholder="Buscar nombre, carrera o razón..."
                className="input-field pl-9 h-10 w-full sm:w-60 text-sm"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={fetchData} title="Actualizar"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0">
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin text-orange-400" : ""}`}>refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
            <span className="material-symbols-outlined shrink-0">database_off</span>
            <div className="flex-1 min-w-0"><p className="font-bold text-sm">Error de conexión</p><p className="text-xs opacity-75 truncate">{error}</p></div>
            <button onClick={fetchData} className="shrink-0 px-3 py-1.5 bg-rose-500 text-white rounded-lg font-bold text-xs">Reintentar</button>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="th-cell">Persona</th>
                  <th className="th-cell">Razón</th>
                  <th className="th-cell hidden md:table-cell">Fecha</th>
                  <th className="th-cell">Estado</th>
                  <th className="th-cell text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="py-24 text-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-orange-500 block mx-auto mb-3">progress_activity</span>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Cargando datos...</p>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <span className="material-symbols-outlined text-4xl">inbox</span>
                      <p className="text-xs font-black uppercase tracking-widest">Sin registros</p>
                    </div>
                  </td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-all">
                    <td className="td-cell">
                      <div className="flex items-center gap-3">
                        <div className={`avatar-circle ${item.genero?.toLowerCase() === "mujer" ? "avatar-fem" : "avatar-masc"}`}>
                          {item.nombre?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-white uppercase truncate max-w-[120px]">{item.nombre}</p>
                          <p className="text-[11px] text-zinc-500 truncate max-w-[140px]">{item.carrera}</p>
                          {item.total_votos !== undefined && (
                            <p className="text-[10px] text-orange-400/70 font-bold">{item.total_votos} votos</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="td-cell max-w-xs">
                      <p className="text-xs text-zinc-400 leading-relaxed italic line-clamp-2">
                        {item.razon ? `"${item.razon}"` : <span className="text-zinc-600 not-italic">— sin descripción —</span>}
                      </p>
                    </td>
                    <td className="td-cell hidden md:table-cell text-xs text-zinc-500">{formatDate(item.created_at)}</td>
                    <td className="td-cell"><StatusBadge status={item.status} /></td>
                    <td className="td-cell">
                      <div className="flex justify-end">
                        <ActionButtons
                          status={item.status} loading={actionLoading === item.id}
                          onAprobar={()   => handleStatus(item.id, "aprobado")}
                          onRechazar={()  => handleRechazar(item.id, item.persona_id, item.nombre)}
                          onPendiente={()  => handleStatus(item.id, "pendiente")}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-white/5 text-xs text-zinc-600 font-medium">
              Mostrando {filtered.length} de {items.length} registros
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// VISTA PARCHES
// ─────────────────────────────────────────────────────────────
function VistaParches() {
  const [items,         setItems]         = useState<Parche[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [filtro,        setFiltro]        = useState<Filtro>("pendiente");
  const [search,        setSearch]        = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expanded,      setExpanded]      = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try { setLoading(true); setError(null); setItems(await ParchesAPI.getPanel()); }
    catch (e: any) { setError(e.message || "Error al conectar"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStatus = async (id: number, status: "aprobado" | "rechazado" | "pendiente") => {
    setActionLoading(id);
    try {
      await ParchesAPI.updateStatus(id, status);
      setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (e: any) { alert("Error: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const counts = {
    total: items.length,
    pendiente: items.filter(r => r.status === "pendiente").length,
    aprobado:  items.filter(r => r.status === "aprobado").length,
    rechazado: items.filter(r => r.status === "rechazado").length,
  };

  const filtered = items.filter(r => {
    const matchFilter = filtro === "todo" || r.status === filtro;
    const q = search.toLowerCase();
    const matchSearch = !q || r.titulo?.toLowerCase().includes(q) ||
      r.autor?.toLowerCase().includes(q) || r.lugar?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <FilterTabs filtro={filtro} setFiltro={setFiltro} counts={counts} />
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-base">search</span>
            <input type="text" placeholder="Buscar título, autor, lugar..."
              className="input-field pl-9 h-10 w-full sm:w-60 text-sm"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button onClick={fetchData}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0">
            <span className={`material-symbols-outlined text-base ${loading ? "animate-spin text-orange-400" : ""}`}>refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
          <span className="material-symbols-outlined shrink-0">database_off</span>
          <div className="flex-1 min-w-0"><p className="font-bold text-sm">Error de conexión</p><p className="text-xs opacity-75 truncate">{error}</p></div>
          <button onClick={fetchData} className="shrink-0 px-3 py-1.5 bg-rose-500 text-white rounded-lg font-bold text-xs">Reintentar</button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center py-24 gap-3">
          <span className="material-symbols-outlined animate-spin text-4xl text-orange-500">progress_activity</span>
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Cargando parches...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 gap-2 opacity-30">
          <span className="material-symbols-outlined text-4xl">event_busy</span>
          <p className="text-xs font-black uppercase tracking-widest">Sin parches</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(parche => (
            <div key={parche.id} className={`parche-card ${parche.status === "pendiente" ? "ring-1 ring-yellow-500/30" : parche.status === "rechazado" ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-2xl">{parche.emoji || "📅"}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-white line-clamp-1">{parche.titulo}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${categoriaColor(parche.categoria)}`}>{parche.categoria}</span>
                  </div>
                </div>
                <StatusBadge status={parche.status} />
              </div>
              <p className={`text-xs text-zinc-400 leading-relaxed mb-2 ${expanded === parche.id ? "" : "line-clamp-2"}`}>{parche.descripcion}</p>
              {(parche.descripcion?.length ?? 0) > 80 && (
                <button onClick={() => setExpanded(expanded === parche.id ? null : parche.id)} className="text-[10px] text-orange-400 font-bold mb-3 block">
                  {expanded === parche.id ? "Ver menos ▲" : "Ver más ▼"}
                </button>
              )}
              <div className="space-y-1 mb-4 text-[11px] text-zinc-500">
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">person</span><span className="font-semibold">{parche.autor}</span>{parche.carrera && <span className="opacity-60">· {parche.carrera}</span>}</div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">location_on</span><span>{parche.lugar}</span></div>
                <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">calendar_month</span><span>{formatDate(parche.fecha)} · {parche.hora?.substring(0, 5)}</span></div>
                {parche.cupo && <div className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">group</span><span>Cupo: {parche.cupo}</span>{parche.total_interesados !== undefined && <span className="text-orange-400 font-bold">· {parche.total_interesados}</span>}</div>}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/5">
                <span className="text-[10px] text-zinc-600">#{parche.id} · {formatDate(parche.created_at)}</span>
                <ActionButtons status={parche.status} loading={actionLoading === parche.id}
                  onAprobar={()  => handleStatus(parche.id, "aprobado")}
                  onRechazar={()  => handleStatus(parche.id, "rechazado")}
                  onPendiente={()  => handleStatus(parche.id, "pendiente")} />
              </div>
            </div>
          ))}
        </div>
      )}
      {filtered.length > 0 && <p className="text-xs text-zinc-600 text-right font-medium">Mostrando {filtered.length} de {items.length} parches</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// VISTA USUARIOS
// ─────────────────────────────────────────────────────────────
function VistaUsuarios() {
  const [personas,      setPersonas]      = useState<Persona[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [editando,      setEditando]      = useState<number | null>(null);
  const [editNombre,    setEditNombre]    = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmDel,    setConfirmDel]    = useState<Persona | null>(null);

  const fetchData = useCallback(async () => {
    try { setLoading(true); setError(null); setPersonas(await PersonasAPI.getAll()); }
    catch (e: any) { setError(e.message || "Error al conectar"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const iniciarEdicion = (p: Persona) => {
    setEditando(p.id);
    setEditNombre(p.nombre);
  };

  const guardarEdicion = async (id: number) => {
    if (!editNombre.trim()) return;
    setActionLoading(id);
    try {
      await PersonasAPI.update(id, { nombre: editNombre.trim() });
      setPersonas(prev => prev.map(p => p.id === id ? { ...p, nombre: editNombre.trim() } : p));
      setEditando(null);
    } catch (e: any) { alert("Error al editar: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const borrarPersona = async () => {
    if (!confirmDel) return;
    const id = confirmDel.id;
    setConfirmDel(null);
    setActionLoading(id);
    try {
      await PersonasAPI.delete(id);
      setPersonas(prev => prev.filter(p => p.id !== id));
    } catch (e: any) { alert("Error al borrar: " + (e.response?.data?.error || e.message)); }
    finally { setActionLoading(null); }
  };

  const filtradas = personas.filter(p => {
    const q = search.toLowerCase();
    return !q || p.nombre?.toLowerCase().includes(q) || p.carrera?.toLowerCase().includes(q);
  });

  return (
    <>
      {confirmDel && (
        <ConfirmModal
          title="¿Eliminar persona?"
          message={`Esto borrará a "${confirmDel.nombre}" y todas sus razones del ranking permanentemente. Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={() => borrarPersona()}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black">
              {personas.length} personas en el ranking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-zinc-500 text-base">search</span>
              <input type="text" placeholder="Buscar nombre o carrera..."
                className="input-field pl-9 h-10 w-full sm:w-60 text-sm"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <button onClick={fetchData} title="Actualizar"
              className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0">
              <span className={`material-symbols-outlined text-base ${loading ? "animate-spin text-orange-400" : ""}`}>refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3">
            <span className="material-symbols-outlined shrink-0">database_off</span>
            <div className="flex-1 min-w-0"><p className="font-bold text-sm">Error de conexión</p><p className="text-xs opacity-75 truncate">{error}</p></div>
            <button onClick={fetchData} className="shrink-0 px-3 py-1.5 bg-rose-500 text-white rounded-lg font-bold text-xs">Reintentar</button>
          </div>
        )}

        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="th-cell">#</th>
                  <th className="th-cell">Nombre</th>
                  <th className="th-cell hidden sm:table-cell">Carrera</th>
                  <th className="th-cell hidden md:table-cell">Género</th>
                  <th className="th-cell hidden md:table-cell text-center">Votos</th>
                  <th className="th-cell text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="py-24 text-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-orange-500 block mx-auto mb-3">progress_activity</span>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Cargando usuarios...</p>
                  </td></tr>
                ) : filtradas.length === 0 ? (
                  <tr><td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-2 opacity-30">
                      <span className="material-symbols-outlined text-4xl">person_off</span>
                      <p className="text-xs font-black uppercase tracking-widest">Sin resultados</p>
                    </div>
                  </td></tr>
                ) : filtradas.map(p => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-all group">
                    {/* Posición */}
                    <td className="td-cell">
                      <span className="text-xs text-zinc-600 font-bold">#{p.posicion ?? p.id}</span>
                    </td>
                    {/* Nombre (editable) */}
                    <td className="td-cell">
                      {editando === p.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            autoFocus
                            type="text"
                            value={editNombre}
                            onChange={e => setEditNombre(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") guardarEdicion(p.id); if (e.key === "Escape") setEditando(null); }}
                            className="input-field h-8 text-sm py-1 px-2 max-w-[160px]"
                          />
                          <button onClick={() => guardarEdicion(p.id)} disabled={actionLoading === p.id}
                            className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition text-xs">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button onClick={() => setEditando(null)}
                            className="w-7 h-7 rounded-lg bg-white/5 text-zinc-500 border border-white/10 hover:bg-white/10 hover:text-white flex items-center justify-center transition">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className={`avatar-circle w-8 h-8 text-sm ${p.genero?.toLowerCase() === "mujer" ? "avatar-fem" : "avatar-masc"}`}>
                            {p.nombre?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <span className="font-bold text-sm text-white truncate max-w-[120px] capitalize">{p.nombre}</span>
                        </div>
                      )}
                    </td>
                    {/* Carrera */}
                    <td className="td-cell hidden sm:table-cell">
                      <span className="text-xs text-zinc-400 truncate max-w-[180px] block">{p.carrera}</span>
                    </td>
                    {/* Género */}
                    <td className="td-cell hidden md:table-cell">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        p.genero === "Mujer"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : p.genero === "Hombre"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                      }`}>{p.genero}</span>
                    </td>
                    {/* Votos */}
                    <td className="td-cell hidden md:table-cell text-center">
                      {p.total_votos !== undefined && (
                        <span className="text-sm font-black text-orange-400">{p.total_votos}</span>
                      )}
                    </td>
                    {/* Acciones */}
                    <td className="td-cell">
                      <div className="flex items-center justify-end gap-2">
                        {editando !== p.id && (
                          <button onClick={() => iniciarEdicion(p)} title="Editar nombre"
                            className="action-btn action-btn-ghost">
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                        )}
                        <button onClick={() => setConfirmDel(p)} disabled={actionLoading === p.id} title="Eliminar persona"
                          className="action-btn action-btn-reject">
                          <span className="material-symbols-outlined text-[18px]">person_remove</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtradas.length > 0 && (
            <div className="px-6 py-3 border-t border-white/5 text-xs text-zinc-600 font-medium">
              Mostrando {filtradas.length} de {personas.length} personas
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// APP PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function App() {
  const [vista,       setVista]       = useState<Vista>("razones");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems: { key: Vista; label: string; icon: string; badge: string }[] = [
    { key: "razones",  label: "Razones",    icon: "rate_review", badge: "Ranking" },
    { key: "parches",  label: "Parches UTS", icon: "event",       badge: "Eventos" },
    { key: "usuarios", label: "Usuarios",    icon: "group",       badge: "Personas" },
  ];

  const vistaMeta = navItems.find(n => n.key === vista)!;

  return (
    <div className="h-screen flex overflow-hidden bg-zinc-950 text-slate-100">

      {/* Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-orange-600/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 -left-20 w-[500px] h-[500px] bg-rose-600/8 rounded-full blur-[140px]" />
      </div>

      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-30 bg-black/70 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-72 flex flex-col
        bg-[#0f0f11] border-r border-white/[0.06]
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:relative lg:translate-x-0 lg:w-64 lg:shrink-0 lg:z-10
      `}>
        {/* Logo */}
        <div className="px-6 pt-7 pb-5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-rose-600 flex items-center justify-center shadow-lg shadow-orange-500/25 shrink-0">
              <span className="material-symbols-outlined text-white text-xl">admin_panel_settings</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-black tracking-tight text-gradient leading-none">UTS MOD</h1>
              <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">Panel de Moderación</p>
            </div>
            <button className="lg:hidden w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition shrink-0"
              onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] px-3 mb-3">Módulos</p>
          {navItems.map(item => (
            <button key={item.key}
              onClick={() => { setVista(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all
                ${vista === item.key
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/25"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04] border border-transparent"
                }`}>
              <span className="material-symbols-outlined text-xl shrink-0">{item.icon}</span>
              <span className="flex-1 text-left">{item.label}</span>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wide shrink-0 ${
                vista === item.key ? "bg-orange-500/20 text-orange-400" : "bg-white/5 text-zinc-600"
              }`}>{item.badge}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] shrink-0">
          <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500/30 to-rose-500/30 border border-orange-500/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-orange-400 text-sm">person</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">Admin UTS</p>
              <p className="text-[10px] text-zinc-500 truncate">moderador@uts.edu.co</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <header className="h-16 shrink-0 flex items-center gap-3 px-4 sm:px-6 border-b border-white/[0.06] bg-[#0f0f11]/90 backdrop-blur-xl">
          <button className="lg:hidden w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 active:scale-95 transition shrink-0"
            onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="flex-1 min-w-0 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-orange-400 text-xl shrink-0">{vistaMeta.icon}</span>
            <div className="min-w-0">
              <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
                {vista === "razones" ? "Moderación de Razones" : vista === "parches" ? "Moderación de Parches" : "Gestión de Usuarios"}
              </h2>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                {vista === "razones" ? "Aprobar o rechazar comentarios del ranking" : vista === "parches" ? "Gestionar eventos estudiantiles" : "Editar nombre o eliminar personas del ranking"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span className="hidden sm:inline">{vistaMeta.badge}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {vista === "razones"  && <VistaRazones />}
          {vista === "parches"  && <VistaParches />}
          {vista === "usuarios" && <VistaUsuarios />}
        </main>
      </div>
    </div>
  );
}
