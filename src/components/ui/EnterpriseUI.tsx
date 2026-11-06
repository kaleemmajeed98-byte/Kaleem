import React from 'react';
import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
}

const buttonStyles: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-emerald-600 text-white hover:bg-emerald-700',
  secondary: 'border-stone-800 bg-stone-900 text-stone-200 hover:bg-stone-800',
  ghost: 'border-transparent bg-transparent text-stone-500 hover:bg-stone-100 hover:text-stone-900',
  danger: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  icon,
  className = '',
  children,
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    className={`erp-button ${buttonStyles[variant]} ${className}`}
    {...props}
  >
    {icon}
    {children}
  </button>
);

export const PageHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}> = ({ eyebrow, title, description, actions }) => (
  <div className="erp-page-header">
    <div className="min-w-0">
      {eyebrow && <p className="erp-eyebrow">{eyebrow}</p>}
      <h1 className="erp-page-title">{title}</h1>
      {description && <p className="erp-page-description">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
  </div>
);

export const Panel: React.FC<{
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, description, action, children, className = '' }) => (
  <section className={`erp-panel ${className}`}>
    {(title || description || action) && (
      <header className="erp-panel-header">
        <div>
          {title && <h2 className="erp-panel-title">{title}</h2>}
          {description && <p className="erp-panel-description">{description}</p>}
        </div>
        {action}
      </header>
    )}
    {children}
  </section>
);

export const StatusBadge: React.FC<{ children: React.ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }> = ({
  children,
  tone = 'neutral',
}) => <span className={`erp-status erp-status-${tone}`}>{children}</span>;

export const EmptyState: React.FC<{ title: string; description?: string; icon?: React.ReactNode }> = ({
  title,
  description,
  icon,
}) => (
  <div className="erp-empty-state">
    {icon || <Inbox className="h-5 w-5" />}
    <p className="font-semibold">{title}</p>
    {description && <p className="max-w-sm text-sm">{description}</p>}
  </div>
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading data' }) => (
  <div className="erp-feedback" role="status">
    <LoaderCircle className="h-5 w-5 animate-spin" />
    <span>{label}</span>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="erp-error-state" role="alert">
    <AlertCircle className="h-5 w-5 shrink-0" />
    <span className="flex-1">{message}</span>
    {onRetry && <Button onClick={onRetry}>Retry</Button>}
  </div>
);
