// src/components/admin/AdminDashboard.tsx

import React, { useEffect, useState, lazy, Suspense } from 'react';

import {
  X,
  LayoutDashboard,
  BarChart3,
  TrendingUp,
  Package,
  Boxes,
  ShoppingCart,
  Users,

  // Marketing
  Tag,
  Mail,
  Clock3,

  // Content
  PanelTop,
  Layers3,
  FolderOpen,

  // Finance
  CreditCard,
  RotateCcw,

  Settings,
  Activity,
  ChevronDown,
  ChevronRight,
  LogOut,
  Store,
  Menu,
  ArrowUpRight,
  Bell,
} from 'lucide-react';

import { User as UserType } from '../../hooks/useAuth';

import { AdminNotificationsDropdown } from './AdminNotificationsDropdown';
import { AdminToastProvider } from './AdminUI';

// Type-only imports are erased at compile time — safe alongside lazy()
// default imports of the same modules, no duplicate bundle entry.
import type { MarketingTab } from './sections/AdminMarketing';
import type { FinanceTab } from './sections/AdminFinance';
import type { SettingsTab } from './sections/AdminSettings';

const AdminOverview = lazy(() => import('./sections/AdminOverview'));
const AdminAnalytics = lazy(() => import('./sections/AdminAnalytics'));
const AdminProducts = lazy(() => import('./sections/AdminProducts'));
const AdminInventory = lazy(() => import('./sections/AdminInventory'));
const AdminOrders = lazy(() => import('./sections/AdminOrders'));
const AdminCustomers = lazy(() => import('./sections/AdminCustomers'));
const AdminMarketing = lazy(() => import('./sections/AdminMarketing'));
const AdminContent = lazy(() => import('./sections/AdminContent'));
const AdminFinance = lazy(() => import('./sections/AdminFinance'));
const AdminSettings = lazy(() => import('./sections/AdminSettings'));
const AdminActivityLog = lazy(() => import('./sections/AdminActivityLog'));

import {
  getAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
  clearAllAdminNotifications,
  AdminNotification,
} from '../../data/admin';

import { supabase } from '../../lib/supabase';

const FONT = "'Helvetica Neue', Arial, sans-serif";

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onSignOut: () => void;
}

type SectionId =
  | 'dashboard'
  | 'analytics'
  | 'sales'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'traffic'
  | 'marketing'
  | 'campaigns'
  | 'abandoned'
  | 'content'
  | 'homepage'
  | 'floor'
  | 'media'
  | 'finance'
  | 'revenue'
  | 'payments'
  | 'refunds'
  | 'settings'
  | 'admins'
  | 'activity';

// ============================================================
// SECTION GROUPS
//
// Several SectionIds route to the same underlying component (e.g.
// 'analytics' / 'sales' / 'traffic' all render <AdminAnalytics> with a
// different initialTab). "Group" here means "which physical component
// this section belongs to" — that's the granularity at which we decide
// whether something has ever been mounted.
// ============================================================

type SectionGroup =
  | 'dashboard'
  | 'analytics'
  | 'products'
  | 'inventory'
  | 'orders'
  | 'customers'
  | 'marketing'
  | 'content'
  | 'finance'
  | 'settings'
  | 'activity';

