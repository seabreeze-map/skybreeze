'use client';
import { useState, useEffect, useCallback } from 'react';
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
    fetch('/api/data/summary')
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

  const updatePackage = (index, field, value) => {
    setPackages(prev => prev.map((pkg, i) =>
      i === index ? { ...pkg, [field]: field === 'trend' ? value : Number(value) || 0 } : pkg
    ));
  };

  const addRisk = () => {
    if (!newRisk.risk.trim()) return;
    setRisks(prev => [...prev, { ...newRisk, id: prev.length + 1 }]);
    setNewRisk({ risk: '', status: '', level: 'Orta', action: '', deadline: '', state: 'Açıq' });
  };

  const removeRisk = (index) => {
    setRisks(prev => prev.filter((_, i) => i !== index).map((r, i) => ({ ...r, id: i + 1 })));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const equipmentList = EQUIPMENT_TYPES.map(type => ({
        name: type,
        count: equipment[type] || 0,
      }));

      const response = await fetch('/api/data/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          general,
          packages: packages.map(p => ({
            name: p.name, plan: p.plan, fact: p.fact, trend: p.trend,
          })),
          personnel: {
            date: personnel.date,
            administrative: personnel.administrative,
            technical: personnel.technical,
            field: personnel.field,
          },
          equipment: equipmentList,
          risks,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: 'Məlumatlar uğurla yadda saxlanıldı!' });
      } else {
        setMessage({ type: 'error', text: 'Xəta: ' + (result.errors?.join(', ') || 'Bilinməyən xəta') });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Xəta: ' + err.message });
    }

    setSaving(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
        <div className="page-header">
          <h1 className="page-header__title">Admin Panel</h1>
          <p className="page-header__desc">Məlumatları daxil edin və bazaya göndərin</p>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'form-success' : 'form-error'}>
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
                  onChange={e => setGeneral({...general, reportDate: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">Layihə Adı</label>
                <input className="form-input" type="text" value={general.projectName}
                  onChange={e => setGeneral({...general, projectName: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Yer</label>
                <input className="form-input" type="text" value={general.location}
                  onChange={e => setGeneral({...general, location: e.target.value})} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Podratçı</label>
                <input className="form-input" type="text" value={general.contractor}
                  onChange={e => setGeneral({...general, contractor: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Müqavilə Başlanğıc</label>
                <input className="form-input" type="text" value={general.contractStart}
                  onChange={e => setGeneral({...general, contractStart: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">Müqavilə Bitmə</label>
                <input className="form-input" type="text" value={general.contractEnd}
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
                  <input className="form-input" type="number" step="0.1" value={pkg.plan}
                    onChange={e => updatePackage(i, 'plan', e.target.value)} />
                  <input className="form-input" type="number" step="0.1" value={pkg.fact}
                    onChange={e => updatePackage(i, 'fact', e.target.value)} />
                  <input className="form-input" type="text" value={pkg.trend}
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
                  onChange={e => setPersonnel({...personnel, date: e.target.value})} placeholder="gg.aa.iiii" />
              </div>
              <div className="form-group">
                <label className="form-label">İdari</label>
                <input className="form-input" type="number" value={personnel.administrative}
                  onChange={e => setPersonnel({...personnel, administrative: Number(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label className="form-label">Texniki</label>
                <input className="form-input" type="number" value={personnel.technical}
                  onChange={e => setPersonnel({...personnel, technical: Number(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label className="form-label">Sahə</label>
                <input className="form-input" type="number" value={personnel.field}
                  onChange={e => setPersonnel({...personnel, field: Number(e.target.value) || 0})} />
              </div>
              <div className="form-group">
                <label className="form-label">Cəmi</label>
                <input className="form-input" type="text" readOnly
                  value={personnel.administrative + personnel.technical + personnel.field}
                  style={{ background: 'var(--color-bg)', fontWeight: 600 }} />
              </div>
            </div>

            <h4 style={{ margin: 'var(--space-lg) 0 var(--space-md)', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Texnika</h4>
            <div className="equipment-grid">
              {EQUIPMENT_TYPES.map(type => (
                <div key={type} className="equipment-item">
                  <label className="form-label">{type}</label>
                  <input className="form-input" type="number" min="0" value={equipment[type] || 0}
                    onChange={e => setEquipment({...equipment, [type]: Number(e.target.value) || 0})} />
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

        {/* Save Button */}
        <div className="admin-actions">
          <button className="btn btn--accent" onClick={handleSave} disabled={saving}>
            {saving ? 'Yazılır...' : '💾 Yadda Saxla'}
          </button>
        </div>
      </main>
    </>
  );
}
