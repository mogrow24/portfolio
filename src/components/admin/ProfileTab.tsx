'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Phone, Mail, Plus, X, Languages, Loader2 } from 'lucide-react';
import { getProfile, saveProfile, type ProfileData } from '@/lib/siteData';
import { translateKoToEn } from '@/lib/translate';
import ImageUploader from './ImageUploader';

export default function ProfileTab() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await saveProfile(profile);
    setTimeout(() => setSaving(false), 500);
  };

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;
    setProfile({ ...profile, skills: [...profile.skills, newSkill.trim()] });
    setNewSkill('');
  };

  const removeSkill = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, skills: profile.skills.filter((_, i) => i !== index) });
  };

  // 한글 -> 영어 자동 번역
  const handleAutoTranslate = async () => {
    if (!profile) return;
    setTranslating(true);

    try {
      const translations = await Promise.all([
        profile.subtitle_ko ? translateKoToEn(profile.subtitle_ko) : { success: true, translatedText: '' },
        profile.title1_ko ? translateKoToEn(profile.title1_ko) : { success: true, translatedText: '' },
        profile.title2_ko ? translateKoToEn(profile.title2_ko) : { success: true, translatedText: '' },
        profile.desc_ko ? translateKoToEn(profile.desc_ko) : { success: true, translatedText: '' },
        profile.quote_ko ? translateKoToEn(profile.quote_ko) : { success: true, translatedText: '' },
      ]);

      setProfile({
        ...profile,
        subtitle_en: translations[0].success ? translations[0].translatedText : profile.subtitle_en,
        title1_en: translations[1].success ? translations[1].translatedText : profile.title1_en,
        title2_en: translations[2].success ? translations[2].translatedText : profile.title2_en,
        desc_en: translations[3].success ? translations[3].translatedText : profile.desc_en,
        quote_en: translations[4].success ? translations[4].translatedText : profile.quote_en,
      });

      alert('영문 번역이 완료되었습니다. 내용을 확인 후 저장해주세요.');
    } catch (error) {
      alert('번역 중 오류가 발생했습니다.');
    } finally {
      setTranslating(false);
    }
  };

  if (!profile) return <div className="text-center py-8 text-[--text-secondary]">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-white">프로필 관리</h2>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAutoTranslate}
            disabled={translating}
            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 flex items-center gap-2 hover:bg-blue-500/30 disabled:opacity-50"
          >
            {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
            {translating ? '번역 중...' : '한→영 자동번역'}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saving ? '저장 중...' : '저장'}
          </motion.button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* 기본 정보 */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[--accent-color]" />
            기본 정보
          </h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">이름 (한글)</label>
              <input
                type="text"
                value={profile.name_ko}
                onChange={(e) => setProfile({ ...profile, name_ko: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">Name (English)</label>
              <input
                type="text"
                value={profile.name_en}
                onChange={(e) => setProfile({ ...profile, name_en: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">
                <Phone className="w-3 h-3 inline mr-1" />연락처
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
            <div>
              <label className="block text-sm text-[--text-secondary] mb-1">
                <Mail className="w-3 h-3 inline mr-1" />이메일
              </label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
              />
            </div>
          </div>

          <ImageUploader
            label="프로필 사진"
            value={profile.photo_url}
            onChange={(url) => setProfile({ ...profile, photo_url: url })}
            placeholder="이미지 URL을 입력하세요"
          />
        </div>

        {/* 스킬 */}
        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-bold text-white">Main Tools (Skills)</h3>
          
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, index) => (
              <span key={index} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[--bg-tertiary] text-sm text-[--text-secondary]">
                {skill}
                <button onClick={() => removeSkill(index)} className="text-red-400 hover:text-red-300">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="새 스킬 추가"
              onKeyDown={(e) => e.key === 'Enter' && addSkill()}
              className="flex-1 px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
            <button onClick={addSkill} className="px-4 py-2 rounded-lg bg-[--accent-color] text-black font-semibold">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 헤드라인 문구 */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-white">헤드라인 문구</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">서브타이틀 (한글)</label>
            <input
              type="text"
              value={profile.subtitle_ko}
              onChange={(e) => setProfile({ ...profile, subtitle_ko: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Subtitle (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
            <input
              type="text"
              value={profile.subtitle_en}
              onChange={(e) => setProfile({ ...profile, subtitle_en: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">타이틀 1행 (한글)</label>
            <input
              type="text"
              value={profile.title1_ko}
              onChange={(e) => setProfile({ ...profile, title1_ko: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Title Line 1 (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
            <input
              type="text"
              value={profile.title1_en}
              onChange={(e) => setProfile({ ...profile, title1_en: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">타이틀 2행 (한글)</label>
            <input
              type="text"
              value={profile.title2_ko}
              onChange={(e) => setProfile({ ...profile, title2_ko: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Title Line 2 (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
            <input
              type="text"
              value={profile.title2_en}
              onChange={(e) => setProfile({ ...profile, title2_en: e.target.value })}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color]"
            />
          </div>
        </div>
      </div>

      {/* 소개 문구 */}
      <div className="glass-card rounded-xl p-6 space-y-4">
        <h3 className="font-bold text-white">소개 문구</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">소개 (한글)</label>
            <textarea
              value={profile.desc_ko}
              onChange={(e) => setProfile({ ...profile, desc_ko: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Description (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
            <textarea
              value={profile.desc_en}
              onChange={(e) => setProfile({ ...profile, desc_en: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">인용문 (한글)</label>
            <textarea
              value={profile.quote_ko}
              onChange={(e) => setProfile({ ...profile, quote_ko: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>
          <div>
            <label className="block text-sm text-[--text-secondary] mb-1">Quote (English) <span className="text-blue-400 text-xs">← 자동번역</span></label>
            <textarea
              value={profile.quote_en}
              onChange={(e) => setProfile({ ...profile, quote_en: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 rounded-lg bg-[--bg-tertiary] border border-[--border-color] text-white focus:outline-none focus:border-[--accent-color] resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
