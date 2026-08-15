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
    weeklyTrend: (trendsData || []).map(t => ({
      week: t.week_label,
      plan: Number(t.plan_percent),
      fact: Number(t.fact_percent),
    })),
    overallFact,
    overallPlan,
    remainingWork: +(100 - overallFact).toFixed(1),
    totalEquipment: totalEquip,
    personnelHistory: (personnelRecords || []).map((r, i) => {
      const dStr = r.record_date || '';
      const parts = dStr.split('.');
      const shortDate = parts.length >= 2 ? `${parts[0]}.${parts[1]}` : (dStr || `${i + 1}`);
      return {
        day: i + 1,
        date: dStr || `Gün ${i + 1}`,
        displayDate: shortDate,
        field: r.field_count || 0,
        technical: r.technical || 0,
        administrative: r.administrative || 0,
      };
    }),
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
  const parts = dateStr.split('.');
  if (parts.length !== 3) return 1;
  const d = new Date(parts[2], parts[1] - 1, parts[0]);
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
}
