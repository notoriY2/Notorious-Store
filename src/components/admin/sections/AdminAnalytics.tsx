import React, { useEffect, useMemo, useState } from 'react';
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Package,
  Eye,
  Users,
  MousePointerClick,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
} from 'lucide-react';

import {
  PageTitle,
  SectionCard,
  KPICard,
  Table,
  StatusBadge,
  LineChart,
  BarChart,
} from '../AdminUI';

import {
  getAdminKPIs,
  getAdminRevenueChart,
  getAdminProducts,
  getAdminRevenueByCategory,
  getAdminRevenueByPayment,
  getAdminRevenueByCountry,
  getAdminOrderStatusCounts,
  getAdminPaymentStatusCounts,      // ADD THIS
  AdminTimeRange,
  AdminOrderStatusCounts,
  AdminPaymentStatusCounts,          // ADD THIS
} from '../../../data/admin';

import { cached } from '../../../lib/adminCache';
import { supabase } from '../../../lib/supabase';

const FONT = "'Helvetica Neue', Arial, sans-serif";
const ACCENT = '#C44D2B';

/* ============================================================
   TYPES
============================================================ */

export type AnalyticsTab =
  | 'overview'
  | 'sales'
  | 'traffic'
  | 'orders'
  | 'products';

interface AdminAnalyticsProps {
  initialTab?: AnalyticsTab;
  // See AdminOverview.tsx for why this exists: sections stay mounted
  // at all times, so each one must gate its own fetch on visibility.
  isActive?: boolean;
}

interface KPIData {
  label: string;
  value: string;
  change?: string;
}

interface RevenueChartItem {
  label: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

interface PaymentRevenue {
  method: string;
  revenue: number;
  percentage: number;
}

interface CountryRevenue {
  country: string;
  revenue: number;
  percentage: number;
}

interface AnalyticsProduct {
  id: string;
  name: string;
  image: string;
  views: number;
  carts: number;
  sales: number;
  conversionRate: number;
  soldOut: boolean;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  change?: string;
}

interface TrafficCountry {
  country: string;
  visitors: number;
  percentage: number;
}

interface DeviceTraffic {
  label: string;
  value: number;
  icon: React.ReactNode;
}

interface TrafficDataPoint {
  label: string;
  value: number;
}

interface TrafficAnalytics {
  trafficData: TrafficDataPoint[];
  sources: TrafficSource[];
  countries: TrafficCountry[];
  devices: DeviceTraffic[];
  visitors: number;
  sessions: number;
  pageViews: number;
  addToCarts: number;
  checkoutStarts: number;
}

/* ============================================================
   HELPERS
============================================================ */

const formatCurrency = (value: number): string =>
  `R${Math.round(value).toLocaleString('en-ZA')}`;

const formatNumber = (value: number): string =>
  Math.round(value).toLocaleString('en-ZA');

const formatPercentage = (value: number): string =>
  `${value.toFixed(1)}%`;

const percentageChange = (
  current: number,
  previous: number
): string => {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%';
  }

  const change =
    ((current - previous) / previous) * 100;

  const rounded = Number(change.toFixed(1));

  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
};

const startOfDay = (date = new Date()): Date => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const daysAgo = (days: number): Date => {
  const date = startOfDay();
  date.setDate(date.getDate() - days);
  return date;
};

const formatChartLabel = (date: Date): string =>
  date.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
  });

/* ============================================================
   TRAFFIC ANALYTICS (PRE-AGGREGATED — UNCACHED)

   Queries the Phase 0 analytics_daily_traffic view instead of
   scanning raw analytics_events rows directly.
============================================================ */

