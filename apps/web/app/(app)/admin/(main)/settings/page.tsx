'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CaretRight as ChevronRight,
  Check,
  DeviceMobile as Smartphone,
  Globe,
  Info,
  LockKey,
  SignOut as LogOut,
} from '@phosphor-icons/react';

import { authClient } from '@/lib/auth-client';
import { getAdminProfile, type AdminProfile } from '@/lib/admin-profile';
import { platformFetch } from '@/lib/api/platform';
import { Button } from '@/components/ui/button';
import PortalBrand from '@/components/ui/portal-brand';
import { useToast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type UserPreference = {
  id: string;
  userId: string;
  language: string;
  theme: string;
  notificationEnabled: boolean;
};

type Language = 'Indonesia' | 'Sunda' | 'English';
type TranslationKey =
  | 'appearance'
  | 'active'
  | 'inactive'
  | 'blocked'
  | 'unsupported'
  | 'unsupportedDesc'
  | 'notifBlocked'
  | 'notifBlockedDesc'
  | 'notifEnabled'
  | 'saveFailed'
  | 'languageSaveFailed'
  | 'language'
  | 'languageTitle'
  | 'languageDesc'
  | 'notifPrivacy'
  | 'notif'
  | 'about'
  | 'appVersion'
  | 'appAbout'
  | 'appAboutDesc'
  | 'appDesc'
  | 'version'
  | 'developedBy'
  | 'forLabel'
  | 'logout'
  | 'logoutSuccess'
  | 'logoutSuccessDesc'
  | 'logoutConfirm'
  | 'logoutDesc'
  | 'yesLogout'
  | 'cancel'
  | 'close';

const DICT: Record<Language, Record<TranslationKey, string>> = {
  Indonesia: {
    appearance: 'Tampilan',
    active: 'Aktif',
    inactive: 'Nonaktif',
    blocked: 'Diblokir',
    unsupported: 'Tidak Didukung',
    unsupportedDesc: 'Browser Anda tidak mendukung notifikasi.',
    notifBlocked: 'Notifikasi Diblokir',
    notifBlockedDesc: 'Anda memblokir notifikasi. Silakan ubah di pengaturan browser.',
    notifEnabled: 'Notifikasi berhasil diaktifkan!',
    saveFailed: 'Gagal menyimpan preferensi',
    languageSaveFailed: 'Gagal menyimpan bahasa',
    language: 'Bahasa',
    languageTitle: 'Pilih Bahasa',
    languageDesc: 'Pilih bahasa antarmuka sistem.',
    notifPrivacy: 'Notifikasi & Privasi',
    notif: 'Notifikasi',
    about: 'Tentang',
    appVersion: 'Versi Aplikasi',
    appAbout: 'Tentang Aplikasi',
    appAboutDesc: 'Info & lisensi',
    appDesc:
      'Portal RW 25 adalah sistem informasi digital untuk mengelola data kependudukan warga di lingkungan RW 025, Kota Cimahi. Aplikasi ini membantu pengurus RW mengelola data warga, kartu keluarga, mutasi penduduk, dan permohonan secara efisien.',
    version: 'Versi',
    developedBy: 'Dikembangkan oleh',
    forLabel: 'Untuk',
    logout: 'Keluar',
    logoutSuccess: 'Berhasil keluar',
    logoutSuccessDesc: 'Anda telah keluar.',
    logoutConfirm: 'Keluar?',
    logoutDesc: 'Anda akan dikembalikan ke halaman login admin.',
    yesLogout: 'Ya, Keluar',
    cancel: 'Batal',
    close: 'Tutup',
  },
  Sunda: {
    appearance: 'Tampilan',
    active: 'Aktif',
    inactive: 'Nonaktif',
    blocked: 'Diblokir',
    unsupported: 'Teu Dirojong',
    unsupportedDesc: 'Browser anjeun teu ngarojong notifikasi.',
    notifBlocked: 'Notifikasi Diblokir',
    notifBlockedDesc: 'Anjeun meungpeuk notifikasi. Mangga robah dina setelan browser.',
    notifEnabled: 'Notifikasi hasil diaktipkeun!',
    saveFailed: 'Gagal nyimpen preferensi',
    languageSaveFailed: 'Gagal nyimpen basa',
    language: 'Basa',
    languageTitle: 'Pilih Basa',
    languageDesc: 'Pilih basa antarmuka sistem.',
    notifPrivacy: 'Notifikasi & Privasi',
    notif: 'Notifikasi',
    about: 'Ngeunaan',
    appVersion: 'Versi Aplikasi',
    appAbout: 'Ngeunaan Aplikasi',
    appAboutDesc: 'Info & lisensi',
    appDesc:
      'Portal RW 25 nyaéta sistem informasi digital pikeun ngatur data warga di lingkungan RW 025, Kota Cimahi.',
    version: 'Versi',
    developedBy: 'Dimekarkeun ku',
    forLabel: 'Kanggo',
    logout: 'Kaluar',
    logoutSuccess: 'Hasil kaluar',
    logoutSuccessDesc: 'Anjeun parantos kaluar.',
    logoutConfirm: 'Kaluar?',
    logoutDesc: 'Anjeun bakal dipulangkeun ka halaman login admin.',
    yesLogout: 'Enya, Kaluar',
    cancel: 'Batal',
    close: 'Tutup',
  },
  English: {
    appearance: 'Appearance',
    active: 'Active',
    inactive: 'Inactive',
    blocked: 'Blocked',
    unsupported: 'Unsupported',
    unsupportedDesc: 'Your browser does not support notifications.',
    notifBlocked: 'Notifications Blocked',
    notifBlockedDesc: 'You have blocked notifications. Please change this in your browser settings.',
    notifEnabled: 'Notifications enabled!',
    saveFailed: 'Failed to save preferences',
    languageSaveFailed: 'Failed to save language',
    language: 'Language',
    languageTitle: 'Choose Language',
    languageDesc: 'Choose the system interface language.',
    notifPrivacy: 'Notifications & Privacy',
    notif: 'Notifications',
    about: 'About',
    appVersion: 'App Version',
    appAbout: 'About App',
    appAboutDesc: 'Info & license',
    appDesc:
      'Portal RW 25 is a digital information system for managing resident data in RW 025, Cimahi City. This app helps RW administrators manage resident data, family cards, resident mutations, and requests efficiently.',
    version: 'Version',
    developedBy: 'Developed by',
    forLabel: 'For',
    logout: 'Exit',
    logoutSuccess: 'Signed out successfully',
    logoutSuccessDesc: 'You have signed out.',
    logoutConfirm: 'Exit?',
    logoutDesc: 'You will be returned to the admin login page.',
    yesLogout: 'Yes, Exit',
    cancel: 'Cancel',
    close: 'Close',
  },
};

function preferenceToLanguage(value?: string): Language {
  void value;
  return 'Indonesia';
}

function languageToPreference(value: Language) {
  if (value === 'English') return 'en';
  if (value === 'Sunda') return 'su';
  return 'id';
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<AdminProfile>(() => getAdminProfile());
  const [notifStatus, setNotifStatus] = useState<string>('default');
  const [notifikasi, setNotifikasi] = useState(false);
  const [bahasa, setBahasa] = useState<Language>('Indonesia');
  const [savingKey, setSavingKey] = useState<'language' | 'notification' | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeDialog, setActiveDialog] = useState<'bahasa' | 'tentang' | null>(null);

  const t = DICT[bahasa];

  useEffect(() => {
    let active = true;

    async function loadSession() {
      const [session, preference] = await Promise.all([
        authClient.getSession().catch(() => null),
        platformFetch<UserPreference>('/me/preferences').catch(() => null),
      ]);
      if (!active) return;
      setProfile(getAdminProfile(session?.data?.user));
      if (preference?.data) {
        setNotifikasi(preference.data.notificationEnabled);
        setBahasa(preferenceToLanguage(preference.data.language));
      }
    }

    void loadSession();

    const checkPermission = () => {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotifStatus(Notification.permission);
      }
    };

    checkPermission();
    window.addEventListener('notif-updated', checkPermission);

    return () => {
      active = false;
      window.removeEventListener('notif-updated', checkPermission);
    };
  }, []);

  const persistPreference = async (
    payload: Partial<Pick<UserPreference, 'language' | 'notificationEnabled'>>,
    key: 'language' | 'notification',
  ) => {
    setSavingKey(key);
    try {
      await platformFetch<UserPreference>('/me/preferences', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    } catch {
      toast({ title: key === 'language' ? t.languageSaveFailed : t.saveFailed, variant: 'destructive' });
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggleNotif = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast({ title: t.unsupported, description: t.unsupportedDesc });
      return;
    }
    if (notifStatus === 'denied') {
      toast({ title: t.notifBlocked, description: t.notifBlockedDesc, variant: 'destructive' });
      return;
    }
    if (notifStatus !== 'granted') {
      const permission = await Notification.requestPermission();
      setNotifStatus(permission);
      window.dispatchEvent(new CustomEvent('notif-updated'));
      if (permission === 'granted') {
        new Notification('Portal RW 25', { body: t.notifEnabled, icon: '/favicon.ico' });
      } else {
        return;
      }
    }

    const next = !notifikasi;
    setNotifikasi(next);
    void persistPreference({ notificationEnabled: next }, 'notification');
  };

  const handleLanguageChange = (language: Language) => {
    if (language !== 'Indonesia') return;
    setBahasa(language);
    setActiveDialog(null);
    void persistPreference({ language: languageToPreference(language) }, 'language');
  };

  const handleLogout = async () => {
    await authClient.signOut().catch(() => null);
    toast({ title: t.logoutSuccess, description: t.logoutSuccessDesc, variant: 'default' });
    router.push('/sign-in');
  };

  return (
    <div className="flex w-full flex-col gap-5 py-6">
      <div className="flex items-center gap-4 rounded-[28px] border border-[#D8DEE8] bg-white p-5 shadow-sm">
        <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${profile.avatarClassName} text-2xl font-bold text-white shadow-md`}>
          {profile.initials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#18212F]">{profile.name}</h2>
          <p className="text-sm font-medium text-[#667085]">{profile.email}</p>
          <span className="mt-2 inline-block rounded-full bg-[#EAF2FF] px-3 py-1 text-xs font-semibold text-[#2563EB]">
            {profile.roleLabel}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h3 className="mb-2 ml-1 text-sm font-bold uppercase tracking-wider text-[#667085]">
            {t.appearance}
          </h3>
          <div className="overflow-hidden rounded-[28px] border border-[#D8DEE8] bg-white shadow-sm">
            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onClick={() => setActiveDialog('bahasa')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6ECE6]">
                  <Globe className="h-6 w-6 text-[#A44A3F]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#18212F]">{t.language}</p>
                  <p className="text-sm font-medium text-[#667085]">{bahasa}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#98A2B3]" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="mb-2 ml-1 text-sm font-bold uppercase tracking-wider text-[#667085]">
            {t.notifPrivacy}
          </h3>
          <div className="overflow-hidden rounded-[28px] border border-[#D8DEE8] bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EAF1F8]">
                  <Bell className="h-6 w-6 text-[#2C5F75]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#18212F]">{t.notif}</p>
                  <p className="text-sm font-medium text-[#667085]">
                    {notifStatus === 'granted' ? t.active : notifStatus === 'denied' ? t.blocked : t.inactive}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                onClick={handleToggleNotif}
                disabled={savingKey === 'notification'}
                className={`relative h-8 w-14 rounded-full transition-all duration-300 ${
                  notifStatus === 'granted' && notifikasi ? 'bg-[#2C5F75]' : 'bg-[#D0D5DD]'
                }`}
              >
                <div className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-all duration-300 ${
                  notifStatus === 'granted' && notifikasi ? 'left-[28px]' : 'left-1'
                }`} />
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-2 ml-1 text-sm font-bold uppercase tracking-wider text-[#667085]">
            {t.about}
          </h3>
          <div className="overflow-hidden rounded-[28px] border border-[#D8DEE8] bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F6ECE6]">
                  <Smartphone className="h-6 w-6 text-[#A44A3F]" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#18212F]">{t.appVersion}</p>
                  <p className="text-sm font-medium text-[#667085]">v1.0.0 (Build 2026.04)</p>
                </div>
              </div>
            </div>

            <div className="mx-5 h-px bg-[#EEF2F6]" />

            <button
              type="button"
              className="flex w-full cursor-pointer items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50"
              onClick={() => setActiveDialog('tentang')}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
                  <Info className="h-6 w-6 text-gray-500" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#18212F]">{t.appAbout}</p>
                  <p className="text-sm font-medium text-[#667085]">{t.appAboutDesc}</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#98A2B3]" />
            </button>
          </div>
        </div>

        <Button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="mt-2 flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 py-4 font-bold text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
        >
          <LogOut className="h-6 w-6" />
          <span className="text-lg">{t.logout}</span>
        </Button>
      </div>

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="max-w-sm rounded-3xl p-8 text-center">
          <AlertDialogHeader className="items-center text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <LogOut className="h-8 w-8 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-[#18212F]">
              {t.logoutConfirm}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-[#667085]">
              {t.logoutDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex w-full flex-col gap-3 sm:flex-col sm:justify-center sm:space-x-0">
            <AlertDialogAction
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-600 py-6 text-base font-bold text-white hover:bg-red-700"
            >
              {t.yesLogout}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-xl border-gray-200 py-6 text-base font-bold text-[#64748B] hover:bg-gray-100">
              {t.cancel}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={activeDialog !== null} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent className="max-w-sm rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-[#18212F]">
              {activeDialog === 'bahasa' ? t.languageTitle : t.appAbout}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-[#667085]">
              {activeDialog === 'bahasa' ? t.languageDesc : t.appAboutDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {activeDialog === 'bahasa' && (
            <div className="mt-4 flex flex-col gap-3">
              {(['Indonesia', 'Sunda', 'English'] as Language[]).map((language) => (
                <Button
                  key={language}
                  type="button"
                  onClick={() => handleLanguageChange(language)}
                  disabled={savingKey === 'language' || language !== 'Indonesia'}
                  className={`flex items-center justify-between rounded-xl border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-100 ${
                    bahasa === language
                      ? 'border-[#1F7A6B] bg-[#E8F3F0] text-[#1F7A6B]'
                      : 'border-gray-100 bg-gray-50 text-[#98A2B3]'
                  }`}
                >
                  <span className="font-bold">{language}</span>
                  {bahasa === language ? <Check className="h-5 w-5" /> : <LockKey className="h-5 w-5 text-[#98A2B3]" />}
                </Button>
              ))}
            </div>
          )}

          {activeDialog === 'tentang' && (
            <div className="mt-4 flex flex-col gap-4">
              <PortalBrand
                imageSize={64}
                textClassName="text-lg font-bold text-[#18212F]"
                subtitle="Versi 1.0.0"
                subtitleClassName="text-sm text-[#667085]"
              />
              <p className="text-sm leading-relaxed text-[#667085]">{t.appDesc}</p>
              <div className="h-px bg-[#EEF2F6]" />
              <div className="space-y-1 text-sm text-[#667085]">
                <p><strong>{t.version}:</strong> 1.0.0 (Build 2026.04)</p>
                <div>
                  <p><strong>{t.developedBy}:</strong> Tim ABDIMAS - Telkom University</p>
                  <ol className="ml-2 mt-1 list-inside list-decimal space-y-0.5 text-xs">
                    <li>Raenaldi Ardiansyah Sidik - Front End Developer</li>
                    <li>Faiq Haqqani - UI/UX Designer</li>
                    <li>Muhammad Riyadhul Jinan Nasution - Back End Developer</li>
                  </ol>
                </div>
                <p><strong>{t.forLabel}:</strong> RW 025, Kota Cimahi, Jawa Barat</p>
              </div>
            </div>
          )}

          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="w-full rounded-xl border-gray-200 py-6 text-base font-bold text-[#64748B] hover:bg-gray-100">
              {t.close}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
