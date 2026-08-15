'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import Header from '@/components/Header';

const EQUIPMENT_TYPES = [
  'Ekskavator', 'Backhoe loader', 'Qreyder', 'Katok yol', 'Katok asfalt',
  'Bulldozer', 'Özüboşaldan', 'Su maşını', 'Yanacaq maşını'
];

const RISK_LEVELS = ['Kritik', 'Yüksək', 'Orta', 'Aşağı', 'Müsbət'];
const RISK_STATES = ['Açıq', 'Nəzarətdə', 'Davam edir'];

function AccordionSection({ title, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="admin-section">
      <div className="admin-section__header" onClick={() => setOpen(!open)}>
        <span className="admin-section__title">
          <span>{icon}</span> {title}
        </span>
        <span className={`admin-section__toggle ${open ? 'open' : ''}`}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
          </svg>
        </span>
      </div>
      <div className={`admin-section__body ${!open ? 'collapsed' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form state
  const [general, setGeneral] = useState({
    reportDate: new Date().toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    projectName: 'Sky Breeze',
    location: 'Bakı, Azərbaycan',
    contractor: 'Sky Breeze Construction MMC',
    contractStart: '01.03.2025',
    contractEnd: '01.09.2027',
  });

  const [packages, setPackages] = useState([
    { name: 'Sky Breeze Cəmi', plan: 35, fact: 31.2, trend: '' },
    { name: 'Paket 1 — Bina A1-C5', plan: 40, fact: 37.5, trend: '' },
    { name: 'Paket 2 — Koteclər', plan: 30, fact: 26.8, trend: '' },
    { name: 'Paket 3 — Hotel Binası', plan: 25, fact: 22.1, trend: '' },
  ]);

  const [personnel, setPersonnel] = useState({
    date: new Date().toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    administrative: 12,
    technical: 28,
    field: 185,
  });

  const [equipment, setEquipment] = useState(
    EQUIPMENT_TYPES.reduce((acc, type) => ({ ...acc, [type]: 0 }), {})
  );

  const [risks, setRisks] = useState([]);
  const [newRisk, setNewRisk] = useState({
    risk: '', status: '', level: 'Orta', action: '', deadline: '', state: 'Açıq'
  });

  // Undo / Redo history stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);
  const isUndoRedoAction = useRef(false);

  // Helper to get snapshot
  const getSnapshot = useCallback(() => ({
    general: JSON.parse(JSON.stringify(general)),
    packages: JSON.parse(JSON.stringify(packages)),
    personnel: JSON.parse(JSON.stringify(personnel)),
    equipment: JSON.parse(JSON.stringify(equipment)),
    risks: JSON.parse(JSON.stringify(risks)),
  }), [general, packages, personnel, equipment, risks]);

  // Auth check
  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/');
      } else if (user.email !== 'kanan.gahramanov@seabreeze.az') {
        router.push('/dashboard');
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  // Load existing data from Supabase
  useEffect(() => {
    if (!user) return;
    fetch('/api/data/summary', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.general && data.general.reportDate) {
          setGeneral(prev => ({ ...prev, ...data.general }));
        }
        if (data.packages && data.packages.length > 0) {
          setPackages(data.packages.map(p => ({
            name: p.name, plan: p.plan, fact: p.fact, trend: p.trend || ''
          })));
        }
        if (data.personnel && data.personnel.total > 0) {
          setPersonnel(prev => ({
            ...prev,
            administrative: data.personnel.administrative,
            technical: data.personnel.technical,
            field: data.personnel.field,
          }));
        }
        if (data.equipment && data.equipment.length > 0) {
          const eq = {};
          data.equipment.forEach(e => { eq[e.name] = e.count; });
          setEquipment(prev => ({ ...prev, ...eq }));
        }
        if (data.risks && data.risks.length > 0) setRisks(data.risks);
      })
      .catch(console.error);
  }, [user]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  // Direct save payload function
  const savePayload = async (payload, showMsg = true) => {
    setSaving(true);
    try {
      const equipmentList = EQUIPMENT_TYPES.map(type => ({
        name: type,
        count: Number(payload.equipment[type]) || 0,
      }));

      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general: payload.general,
          packages: payload.packages.map(p => ({
            name: p.name, plan: Number(p.plan) || 0, fact: Number(p.fact) || 0, trend: p.trend,
          })),
          personnel: {
            date: payload.personnel.date,
            administrative: Number(payload.personnel.administrative) || 0,
            technical: Number(payload.personnel.technical) || 0,
            field: Number(payload.personnel.field) || 0,
          },
          equipment: equipmentList,
          risks: payload.risks,
        }),
      });

      const result = await response.json();
      if (result.success) {
        if (showMsg) setMessage({ type: 'success', text: 'Məlumatlar saytda anında yeniləndi! ⚡' });
      } else {
        if (showMsg) setMessage({ type: 'error', text: 'Xəta: ' + (result.errors?.join(', ') || 'Xəta baş verdi') });
      }
    } catch (err) {
      if (showMsg) setMessage({ type: 'error', text: 'Xəta: ' + err.message });
    }
    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  // Record history snapshot before user modification
  const recordSnapshot = () => {
    if (isUndoRedoAction.current) return;
    const current = getSnapshot();
    setHistory(prev => [...prev.slice(-20), current]);
    setFuture([]); // reset future on new change
  };

  // Undo Handler
  const handleUndo = async () => {
    if (history.length === 0) return;
    const current = getSnapshot();
    const previous = history[history.length - 1];

    isUndoRedoAction.current = true;
    setFuture(prev => [current, ...prev]);
    setHistory(prev => prev.slice(0, prev.length - 1));

    // Apply previous state
    setGeneral(previous.general);
    setPackages(previous.packages);
    setPersonnel(previous.personnel);
    setEquipment(previous.equipment);
    setRisks(previous.risks);

    // Save and instantly broadcast to site
    await savePayload(previous, true);
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 100);
  };

  // Redo Handler
  const handleRedo = async () => {
    if (future.length === 0) return;
    const current = getSnapshot();
    const next = future[0];

    isUndoRedoAction.current = true;
    setHistory(prev => [...prev, current]);
    setFuture(prev => prev.slice(1));

    // Apply next state
    setGeneral(next.general);
    setPackages(next.packages);
    setPersonnel(next.personnel);
    setEquipment(next.equipment);
    setRisks(next.risks);

    // Save and instantly broadcast to site
    await savePayload(next, true);
    setTimeout(() => {
      isUndoRedoAction.current = false;
    }, 100);
  };

  // Keyboard shortcut listener (Ctrl+Z for Undo, Ctrl+Y or Ctrl+Shift+Z for Redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const updatePackage = (index, field, value) => {
    recordSnapshot();
    setPackages(prev => prev.map((pkg, i) =>
      i === index ? { ...pkg, [field]: field === 'trend' ? value : value } : pkg
    ));
  };

  const addRisk = () => {
    if (!newRisk.risk.trim()) return;
    recordSnapshot();
    setRisks(prev => [...prev, { ...newRisk, id: prev.length + 1 }]);
    setNewRisk({ risk: '', status: '', level: 'Orta', action: '', deadline: '', state: 'Açıq' });
  };

  const removeRisk = (index) => {
    recordSnapshot();
    setRisks(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, id: i + 1 })));
  };

  const handleSave = () => {
    savePayload(getSnapshot(), true);
  };

  if (loading) {
    return (
      <div className="loading-container" style={{ minHeight: '100vh' }}>
        <div className="loading-spinner" />
        <span className="loading-text">Yüklənir...</span>
      </div>
    );
  }

  return (
    <>
      <Header isAdmin user={user} onSignOut={handleSignOut} />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="page-header__title">Admin Panel</h1>
            <p className="page-header__desc">Məlumatları daxil edin. Dəyişikliklər və Undo anında canlı yenilənir.</p>
          </div>

          {/* Quick Undo / Redo toolbar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleUndo}
              disabled={history.length === 0 || saving}
              title="Geri al (Ctrl+Z)"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: history.length === 0 ? 0.5 : 1 }}
            >
              ↩️ Geri al {history.length > 0 && `(${history.length})`}
            </button>
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={handleRedo}
              disabled={future.length === 0 || saving}
              title="İrəli al (Ctrl+Y)"
              style={{ display: 'flex', alignItems: 'center', gap: '4px', opacity: future.length === 0 ? 0.5 : 1 }}
            >
              ↪️ İrəli al {future.length > 0 && `(${future.length})`}
            </button>
          </div>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'form-success' : 'form-error'} style={{ transition: 'all 0.3s ease' }}>
            {message.text}
          </div>
        )}

        <div className="admin-sections">
          {/* SECTION 1: General Info */}
          <AccordionSection title="Ümumi Məlumat" icon="🏢" defaultOpen={true}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hesabat Tarixi</label>
                <input className="form-input" type="text" value={general.reportDate}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, reportDate: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">Layihə Adı</label>
                <input className="form-input" type="text" value={general.projectName}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, projectName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Yer</label>
                <input className="form-input" type="text" value={general.location}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, location: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Podratçı</label>
                <input className="form-input" type="text" value={general.contractor}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, contractor: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Müqavilə Başlanğıc</label>
                <input className="form-input" type="text" value={general.contractStart}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, contractStart: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">Müqavilə Bitmə</label>
                <input className="form-input" type="text" value={general.contractEnd}
                  onFocus={recordSnapshot}
                  onChange={e => setGeneral({...general, contractEnd: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
            </div>
          </AccordionSection>

          {/* SECTION 2: Packages */}
          <AccordionSection title="Paketlər Üzrə Plan/Fakt" icon="📊" defaultOpen={true}>
            <div style={{ marginBottom: 'var(--space-sm)' }}>
              <div className="package-row" style={{ borderBottom: '2px solid var(--color-border)' }}>
                <span className="form-label" style={{ margin: 0 }}>Paket</span>
                <span className="form-label" style={{ margin: 0 }}>Plan %</span>
                <span className="form-label" style={{ margin: 0 }}>Fakt %</span>
                <span className="form-label" style={{ margin: 0 }}>Trend/Şərh</span>
              </div>
              {packages.map((pkg, i) => (
                <div key={i} className="package-row">
                  <span className="package-row__label">{pkg.name}</span>
                  <input className="form-input" type="text" inputMode="decimal" value={pkg.plan}
                    onFocus={recordSnapshot}
                    onChange={e => updatePackage(i, 'plan', e.target.value)} />
                  <input className="form-input" type="text" inputMode="decimal" value={pkg.fact}
                    onFocus={recordSnapshot}
                    onChange={e => updatePackage(i, 'fact', e.target.value)} />
                  <input className="form-input" type="text" value={pkg.trend}
                    onFocus={recordSnapshot}
                    onChange={e => updatePackage(i, 'trend', e.target.value)} placeholder="Trend/şərh yazın" />
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* SECTION 3: Personnel & Equipment */}
          <AccordionSection title="Personal və Texnika" icon="👷" defaultOpen={false}>
            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Günlük Personal</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Tarix</label>
                <input className="form-input" type="text" value={personnel.date}
                  onFocus={recordSnapshot}
                  onChange={e => { recordSnapshot(); setPersonnel({...personnel, date: e.target.value}); }} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">İdari</label>
                <input className="form-input" type="text" inputMode="numeric" value={personnel.administrative}
                  onFocus={recordSnapshot}
                  onChange={e => { recordSnapshot(); setPersonnel({...personnel, administrative: e.target.value}); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Texniki</label>
                <input className="form-input" type="text" inputMode="numeric" value={personnel.technical}
                  onFocus={recordSnapshot}
                  onChange={e => { recordSnapshot(); setPersonnel({...personnel, technical: e.target.value}); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Sahə</label>
                <input className="form-input" type="text" inputMode="numeric" value={personnel.field}
                  onFocus={recordSnapshot}
                  onChange={e => { recordSnapshot(); setPersonnel({...personnel, field: e.target.value}); }} />
              </div>
              <div className="form-group">
                <label className="form-label">Cəmi</label>
                <input className="form-input" type="text" readOnly
                  value={(Number(personnel.administrative) || 0) + (Number(personnel.technical) || 0) + (Number(personnel.field) || 0)}
                  style={{ background: 'var(--color-bg)', fontWeight: 600 }} />
              </div>
            </div>

            <h4 style={{ margin: 'var(--space-lg) 0 var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Texnika</h4>
            <div className="equipment-grid">
              {EQUIPMENT_TYPES.map(type => (
                <div key={type} className="equipment-item">
                  <label className="form-label">{type}</label>
                  <input className="form-input" type="text" inputMode="numeric" value={equipment[type]}
                    onFocus={recordSnapshot}
                    onChange={e => { recordSnapshot(); setEquipment({...equipment, [type]: e.target.value}); }} />
                </div>
              ))}
            </div>
          </AccordionSection>

          {/* SECTION 4: Risks */}
          <AccordionSection title="Risk və Təkliflər" icon="⚠️" defaultOpen={false}>
            {risks.length > 0 && (
              <div className="table-scroll" style={{ marginBottom: 'var(--space-lg)' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Risk</th>
                      <th>Vəziyyət</th>
                      <th>Səviyyə</th>
                      <th>Tədbir</th>
                      <th>Son tarix</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map((risk, i) => (
                      <tr key={i}>
                        <td>{risk.id}</td>
                        <td>{risk.risk}</td>
                        <td>{risk.status}</td>
                        <td>{risk.level}</td>
                        <td>{risk.action}</td>
                        <td>{risk.deadline}</td>
                        <td>{risk.state}</td>
                        <td>
                          <button className="btn btn--sm btn--outline" onClick={() => removeRisk(i)}
                            style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>Sil</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <h4 style={{ marginBottom: 'var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Yeni Risk Əlavə Et</h4>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Risk / Məsələ</label>
                <input className="form-input" type="text" value={newRisk.risk}
                  onChange={e => setNewRisk({...newRisk, risk: e.target.value})} placeholder="Riskə adı yazın" />
              </div>
              <div className="form-group">
                <label className="form-label">Cari Vəziyyət</label>
                <input className="form-input" type="text" value={newRisk.status}
                  onChange={e => setNewRisk({...newRisk, status: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Səviyyə</label>
                <select className="form-select" value={newRisk.level}
                  onChange={e => setNewRisk({...newRisk, level: e.target.value})}>
                  {RISK_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Təklif Olunan Tədbir</label>
                <input className="form-input" type="text" value={newRisk.action}
                  onChange={e => setNewRisk({...newRisk, action: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Son Tarix</label>
                <input className="form-input" type="text" value={newRisk.deadline}
                  onChange={e => setNewRisk({...newRisk, deadline: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={newRisk.state}
                  onChange={e => setNewRisk({...newRisk, state: e.target.value})}>
                  {RISK_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn--outline btn--sm" onClick={addRisk} style={{ marginTop: 'var(--space-sm)' }}>
              + Əlavə et
            </button>
          </AccordionSection>
        </div>

        {/* Action Buttons */}
        <div className="admin-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleUndo}
              disabled={history.length === 0 || saving}
              title="Geri al (Ctrl+Z)"
            >
              ↩️ Geri al (Ctrl+Z)
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={handleRedo}
              disabled={future.length === 0 || saving}
              title="İrəli al (Ctrl+Y)"
            >
              ↪️ İrəli al (Ctrl+Y)
            </button>
          </div>

          <button className="btn btn--accent" onClick={handleSave} disabled={saving} style={{ minWidth: '160px' }}>
            {saving ? '⚡ Saxlanılır...' : '💾 Yadda Saxla'}
          </button>
        </div>
      </main>
    </>
  );
}