interface NavItem {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
  available?: boolean;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

/* ============================================================
   ROUTING MAPS
   ============================================================ */

const marketingTabMap: Partial<Record<SectionId, MarketingTab>> = {
  marketing: 'discounts',
  campaigns: 'campaigns',
  abandoned: 'abandoned',
};

const settingsTabMap: Partial<Record<SectionId, SettingsTab>> = {
  settings: 'general',
  admins: 'team',
};

type ContentTab = 'homepage' | 'floor' | 'media';

const contentTabMap: Partial<Record<SectionId, ContentTab>> = {
  homepage: 'homepage',
  floor: 'floor',
  media: 'media',
};

type AnalyticsTab =
  | 'overview'
  | 'sales'
  | 'traffic'
  | 'orders'
  | 'products';

const analyticsTabMap: Partial<Record<SectionId, AnalyticsTab>> = {
  analytics: 'overview',
  sales: 'sales',
  traffic: 'traffic',
};

const settingsHeaderSections: SectionId[] = [
  'settings',
  'admins',
  'activity',
];

const financeTabMap: Partial<Record<SectionId, FinanceTab>> = {
  finance: 'overview',
  revenue: 'overview',
  payments: 'transactions',
  refunds: 'refunds',
};

const storeHeaderSections: SectionId[] = [
  'products',
  'inventory',
  'orders',
  'customers',
];

const analyticsHeaderSections: SectionId[] = [
  'analytics',
  'sales',
  'traffic',
];

/* ============================================================
   SHARED SECTION GROUPS (for routing / visibility)
   ============================================================ */

const analyticsSectionIds: SectionId[] = [
  'analytics',
  'sales',
  'traffic',
];

const marketingSectionIds: SectionId[] = [
  'marketing',
  'campaigns',
  'abandoned',
];

const contentSectionIds: SectionId[] = [
  'homepage',
  'floor',
  'media',
];

const financeSectionIds: SectionId[] = [
  'finance',
  'revenue',
  'payments',
  'refunds',
];

const settingsSectionIds: SectionId[] = [
  'settings',
  'admins',
];

const sectionPrefetchers: Partial<Record<SectionGroup, () => void>> = {
  dashboard: () => import('./sections/AdminOverview'),
  analytics: () => {
    import('./sections/AdminAnalytics');
    import('../../data/admin').then(m => m.getAdminKPIs());
  },
  products: () => {
    import('./sections/AdminProducts');
    import('../../data/admin').then(m => m.getAdminProducts());
  },
  inventory: () => {
    import('./sections/AdminInventory');
    import('../../data/admin').then(m => m.getAdminInventory());
  },
  orders: () => {
    import('./sections/AdminOrders');
    import('../../data/admin').then(m => m.getAdminOrders(100));
  },
  customers: () => import('./sections/AdminCustomers'),
  marketing: () => import('./sections/AdminMarketing'),
  content: () => import('./sections/AdminContent'),
  finance: () => import('./sections/AdminFinance'),
  settings: () => import('./sections/AdminSettings'),
  activity: () => {
    import('./sections/AdminActivityLog');
    import('../../data/admin').then(m => m.getAdminActivity(100));
  },
};

const handleNavHover = (id: SectionId) => {
  sectionPrefetchers[getSectionGroup(id)]?.();
};
// Maps any SectionId to the physical component group it belongs to.
// Used to decide (a) which single component should currently be
// mounted+visible, and (b) whether that component has EVER been
// visited (and should therefore stay mounted going forward to
// preserve its local state, e.g. search text / filters).
const getSectionGroup = (section: SectionId): SectionGroup => {
  if (section === 'dashboard') return 'dashboard';
  if (analyticsSectionIds.includes(section)) return 'analytics';
  if (section === 'products') return 'products';
  if (section === 'inventory') return 'inventory';
  if (section === 'orders') return 'orders';
  if (section === 'customers') return 'customers';
  if (marketingSectionIds.includes(section)) return 'marketing';
  if (contentSectionIds.includes(section)) return 'content';
  if (financeSectionIds.includes(section)) return 'finance';
  if (settingsSectionIds.includes(section)) return 'settings';
  return 'activity';
};

/* ============================================================
   NAVIGATION
   ============================================================ */

const navGroups: NavGroup[] = [
  {
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: <LayoutDashboard size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'Analytics',
    items: [
      {
        id: 'analytics',
        label: 'Overview',
        icon: <BarChart3 size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'sales',
        label: 'Sales',
        icon: <TrendingUp size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'traffic',
        label: 'Traffic',
        icon: <ArrowUpRight size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'Store',
    items: [
      {
        id: 'products',
        label: 'Products',
        icon: <Package size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'inventory',
        label: 'Inventory',
        icon: <Boxes size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'orders',
        label: 'Orders',
        icon: <ShoppingCart size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'customers',
        label: 'Customers',
        icon: <Users size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'Marketing',
    items: [
      {
        id: 'marketing',
        label: 'Discounts',
        icon: <Tag size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        icon: <Mail size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'abandoned',
        label: 'Abandoned Carts',
        icon: <Clock3 size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'Content',
    items: [
      {
        id: 'homepage',
        label: 'Homepage',
        icon: <PanelTop size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'floor',
        label: 'Product Floor',
        icon: <Layers3 size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'media',
        label: 'Media Library',
        icon: <FolderOpen size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'Finance',
    items: [
      {
        id: 'revenue',
        label: 'Revenue',
        icon: <TrendingUp size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'payments',
        label: 'Payments',
        icon: <CreditCard size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'refunds',
        label: 'Refunds',
        icon: <RotateCcw size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },

  {
    label: 'System',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'admins',
        label: 'Admin Users',
        icon: <Users size={18} strokeWidth={1.5} />,
        available: true,
      },
      {
        id: 'activity',
        label: 'Activity Log',
        icon: <Activity size={18} strokeWidth={1.5} />,
        available: true,
      },
    ],
  },
];

const SectionFallback: React.FC = () => (
  <div className="space-y-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-20 bg-gray-100 animate-pulse" />
    ))}
  </div>
);

/* ============================================================
   COMPONENT
   ============================================================ */

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  user,
  onSignOut,
}) => {
  const [activeSection, setActiveSection] =
    useState<SectionId>('dashboard');

  // Which component groups have ever been visited. A group's component
  // is only rendered into the tree once its group appears here — this
  // is what makes each admin page load on-demand instead of every
  // section firing its data fetch the instant the dashboard opens.
  // 'dashboard' starts pre-visited since it's the section shown on open.
  const [visitedGroups, setVisitedGroups] =
    useState<Set<SectionGroup>>(new Set<SectionGroup>(['dashboard']));

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [expandedGroups, setExpandedGroups] =
    useState<Set<string>>(
      new Set([
        'Analytics',
        'Store',
        'Marketing',
        'Content',
        'Finance',
        'System',
      ])
    );

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  /* ============================================================
     NOTIFICATIONS

     Only runs once someone is actually viewing the admin panel AND is
     a confirmed admin. This is a single query + a realtime channel —
     not part of the request-burst problem — so it's left as-is.
     ============================================================ */

  useEffect(() => {
    if (!isOpen || !user?.isAdmin) {
      return;
    }

    let cancelled = false;

    getAdminNotifications(30)
      .then(data => {
        if (!cancelled) {
          setNotifications(data);
        }
      })
      .catch(error => {
        console.error(
          'Failed to load notifications:',
          error
        );
      });

    const channel = supabase
      .channel('admin_notifications_live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
        },
        payload => {
          const row = payload.new as any;

          setNotifications(prev => [
            {
              id: row.id,
              title: row.title,
              description: row.description,
              type: row.type,
              read: row.read,
              createdAt: row.created_at,
            },
            ...prev,
          ]);
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [isOpen, user?.isAdmin]);

  /* ============================================================
     NO BULK PREFETCH

     There used to be a second effect here that fired all ~12 admin
     data getters (several of which internally fan out into 5-6 MORE
     queries each) the instant the dashboard opened, "to warm the
     cache ahead of time." That's what caused a burst of 25-30+
     simultaneous requests against Supabase, which under a small
     connection pool caused queueing long enough to blow past
     statement_timeout — for this AND unrelated queries elsewhere in
     the app (e.g. the public storefront's product fetch).

     That prefetch is intentionally removed. Every section below now
     fetches its own data, gated on `isActive`, and only mounts at all
     once its group has been visited (see visitedGroups). Opening the
     dashboard now means "load the Dashboard/Overview tab" — nothing
     else — and switching tabs loads exactly one section's data at a
     time, through the shared cache + concurrency limiter in
     lib/adminCache.ts / lib/requestCache.ts.
     ============================================================ */

  /* ============================================================
     NOTIFICATION ACTIONS
     ============================================================ */

  const unreadCount = notifications.filter(
    notification => !notification.read
  ).length;

  const handleMarkAsRead = async (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    try {
      await markAdminNotificationRead(id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(notification => ({
        ...notification,
        read: true,
      }))
    );

    try {
      await markAllAdminNotificationsRead();
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);

    try {
      await clearAllAdminNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  /* ============================================================
     EARLY RETURN
     ============================================================ */

  if (!isOpen) {
    return null;
  }
  

  /* ============================================================
     NAVIGATION HANDLERS
     ============================================================ */

  const handleSectionClick = (
    id: SectionId,
    available = true
  ) => {
    if (!available) {
      return;
    }

    setActiveSection(id);

    // Mark this section's component group as visited so it mounts
    // (and its data effects fire) for the first time right now — and
    // stays mounted afterward so its local state (search, filters,
    // selections) survives future tab switches.
    setVisitedGroups(prev => {
      const group = getSectionGroup(id);

      if (prev.has(group)) {
        return prev;
      }

      const next = new Set(prev);
      next.add(group);
      return next;
    });

    setMobileSidebarOpen(false);
  };

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);

      if (next.has(label)) {
        next.delete(label);
      } else {
        next.add(label);
      }

      return next;
    });
  };

  /* ============================================================
     CURRENT HEADER LABEL
     ============================================================ */

  const currentLabel = marketingTabMap[activeSection]
    ? 'Marketing'
    : settingsHeaderSections.includes(activeSection)
    ? 'System'
    : financeTabMap[activeSection]
    ? 'Finance'
    : storeHeaderSections.includes(activeSection)
    ? 'Store'
    : analyticsHeaderSections.includes(activeSection)
    ? 'Analytics'
    : navGroups
        .flatMap(group => group.items)
        .find(item => item.id === activeSection)?.label ||
      'Dashboard';

  /* ============================================================
     RENDER
     ============================================================ */

    return (
    <AdminToastProvider>
    <div
      className="fixed inset-x-0 top-0 h-[100dvh] z-[60] flex bg-white text-black overflow-hidden"
      style={{ fontFamily: FONT }}
    >
      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileSidebarOpen && (
        <div
          className="fixed inset-x-0 top-0 h-[100dvh] bg-black/30 backdrop-blur-[2px] z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
  className={`
    fixed lg:static
    inset-y-0 left-0
    w-[260px]
    bg-white
    border-r border-gray-100
    lg:shadow-none shadow-2xl
    flex flex-col
    z-40
    transform
    transition-transform
    duration-300
    ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}
>
        {/* ====================================================
            BRAND
            ==================================================== */}

        <div className="px-6 py-6 border-b border-gray-100">
          <a
            href="/"
            className="flex items-center gap-3 group"
            aria-label="Go to storefront"
          >
            <img
              src="/logo/13 (1).png"
              alt="Notorious Y2"
              className="w-11 h-11 object-contain"
            />

            <div className="min-w-0">
              <div className="text-[18px] tracking-[0.28em] font-[100] text-black">
                Notorious.Y2
              </div>

              <div className="text-[11px] text-gray-400 tracking-[0.22em] uppercase mt-1">
                Admin
              </div>
            </div>
          </a>
        </div>

        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav className="flex-1 overflow-y-auto py-5">
          {navGroups.map((group, groupIndex) => {
            const isExpanded =
              !group.label ||
              expandedGroups.has(group.label);

            return (
              <div
                key={`${group.label || 'root'}-${groupIndex}`}
                className="mb-3"
              >
                {group.label && (
                  <button
                    type="button"
                    onClick={() =>
                      toggleGroup(group.label!)
                    }
                    className="
                      w-full
                      flex
                      items-center
                      justify-between
                      px-6
                      py-2.5
                      text-[9px]
                      uppercase
                      tracking-[0.25em]
                      text-gray-400
                      hover:text-black
                      transition-colors
                    "
                  >
                    <span>{group.label}</span>

                    {isExpanded ? (
                      <ChevronDown size={11} strokeWidth={1.5} />
                    ) : (
                      <ChevronRight size={11} strokeWidth={1.5} />
                    )}
                  </button>
                )}

                {isExpanded && (
                  <div className="space-y-0.5">
                    {group.items.map(item => {
                      const active =
                        activeSection === item.id &&
                        item.available;

                      return (
                        <button
                          key={`${group.label}-${item.id}-${item.label}`}
                          type="button"
                          disabled={!item.available}
                          onMouseEnter={() =>
                            item.available && handleNavHover(item.id)
                          }
                          onClick={() =>
                            handleSectionClick(
                              item.id,
                              item.available
                            )
                          }
                          className={`
                            group
                            w-full
                            flex
                            items-center
                            gap-3
                            px-6
                            py-2.5
                            text-left
                            border-l
                            transition-all
                            duration-200

                            ${
                              active
                                ? `
                                  border-[#C44D2B]
                                  bg-gray-50
                                  text-black
                                `
                                : `
                                  border-transparent
                                  text-gray-500
                                  hover:bg-gray-50
                                  hover:text-black
                                `
                            }

                            ${
                              !item.available
                                ? `
                                  opacity-40
                                  cursor-not-allowed
                                `
                                : 'cursor-pointer'
                            }
                          `}
                        >
                          <span
                            className={
                              active
                                ? 'text-[#C44D2B]'
                                : 'text-gray-400 group-hover:text-gray-700'
                            }
                          >
                            {item.icon}
                          </span>

                          <span className="flex-1 text-[13px] font-[100] tracking-[0.12em]">
                            {item.label}
                          </span>

                          {!item.available && (
                            <span className="text-[7px] uppercase tracking-[0.15em] text-gray-300">
                              Soon
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ====================================================
            BOTTOM USER AREA
            ==================================================== */}

        <div className="border-t border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-light">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>

            <div className="min-w-0">
              <p className="text-[13px] font-light text-black truncate">
                {user?.name || 'Admin'}
              </p>

              <p className="text-[9px] text-gray-400 truncate mt-0.5">
                {user?.email || 'Administrator'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <a
              href="/"
              className="
                flex
                items-center
                justify-center
                gap-2
                py-2.5
                border
                border-gray-200
                text-[9px]
                uppercase
                tracking-[0.15em]
                text-gray-500
                hover:border-black
                hover:text-black
                transition-colors
              "
            >
              <Store size={11} strokeWidth={1.5} />
              Store
            </a>

            <button
              type="button"
              onClick={() => {
                onSignOut();
                onClose();
              }}
              className="
                flex
                items-center
                justify-center
                gap-2
                py-2.5
                border
                border-gray-200
                text-[9px]
                uppercase
                tracking-[0.15em]
                text-gray-500
                hover:border-[#C44D2B]
                hover:text-[#C44D2B]
                transition-colors
              "
            >
              <LogOut size={11} strokeWidth={1.5} />
              Exit
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================
          MAIN APPLICATION AREA
          ====================================================== */}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden bg-[#fafafa]">
        {/* ====================================================
            TOP HEADER
            ==================================================== */}

        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-gray-100">
          <div className="h-[72px] px-4 lg:px-8 flex items-center justify-between">
            {/* LEFT SIDE */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(true)}
                className="
                  lg:hidden
                  p-2
                  text-gray-500
                  hover:text-black
                  hover:bg-gray-50
                  transition-colors
                "
                aria-label="Open menu"
              >
                <Menu size={19} strokeWidth={1.5} />
              </button>

              <div>
                <div className="text-[9px] uppercase tracking-[0.28em] text-gray-400 mb-1">
                  Notorious.Y2 / ADMIN
                </div>

                <h2 className="text-sm lg:text-base uppercase tracking-[0.2em] font-[100]">
                  {currentLabel}
                </h2>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* LIVE STORE */}
              <div className="hidden xl:flex items-center gap-2 text-[9px] text-gray-400 tracking-[0.15em] uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C44D2B]" />
                Live Store
              </div>

              {/* NOTIFICATIONS */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setNotificationsOpen(previous => !previous)
                  }
                  className="
                    hidden
                    sm:flex
                    p-2
                    text-gray-400
                    hover:text-black
                    hover:bg-gray-50
                    transition-colors
                    relative
                  "
                  aria-label="Notifications"
                  aria-expanded={notificationsOpen}
                >
                  <Bell size={16} strokeWidth={1.5} />

                  {unreadCount > 0 && (
                    <span
                      className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#C44D2B' }}
                    />
                  )}
                </button>

                <AdminNotificationsDropdown
                  isOpen={notificationsOpen}
                  onClose={() => setNotificationsOpen(false)}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllAsRead}
                  onClearAll={handleClearAll}
                />
              </div>

              {/* VIEW STORE */}
              <a
                href="/"
                className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  px-3
                  py-2
                  border
                  border-gray-200
                  text-[9px]
                  uppercase
                  tracking-[0.16em]
                  text-gray-500
                  hover:border-black
                  hover:text-black
                  transition-colors
                "
              >
                <Store size={12} strokeWidth={1.5} />
                View Store
              </a>

              {/* CLOSE ADMIN */}
              <button
                type="button"
                onClick={onClose}
                className="
                  p-2
                  text-gray-400
                  hover:text-black
                  hover:bg-gray-50
                  transition-colors
                "
                aria-label="Close admin"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        {user?.adminRole === 'Viewer' && (
  <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs text-amber-800">
    You're viewing in read-only mode. Changes you make here will not be saved.
  </div>
)}

        {/* ====================================================
            PAGE CONTENT

            Each section below is only rendered into the tree once its
            group has been visited (see visitedGroups). Before that,
            nothing is mounted — no component, no effect, no fetch. On
            first visit it mounts and fetches its own data; after that
            it just toggles display:none/block like before, so local
            state (search text, filters, selections) survives tab
            switches without ever having queried the DB prematurely.
            ==================================================== */}

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10">

            {/* DASHBOARD */}
            {visitedGroups.has('dashboard') && (
  <div style={{ display: activeSection === 'dashboard' ? 'block' : 'none' }}>
    <Suspense fallback={<SectionFallback />}>
      <AdminOverview isActive={activeSection === 'dashboard'} />
    </Suspense>
  </div>
)}

            {/* ANALYTICS */}
            {visitedGroups.has('analytics') && (
              <div
                style={{
                  display: analyticsSectionIds.includes(activeSection)
                    ? 'block'
                    : 'none',
                }}
              >
                <AdminAnalytics
                  initialTab={analyticsTabMap[activeSection] ?? 'overview'}
                  isActive={analyticsSectionIds.includes(activeSection)}
                />
              </div>
            )}

            {/* PRODUCTS */}
            {visitedGroups.has('products') && (
              <div
                style={{
                  display: activeSection === 'products' ? 'block' : 'none',
                }}
              >
                <AdminProducts isActive={activeSection === 'products'} />
              </div>
            )}

            {/* INVENTORY */}
            {visitedGroups.has('inventory') && (
              <div
                style={{
                  display: activeSection === 'inventory' ? 'block' : 'none',
                }}
              >
                <AdminInventory isActive={activeSection === 'inventory'} />
              </div>
            )}

            {/* ORDERS */}
            {visitedGroups.has('orders') && (
              <div
                style={{
                  display: activeSection === 'orders' ? 'block' : 'none',
                }}
              >
                <AdminOrders isActive={activeSection === 'orders'} />
              </div>
            )}

            {/* CUSTOMERS */}
            {visitedGroups.has('customers') && (
              <div
                style={{
                  display: activeSection === 'customers' ? 'block' : 'none',
                }}
              >
                <AdminCustomers isActive={activeSection === 'customers'} />
              </div>
            )}

            {/* MARKETING */}
            {visitedGroups.has('marketing') && (
              <div
                style={{
                  display: marketingSectionIds.includes(activeSection)
                    ? 'block'
                    : 'none',
                }}
              >
                <AdminMarketing
                  initialTab={marketingTabMap[activeSection] ?? 'discounts'}
                  isActive={marketingSectionIds.includes(activeSection)}
                />
              </div>
            )}

            {/* CONTENT */}
            {visitedGroups.has('content') && (
              <div
                style={{
                  display: contentSectionIds.includes(activeSection)
                    ? 'block'
                    : 'none',
                }}
              >
                <AdminContent
                  initialTab={contentTabMap[activeSection] ?? 'homepage'}
                  isActive={contentSectionIds.includes(activeSection)}
                />
              </div>
            )}

            {/* FINANCE */}
            {visitedGroups.has('finance') && (
              <div
                style={{
                  display: financeSectionIds.includes(activeSection)
                    ? 'block'
                    : 'none',
                }}
              >
                <AdminFinance
                  initialTab={financeTabMap[activeSection] ?? 'overview'}
                  isActive={financeSectionIds.includes(activeSection)}
                />
              </div>
            )}

            {/* SETTINGS */}
            {visitedGroups.has('settings') && (
              <div
                style={{
                  display: settingsSectionIds.includes(activeSection)
                    ? 'block'
                    : 'none',
                }}
              >
                <AdminSettings
                  initialTab={settingsTabMap[activeSection] ?? 'general'}
                  isActive={settingsSectionIds.includes(activeSection)}
                />
              </div>
            )}

            {/* ACTIVITY LOG */}
            {visitedGroups.has('activity') && (
              <div
                style={{
                  display: activeSection === 'activity' ? 'block' : 'none',
                }}
              >
                <AdminActivityLog isActive={activeSection === 'activity'} />
              </div>
            )}

          </div>
        </main>
            </div>
    </div>
    </AdminToastProvider>
  );
};

export default AdminDashboard;