const getTrafficAnalyticsRaw = async (
  days = 7
): Promise<TrafficAnalytics> => {
  const currentStart = daysAgo(days);
  const previousStart = daysAgo(days * 2);

  // Phase 0 provides a pre-aggregated traffic view with the dimensions
  // required by this screen. This replaces the previous raw
  // analytics_events scan and keeps the source/device/country breakdowns
  // server-side.
  const [currentResult, previousResult] = await Promise.all([
    supabase
      .from('analytics_daily_traffic')
      .select(
        'day,event_type,device,source,country,event_count,unique_sessions'
      )
      .gte('day', currentStart.toISOString().slice(0, 10))
      .lte('day', new Date().toISOString().slice(0, 10)),

    supabase
      .from('analytics_daily_traffic')
      .select(
        'day,event_type,device,source,country,event_count,unique_sessions'
      )
      .gte('day', previousStart.toISOString().slice(0, 10))
      .lt('day', currentStart.toISOString().slice(0, 10)),
  ]);

  if (currentResult.error) {
    throw currentResult.error;
  }

  if (previousResult.error) {
    throw previousResult.error;
  }

  type TrafficSummaryRow = {
    day: string;
    event_type: string;
    device: string | null;
    source: string | null;
    country: string | null;
    event_count: number | null;
    unique_sessions: number | null;
  };

  const currentRows =
    (currentResult.data ?? []) as TrafficSummaryRow[];
  const previousRows =
    (previousResult.data ?? []) as TrafficSummaryRow[];

  const pageViewRows = currentRows.filter(
    row => row.event_type === 'page_view'
  );
  const previousPageViewRows = previousRows.filter(
    row => row.event_type === 'page_view'
  );

  const eventCount = (row: TrafficSummaryRow): number =>
    Number(row.event_count ?? 0);

  const sessionCount = (row: TrafficSummaryRow): number =>
    Number(row.unique_sessions ?? 0);

  const pageViews = pageViewRows.reduce(
    (sum, row) => sum + eventCount(row),
    0
  );

  const previousPageViews = previousPageViewRows.reduce(
    (sum, row) => sum + eventCount(row),
    0
  );

  // The extended Phase 0 view is grouped by day + event type +
  // device + source + country. Its unique_sessions value is therefore
  // unique within each dimension bucket; summing buckets is the only
  // aggregation available from this view without scanning raw events.
  const sessions = currentRows.reduce(
    (sum, row) => sum + sessionCount(row),
    0
  );

  const previousSessions = previousRows.reduce(
    (sum, row) => sum + sessionCount(row),
    0
  );

  const addToCarts = currentRows
    .filter(row => row.event_type === 'add_to_cart')
    .reduce((sum, row) => sum + eventCount(row), 0);

  const checkoutStarts = currentRows
    .filter(row => row.event_type === 'checkout_start')
    .reduce((sum, row) => sum + eventCount(row), 0);

  /* ----------------------------------------------------------
     DAILY TRAFFIC
  ---------------------------------------------------------- */

  const dailyMap = new Map<string, number>();

  for (const row of pageViewRows) {
    const key = row.day;
    dailyMap.set(key, (dailyMap.get(key) ?? 0) + eventCount(row));
  }

  const trafficData: TrafficDataPoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = daysAgo(i);
    const key = date.toISOString().slice(0, 10);

    trafficData.push({
      label: formatChartLabel(date),
      value: dailyMap.get(key) ?? 0,
    });
  }

  /* ----------------------------------------------------------
     TRAFFIC SOURCES
  ---------------------------------------------------------- */

  const sourceMap = new Map<string, number>();
  const previousSourceMap = new Map<string, number>();

  for (const row of pageViewRows) {
    const source = row.source?.trim() || 'Direct';
    sourceMap.set(
      source,
      (sourceMap.get(source) ?? 0) + eventCount(row)
    );
  }

  for (const row of previousPageViewRows) {
    const source = row.source?.trim() || 'Direct';
    previousSourceMap.set(
      source,
      (previousSourceMap.get(source) ?? 0) + eventCount(row)
    );
  }

  const totalSourceVisitors = [...sourceMap.values()].reduce(
    (sum, value) => sum + value,
    0
  );

  const sources: TrafficSource[] = [...sourceMap.entries()]
    .map(([source, visitors]) => {
      const previous = previousSourceMap.get(source) ?? 0;

      return {
        source,
        visitors,
        percentage:
          totalSourceVisitors > 0
            ? (visitors / totalSourceVisitors) * 100
            : 0,
        change:
          previous > 0
            ? percentageChange(visitors, previous)
            : undefined,
      };
    })
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);

  /* ----------------------------------------------------------
     DEVICES
  ---------------------------------------------------------- */

  const deviceMap = new Map<string, number>();

  for (const row of pageViewRows) {
    const device = row.device?.trim().toLowerCase() || 'desktop';
    deviceMap.set(
      device,
      (deviceMap.get(device) ?? 0) + eventCount(row)
    );
  }

  const totalDeviceViews = [...deviceMap.values()].reduce(
    (sum, value) => sum + value,
    0
  );

  const devices: DeviceTraffic[] = [
    {
      key: 'mobile',
      label: 'Mobile',
      icon: <Smartphone size={15} strokeWidth={1.5} />,
    },
    {
      key: 'desktop',
      label: 'Desktop',
      icon: <Monitor size={15} strokeWidth={1.5} />,
    },
    {
      key: 'tablet',
      label: 'Tablet',
      icon: <Tablet size={15} strokeWidth={1.5} />,
    },
  ].map(device => ({
    label: device.label,
    icon: device.icon,
    value:
      totalDeviceViews > 0
        ? Number(
            (
              ((deviceMap.get(device.key) ?? 0) /
                totalDeviceViews) *
              100
            ).toFixed(1)
          )
        : 0,
  }));

  /* ----------------------------------------------------------
     COUNTRIES
  ---------------------------------------------------------- */

  const countryMap = new Map<string, number>();

  for (const row of pageViewRows) {
    const country = row.country?.trim() || 'Unknown';
    countryMap.set(
      country,
      (countryMap.get(country) ?? 0) + eventCount(row)
    );
  }

  const totalCountryVisitors = [...countryMap.values()].reduce(
    (sum, value) => sum + value,
    0
  );

  const countries: TrafficCountry[] = [...countryMap.entries()]
    .map(([country, visitors]) => ({
      country,
      visitors,
      percentage:
        totalCountryVisitors > 0
          ? Number(
              (
                (visitors / totalCountryVisitors) *
                100
              ).toFixed(1)
            )
          : 0,
    }))
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, 10);

  return {
    trafficData,
    sources,
    countries,
    devices,
    visitors: pageViews,
    sessions,
    pageViews,
    addToCarts,
    checkoutStarts,
    ...({
      previousPageViews,
      previousSessions,
    } as unknown as Partial<TrafficAnalytics>),
  };
};

