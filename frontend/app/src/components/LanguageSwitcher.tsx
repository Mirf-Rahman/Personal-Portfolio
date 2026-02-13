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
    
    document.cookie = `locale=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex items-center">
      <GooeyFilter />
      <div className={`relative ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
        <Toggle 
          checked={isFrench} 
          onCheckedChange={handleToggle}
        />
        {/* EN/FR labels overlaid on the toggle circles */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-between px-[5px]">
          <span 
            className={`w-[22px] h-[22px] flex items-center justify-center text-[8px] font-black leading-none transition-opacity duration-300 ${
              !isFrench ? 'opacity-100 text-[#275EFE]' : 'opacity-0'
            }`}
          >
            EN
          </span>
          <span 
            className={`w-[22px] h-[22px] flex items-center justify-center text-[8px] font-black leading-none transition-opacity duration-300 ${
              isFrench ? 'opacity-100 text-[#275EFE]' : 'opacity-0'
            }`}
          >
            FR
          </span>
        </div>
      </div>
    </div>
  );
}
