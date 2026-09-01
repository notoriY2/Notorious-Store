//src/components/admin/AdminUI.tsx
import React from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

const FONT = "'Helvetica Neue', Arial, sans-serif";
const ACCENT = '#C44D2B';

/* ─────────────────────────────────────────────────────────
   KPI CARD
───────────────────────────────────────────────────────── */

export const KPICard: React.FC<{
  label: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
}> = ({ label, value, change, icon }) => (
  <div
    className="
      group
      bg-white
      border border-gray-100
      p-5 lg:p-6
      transition-all
      duration-300
      hover:border-gray-200
      hover:-translate-y-[1px]
    "
    style={{ fontFamily: FONT }}
  >
    <div className="flex items-start justify-between">
      <p className="text-[9px] uppercase tracking-[0.25em] font-[100] text-gray-400">
        {label}
      </p>

      {icon && (
        <div className="text-gray-300 group-hover:text-[#C44D2B] transition-colors">
          {icon}
        </div>
      )}
    </div>

    <p className="mt-4 text-[28px] leading-none font-[100] tracking-[-0.02em] text-black">
      {value}
    </p>

    {change && (
      <p
        className={`
          mt-3
          text-[9px]
          uppercase
          tracking-[0.15em]
          font-light
          ${
            change.startsWith('+')
              ? 'text-gray-500'
              : 'text-[#C44D2B]'
          }
        `}
      >
        {change}
      </p>
    )}
  </div>
);


/* ─────────────────────────────────────────────────────────
   SECTION CARD
───────────────────────────────────────────────────────── */

export const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({
  title,
  children,
  action,
  className = '',
}) => (
  <section
    className={`bg-white border border-gray-100 ${className}`}
    style={{ fontFamily: FONT }}
  >
    <div className="min-h-[58px] px-5 lg:px-6 border-b border-gray-100 flex items-center justify-between">
      <h3 className="text-[10px] uppercase tracking-[0.25em] font-[100] text-black">
        {title}
      </h3>

      {action}
    </div>

    <div className="p-5 lg:p-6">
      {children}
    </div>
  </section>
);


/* ─────────────────────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────────────────────── */

