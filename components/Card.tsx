
import React, { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', actions }) => {
  return (
    <div className={`bg-slate-800 shadow-xl rounded-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-4 py-3 border-b border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-sky-400">{title}</h3>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass = 'text-sky-400' }) => {
  return (
    <Card className="transform hover:scale-105 transition-transform duration-200 ease-out">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-slate-700 mr-4 ${colorClass}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-100">{value}</p>
        </div>
      </div>
    </Card>
  );
};
