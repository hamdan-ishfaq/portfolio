'use client';

import Link from 'next/link';
import { useLocale } from '@/components/providers/LocaleProvider';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

type Stat = {
  labelKey: string;
  value: number;
  icon: string;
  iconClass: string;
};

type AdminDashboardClientProps = {
  stats: Stat[];
};

export function AdminDashboardClient({ stats }: AdminDashboardClientProps) {
  const { t } = useLocale();

  return (
    <div className="admin-page space-y-2xl">
      <section className="admin-page-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="type-section">{t('admin.overview')}</h2>
            <LanguageToggle />
          </div>
          <p className="type-lead mt-2 text-sm">{t('admin.overviewLead')}</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          {t('admin.newProject')}
        </Link>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
        {stats.map((stat) => (
          <div key={stat.labelKey} className="admin-stat-card">
            <div className="admin-stat-card__icon">
              <span className={`material-symbols-outlined ${stat.iconClass}`}>{stat.icon}</span>
            </div>
            <h3 className="text-sm text-on-surface-variant mb-1">{t(stat.labelKey)}</h3>
            <p className="text-[2rem] font-bold text-on-surface leading-none tabular-nums">
              {stat.value}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
