import { NavLink } from 'react-router-dom';
import { Home, History, BarChart2 } from 'lucide-react';
import { clsx } from 'clsx';

export default function BottomNav() {
  const navItems = [
    { to: '/', icon: Home, label: 'Accueil' },
    { to: '/history', icon: History, label: 'Historique' },
    { to: '/progress', icon: BarChart2, label: 'Progrès' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1E] border-t border-[#2C2C2E] pb-4">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-[#D4FF00]' : 'text-[#8E8E93]'
              )
            }
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
