'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    series: 0, 
    activeSeries: 0, 
    totalSlots: 0, 
    purchased: 0, 
    reserved: 0, 
    available: 0 
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('isAuthenticated');
      if (!isAuth) {
        router.push('/login');
        return;
      }
    }

    const fetchStats = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        const [seriesRes, slotsRes, purchasesRes] = await Promise.all([
          fetch(API_URL + '/admin/series'),
          fetch(API_URL + '/admin/slots'),
          fetch(API_URL + '/admin/purchases')
        ]);

        const series = await seriesRes.json();
        const slots = await slotsRes.json();
        const purchases = await purchasesRes.json();

        setStats({
          series: series.length,
          activeSeries: series.filter(s => s.status === 'active').length,
          totalSlots: slots.length,
          purchased: slots.filter(s => s.status === 'purchased').length,
          reserved: slots.filter(s => s.status === 'reserved').length,
          available: slots.filter(s => s.status === 'unallocated').length
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    router.push('/login');
  };

  const menuItems = [
    { title: 'シリーズ管理', href: '/series', emoji: '📋', color: '#3b82f6' },
    { title: '当選設定管理', href: '/win-settings', emoji: '🎁', color: '#10b981' },
    { title: 'スロット管理', href: '/slots', emoji: '🎰', color: '#06b6d4' },
    { title: '購入履歴', href: '/purchases', emoji: '💰', color: '#f59e0b' },
    { title: '監査ログ', href: '/audit-logs', emoji: '📝', color: '#6b7280' }
  ];

  const statCards = [
    { label: 'シリーズ', value: stats.series, subtext: 'アクティブ: ' + stats.activeSeries, color: '#3b82f6' },
    { label: '総スロット数', value: stats.totalSlots, subtext: '購入済: ' + stats.purchased, color: '#8b5cf6' },
    { label: '予約中', value: stats.reserved, subtext: '利用可能: ' + stats.available, color: '#10b981' },
    { label: '購入数', value: stats.purchased, subtext: '完了: ' + stats.purchased, color: '#f59e0b' }
  ];

  return (
    <div style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '32px',
          marginBottom: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              color: '#1a202c',
              marginBottom: '8px'
            }}>管理ダッシュボード</h1>
            <p style={{ color: '#718096' }}>くじシステム管理画面</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: '#ef4444',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ログアウト
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'white' }}>読み込み中...</div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {statCards.map((stat, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '14px', color: '#718096', marginBottom: '8px' }}>{stat.label}</div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: stat.color, marginBottom: '8px' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '12px', color: '#a0aec0' }}>{stat.subtext}</div>
              </div>
            ))}
          </div>
        )}

        <h2 style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '700',
          marginBottom: '16px'
        }}>管理メニュー</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {menuItems.map((item, i) => (
            <Link key={i} href={item.href} style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              textDecoration: 'none',
              display: 'block'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{item.emoji}</div>
              <div style={{
                fontSize: '20px',
                fontWeight: '600',
                color: item.color,
                marginBottom: '8px'
              }}>{item.title}</div>
              <div style={{ fontSize: '14px', color: '#718096' }}>
                {item.title}の確認・編集
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
