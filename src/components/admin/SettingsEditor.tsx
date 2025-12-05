'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Settings, 
  Globe, 
  Type, 
  Mail, 
  RefreshCw,
  Download,
  Upload,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { LocalSiteSettings } from '@/types/admin';
import { initialSiteSettings, initialProjects, initialProfile, initialExperiences } from '@/data/initialData';

export default function SettingsEditor() {
  const [settings, setSettings] = useState<LocalSiteSettings>(initialSiteSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 로컬 스토리지에서 설정 로드
  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleChange = (field: keyof LocalSiteSettings, value: string) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      setSaveMessage('설정이 저장되었습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('저장 중 오류가 발생했습니다.');
    }
    setIsSaving(false);
  };

  // 데이터 내보내기
  const handleExportData = () => {
    const data = {
      projects: JSON.parse(localStorage.getItem('admin_projects') || '[]'),
      profile: JSON.parse(localStorage.getItem('admin_profile') || '{}'),
      experiences: JSON.parse(localStorage.getItem('admin_experiences') || '[]'),
      settings: JSON.parse(localStorage.getItem('admin_settings') || '{}'),
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSaveMessage('데이터가 내보내기 되었습니다.');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // 데이터 가져오기
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        if (data.projects) localStorage.setItem('admin_projects', JSON.stringify(data.projects));
        if (data.profile) localStorage.setItem('admin_profile', JSON.stringify(data.profile));
        if (data.experiences) localStorage.setItem('admin_experiences', JSON.stringify(data.experiences));
        if (data.settings) {
          localStorage.setItem('admin_settings', JSON.stringify(data.settings));
          setSettings(data.settings);
        }
        
        setSaveMessage('데이터가 성공적으로 가져와졌습니다. 페이지를 새로고침하세요.');
        setTimeout(() => setSaveMessage(''), 5000);
      } catch {
        setSaveMessage('올바른 JSON 파일이 아닙니다.');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // 리셋
  };

  // 데이터 초기화
  const handleResetData = () => {
    localStorage.setItem('admin_projects', JSON.stringify(initialProjects));
    localStorage.setItem('admin_profile', JSON.stringify(initialProfile));
    localStorage.setItem('admin_experiences', JSON.stringify(initialExperiences));
    localStorage.setItem('admin_settings', JSON.stringify(initialSiteSettings));
    setSettings(initialSiteSettings);
    setShowResetConfirm(false);
    setSaveMessage('모든 데이터가 초기화되었습니다. 페이지를 새로고침하세요.');
    setTimeout(() => setSaveMessage(''), 5000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">사이트 설정</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={isSaving}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '저장 중...' : '저장'}
        </motion.button>
      </div>

      {saveMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-lg ${
            saveMessage.includes('오류') || saveMessage.includes('아닙니다')
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 히어로 섹션 설정 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Type className="w-5 h-5 text-[--accent-color]" />
            히어로 섹션
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">메인 타이틀 (한글)</label>
              <input
                type="text"
                value={settings.hero_title_ko}
                onChange={(e) => handleChange('hero_title_ko', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Main Title (English)</label>
              <input
                type="text"
                value={settings.hero_title_en}
                onChange={(e) => handleChange('hero_title_en', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">서브 타이틀 (한글)</label>
              <textarea
                value={settings.hero_subtitle_ko}
                onChange={(e) => handleChange('hero_subtitle_ko', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Subtitle (English)</label>
              <textarea
                value={settings.hero_subtitle_en}
                onChange={(e) => handleChange('hero_subtitle_en', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
          </div>
        </div>

        {/* About 섹션 설정 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[--accent-color]" />
            About 섹션
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">소개 설명 (한글)</label>
              <textarea
                value={settings.about_description_ko}
                onChange={(e) => handleChange('about_description_ko', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Description (English)</label>
              <textarea
                value={settings.about_description_en}
                onChange={(e) => handleChange('about_description_en', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
          </div>
        </div>

        {/* 연락처 설정 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[--accent-color]" />
            연락처 & 소셜
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">연락처 이메일</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">LinkedIn URL</label>
              <input
                type="url"
                value={settings.social_linkedin}
                onChange={(e) => handleChange('social_linkedin', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">GitHub URL</label>
              <input
                type="url"
                value={settings.social_github}
                onChange={(e) => handleChange('social_github', e.target.value)}
                placeholder="https://github.com/..."
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>
        </div>

        {/* 데이터 관리 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[--accent-color]" />
            데이터 관리
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[--text-secondary] mb-3">
                포트폴리오 데이터를 백업하거나 복원할 수 있습니다.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportData}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white hover:bg-[--accent-color]/20 hover:border-[--accent-color] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  데이터 내보내기
                </button>
                <label className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white hover:bg-[--accent-color]/20 hover:border-[--accent-color] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  데이터 가져오기
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            <div className="pt-4 border-t border-[--border-color]">
              <p className="text-sm text-[--text-secondary] mb-3">
                모든 데이터를 초기 상태로 되돌립니다. 이 작업은 되돌릴 수 없습니다.
              </p>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  데이터 초기화
                </button>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/30">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-red-400">정말로 초기화하시겠습니까?</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="px-3 py-1 rounded text-sm text-[--text-secondary] hover:text-white"
                    >
                      취소
                    </button>
                    <button
                      onClick={handleResetData}
                      className="px-3 py-1 rounded text-sm bg-red-500 text-white hover:bg-red-600"
                    >
                      초기화
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 관리자 정보 */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">관리자 정보</h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[--bg-tertiary] rounded-lg">
              <p className="text-[--text-secondary] mb-1">비밀 코드</p>
              <code className="text-[--accent-color] font-mono">7807</code>
              <p className="text-xs text-[--text-secondary] mt-2">
                비밀 코드를 변경하려면 <code className="bg-[--bg-secondary] px-1 rounded">SecretAccess.tsx</code> 파일을 수정하세요.
              </p>
            </div>
            <div className="p-4 bg-[--bg-tertiary] rounded-lg">
              <p className="text-[--text-secondary] mb-1">데이터 저장 방식</p>
              <p className="text-white">로컬 스토리지</p>
              <p className="text-xs text-[--text-secondary] mt-2">
                영구 저장을 위해서는 Supabase 연동이 필요합니다.
              </p>
            </div>
            <div className="p-4 bg-[--bg-tertiary] rounded-lg">
              <p className="text-[--text-secondary] mb-1">인증 유효 기간</p>
              <p className="text-white">24시간</p>
              <p className="text-xs text-[--text-secondary] mt-2">
                인증 후 24시간이 지나면 다시 로그인해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


