"use client";

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { Toggle, GooeyFilter } from '@/components/ui/liquid-toggle';
import { type Locale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isFrench = locale === 'fr';

  const handleToggle = (checked: boolean) => {
    const newLocale = checked ? 'fr' : 'en';
    
    // Set locale cookie (expires in 1 year)
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    
    // Refresh the page to apply the new locale
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <GooeyFilter />
      <span 
        className={`text-xs font-semibold transition-colors ${
          !isFrench ? 'text-cyan-400' : 'text-slate-500'
        }`}
      >
        EN
      </span>
      <Toggle 
        checked={isFrench} 
        onCheckedChange={handleToggle}
        className={isPending ? 'opacity-50 pointer-events-none' : ''}
      />
      <span 
        className={`text-xs font-semibold transition-colors ${
          isFrench ? 'text-cyan-400' : 'text-slate-500'
        }`}
      >
        FR
      </span>
    </div>
  );
}
