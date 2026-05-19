import type { ReactNode } from 'react';

function GlassPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`ui-card-hover ui-fade-up rounded-[24px] border border-white/10 bg-white/[0.04] shadow-[0_24px_80px_rgba(5,8,20,0.45)] backdrop-blur-2xl sm:rounded-[28px] ${className}`}
    >
      {children}
    </div>
  );
}

function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-slate-300 sm:text-[11px] sm:tracking-[0.28em]">
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <GlassPanel className="p-4 sm:p-5">
      <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
      <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </GlassPanel>
  );
}

export { GlassPanel, SectionEyebrow, StatCard };