/* ============================================================
   TRAFFIC ANALYTICS (CACHED)

   Wraps the expensive raw query above in the same TTL cache used by
   data/admin.ts, keyed by the lookback window.
============================================================ */

const getTrafficAnalytics = async (
  days = 7
): Promise<TrafficAnalytics> =>
  cached(`traffic:${days}`, () =>
    getTrafficAnalyticsRaw(days)
  );

/* ============================================================
   COMPONENT
============================================================ */

const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({
  initialTab = 'overview',
  isActive = true,
}) => {
  const [tab, setTab] =
    useState<AnalyticsTab>(
      initialTab
    );

  const [
    selectedRange,
    setSelectedRange,
  ] = useState<AdminTimeRange>(
    '30d'
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [hasLoadedOnce, setHasLoadedOnce] =
    useState(false);


    const [
  orderStatusCounts,
  setOrderStatusCounts,
] = useState<AdminOrderStatusCounts>({
  processing: 0,
  shipped: 0,
  delivered: 0,
  cancelled: 0,
  pending: 0,
});

const [
  paymentStatusCounts,
  setPaymentStatusCounts,
] = useState<AdminPaymentStatusCounts>({
  paid: 0,
  pending: 0,
  refunded: 0,
  failed: 0,
});

  /* ----------------------------------------------------------
     DATABASE STATE
  ---------------------------------------------------------- */

  const [kpis, setKpis] =
    useState<{
      revenue: number;
      orders: number;
      averageOrderValue: number;
      customers: number;
      conversionRate: number;
      itemsSold: number;
    }>({
      revenue: 0,
      orders: 0,
      averageOrderValue: 0,
      customers: 0,
      conversionRate: 0,
      itemsSold: 0,
    });

  const [
    revenueChart,
    setRevenueChart,
  ] = useState<RevenueChartItem[]>([]);

  const [
    products,
    setProducts,
  ] = useState<AnalyticsProduct[]>(
    []
  );

  const [
    revenueByCategory,
    setRevenueByCategory,
  ] = useState<CategoryRevenue[]>(
    []
  );

  const [
    revenueByPayment,
    setRevenueByPayment,
  ] = useState<PaymentRevenue[]>(
    []
  );

  const [
    revenueByCountry,
    setRevenueByCountry,
  ] = useState<CountryRevenue[]>(
    []
  );

  const [
    traffic,
    setTraffic,
  ] =
    useState<TrafficAnalytics | null>(
      null
    );

    

  /* ----------------------------------------------------------
     INITIAL TAB
  ---------------------------------------------------------- */

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  /* ----------------------------------------------------------
     LOAD DATABASE ANALYTICS
  ---------------------------------------------------------- */

  useEffect(() => {
    // Don't fetch while hidden — see AdminOverview.tsx for why this
    // guard exists on every section.
    if (!isActive) {
      return;
    }

    let cancelled = false;

    // requestCache.ts's concurrency limiter protects the connection pool,
    // so Promise.all is used directly without manual STAGGER_MS wait chains.
        const loadAnalytics =
      async () => {
        if (!hasLoadedOnce) {
          setLoading(true);
        }
        setError(null);

        try {
          const [
            kpiData,
            chartData,
            productData,
            categoryData,
            paymentData,
            countryData,
            trafficData,
            orderStatusData,
            paymentStatusData,
          ] = await Promise.all([
            getAdminKPIs(),
            getAdminRevenueChart(selectedRange),
            getAdminProducts(),
            getAdminRevenueByCategory(),
            getAdminRevenueByPayment(),
            getAdminRevenueByCountry(),
            getTrafficAnalytics(7),
            getAdminOrderStatusCounts(), // ADD THIS
            getAdminPaymentStatusCounts(), // ADD THIS
          ]);

          if (cancelled) return;

          setKpis(kpiData);
          setRevenueChart(chartData);
          setProducts(
            productData.map(
              product => ({
                id: product.id,
                name: product.name,
                image: product.image,
                views: product.views,
                carts: product.carts,
                sales: product.sales,
                conversionRate:
                  product.conversionRate,
                soldOut:
                  product.soldOut,
              })
            )
          );
          setRevenueByCategory(categoryData);
          setRevenueByPayment(paymentData);
          setRevenueByCountry(countryData);
          setTraffic(trafficData);
          setOrderStatusCounts(orderStatusData);
          setPaymentStatusCounts(paymentStatusData);
          setHasLoadedOnce(true);
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            'Failed to load analytics:',
            err
          );

          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load analytics.'
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [selectedRange, isActive]);

  /* ============================================================
     DERIVED DATA
  ============================================================ */

  const salesChart = useMemo(
    () =>
      revenueChart.map(
        item => ({
          label: item.label,
          value: item.revenue,
        })
      ),
    [revenueChart]
  );

  const orderChart = useMemo(
    () =>
      revenueChart.map(
        item => ({
          label: item.label,
          value: item.orders,
        })
      ),
    [revenueChart]
  );

  const sortedByViews = useMemo(
    () =>
      [...products].sort(
        (a, b) =>
          b.views - a.views
      ),
    [products]
  );

  const sortedBySales = useMemo(
    () =>
      [...products].sort(
        (a, b) =>
          b.sales - a.sales
      ),
    [products]
  );

  const zeroSales = useMemo(
    () =>
      products.filter(
        product =>
          product.sales === 0
      ),
    [products]
  );

  const soldOut = useMemo(
    () =>
      products.filter(
        product =>
          product.soldOut
      ),
    [products]
  );

  const totalVisitors =
    traffic?.visitors ?? 0;

  const totalSessions =
    traffic?.sessions ?? 0;

  const trafficConversionRate =
    totalSessions > 0
      ? (kpis.orders /
          totalSessions) *
        100
      : 0;

  /* ============================================================
     SALES STATS
  ============================================================ */

  const salesStats: KPIData[] = [
    {
      label: 'Revenue',
      value: formatCurrency(
        kpis.revenue
      ),
    },
    {
      label: 'Gross Sales',
      value: formatCurrency(
        kpis.revenue
      ),
    },
    {
      label: 'Discounts',
      value: 'R0',
    },
    {
      label: 'Refunds',
      value: '—',
    },
    {
      label: 'Net Sales',
      value: formatCurrency(
        kpis.revenue
      ),
    },
    {
      label: 'Shipping Revenue',
      value: '—',
    },
  ];

  const orderStats: KPIData[] = [
  {
    label: 'Total Orders',
    value: formatNumber(kpis.orders),
  },
  {
    label: 'Completed',
    value: formatNumber(orderStatusCounts.delivered),
  },
  {
    label: 'Pending',
    value: formatNumber(
      orderStatusCounts.pending + orderStatusCounts.processing
    ),
  },
  {
    label: 'Cancelled',
    value: formatNumber(orderStatusCounts.cancelled),
  },
  {
    label: 'Refunded',
    value: formatNumber(paymentStatusCounts.refunded), // was '—'
  },
  {
    label: 'Avg Order Value',
    value: formatCurrency(kpis.averageOrderValue),
  },
  {
    label: 'Items Sold',
    value: formatNumber(kpis.itemsSold),
  },
];

  /* ============================================================
     TRAFFIC KPIS
  ============================================================ */

  const trafficKpis: KPIData[] =
    useMemo(
      () => [
        {
          label: 'Visitors',
          value:
            formatNumber(
              totalVisitors
            ),
        },
        {
          label: 'Sessions',
          value:
            formatNumber(
              totalSessions
            ),
        },
        {
          label: 'Page Views',
          value:
            formatNumber(
              traffic?.pageViews ?? 0
            ),
        },
        {
          label: 'Conversion Rate',
          value:
            formatPercentage(
              trafficConversionRate
            ),
        },
      ],
      [
        totalVisitors,
        totalSessions,
        traffic,
        trafficConversionRate,
      ]
    );

  /* ============================================================
     PAGE TITLE
  ============================================================ */

  const pageTitle = useMemo(
    () => {
      switch (tab) {
        case 'sales':
          return {
            title: 'Sales',
            subtitle:
              'Revenue, orders, and sales performance',
          };

        case 'traffic':
          return {
            title: 'Traffic',
            subtitle:
              'Visitors, acquisition, devices, and storefront activity',
          };

        case 'orders':
          return {
            title: 'Orders',
            subtitle:
              'Order volume and fulfillment performance',
          };

        case 'products':
          return {
            title: 'Products',
            subtitle:
              'Product performance and customer behavior',
          };

        default:
          return {
            title: 'Overview',
            subtitle:
              'Deep dive into store performance',
          };
      }
    },
    [tab]
  );

  /* ============================================================
     TAB BAR VISIBILITY

     - "overview" and "traffic" never appear as buttons here,
       since they're already reachable from the sidebar.
     - The remaining buttons (sales / orders / products) only
       render when we're already on one of those three tabs —
       i.e. the whole sub-tab bar disappears while viewing
       "overview" or "traffic".
  ============================================================ */

  const visibleTabs: AnalyticsTab[] = [
    'sales',
    'orders',
    'products',
  ];

  const showTabBar =
    tab !== 'overview' && tab !== 'traffic';

  /* ============================================================
     LOADING
  ============================================================ */

    if (loading && !hasLoadedOnce) {
    return (
      <div
        style={{
          fontFamily: FONT,
        }}
      >
        <PageTitle
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
        />

        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="w-5 h-5 border border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-4" />

            <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
              Loading analytics
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <div
        style={{
          fontFamily: FONT,
        }}
      >
        <PageTitle
          title={pageTitle.title}
          subtitle={pageTitle.subtitle}
        />

        <div className="border border-red-100 bg-red-50 p-6">
          <p className="text-[9px] uppercase tracking-[0.2em] text-[#C44D2B] mb-2">
            Analytics error
          </p>

          <p className="text-sm text-gray-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="mt-4 px-4 py-2 border border-gray-300 text-[9px] uppercase tracking-[0.15em] hover:border-black transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      style={{
        fontFamily: FONT,
      }}
    >
      <PageTitle
        title={pageTitle.title}
        subtitle={pageTitle.subtitle}
      />

      {/* ========================================================
          ANALYTICS TABS
      ======================================================== */}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {showTabBar ? (
          <div className="flex flex-wrap items-center gap-1 bg-white border border-gray-200 p-1 w-fit">
            {visibleTabs.map(
              analyticsTab => (
                <button
                  key={analyticsTab}
                  type="button"
                  onClick={() =>
                    setTab(
                      analyticsTab
                    )
                  }
                  className={`
                    px-4 py-2
                    text-[10px]
                    uppercase
                    tracking-[0.14em]
                    transition-colors
                    ${
                      tab ===
                      analyticsTab
                        ? 'bg-black text-white'
                        : 'text-gray-500 hover:bg-gray-50'
                    }
                  `}
                >
                  {analyticsTab}
                </button>
              )
            )}
          </div>
        ) : (
          <div />
        )}

        {/* Date range */}
        <div className="flex items-center gap-1">
          {(
            [
              '7d',
              '30d',
              '90d',
            ] as AdminTimeRange[]
          ).map(range => (
            <button
              key={range}
              type="button"
              onClick={() =>
                setSelectedRange(
                  range
                )
              }
              className={`
                px-3 py-2
                text-[9px]
                uppercase
                tracking-[0.12em]
                border
                transition-colors
                ${
                  selectedRange ===
                  range
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-400 border-gray-200 hover:border-gray-400'
                }
              `}
            >
              {range ===
              '7d'
                ? '7 Days'
                : range ===
                    '30d'
                  ? '30 Days'
                  : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================
          OVERVIEW
      ======================================================== */}

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            <KPICard
              label="Revenue"
              value={formatCurrency(
                kpis.revenue
              )}
              icon={
                <DollarSign
                  size={16}
                />
              }
            />

            <KPICard
              label="Orders"
              value={formatNumber(
                kpis.orders
              )}
              icon={
                <ShoppingCart
                  size={16}
                />
              }
            />

            <KPICard
              label="Products"
              value={formatNumber(
                products.length
              )}
              icon={
                <Package
                  size={16}
                />
              }
            />

            <KPICard
              label="Visitors"
              value={formatNumber(
                totalVisitors
              )}
              icon={
                <Eye size={16} />
              }
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <SectionCard
              title="Revenue Trend"
              className="xl:col-span-2"
            >
              {salesChart.length >
              0 ? (
                <LineChart
                  data={
                    salesChart
                  }
                  height={260}
                />
              ) : (
                <EmptyState text="No revenue data available for this period." />
              )}
            </SectionCard>

            <SectionCard title="Store Snapshot">
              <div className="space-y-5">
                {[
                  {
                    label:
                      'Average Order Value',
                    value:
                      formatCurrency(
                        kpis.averageOrderValue
                      ),
                  },
                  {
                    label:
                      'Conversion Rate',
                    value:
                      formatPercentage(
                        kpis.conversionRate
                      ),
                  },
                  {
                    label:
                      'Items Sold',
                    value:
                      formatNumber(
                        kpis.itemsSold
                      ),
                  },
                  {
                    label:
                      'Customers',
                    value:
                      formatNumber(
                        kpis.customers
                      ),
                  },
                ].map(
                  item => (
                    <div
                      key={
                        item.label
                      }
                      className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <span className="text-xs text-gray-500">
                        {
                          item.label
                        }
                      </span>

                      <span className="text-sm font-light text-black">
                        {
                          item.value
                        }
                      </span>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Revenue by Category">
              <div className="space-y-5">
                {revenueByCategory.length ===
                0 ? (
                  <EmptyState text="No category revenue data." />
                ) : (
                  revenueByCategory.map(
                    category => (
                      <div
                        key={
                          category.category
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-600">
                            {
                              category.category
                            }
                          </span>

                          <span className="text-xs text-gray-700">
                            {formatCurrency(
                              category.revenue
                            )}
                          </span>
                        </div>

                        <div className="h-1 bg-gray-100 overflow-hidden">
                          <div
                            className="h-full"
                            style={{
                              width: `${category.percentage}%`,
                              backgroundColor:
                                ACCENT,
                            }}
                          />
                        </div>

                        <div className="text-[9px] text-gray-400 mt-1">
                          {
                            category.percentage
                          }
                          % of revenue
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </SectionCard>

            <SectionCard title="Revenue by Country">
              <Table
                headers={[
                  'Country',
                  'Revenue',
                  'Share',
                ]}
              >
                {revenueByCountry.map(
                  country => (
                    <tr
                      key={
                        country.country
                      }
                      className="border-b border-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {
                          country.country
                        }
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatCurrency(
                          country.revenue
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1 bg-gray-100">
                            <div
                              className="h-full"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor:
                                  ACCENT,
                              }}
                            />
                          </div>

                          <span className="text-[10px] text-gray-500">
                            {
                              country.percentage
                            }
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </Table>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ========================================================
          SALES
      ======================================================== */}

      {tab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {salesStats.map(
              stat => (
                <KPICard
                  key={
                    stat.label
                  }
                  label={
                    stat.label
                  }
                  value={
                    stat.value
                  }
                  change={
                    stat.change
                  }
                />
              )
            )}
          </div>

          <SectionCard title="Sales Revenue">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Paid revenue
                </p>

                <p className="text-3xl font-[100] mt-2">
                  {formatCurrency(
                    kpis.revenue
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-gray-400">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      ACCENT,
                  }}
                />

                Revenue
              </div>
            </div>

            {salesChart.length >
            0 ? (
              <LineChart
                data={
                  salesChart
                }
                height={290}
                color={
                  ACCENT
                }
              />
            ) : (
              <EmptyState text="No sales data available." />
            )}
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Sales Summary">
              <div className="space-y-5">
                {salesStats
                  .slice(
                    0,
                    5
                  )
                  .map(
                    stat => (
                      <div
                        key={
                          stat.label
                        }
                        className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        <span className="text-xs text-gray-500">
                          {
                            stat.label
                          }
                        </span>

                        <span className="text-sm text-gray-800">
                          {
                            stat.value
                          }
                        </span>
                      </div>
                    )
                  )}
              </div>
            </SectionCard>

            <SectionCard title="Revenue by Category">
              <div className="space-y-5">
                {revenueByCategory.map(
                  category => (
                    <div
                      key={
                        category.category
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-600">
                          {
                            category.category
                          }
                        </span>

                        <span className="text-xs text-gray-700">
                          {
                            category.percentage
                          }
                          %
                        </span>
                      </div>

                      <div className="h-1.5 bg-gray-100">
                        <div
                          className="h-full"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor:
                              ACCENT,
                          }}
                        />
                      </div>

                      <p className="text-[9px] text-gray-400 mt-1">
                        {formatCurrency(
                          category.revenue
                        )}
                      </p>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Revenue by Payment Method">
              <Table
                headers={[
                  'Method',
                  'Revenue',
                  'Share',
                ]}
              >
                {revenueByPayment.map(
                  payment => (
                    <tr
                      key={
                        payment.method
                      }
                      className="border-b border-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {
                          payment.method
                        }
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatCurrency(
                          payment.revenue
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] text-gray-500">
                          {
                            payment.percentage
                          }
                          %
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </Table>
            </SectionCard>

            <SectionCard title="Revenue by Country">
              <Table
                headers={[
                  'Country',
                  'Revenue',
                  'Share',
                ]}
              >
                {revenueByCountry.map(
                  country => (
                    <tr
                      key={
                        country.country
                      }
                      className="border-b border-gray-50"
                    >
                      <td className="py-3 px-4 text-sm text-gray-700">
                        {
                          country.country
                        }
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatCurrency(
                          country.revenue
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] text-gray-500">
                          {
                            country.percentage
                          }
                          %
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </Table>
            </SectionCard>
          </div>

          <SectionCard title="Order Performance">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {orderStats
                .slice(
                  0,
                  4
                )
                .map(
                  stat => (
                    <div
                      key={
                        stat.label
                      }
                      className="border-r border-gray-100 last:border-r-0"
                    >
                      <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
                        {
                          stat.label
                        }
                      </p>

                      <p className="text-2xl font-[100] mt-2">
                        {
                          stat.value
                        }
                      </p>
                    </div>
                  )
                )}
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================
          TRAFFIC
      ======================================================== */}

      {tab === 'traffic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {trafficKpis.map(
              kpi => (
                <KPICard
                  key={
                    kpi.label
                  }
                  label={
                    kpi.label
                  }
                  value={
                    kpi.value
                  }
                  change={
                    kpi.change
                  }
                  icon={
                    kpi.label ===
                    'Visitors' ? (
                      <Eye
                        size={16}
                      />
                    ) : kpi.label ===
                      'Sessions' ? (
                      <Users
                        size={16}
                      />
                    ) : kpi.label ===
                      'Page Views' ? (
                      <MousePointerClick
                        size={16}
                      />
                    ) : (
                      <TrendingUp
                        size={16}
                      />
                    )
                  }
                />
              )
            )}
          </div>

          <SectionCard title="Store Traffic — Last 7 Days">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                  Page views
                </p>

                <p className="text-3xl font-[100] mt-2">
                  {formatNumber(
                    traffic?.pageViews ??
                      0
                  )}
                </p>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-gray-500 text-[9px] uppercase tracking-[0.15em]">
                  <ArrowUpRight
                    size={12}
                  />

                  Live data
                </div>

                <p className="text-[9px] text-gray-400 mt-1">
                  analytics_events
                </p>
              </div>
            </div>

            <BarChart
              data={
                traffic?.trafficData ??
                []
              }
              height={270}
              color={
                ACCENT
              }
            />
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Traffic Sources">
              <Table
                headers={[
                  'Source',
                  'Visitors',
                  'Share',
                  'Change',
                ]}
              >
                {(
                  traffic?.sources ??
                  []
                ).map(
                  source => (
                    <tr
                      key={
                        source.source
                      }
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 bg-gray-50 flex items-center justify-center">
                            <Globe
                              size={
                                13
                              }
                              className="text-gray-400"
                            />
                          </div>

                          <span className="text-sm text-gray-700">
                            {
                              source.source
                            }
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatNumber(
                          source.visitors
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-gray-100">
                            <div
                              className="h-full"
                              style={{
                                width: `${source.percentage}%`,
                                backgroundColor:
                                  ACCENT,
                              }}
                            />
                          </div>

                          <span className="text-[10px] text-gray-500">
                            {source.percentage.toFixed(
                              1
                            )}
                            %
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-[10px] text-gray-500">
                          {source.change ??
                            '—'}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </Table>
            </SectionCard>

            <SectionCard title="Visitors by Device">
              <div className="space-y-6">
                {(
                  traffic?.devices ??
                  []
                ).map(
                  device => (
                    <div
                      key={
                        device.label
                      }
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">
                            {
                              device.icon
                            }
                          </span>

                          <span className="text-xs text-gray-600">
                            {
                              device.label
                            }
                          </span>
                        </div>

                        <span className="text-sm font-light">
                          {
                            device.value
                          }
                          %
                        </span>
                      </div>

                      <div className="h-1 bg-gray-100">
                        <div
                          className="h-full"
                          style={{
                            width: `${device.value}%`,
                            backgroundColor:
                              ACCENT,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Traffic by Country">
              <Table
                headers={[
                  'Country',
                  'Visitors',
                  'Share',
                ]}
              >
                {(
                  traffic?.countries ??
                  []
                ).map(
                  country => (
                    <tr
                      key={
                        country.country
                      }
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-700">
                        {
                          country.country
                        }
                      </td>

                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatNumber(
                          country.visitors
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1 bg-gray-100">
                            <div
                              className="h-full"
                              style={{
                                width: `${country.percentage}%`,
                                backgroundColor:
                                  ACCENT,
                              }}
                            />
                          </div>

                          <span className="text-[10px] text-gray-500">
                            {
                              country.percentage
                            }
                            %
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </Table>
            </SectionCard>

            <SectionCard title="Visitor Behavior">
              <div className="grid grid-cols-2 gap-4">
                <BehaviorCard
                  icon={
                    <Eye size={14} />
                  }
                  label="Page Views"
                  value={formatNumber(
                    traffic?.pageViews ??
                      0
                  )}
                  description="Tracked storefront page views"
                />

                <BehaviorCard
                  icon={
                    <Users
                      size={14}
                    />
                  }
                  label="Sessions"
                  value={formatNumber(
                    traffic?.sessions ??
                      0
                  )}
                  description="Unique tracked sessions"
                />

                <BehaviorCard
                  icon={
                    <ShoppingCart
                      size={14}
                    />
                  }
                  label="Add To Cart"
                  value={formatNumber(
                    traffic?.addToCarts ??
                      0
                  )}
                  description="Tracked add-to-cart events"
                />

                <BehaviorCard
                  icon={
                    <TrendingUp
                      size={14}
                    />
                  }
                  label="Checkout Starts"
                  value={formatNumber(
                    traffic?.checkoutStarts ??
                      0
                  )}
                  description="Tracked checkout starts"
                />
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* ========================================================
          ORDERS
      ======================================================== */}

      {tab === 'orders' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
            {orderStats.map(
              stat => (
                <KPICard
                  key={
                    stat.label
                  }
                  label={
                    stat.label
                  }
                  value={
                    stat.value
                  }
                  change={
                    stat.change
                  }
                />
              )
            )}
          </div>

          <SectionCard title="Orders Trend">
            <LineChart
              data={
                orderChart
              }
              height={270}
              color="#555555"
            />
          </SectionCard>

          <SectionCard title="Order Summary">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryMetric
                label="Total Orders"
                value={formatNumber(
                  kpis.orders
                )}
              />

              <SummaryMetric
                label="Average Order"
                value={formatCurrency(
                  kpis.averageOrderValue
                )}
              />

              <SummaryMetric
                label="Items Sold"
                value={formatNumber(
                  kpis.itemsSold
                )}
              />

              <SummaryMetric
                label="Customers"
                value={formatNumber(
                  kpis.customers
                )}
              />
            </div>
          </SectionCard>
        </div>
      )}

      {/* ========================================================
          PRODUCTS
      ======================================================== */}

      {tab === 'products' && (
        <div className="space-y-6">
          <SectionCard title="Product Performance">
            <Table
              headers={[
                'Product',
                'Views',
                'Carts',
                'Sales',
                'Conversion',
              ]}
            >
              {sortedByViews.map(
                product => (
                  <tr
                    key={
                      product.id
                    }
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            product.image
                          }
                          alt={
                            product.name
                          }
                          className="w-8 h-8 object-cover"
                        />

                        <span className="text-sm text-gray-800">
                          {
                            product.name
                          }
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatNumber(
                        product.views
                      )}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatNumber(
                        product.carts
                      )}
                    </td>

                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatNumber(
                        product.sales
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-sm ${
                          product.conversionRate ===
                          0
                            ? 'text-[#C44D2B]'
                            : 'text-gray-700'
                        }`}
                      >
                        {product.conversionRate.toFixed(
                          2
                        )}
                        %
                      </span>
                    </td>
                  </tr>
                )
              )}
            </Table>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Best Sellers">
              <div className="space-y-2">
                {sortedBySales
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      product,
                      index
                    ) => (
                      <div
                        key={
                          product.id
                        }
                        className="flex items-center justify-between py-3 border-b border-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-4">
                            {
                              index +
                              1
                            }
                          </span>

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="w-8 h-8 object-cover"
                          />

                          <span className="text-sm text-gray-700">
                            {
                              product.name
                            }
                          </span>
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatNumber(
                            product.sales
                          )}{' '}
                          sold
                        </span>
                      </div>
                    )
                  )}
              </div>
            </SectionCard>

            <SectionCard title="Most Viewed">
              <div className="space-y-2">
                {sortedByViews
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      product,
                      index
                    ) => (
                      <div
                        key={
                          product.id
                        }
                        className="flex items-center justify-between py-3 border-b border-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 w-4">
                            {
                              index +
                              1
                            }
                          </span>

                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="w-8 h-8 object-cover"
                          />

                          <span className="text-sm text-gray-700">
                            {
                              product.name
                            }
                          </span>
                        </div>

                        <span className="text-xs text-gray-500">
                          {formatNumber(
                            product.views
                          )}{' '}
                          views
                        </span>
                      </div>
                    )
                  )}
              </div>
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Zero Sales">
              {zeroSales.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  All products
                  have sales.
                </p>
              ) : (
                <div className="space-y-2">
                  {zeroSales.map(
                    product => (
                      <div
                        key={
                          product.id
                        }
                        className="flex items-center justify-between py-3 border-b border-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="w-8 h-8 object-cover"
                          />

                          <span className="text-sm text-gray-700">
                            {
                              product.name
                            }
                          </span>
                        </div>

                        <StatusBadge status="Sold Out" />
                      </div>
                    )
                  )}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Frequently Sold Out">
              {soldOut.length ===
              0 ? (
                <p className="text-sm text-gray-500">
                  No sold out
                  products.
                </p>
              ) : (
                <div className="space-y-2">
                  {soldOut.map(
                    product => (
                      <div
                        key={
                          product.id
                        }
                        className="flex items-center justify-between py-3 border-b border-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              product.image
                            }
                            alt={
                              product.name
                            }
                            className="w-8 h-8 object-cover"
                          />

                          <span className="text-sm text-gray-700">
                            {
                              product.name
                            }
                          </span>
                        </div>

                        <StatusBadge status="Sold Out" />
                      </div>
                    )
                  )}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================
   EMPTY STATE
============================================================ */

const EmptyState: React.FC<{
  text: string;
}> = ({ text }) => (
  <div className="py-16 text-center">
    <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
      {text}
    </p>
  </div>
);

/* ============================================================
   BEHAVIOR CARD
============================================================ */

interface BehaviorCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
}

const BehaviorCard: React.FC<BehaviorCardProps> = ({
  icon,
  label,
  value,
  description,
}) => (
  <div className="border border-gray-100 p-5">
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-400">
        {icon}
      </span>

      <span className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
        {label}
      </span>
    </div>

    <p className="text-2xl font-[100]">
      {value}
    </p>

    <p className="text-[9px] text-gray-400 mt-2">
      {description}
    </p>
  </div>
);

/* ============================================================
   SUMMARY METRIC
============================================================ */

interface SummaryMetricProps {
  label: string;
  value: string;
}

const SummaryMetric: React.FC<SummaryMetricProps> = ({
  label,
  value,
}) => (
  <div className="border border-gray-100 p-5">
    <p className="text-[9px] uppercase tracking-[0.18em] text-gray-400">
      {label}
    </p>

    <p className="text-2xl font-[100] mt-2">
      {value}
    </p>
  </div>
);

export default AdminAnalytics;