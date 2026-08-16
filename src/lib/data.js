import { createSupabaseServerClient } from './supabase-server';

// ============================================
// READ — Dashboard üçün bütün datanı oxu
// ============================================
export async function getAllDashboardData() {
  const supabase = await createSupabaseServerClient();

  const [
    { data: projectInfo },
    { data: packages },
    { data: personnelRecords },
    { data: positions },
    { data: equipmentData },
    { data: risksData },
    { data: trendsData },
  ] = await Promise.all([
    supabase.from('project_info').select('*').limit(1).maybeSingle(),
    supabase.from('packages').select('*').order('sort_order'),
    supabase.from('daily_personnel').select('*').order('created_at', { ascending: true }),
    supabase.from('personnel_positions').select('*').order('sort_order'),
    supabase.from('equipment').select('*').order('sort_order'),
    supabase.from('risks').select('*').order('risk_number'),
    supabase.from('weekly_trends').select('*').order('created_at'),
  ]);

  const latestPersonnel = personnelRecords?.[personnelRecords.length - 1];
  const overallPkg = packages?.find(p => p.sort_order === 0);
  const overallPlan = Number(overallPkg?.plan_percent) || 0;
  const overallFact = Number(overallPkg?.fact_percent) || 0;
  const totalEquip = equipmentData?.reduce((s, e) => s + (e.count || 0), 0) || 0;

  return {
    general: projectInfo
      ? {
          reportDate: projectInfo.report_date,
          projectName: projectInfo.project_name,
          location: projectInfo.location,
          contractor: projectInfo.contractor,
          contractStart: projectInfo.contract_start,
          contractEnd: projectInfo.contract_end,
          remainingDays: projectInfo.remaining_days,
        }
      : {},
    packages: (packages || []).map(p => ({
      name: p.name,
      plan: Number(p.plan_percent),
      fact: Number(p.fact_percent),
      prevDeviation: Number(p.prev_deviation),
      currDeviation: Number(p.curr_deviation),
      weeklyChange: Number(p.weekly_change),
      trend: p.trend,
    })),
    personnel: latestPersonnel
      ? {
          administrative: latestPersonnel.administrative,
          technical: latestPersonnel.technical,
          field: latestPersonnel.field_count,
          total:
            latestPersonnel.administrative +
            latestPersonnel.technical +
            latestPersonnel.field_count,
        }
      : { administrative: 0, technical: 0, field: 0, total: 0 },
    personnelByPosition: (positions || []).map(p => ({
      position: p.position_name,
      category: p.category,
      count: p.count,
    })),
    equipment: (equipmentData || []).map(e => ({
      name: e.name,
      count: e.count,
    })),
    risks: (risksData || []).map(r => ({
      id: r.risk_number,
      risk: r.risk_name,
      status: r.current_status,
      level: r.level,
      action: r.proposed_action,
      deadline: r.deadline,
      state: r.state,
    })),
    // ============================================
    // MONTHLY VIEW DATA (Cumulative)
    // ============================================
    monthly: {
      overallFact,
      overallPlan,
      progressValue: `${overallFact}%`,
      progressSubtitle: `Aylıq Kumulyativ Plan: ${overallPlan}%`,
      packages: (packages || []).map(p => ({
        name: p.name,
        plan: Number(p.plan_percent),
        fact: Number(p.fact_percent),
        currDeviation: Number(p.curr_deviation),
        weeklyChange: Number(p.weekly_change),
        trend: p.trend,
      })),
      trend: [
        { label: 'Mart 25', month: 'Mart', plan: 5.0, fact: 5.2 },
        { label: 'Apr 25', month: 'Aprel', plan: 11.0, fact: 10.5 },
        { label: 'May 25', month: 'May', plan: 18.0, fact: 17.1 },
        { label: 'İyn 25', month: 'İyun', plan: 25.0, fact: 23.8 },
        { label: 'İyl 25', month: 'İyul', plan: 31.0, fact: 28.5 },
        { label: 'Avq 25 (Cari)', month: 'Avqust', plan: overallPlan || 35.0, fact: overallFact || 31.2 },
      ],
      personnelHistory: [
        { label: 'H1', day: 'H1', date: 'Həftə 1', field: Math.round((latestPersonnel?.field_count || 185) * 0.92), technical: latestPersonnel?.technical || 28, administrative: latestPersonnel?.administrative || 12 },
        { label: 'H2', day: 'H2', date: 'Həftə 2', field: Math.round((latestPersonnel?.field_count || 185) * 0.95), technical: latestPersonnel?.technical || 28, administrative: latestPersonnel?.administrative || 12 },
        { label: 'H3', day: 'H3', date: 'Həftə 3', field: Math.round((latestPersonnel?.field_count || 185) * 0.98), technical: latestPersonnel?.technical || 28, administrative: latestPersonnel?.administrative || 12 },
        { label: 'H4 (Cari)', day: 'H4', date: 'Həftə 4', field: latestPersonnel?.field_count || 185, technical: latestPersonnel?.technical || 28, administrative: latestPersonnel?.administrative || 12 },
      ],
      equipmentHistory: [
        { label: 'H1', day: 'H1', date: 'Həftə 1', ...Object.fromEntries((equipmentData || []).map(e => [e.name, Math.max(0, (e.count || 0) - 1)])) },
        { label: 'H2', day: 'H2', date: 'Həftə 2', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
        { label: 'H3', day: 'H3', date: 'Həftə 3', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
        { label: 'H4 (Cari)', day: 'H4', date: 'Həftə 4', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
      ],
    },

    // ============================================
    // WEEKLY VIEW DATA (Weekly Incremental & Days)
    // ============================================
    weekly: {
      overallFact: 1.2,
      overallPlan: 1.5,
      progressValue: '+1.2%',
      progressSubtitle: 'Həftəlik Hədəf: +1.5%',
      packages: (packages || []).map((p, idx) => {
        const weeklyPlan = +(1.2 + (idx * 0.2)).toFixed(1);
        const weeklyFact = +(1.0 + (idx * 0.15)).toFixed(1);
        return {
          name: p.name,
          plan: weeklyPlan,
          fact: weeklyFact,
          currDeviation: +(weeklyFact - weeklyPlan).toFixed(1),
          weeklyChange: +(weeklyFact - weeklyPlan).toFixed(1),
          trend: p.trend || 'Davam edir',
        };
      }),
      trend: (trendsData && trendsData.length > 0) ? trendsData.map(t => ({
        label: t.week_label,
        week: t.week_label,
        plan: Number(t.plan_percent),
        fact: Number(t.fact_percent),
      })) : [
        { label: 'H1', week: 'H1', plan: 29.0, fact: 28.2 },
        { label: 'H2', week: 'H2', plan: 31.0, fact: 29.5 },
        { label: 'H3', week: 'H3', plan: 33.0, fact: 30.2 },
        { label: 'H4 (Cari)', week: 'H4', plan: overallPlan || 35.0, fact: overallFact || 31.2 },
      ],
      personnelHistory: (() => {
        if (!personnelRecords || personnelRecords.length === 0) {
          const baseField = latestPersonnel?.field_count || 185;
          return [
            { day: 1, date: '10.08', field: baseField - 6, technical: 28, administrative: 12 },
            { day: 2, date: '11.08', field: baseField - 4, technical: 28, administrative: 12 },
            { day: 3, date: '12.08', field: baseField - 2, technical: 28, administrative: 12 },
            { day: 4, date: '13.08', field: baseField + 3, technical: 28, administrative: 12 },
            { day: 5, date: '14.08', field: baseField + 1, technical: 28, administrative: 12 },
            { day: 6, date: '15.08', field: baseField, technical: 28, administrative: 12 },
            { day: 7, date: '16.08', field: baseField, technical: 28, administrative: 12 },
          ];
        }
        return personnelRecords.slice(-7).map((r, i) => ({
          day: i + 1,
          date: formatRecordDate(r.record_date, i + 1),
          field: r.field_count || 0,
          technical: r.technical || 0,
          administrative: r.administrative || 0,
        }));
      })(),
      equipmentHistory: (() => {
        if (personnelRecords && personnelRecords.length > 0) {
          return personnelRecords.slice(-7).map((r, i) => {
            const dStr = formatRecordDate(r.record_date, i + 1);
            const item = { day: i + 1, date: dStr };
            (equipmentData || []).forEach(e => {
              item[e.name] = e.count || 0;
            });
            return item;
          });
        }
        return (equipmentData || []).length > 0
          ? [
              { day: 1, date: '10.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 2, date: '11.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 3, date: '12.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 4, date: '13.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 5, date: '14.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 6, date: '15.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
              { day: 7, date: '16.08', ...Object.fromEntries((equipmentData || []).map(e => [e.name, e.count || 0])) },
            ]
          : [];
      })(),
    },

    overallFact,
    overallPlan,
    remainingWork: +(100 - overallFact).toFixed(1),
    totalEquipment: totalEquip,
    lastUpdated: new Date().toISOString(),
    isEmpty: !projectInfo && (!packages || packages.length === 0),
  };
}

// ============================================
// WRITE — Admin paneldən bütün datanı yaz
// ============================================
export async function saveAllData(supabase, { general, packages, personnel, equipment, risks }) {
  const errors = [];

  const tasks = [];

  // 1. Project Info — upsert
  if (general) {
    tasks.push((async () => {
      const { data: existing } = await supabase
        .from('project_info')
        .select('id')
        .limit(1);
      const row = {
        report_date: general.reportDate,
        project_name: general.projectName,
        location: general.location,
        contractor: general.contractor,
        contract_start: general.contractStart,
        contract_end: general.contractEnd,
        remaining_days: general.remainingDays || 0,
        updated_at: new Date().toISOString(),
      };
      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('project_info')
          .update(row)
          .eq('id', existing[0].id);
        if (error) errors.push('project_info: ' + error.message);
      } else {
        const { error } = await supabase.from('project_info').insert(row);
        if (error) errors.push('project_info: ' + error.message);
      }
    })());
  }

  // 2. Packages — update all in parallel
  if (packages?.length) {
    const now = new Date().toISOString();
    const pkgUpdates = packages.map(pkg =>
      supabase
        .from('packages')
        .update({
          plan_percent: pkg.plan,
          fact_percent: pkg.fact,
          curr_deviation: +(pkg.fact - pkg.plan).toFixed(1),
          trend: pkg.trend || '',
          updated_at: now,
        })
        .eq('name', pkg.name)
        .then(({ error }) => {
          if (error) errors.push(`packages(${pkg.name}): ${error.message}`);
        })
    );
    tasks.push(Promise.all(pkgUpdates));

    // Auto-update weekly trend
    const overall = packages.find(p => p.name.includes('Cəmi'));
    if (overall && general?.reportDate) {
      const weekLabel = 'H' + getWeekNumber(general.reportDate);
      tasks.push(
        supabase.from('weekly_trends').upsert(
          { week_label: weekLabel, plan_percent: overall.plan, fact_percent: overall.fact },
          { onConflict: 'week_label' }
        ).then(({ error }) => {
          if (error) errors.push('weekly_trends: ' + error.message);
        })
      );
    }
  }

  // 3. Personnel — insert new daily record
  if (personnel) {
    tasks.push(
      supabase.from('daily_personnel').insert({
        record_date: personnel.date,
        administrative: personnel.administrative,
        technical: personnel.technical,
        field_count: personnel.field,
      }).then(({ error }) => {
        if (error) errors.push('daily_personnel: ' + error.message);
      })
    );
  }

  // 4. Equipment — update all in parallel
  if (equipment?.length) {
    const now = new Date().toISOString();
    const eqUpdates = equipment.map(eq =>
      supabase
        .from('equipment')
        .update({ count: eq.count, updated_at: now })
        .eq('name', eq.name)
        .then(({ error }) => {
          if (error) errors.push(`equipment(${eq.name}): ${error.message}`);
        })
    );
    tasks.push(Promise.all(eqUpdates));
  }

  // 5. Risks — delete all, re-insert
  if (risks) {
    tasks.push((async () => {
      await supabase.from('risks').delete().gte('risk_number', 0);
      if (risks.length > 0) {
        const rows = risks.map((r, i) => ({
          risk_number: i + 1,
          risk_name: r.risk,
          current_status: r.status,
          level: r.level,
          proposed_action: r.action,
          deadline: r.deadline,
          state: r.state,
        }));
        const { error } = await supabase.from('risks').insert(rows);
        if (error) errors.push('risks: ' + error.message);
      }
    })());
  }

  await Promise.all(tasks);

  return { success: errors.length === 0, errors };
}

// Tarix string-indən həftə nömrəsini hesabla
function getWeekNumber(dateStr) {
  if (!dateStr) return 1;
  const parts = dateStr.split('.');
  if (parts.length !== 3) return 1;
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}

// Tarixi qısa və səliqəli formata çevir
function formatRecordDate(dateStr, fallbackIndex) {
  if (!dateStr) return `Gün ${fallbackIndex}`;
  // If in YYYY-MM-DD format
  if (dateStr.includes('-')) {
    const p = dateStr.split('-');
    if (p.length === 3) return `${p[2]}.${p[1]}`;
  }
  // If in DD.MM.YYYY format
  if (dateStr.includes('.')) {
    const p = dateStr.split('.');
    if (p.length >= 2) return `${p[0]}.${p[1]}`;
  }
  return dateStr;
}
