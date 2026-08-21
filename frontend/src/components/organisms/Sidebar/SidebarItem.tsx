import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed: boolean;
  badge?: string | number;
  badgeColor?: string;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  href,
  isActive,
  isCollapsed,
  badge,
  badgeColor = 'bg-red-500',
}) => {
  return (
    <Link 
      href={href} 
      className={`relative flex items-center mx-3 my-0.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all group whitespace-nowrap
        ${isActive 
          ? 'bg-[#d94828] text-white shadow-md shadow-orange-950/40' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
        }
      `}
    >
      <div className={`flex items-center justify-center shrink-0 w-5 mr-3 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
        <Icon size={17} strokeWidth={isActive ? 2.4 : 1.9} />
      </div>
      
      <span className={`flex-1 transition-opacity duration-200 truncate ${isCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}`}>
        {label}
      </span>

      {!isCollapsed && badge !== undefined && (
        <span className={`ml-auto px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${badgeColor}`}>
          {badge}
        </span>
      )}

      {isCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-[#131926] border border-[#232f45] text-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-xl z-[100] flex items-center gap-2">
          <span>{label}</span>
          {badge !== undefined && (
            <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full text-white ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </Link>
  );
};

