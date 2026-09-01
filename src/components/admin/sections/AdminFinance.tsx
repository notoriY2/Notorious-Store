import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { PageTitle, SectionCard, KPICard, Table, LineChart, BarChart } from '../AdminUI';

import {
  getAdminFinance,
  getAdminRevenueChart,
  getAdminRevenueByCategory,
  getAdminRevenueByCountry,
  getAdminOrders,
  AdminRevenueCategory,
  AdminRevenueCountry,
} from '../../../data/admin';

import { AdminFinance as AdminFinanceData, AdminChartPoint, AdminOrder } from '../../../types/admin';

export type FinanceTab = 'overview' | 'transactions' | 'tax' | 'refunds';

interface AdminFinanceProps {
  initialTab?: FinanceTab;
  isActive?: boolean;
}

const pageTitles: Record<FinanceTab, { title: string; subtitle: string }> = {
  overview: {
    title: 'Overview',
    subtitle: 'Revenue, profit, and financial breakdown',
  },
  transactions: {
    title: 'Payments',
    subtitle: 'Recent payment transactions and processing fees',
  },
  tax: {
    title: 'Tax Report',
    subtitle: 'Tax collected by region',
  },
  refunds: {
    title: 'Refunds',
    subtitle: 'Track and review refunded orders',
  },
};

const tabLabels: Record<FinanceTab, string> = {
  overview: 'overview',
  transactions: 'transactions',
  tax: 'Tax Report',
  refunds: 'refunds',
};

const emptyFinance: AdminFinanceData = {
  grossRevenue: 0,
  netRevenue: 0,
  refunds: 0,
  taxes: 0,
  shippingCosts: 0,
  processingFees: 0,
  discounts: 0,
  profit: 0,
};

// ============================================================
// DERIVED "TRANSACTION" ROW
//
// There is no dedicated transactions/payment_transactions getter
// wired up in data/admin.ts yet (the table exists in the schema
// but isn't exposed), so transaction rows are derived from paid /
// refunded orders. Processing fee isn't tracked per-order, so it
// shows as R0 here until that data is exposed.
// ============================================================

interface TransactionRow {
  id: string;
  date: string;
  type: 'Sale' | 'Refund';
  amount: number;
  fee: number;
  net: number;
}

const buildTransactions = (orders: AdminOrder[]): TransactionRow[] =>
  orders
    .filter(order => order.paymentStatus === 'Paid' || order.paymentStatus === 'Refunded')
    .map(order => {
      const isRefund = order.paymentStatus === 'Refunded';
      const amount = isRefund ? -order.total : order.total;

      return {
        id: order.id,
        date: order.date,
        type: isRefund ? 'Refund' : 'Sale',
        amount,
        fee: 0,
        net: amount,
      };
    });

