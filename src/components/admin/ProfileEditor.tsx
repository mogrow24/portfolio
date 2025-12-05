'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Mail, Phone, Linkedin, Github, Image as ImageIcon } from 'lucide-react';
import { LocalProfile } from '@/types/admin';
import { initialProfile } from '@/data/initialData';

interface ProfileEditorProps {
  onSave?: (profile: LocalProfile) => void;
}

export default function ProfileEditor({ onSave }: ProfileEditorProps) {
  const [profile, setProfile] = useState<LocalProfile>(initialProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // 로컬 스토리지에서 프로필 로드
  useEffect(() => {
    const savedProfile = localStorage.getItem('admin_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleChange = (field: keyof LocalProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('admin_profile', JSON.stringify(profile));
      setSaveMessage('프로필이 저장되었습니다.');
      onSave?.(profile);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      setSaveMessage('저장 중 오류가 발생했습니다.');
    }
    setIsSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">프로필 관리</h2>
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
            saveMessage.includes('오류') 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-green-500/20 text-green-400'
          }`}
        >
          {saveMessage}
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[--accent-color]" />
            기본 정보
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[--text-secondary] mb-1">이름 (한글)</label>
                <input
                  type="text"
                  value={profile.name_ko}
                  onChange={(e) => handleChange('name_ko', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
              <div>
                <label className="block text-sm text-[--text-secondary] mb-1">Name (English)</label>
                <input
                  type="text"
                  value={profile.name_en}
                  onChange={(e) => handleChange('name_en', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[--text-secondary] mb-1">직함 (한글)</label>
                <input
                  type="text"
                  value={profile.title_ko}
                  onChange={(e) => handleChange('title_ko', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
              <div>
                <label className="block text-sm text-[--text-secondary] mb-1">Title (English)</label>
                <input
                  type="text"
                  value={profile.title_en}
                  onChange={(e) => handleChange('title_en', e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">프로필 이미지 URL</label>
              <div className="flex gap-3">
                <input
                  type="url"
                  value={profile.profile_image}
                  onChange={(e) => handleChange('profile_image', e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
                {profile.profile_image ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-[--bg-tertiary] flex-shrink-0">
                    <img src={profile.profile_image} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-[--bg-tertiary] flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-[--text-secondary]" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 연락처 정보 */}
        <div className="glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-[--accent-color]" />
            연락처 정보
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">이메일</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">전화번호</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="010-0000-0000"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">LinkedIn</label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">GitHub</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--text-secondary]" />
                <input
                  type="url"
                  value={profile.github}
                  onChange={(e) => handleChange('github', e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 자기소개 */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">자기소개</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">자기소개 (한글)</label>
              <textarea
                value={profile.bio_ko}
                onChange={(e) => handleChange('bio_ko', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Bio (English)</label>
              <textarea
                value={profile.bio_en}
                onChange={(e) => handleChange('bio_en', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


