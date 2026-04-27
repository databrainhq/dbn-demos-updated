import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'analytics', label: 'Analytics', icon: '📈' },
  { id: 'customers', label: 'Customers', icon: '👥' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [activeItem, setActiveItem] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="grid min-h-screen grid-cols-[auto_1fr]">
      <aside
        className={cn(
          'border-r bg-white transition-all duration-300',
          sidebarOpen ? 'w-60' : 'w-16',
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </Button>
          {sidebarOpen && <span className="ml-2 font-semibold">Dashboard</span>}
        </div>
        <nav className="flex flex-col gap-1 p-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeItem === item.id ? 'secondary' : 'ghost'}
              className="justify-start"
              onClick={() => setActiveItem(item.id)}
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </nav>
      </aside>
      <main className="flex flex-col">
        <header className="flex h-14 items-center justify-between border-b px-6">
          <h1 className="text-lg font-semibold capitalize">{activeItem}</h1>
        </header>
        <div className="flex-1 p-6 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}
