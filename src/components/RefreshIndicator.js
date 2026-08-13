'use client';
import { useState, useEffect } from 'react';

export default function RefreshIndicator({ lastUpdated, onRefresh, autoInterval = 30 }) {
  const [countdown, setCountdown] = useState(autoInterval);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRefresh?.();
          return autoInterval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [autoInterval, onRefresh]);

  const handleManualRefresh = async () => {
    setLoading(true);
    await onRefresh?.();
    setLoading(false);
    setCountdown(autoInterval);
  };

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    const d = new Date(isoString);
    return d.toLocaleString('az-AZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="refresh-indicator">
      <span className="refresh-indicator__time">
        Son yenilənmə: {formatDate(lastUpdated)}
      </span>
      <div className="refresh-indicator__actions">
        <span className="refresh-indicator__countdown">
          {countdown}s
        </span>
        <button
          className={`refresh-indicator__btn ${loading ? 'loading' : ''}`}
          onClick={handleManualRefresh}
          disabled={loading}
          title="Yenilə"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13.65 2.35A8 8 0 1 0 16 8h-2a6 6 0 1 1-1.76-4.24L10 6h6V0l-2.35 2.35z" fill="currentColor"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
