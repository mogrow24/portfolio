'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  User,
  Briefcase,
  Settings,
  ChevronRight,
  Home,
  LogOut,
  Target,
  RefreshCw,
  MessageCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMessages, resetAllData } from '@/lib/siteData';

// 탭 컴포넌트들
import ProfileTab from '@/components/admin/ProfileTab';
import CompetenciesTab from '@/components/admin/CompetenciesTab';
import ExperienceTab from '@/components/admin/ExperienceTab';
import ProjectsTab from '@/components/admin/ProjectsTab';
import MessagesTab from '@/components/admin/MessagesTab';
import InterviewsTab from '@/components/admin/InterviewsTab';

type TabId = 'projects' | 'messages' | 'profile' | 'competencies' | 'experience' | 'interviews' | 'settings';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('projects');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 인증 확인
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('admin_auth_token');
      const authTime = localStorage.getItem('admin_auth_time');
      
      if (!token || !authTime) {
        router.push('/');
        return;
      }
      
      const elapsed = Date.now() - parseInt(authTime);
      // 24시간 초과 시 만료
      if (elapsed >= 24 * 60 * 60 * 1000) {
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_auth_time');
        router.push('/');
        return;
      }
      
      // 서버에서 토큰 유효성 검증
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token }),
        });
        
        const data = await response.json();
        
        if (data.success && data.valid) {
          setIsAuthenticated(true);
          setIsLoading(false);
          return;
        }
      } catch {
        // 검증 실패
      }
      
      // 인증 실패 시 메인으로
      localStorage.removeItem('admin_auth_token');
      localStorage.removeItem('admin_auth_time');
      router.push('/');
    };

    verifyAuth();
  }, [router]);

  // 읽지 않은 메시지 수 로드
  useEffect(() => {
    if (!isAuthenticated) return;
    const messages = getMessages();
    setUnreadCount(messages.filter((m) => !m.isRead).length);
  }, [isAuthenticated]);

  // 로딩 중이거나 인증 안됐으면 로딩 화면
  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--bg-primary]">
        <div className="w-8 h-8 border-2 border-[--accent-color]/30 border-t-[--accent-color] rounded-full animate-spin" />
      </div>
    );
  }

  // 탭 정의
  const tabs = [
    { id: 'projects' as TabId, label: '프로젝트', icon: FolderOpen, badge: 0 },
    { id: 'messages' as TabId, label: '메시지', icon: MessageSquare, badge: unreadCount },
    { id: 'profile' as TabId, label: '프로필', icon: User, badge: 0 },
    { id: 'competencies' as TabId, label: '역량', icon: Target, badge: 0 },
    { id: 'experience' as TabId, label: '경력', icon: Briefcase, badge: 0 },
    { id: 'interviews' as TabId, label: '인터뷰', icon: MessageCircle, badge: 0 },
    { id: 'settings' as TabId, label: '설정', icon: Settings, badge: 0 },
  ];

  // 로그아웃
  const handleLogout = async () => {
    const token = localStorage.getItem('admin_auth_token');
    if (token) {
      try {
        await fetch('/api/auth', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
      } catch {
        // 무시
      }
    }
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_time');
    router.push('/');
  };

  // 데이터 초기화
  const handleResetData = () => {
    if (!confirm('모든 데이터를 기본값으로 초기화하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) return;
    resetAllData();
    window.location.reload();
  };

  // 현재 탭 렌더링
  const renderTab = () => {
    switch (activeTab) {
      case 'projects':
        return <ProjectsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'profile':
        return <ProfileTab />;
      case 'competencies':
        return <CompetenciesTab />;
      case 'experience':
        return <ExperienceTab />;
      case 'interviews':
        return <InterviewsTab />;
      case 'settings':
        return <SettingsTab onReset={handleResetData} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[--bg-primary]">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[--bg-secondary] border-r border-[--border-color] p-4 hidden lg:block">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-xl bg-[--accent-color] flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-black" />
          </div>
          <div>
            <h1 className="font-bold text-white">Admin</h1>
            <p className="text-xs text-[--text-secondary]">포트폴리오 관리</p>
          </div>
        </div>

        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[--accent-color]/10 text-[--accent-color] border border-[--accent-color]/30'
                  : 'text-[--text-secondary] hover:text-white hover:bg-[--bg-tertiary]'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.badge && tab.badge > 0 ? (
                <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-bold">
                  {tab.badge}
                </span>
              ) : (
                activeTab === tab.id && <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <a
            href="/"
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[--text-secondary] hover:text-[--accent-color] hover:bg-[--accent-color]/10 transition-all"
          >
            <Home className="w-5 h-5" />
            사이트로 이동
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[--text-secondary] hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            로그아웃
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="lg:hidden bg-[--bg-secondary] border-b border-[--border-color] px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-2">
            <a href="/" className="p-2 rounded-lg text-[--text-secondary] hover:text-[--accent-color]">
              <Home className="w-5 h-5" />
            </a>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-[--text-secondary] hover:text-red-400"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all relative ${
                activeTab === tab.id
                  ? 'bg-[--accent-color]/20 text-[--accent-color]'
                  : 'text-[--text-secondary]'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-64 p-4 lg:p-8">
        {renderTab()}
      </main>
    </div>
  );
}

// 설정 탭
function SettingsTab({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">사이트 설정</h2>
      
      <div className="glass-card rounded-xl p-6 max-w-2xl space-y-6">
        <div>
          <h3 className="font-semibold text-white mb-2">관리자 인증</h3>
          <p className="text-sm text-[--text-secondary] mb-2">
            비밀 코드는 서버에서 안전하게 관리됩니다.
          </p>
          <p className="text-xs text-[--text-secondary]">
            비밀 코드를 변경하려면 <code className="bg-[--bg-tertiary] px-1 rounded">.env.local</code> 파일에서{' '}
            <code className="bg-[--bg-tertiary] px-1 rounded">ADMIN_SECRET_CODE</code> 값을 수정하세요.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-white mb-2">데이터 저장</h3>
          <p className="text-sm text-[--text-secondary]">
            현재 데이터는 브라우저 로컬 스토리지에 저장됩니다.
            <br />
            영구 저장을 위해서는 Supabase 연동이 필요합니다.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-white mb-2">데이터 초기화</h3>
          <p className="text-sm text-[--text-secondary] mb-3">
            모든 데이터를 기본값으로 초기화합니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            기본값으로 초기화
          </motion.button>
        </div>
      </div>
    </div>
  );
}
