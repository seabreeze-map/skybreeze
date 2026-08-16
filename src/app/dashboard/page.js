'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase-browser';
import { exportDashboardToPDF } from '@/lib/pdf-export';
import Header from '@/components/Header';
import StatCard from '@/components/StatCard';
import RefreshIndicator from '@/components/RefreshIndicator';
import PackageChart from '@/components/PackageChart';
import TrendChart from '@/components/TrendChart';
import PersonnelPieChart from '@/components/PersonnelPieChart';
import EquipmentChart from '@/components/EquipmentChart';
import RiskTable from '@/components/RiskTable';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState('weekly'); // Default olaraq həftəlik
  const [isExporting, setIsExporting] = useState(false);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/data/summary', {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const supabase = createSupabaseBrowserClient();

    // Check auth status
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/');
      } else {
        setUser(user);
      }
    });

    // Realtime Supabase Subscription for instant updates
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Refresh when user focuses the tab
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      supabase.removeChannel(channel);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchData, router]);

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const handleExportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const datePart = (data?.general?.reportDate || new Date().toISOString().slice(0, 10)).replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Sky_Breeze_${period === 'weekly' ? 'Heftelik' : 'Ayliq'}_Hesabat_${datePart}.pdf`;
      await exportDashboardToPDF('dashboard-export-content', filename);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('PDF hazırlanarkən xəta baş verdi: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner" />
          <span className="loading-text">Məlumatlar yüklənir...</span>
        </div>
      </>
    );
  }

  const general = data?.general || {};
  const personnel = data?.personnel || {};
  const personnelByPosition = data?.personnelByPosition || [];
  const equipmentData = data?.equipment || [];
  const risks = data?.risks || [];

  // Distinct data for active period (weekly vs monthly)
  const activePayload = period === 'monthly' ? (data?.monthly || {}) : (data?.weekly || {});
  const activePackages = activePayload.packages || data?.packages || [];
  const activeTrend = activePayload.trend || [];
  const activePersonnelHistory = activePayload.personnelHistory || [];
  const activeEquipmentHistory = activePayload.equipmentHistory || [];

  return (
    <>
      <Header
        user={user}
        onSignOut={handleSignOut}
        period={period}
        onPeriodChange={setPeriod}
        onExportPDF={handleExportPDF}
        isExporting={isExporting}
      />
      <main id="dashboard-export-content" className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-header__title">
            🏗️ {general.projectName || 'Sky Breeze'} — {period === 'weekly' ? 'Həftəlik' : 'Aylıq'} Tikinti Hesabatı
          </h1>
          <p className="page-header__desc">
            {general.location || ''} | {general.contractor || ''} | Müqavilə: {general.contractStart || ''} – {general.contractEnd || ''}
          </p>
        </div>

        {/* Empty Data Banner */}
        {data?.isEmpty && (
          <div className="mock-banner">
            ⚠️ Bazada məlumat tapılmadı. Supabase SQL Editor-da migration skriptini işə salın.
          </div>
        )}

        {/* Refresh Indicator */}
        <RefreshIndicator
          lastUpdated={data?.lastUpdated}
          onRefresh={fetchData}
          autoInterval={10}
        />

        {/* Hero Stats (Dynamically adapts to Period) */}
        <div className="stats-grid">
          <StatCard
            title={period === 'weekly' ? 'Həftəlik Artım' : 'Ümumi İcra'}
            value={activePayload.progressValue || `${data?.overallFact || 0}%`}
            subtitle={activePayload.progressSubtitle || `Plan: ${data?.overallPlan || 0}%`}
            type={(activePayload.overallFact || 0) >= (activePayload.overallPlan || 0) ? 'success' : 'warning'}
            icon="📊"
          />
          <StatCard
            title="Qalan Gün"
            value={general.remainingDays || '—'}
            subtitle={`Bitmə: ${general.contractEnd || ''}`}
            type="default"
            icon="📅"
          />
          <StatCard
            title="Qalan İş"
            value={`${data?.remainingWork || 0}%`}
            subtitle="Tamamlanmalı"
            type="accent"
            icon="🛠️"
          />
          <StatCard
            title={period === 'weekly' ? 'Bu Həftə Personal' : 'Cəmi Personal'}
            value={personnel.total || 0}
            subtitle={`İdari: ${personnel.administrative || 0} | Texniki: ${personnel.technical || 0} | Sahə: ${personnel.field || 0}`}
            type="default"
            icon="👷"
          />
          <StatCard
            title={period === 'weekly' ? 'Bu Həftə Texnika' : 'Cəmi Texnika'}
            value={data?.totalEquipment || 0}
            subtitle="vahid"
            type="accent"
            icon="🚜"
          />
        </div>

        {/* Charts Row 1: Packages & Trend */}
        <div className="dashboard-section">
          <div className="charts-grid">
            <PackageChart data={activePackages} period={period} />
            <TrendChart
              monthlyData={data?.monthly?.trend || []}
              weeklyData={data?.weekly?.trend || []}
              initialPeriod={period}
            />
          </div>
        </div>

        {/* Charts Row 2: Personnel & Equipment */}
        <div className="dashboard-section">
          <div className="charts-grid">
            <PersonnelPieChart
              personnel={personnel}
              byPosition={personnelByPosition}
              history={activePersonnelHistory}
            />
            <EquipmentChart
              data={equipmentData}
              history={activeEquipmentHistory}
            />
          </div>
        </div>

        {/* Risk Table */}
        <div className="dashboard-section">
          <RiskTable risks={risks} />
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: 'var(--space-xl) 0',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-xs)',
          borderTop: '1px solid var(--color-border)',
          marginTop: 'var(--space-xl)'
        }}>
          Sky Breeze Tikinti İzləmə Sistemi © {new Date().getFullYear()} | {period === 'weekly' ? 'Həftəlik' : 'Aylıq'} Hesabat | Hesabat tarixi: {general.reportDate || '—'}
        </footer>
      </main>
    </>
  );
}