export const StatusBadge: React.FC<{
  status: string;
}> = ({ status }) => {
  const colors: Record<string, string> = {
    Paid: 'bg-gray-50 text-gray-700 border-gray-200',
    Pending: 'bg-white text-gray-500 border-gray-200',
    Refunded: 'bg-gray-50 text-gray-600 border-gray-200',

    Failed: 'bg-[#C44D2B]/5 text-[#C44D2B] border-[#C44D2B]/20',

    Processing: 'bg-gray-50 text-gray-700 border-gray-200',
    Shipped: 'bg-black text-white border-black',
    Delivered: 'bg-gray-50 text-gray-700 border-gray-200',

    Cancelled: 'bg-[#C44D2B]/5 text-[#C44D2B] border-[#C44D2B]/20',

    Active: 'bg-black text-white border-black',
    Inactive: 'bg-gray-50 text-gray-500 border-gray-200',

    VIP: 'bg-[#C44D2B] text-white border-[#C44D2B]',

    'In Stock': 'bg-gray-50 text-gray-700 border-gray-200',
    'Low Stock': 'bg-[#C44D2B]/5 text-[#C44D2B] border-[#C44D2B]/20',
    'Out of Stock': 'bg-[#C44D2B]/5 text-[#C44D2B] border-[#C44D2B]/20',

    'Sold Out': 'bg-[#C44D2B]/5 text-[#C44D2B] border-[#C44D2B]/20',

    Hidden: 'bg-gray-50 text-gray-500 border-gray-200',
    Scheduled: 'bg-gray-50 text-gray-600 border-gray-200',
    Expired: 'bg-gray-50 text-gray-400 border-gray-200',

    Completed: 'bg-gray-50 text-gray-700 border-gray-200',
    Draft: 'bg-gray-50 text-gray-400 border-gray-200',
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        px-2.5
        py-1
        border
        text-[8px]
        uppercase
        tracking-[0.18em]
        font-light
        whitespace-nowrap
        ${colors[status] || 'bg-gray-50 text-gray-500 border-gray-200'}
      `}
      style={{ fontFamily: FONT }}
    >
      {status}
    </span>
  );
};


/* ─────────────────────────────────────────────────────────
   BAR CHART
───────────────────────────────────────────────────────── */

export const BarChart: React.FC<{
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}> = ({
  data,
  height = 220,
  color = ACCENT,
}) => {
  const max = Math.max(
    ...data.map(d => d.value),
    1
  );

  return (
    <div
      className="flex items-end justify-between gap-2"
      style={{
        height,
        fontFamily: FONT,
      }}
    >
      {data.map((d, i) => (
        <div
          key={i}
          className="flex-1 min-w-0 h-full flex flex-col items-center justify-end group"
        >
          <div
            className="
              mb-2
              text-[9px]
              text-gray-500
              font-light
              tracking-wide
              opacity-0
              group-hover:opacity-100
              transition-opacity
            "
          >
            {d.value.toLocaleString()}
          </div>

          <div
            className="
              w-full
              max-w-[34px]
              transition-all
              duration-300
              group-hover:opacity-80
            "
            style={{
              height: `${(d.value / max) * 100}%`,
              backgroundColor: color,
              minHeight: '4px',
            }}
          />

          <div className="mt-2 text-[8px] text-gray-400 tracking-[0.08em] truncate w-full text-center font-light">
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
};


/* ─────────────────────────────────────────────────────────
   LINE CHART
───────────────────────────────────────────────────────── */

export const LineChart: React.FC<{
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}> = ({
  data,
  height = 220,
  color = ACCENT,
}) => {
  const max = Math.max(
    ...data.map(d => d.value),
    1
  );

  const min = Math.min(
    ...data.map(d => d.value),
    0
  );

  const range = max - min || 1;
  const width = 100;

  const points = data
    .map((d, i) => {
      const x =
        data.length === 1
          ? 50
          : (i / (data.length - 1)) * width;

      const y =
        height -
        ((d.value - min) / range) *
          (height - 24) -
        12;

      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <div
      className="w-full"
      style={{
        height,
        fontFamily: FONT,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          <linearGradient
            id="lineGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor={color}
              stopOpacity="0.12"
            />
            <stop
              offset="100%"
              stopColor={color}
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <polygon
          points={areaPoints}
          fill="url(#lineGradient)"
        />

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="0.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {data.map((d, i) => {
          const x =
            data.length === 1
              ? 50
              : (i / (data.length - 1)) * width;

          const y =
            height -
            ((d.value - min) / range) *
              (height - 24) -
            12;

          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="1"
              fill={color}
            />
          );
        })}
      </svg>
    </div>
  );
};


/* ─────────────────────────────────────────────────────────
   TABLE
───────────────────────────────────────────────────────── */

export const Table: React.FC<{
  headers: string[];
  children: React.ReactNode;
}> = ({
  headers,
  children,
}) => (
  <div
    className="overflow-x-auto"
    style={{ fontFamily: FONT }}
  >
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-100">
          {headers.map((header, index) => (
            <th
              key={index}
              className="
                text-left
                text-[8px]
                font-light
                text-gray-400
                uppercase
                tracking-[0.22em]
                py-3
                px-4
                whitespace-nowrap
              "
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {children}
      </tbody>
    </table>
  </div>
);


/* ─────────────────────────────────────────────────────────
   BUTTON
───────────────────────────────────────────────────────── */

export const AdminButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
}) => {
  const variants = {
    primary:
      'bg-black text-white border-black hover:bg-[#C44D2B] hover:border-[#C44D2B]',

    secondary:
      'bg-white text-black border-gray-200 hover:border-black',

    danger:
      'bg-white text-[#C44D2B] border-[#C44D2B]/30 hover:bg-[#C44D2B] hover:text-white',

    ghost:
      'bg-transparent text-gray-500 border-transparent hover:bg-gray-50 hover:text-black',
  };

  const sizes = {
    sm: 'px-3 py-2 text-[9px]',
    md: 'px-5 py-2.5 text-[10px]',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        border
        uppercase
        tracking-[0.18em]
        font-light
        transition-all
        duration-300
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={{ fontFamily: FONT }}
    >
      {children}
    </button>
  );
};


/* ─────────────────────────────────────────────────────────
   INPUT
───────────────────────────────────────────────────────── */

export const AdminInput: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}) => (
  <div style={{ fontFamily: FONT }}>
    {label && (
      <label className="block text-[9px] font-light text-gray-400 mb-2 tracking-[0.2em] uppercase">
        {label}
      </label>
    )}

    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="
        w-full
        px-3
        py-3
        text-sm
        font-light
        border
        border-gray-200
        focus:outline-none
        focus:border-black
        transition-colors
        duration-300
        bg-white
        placeholder:text-gray-300
      "
    />
  </div>
);


/* ─────────────────────────────────────────────────────────
   SELECT
───────────────────────────────────────────────────────── */

export const AdminSelect: React.FC<{
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}> = ({
  label,
  value,
  onChange,
  options,
}) => (
  <div style={{ fontFamily: FONT }}>
    {label && (
      <label className="block text-[9px] font-light text-gray-400 mb-2 tracking-[0.2em] uppercase">
        {label}
      </label>
    )}

    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="
        w-full
        px-3
        py-3
        text-sm
        font-light
        border
        border-gray-200
        focus:outline-none
        focus:border-black
        transition-colors
        duration-300
        bg-white
      "
    >
      {options.map(option => (
        <option
          key={option.value}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);


/* ─────────────────────────────────────────────────────────
   PAGE TITLE
───────────────────────────────────────────────────────── */

export const PageTitle: React.FC<{
  title: string;
  subtitle?: string;
}> = ({
  title,
  subtitle,
}) => (
  <div
    className="mb-8 lg:mb-10"
    style={{ fontFamily: FONT }}
  >
    <div className="flex items-end justify-between gap-4">
      <div>
        <h1 className="text-[19px] sm:text-[24px] lg:text-[30px] font-[100] uppercase tracking-[0.12em] sm:tracking-[0.16em] text-black">
          {title}
        </h1>

        {subtitle && (
          <p className="text-[11px] lg:text-xs text-gray-400 mt-2 tracking-[0.06em] font-light">
            {subtitle}
          </p>
        )}
      </div>

      <div className="hidden md:block h-px flex-1 max-w-[160px] bg-gray-100" />
    </div>
  </div>
);


/* ─────────────────────────────────────────────────────────
   TAB BAR
───────────────────────────────────────────────────────── */

export const TabBar: React.FC<{
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}> = ({
  tabs,
  active,
  onChange,
}) => (
  <div
    className="
      flex
      items-center
      gap-1
      mb-8
      overflow-x-auto
      border-b
      border-gray-100
    "
    style={{ fontFamily: FONT }}
  >
    {tabs.map(tab => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`
          relative
          px-4
          py-3
          text-[9px]
          uppercase
          tracking-[0.18em]
          whitespace-nowrap
          transition-colors
          duration-300
          ${
            active === tab.id
              ? 'text-black'
              : 'text-gray-400 hover:text-black'
          }
        `}
      >
        {tab.label}

        {active === tab.id && (
          <span
            className="absolute left-0 right-0 bottom-[-1px] h-px"
            style={{ backgroundColor: ACCENT }}
          />
        )}
      </button>
    ))}
  </div>
);

/* ─────────────────────────────────────────────────────────
   ADMIN TOAST — single source of truth for every admin save
   confirmation / error message. One keyframe, one visual
   style, used by every admin section via useAdminToast().
───────────────────────────────────────────────────────── */

export interface AdminToastMessage {
  id: number;
  type: 'success' | 'error';
  message: string;
}

interface AdminToastContextValue {
  showToast: (type: 'success' | 'error', message: string) => void;
}

const AdminToastContext = React.createContext<AdminToastContextValue | null>(null);

const TOAST_DURATION_MS = 3200;

const AdminToastView: React.FC<{
  toast: AdminToastMessage | null;
  onClose: () => void;
}> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="fixed top-5 right-5 z-[100]"
      style={{
        animation: 'adminToastIn 180ms ease-out forwards',
        fontFamily: FONT,
      }}
    >
      <div
        className={`flex items-center gap-3 min-w-[300px] max-w-[420px] px-4 py-3 bg-white border rounded-xl shadow-xl ${
          toast.type === 'success' ? 'border-green-200' : 'border-red-200'
        }`}
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-600'
              : 'bg-red-50 text-red-600'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={17} />
          ) : (
            <AlertCircle size={17} />
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-medium text-gray-900">
            {toast.type === 'success' ? 'Saved' : 'Action required'}
          </p>

          <p className="text-[11px] text-gray-500 mt-0.5">
            {toast.message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Dismiss notification"
        >
          <X size={14} />
        </button>
      </div>

      <style>{`
        @keyframes adminToastIn {
          from {
            opacity: 0;
            transform: translateY(-8px) translateX(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Wrap any subtree (AdminDashboard, MyAccount, etc.) with this to give
 * every descendant access to useAdminToast(). Renders exactly one
 * <AdminToastView> at the root of the subtree — later toasts replace
 * earlier ones rather than stacking.
 */
export const AdminToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toast, setToast] = React.useState<AdminToastMessage | null>(null);
  const timerRef = React.useRef<number | null>(null);

  const showToast = React.useCallback(
    (type: 'success' | 'error', message: string) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      const id = Date.now();
      setToast({ id, type, message });

      timerRef.current = window.setTimeout(() => {
        setToast(current => (current?.id === id ? null : current));
      }, TOAST_DURATION_MS);
    },
    []
  );

  React.useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      <AdminToastView toast={toast} onClose={() => setToast(null)} />
    </AdminToastContext.Provider>
  );
};

/**
 * Call showToast('success' | 'error', message) from any component
 * rendered under an <AdminToastProvider>. Throws if used outside one,
 * so a missing provider fails loudly instead of silently no-op'ing.
 */
export const useAdminToast = (): AdminToastContextValue => {
  const ctx = React.useContext(AdminToastContext);

  if (!ctx) {
    throw new Error(
      'useAdminToast() must be used within an <AdminToastProvider>.'
    );
  }

  return ctx;
};