const AdminFinance: React.FC<AdminFinanceProps> = ({ initialTab = 'overview', isActive = true }) => {
  const [tab, setTab] = useState<FinanceTab>(initialTab);

  // AdminDashboard keeps this component mounted across sidebar clicks
  // (Revenue, Payments, and Refunds all route here), so useState's initial
  // value only applies on first mount. Sync whenever initialTab changes.
  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  /* ─────────────────────────────────────────────
     Data loaded from Supabase
  ───────────────────────────────────────────── */

  const [finance, setFinance] = useState<AdminFinanceData>(emptyFinance);
  const [revenueChart, setRevenueChart] = useState<AdminChartPoint[]>([]);
  const [revenueByCategory, setRevenueByCategory] = useState<AdminRevenueCategory[]>([]);
  const [revenueByCountry, setRevenueByCountry] = useState<AdminRevenueCountry[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;

        const loadFinanceData = async () => {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [
          financeData,
          chartData,
          categoryData,
          countryData,
          orderData,
        ] = await Promise.all([
          getAdminFinance(),
          getAdminRevenueChart('30d'),
          getAdminRevenueByCategory(),
          getAdminRevenueByCountry(),
          getAdminOrders(100),
        ]);

        if (cancelled) return;

        setFinance(financeData);
        setRevenueChart(chartData);
        setRevenueByCategory(categoryData);
        setRevenueByCountry(countryData);
        setOrders(orderData);
        setHasLoadedOnce(true);
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to load finance data:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load finance data.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFinanceData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, isActive]);

  /* ─────────────────────────────────────────────
     Derived data
  ───────────────────────────────────────────── */

  const chartData = useMemo(
    () => revenueChart.map(d => ({ label: d.label, value: d.revenue })),
    [revenueChart]
  );

  const transactions = useMemo(
    () => buildTransactions(orders),
    [orders]
  );

  const refundTransactions = useMemo(
    () => transactions.filter(t => t.type === 'Refund'),
    [transactions]
  );

  const totalRefunded = useMemo(
    () => refundTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [refundTransactions]
  );

  const refundCount = refundTransactions.length;

  const averageRefund = refundCount > 0 ? totalRefunded / refundCount : 0;

  const totalSalesVolume = useMemo(
    () =>
      transactions
        .filter(t => t.type === 'Sale')
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const refundRate = totalSalesVolume > 0 ? (totalRefunded / totalSalesVolume) * 100 : 0;

  /* ─────────────────────────────────────────────
     Loading state
  ───────────────────────────────────────────── */

    if (isLoading && !hasLoadedOnce) {
    return (
      <div>
        <PageTitle title={pageTitles[tab].title} subtitle={pageTitles[tab].subtitle} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-24 bg-gray-100 animate-pulse" />
          ))}
        </div>

        <SectionCard title="Loading">
          <div className="h-64 bg-gray-100 animate-pulse" />
        </SectionCard>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Error state
  ───────────────────────────────────────────── */

  if (error) {
    return (
      <div>
        <PageTitle title={pageTitles[tab].title} subtitle={pageTitles[tab].subtitle} />

        <div className="border border-gray-200 bg-white p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-red-500" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Failed to load finance data
              </p>

              <p className="text-sm text-gray-500 mt-1">{error}</p>

              <button
                type="button"
                onClick={() => setReloadKey(current => current + 1)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-xs tracking-wide hover:bg-black transition-colors"
              >
                <RefreshCw size={13} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     Main render
  ───────────────────────────────────────────── */

  return (
    <div>
      <PageTitle title={pageTitles[tab].title} subtitle={pageTitles[tab].subtitle} />

      {tab !== 'overview' && tab !== 'refunds' && (
        <div className="flex items-center space-x-1 mb-6 bg-white rounded-lg border border-gray-200 p-1 w-fit overflow-x-auto">
          {(['transactions', 'tax'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm rounded-md transition-colors capitalize whitespace-nowrap ${
                tab === t
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tabLabels[t]}
            </button>
          ))}
        </div>
      )}

      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Gross Revenue" value={`R${finance.grossRevenue.toLocaleString()}`} />
            <KPICard label="Net Revenue" value={`R${finance.netRevenue.toLocaleString()}`} />
            <KPICard label="Refunds" value={`-R${finance.refunds.toLocaleString()}`} />
            <KPICard label="Profit" value={`R${finance.profit.toLocaleString()}`} />
          </div>

          <SectionCard title="Revenue vs Profit (30 days)">
            {chartData.length > 0 ? (
              <LineChart data={chartData} height={250} />
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">No revenue data for this period.</p>
            )}
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SectionCard title="Financial Breakdown">
              <div className="space-y-3">
                {[
                  { label: 'Gross Revenue', value: finance.grossRevenue, isPositive: true },
                  { label: 'Discounts', value: -finance.discounts, isPositive: false },
                  { label: 'Refunds', value: -finance.refunds, isPositive: false },
                  { label: 'Taxes Collected', value: finance.taxes, isPositive: true },
                  { label: 'Shipping Costs', value: -finance.shippingCosts, isPositive: false },
                  { label: 'Processing Fees', value: -finance.processingFees, isPositive: false },
                  { label: 'Net Revenue', value: finance.netRevenue, isPositive: true, isBold: true },
                  { label: 'Estimated Profit', value: finance.profit, isPositive: true, isBold: true },
                ].map((row, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-2 ${
                      row.isBold ? 'border-t border-gray-200 font-medium' : 'border-b border-gray-50'
                    }`}
                  >
                    <span className={`text-sm ${row.isBold ? 'text-gray-800' : 'text-gray-600'}`}>
                      {row.label}
                    </span>
                    <span className={`text-sm ${row.isPositive ? 'text-gray-800' : 'text-red-500'}`}>
                      R{Math.abs(row.value).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Revenue by Category">
              {revenueByCategory.length > 0 ? (
                <BarChart
                  data={revenueByCategory.map(c => ({ label: c.category, value: c.revenue }))}
                  height={250}
                />
              ) : (
                <p className="text-sm text-gray-400 py-10 text-center">No category revenue yet.</p>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Revenue by Country">
            {revenueByCountry.length > 0 ? (
              <Table headers={['Country', 'Revenue', 'Share']}>
                {revenueByCountry.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{c.country}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">R{c.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full bg-amber-600"
                            style={{ width: `${c.percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{c.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">No country revenue yet.</p>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'transactions' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Total Transactions" value={String(transactions.length)} />
            <KPICard label="Total Volume" value={`R${finance.grossRevenue.toLocaleString()}`} />
            <KPICard label="Processing Fees" value={`R${finance.processingFees.toLocaleString()}`} />
            <KPICard
              label="Net Volume"
              value={`R${(finance.grossRevenue - finance.processingFees).toLocaleString()}`}
            />
          </div>

          <SectionCard title="Recent Transactions">
            {transactions.length > 0 ? (
              <Table headers={['Date', 'Type', 'Amount', 'Fee', 'Net']}>
                {transactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-sm font-medium ${
                          t.type === 'Sale' ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">R{Math.abs(t.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-500">R{t.fee}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">R{t.net.toLocaleString()}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-gray-400 py-6 text-center">No transactions yet.</p>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'tax' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <KPICard label="Taxes Collected" value={`R${finance.taxes.toLocaleString()}`} />
            <KPICard
              label="Taxable Sales"
              value={`R${(finance.grossRevenue - finance.discounts).toLocaleString()}`}
            />
            <KPICard label="Tax Rate" value="15% (VAT)" />
          </div>

          <SectionCard title="Tax Breakdown by Region">
            {revenueByCountry.length > 0 ? (
              <Table headers={['Region', 'Taxable Sales', 'Tax Rate', 'Tax Collected']}>
                {revenueByCountry.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-700">{c.country}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">R{c.revenue.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">15%</td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      R{Math.round(c.revenue * 0.15).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-gray-400 py-10 text-center">No regional tax data yet.</p>
            )}
          </SectionCard>
        </div>
      )}

      {tab === 'refunds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="Total Refunded" value={`R${totalRefunded.toLocaleString()}`} />
            <KPICard label="Refund Count" value={String(refundCount)} />
            <KPICard label="Average Refund" value={`R${averageRefund.toFixed(2)}`} />
            <KPICard label="Refund Rate" value={`${refundRate.toFixed(2)}%`} />
          </div>

          <SectionCard title="Refunded Transactions">
            {refundTransactions.length > 0 ? (
              <Table headers={['Date', 'Amount', 'Net Impact']}>
                {refundTransactions.map(t => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-red-500">-R{Math.abs(t.amount).toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">R{t.net.toLocaleString()}</td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="text-sm text-gray-400 py-6 text-center">No refunds in this period.</p>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
};

export default AdminFinance;