'use client';

// components/ui/Tabs.tsx
// Keyboard-navigable tab interface used on the project detail page.
import { useState, type ReactNode } from 'react';

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

type TabsProps = {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
};

export function Tabs({ tabs, defaultTab, className = '' }: TabsProps) {
  const [activeId, setActiveId] = useState(defaultTab ?? tabs[0]?.id ?? '');

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === 'ArrowRight') {
      const next = tabs[(index + 1) % tabs.length];
      setActiveId(next.id);
    } else if (e.key === 'ArrowLeft') {
      const prev = tabs[(index - 1 + tabs.length) % tabs.length];
      setActiveId(prev.id);
    }
  }

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        aria-label="Content sections"
        className="flex border-b border-white/5 gap-1 overflow-x-auto no-scrollbar -mx-1 px-1"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`tab-${tab.id}`}
            role="tab"
            type="button"
            aria-selected={activeId === tab.id}
            aria-controls={`panel-${tab.id}`}
            tabIndex={activeId === tab.id ? 0 : -1}
            onClick={() => setActiveId(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={`shrink-0 px-3 sm:px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px focus-ring rounded-t-lg whitespace-nowrap ${
              activeId === tab.id
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-white/20'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`panel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={activeId !== tab.id}
          className="pt-4 sm:pt-6 min-w-0"
        >
          {activeId === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
}
