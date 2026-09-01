// src/components/admin/sections/AdminOverview.tsx

import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Percent,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

import {
  KPICard,
  SectionCard,
  StatusBadge,
  LineChart,
  BarChart,
  Table,
  PageTitle,
} from '../AdminUI';

import {
  AdminTimeRange,
  getAdminOverviewData,
} from '../../../data/admin';

import {
  AdminKPI,
  AdminChartPoint,
  AdminProduct,
  AdminOrder,
  AdminInventoryItem,
} from '../../../types/admin';


// ============================================================
// EMPTY STATE
// ============================================================

const emptyKPIs: AdminKPI = {
  revenue: 0,
  orders: 0,
  averageOrderValue: 0,
  customers: 0,
  conversionRate: 0,
  itemsSold: 0,
};


// ============================================================
// TYPES
// ============================================================

interface ChartDataPoint {
  label: string;
  value: number;
}


// ============================================================
// ADMIN OVERVIEW
// ============================================================

interface AdminOverviewProps {
  // Whether this section is the one currently visible in the admin
  // dashboard. AdminDashboard keeps every section mounted (so tab
  // switches don't lose local state like filters/search), so this
  // section must gate its own data fetch on visibility itself —
  // otherwise it fires a query the moment AdminDashboard opens,
  // regardless of which tab the admin is actually looking at.
  isActive?: boolean;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
  isActive = true,
}) => {
  const [timeRange, setTimeRange] =
    useState<AdminTimeRange>('30d');

  const [kpis, setKPIs] =
    useState<AdminKPI>(emptyKPIs);

  const [revenueChart, setRevenueChart] =
    useState<AdminChartPoint[]>([]);

  const [products, setProducts] =
    useState<AdminProduct[]>([]);

  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [inventory, setInventory] =
    useState<AdminInventoryItem[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

    const [reloadKey, setReloadKey] =
    useState(0);

  const [hasLoadedOnce, setHasLoadedOnce] =
    useState(false);


  // ============================================================
  // LOAD DASHBOARD
  // ============================================================

  useEffect(() => {
    // Don't fetch while hidden. This section stays mounted at all
    // times (AdminDashboard just toggles display: none/block), so
    // without this guard it would fire a query the instant the admin
    // panel opens, even if the admin is looking at a different tab.
    if (!isActive) {
      return;
    }

    let cancelled = false;

        const loadDashboard = async () => {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data =
          await getAdminOverviewData(
            timeRange
          );

        if (cancelled) {
          return;
        }

        setKPIs(data.kpis);
        setRevenueChart(data.revenueChart);
        setProducts(data.products);
        setOrders(data.orders);
        setInventory(data.inventory);
        setHasLoadedOnce(true);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load admin overview:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load dashboard data.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [timeRange, reloadKey, isActive]);


  // ============================================================
  // DERIVED DATA
  // ============================================================

  const chartData = useMemo<ChartDataPoint[]>(
    () =>
      revenueChart.map(
        (point: AdminChartPoint) => ({
          label: point.label,
          value: point.revenue,
        })
      ),
    [revenueChart]
  );


  const orderData = useMemo<ChartDataPoint[]>(
    () =>
      revenueChart.map(
        (point: AdminChartPoint) => ({
          label: point.label,
          value: point.orders,
        })
      ),
    [revenueChart]
  );


  const topProducts = useMemo(
    () =>
      [...products]
        .sort(
          (
            a: AdminProduct,
            b: AdminProduct
          ) =>
            b.sales - a.sales
        )
        .slice(0, 5),
    [products]
  );


  const lowStock = useMemo(
    () =>
      inventory.filter(
        (item: AdminInventoryItem) =>
          item.status === 'Low Stock' ||
          item.status === 'Out of Stock'
      ),
    [inventory]
  );


  // ============================================================
  // HELPERS
  // ============================================================

  const formatCurrency = (
    value: number
  ): string =>
    `R${value.toLocaleString(
      'en-ZA',
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }
    )}`;


  const formatNumber = (
    value: number
  ): string =>
    value.toLocaleString('en-ZA');


  const formatOrderDate = (
    value: string | Date
  ): string => {
    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return '—';
    }

    return date.toLocaleDateString(
      'en-ZA',
      {
        day: 'numeric',
        month: 'short',
      }
    );
  };


  // ============================================================
  // LOADING STATE
  // ============================================================

    if (isLoading && !hasLoadedOnce) {
    return (
      <div>
        <PageTitle
          title="Dashboard"
          subtitle="Store performance overview"
        />

        {/* Time range skeleton */}
        <div className="h-10 w-72 bg-gray-100 animate-pulse mb-6" />

        {/* KPI skeletons */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {Array.from({
            length: 6,
          }).map((_, index) => (
            <div
              key={index}
              className="h-24 bg-gray-100 animate-pulse"
            />
          ))}
        </div>

        {/* Chart skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-80 bg-gray-100 animate-pulse" />
          <div className="h-80 bg-gray-100 animate-pulse" />
        </div>

        {/* Lower section skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="h-72 bg-gray-100 animate-pulse" />
          <div className="h-72 bg-gray-100 animate-pulse" />
        </div>

        {/* Orders skeleton */}
        <div className="h-72 bg-gray-100 animate-pulse" />
      </div>
    );
  }


  // ============================================================
  // ERROR STATE
  // ============================================================

  if (error) {
    return (
      <div>
        <PageTitle
          title="Dashboard"
          subtitle="Store performance overview"
        />

        <div className="border border-gray-200 bg-white p-8">

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle
                size={18}
                className="text-red-500"
              />
            </div>

            <div className="flex-1">

              <p className="text-sm font-medium text-gray-900">
                Failed to load dashboard
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setReloadKey(
                    current =>
                      current + 1
                  )
                }
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


  // ============================================================
  // MAIN DASHBOARD
  // ============================================================

  return (
    <div>

      {/* ======================================================
          PAGE TITLE
      ====================================================== */}

      <PageTitle
        title="Dashboard"
        subtitle="Store performance overview"
      />


      {/* ======================================================
          TIME RANGE
      ====================================================== */}

      <div className="flex items-center gap-1 mb-6 bg-white border border-gray-200 p-1 w-fit overflow-x-auto">

        {(
          [
            'today',
            '7d',
            '30d',
            '90d',
          ] as const
        ).map(
          (
            range: AdminTimeRange
          ) => (
            <button
              key={range}
              type="button"
              onClick={() =>
                setTimeRange(range)
              }
              className={`px-4 py-2 text-xs tracking-wide whitespace-nowrap transition-colors ${
                timeRange === range
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {range === 'today'
                ? 'Today'
                : range === '7d'
                ? '7 days'
                : range === '30d'
                ? '30 days'
                : '90 days'}
            </button>
          )
        )}

      </div>


      {/* ======================================================
          KPI ROW
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">

        <KPICard
          label="Revenue"
          value={formatCurrency(
            kpis.revenue
          )}
          icon={
            <DollarSign size={16} />
          }
        />

        <KPICard
          label="Orders"
          value={formatNumber(
            kpis.orders
          )}
          icon={
            <ShoppingCart size={16} />
          }
        />

        <KPICard
          label="Avg Order"
          value={formatCurrency(
            kpis.averageOrderValue
          )}
          icon={
            <TrendingUp size={16} />
          }
        />

        <KPICard
          label="Customers"
          value={formatNumber(
            kpis.customers
          )}
          icon={
            <Users size={16} />
          }
        />

        <KPICard
          label="Conversion"
          value={`${kpis.conversionRate}%`}
          icon={
            <Percent size={16} />
          }
        />

        <KPICard
          label="Items Sold"
          value={formatNumber(
            kpis.itemsSold
          )}
          icon={
            <Package size={16} />
          }
        />

      </div>


      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Revenue */}

        <SectionCard title="Revenue Over Time">

          {chartData.length > 0 ? (
            <LineChart
              data={chartData}
              height={240}
              color="#C44D2B"
            />
          ) : (
            <div className="py-20 text-center">

              <p className="text-sm text-gray-500">
                No revenue data
              </p>

              <p className="text-xs text-gray-400 mt-1">
                There is no recorded revenue for this period.
              </p>

            </div>
          )}

        </SectionCard>


        {/* Orders */}

        <SectionCard title="Orders Over Time">

          {orderData.length > 0 ? (
            <BarChart
              data={orderData}
              height={240}
              color="#555555"
            />
          ) : (
            <div className="py-20 text-center">

              <p className="text-sm text-gray-500">
                No order data
              </p>

              <p className="text-xs text-gray-400 mt-1">
                There are no recorded orders for this period.
              </p>

            </div>
          )}

        </SectionCard>

      </div>


      {/* ======================================================
          TOP PRODUCTS / LOW STOCK
      ====================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* ====================================================
            TOP PRODUCTS
        ==================================================== */}

        <SectionCard title="Top Products">

          {topProducts.length === 0 ? (
            <div className="py-12 text-center">

              <Package
                size={22}
                className="mx-auto text-gray-300"
              />

              <p className="text-sm text-gray-500 mt-3">
                No product sales yet.
              </p>

            </div>
          ) : (
            <Table
              headers={[
                'Product',
                'Units Sold',
                'Revenue',
                'Stock',
              ]}
            >

              {topProducts.map(
                (
                  product: AdminProduct
                ) => {

                  const productRevenue =
                    product.price *
                    product.sales;

                  return (
                    <tr
                      key={product.id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >

                      <td className="py-3 px-4">

                        <div className="flex items-center gap-3">

                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center">
                              <Package
                                size={14}
                                className="text-gray-400"
                              />
                            </div>
                          )}

                          <span className="text-sm text-gray-800">
                            {product.name}
                          </span>

                        </div>

                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatNumber(
                          product.sales
                        )}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatCurrency(
                          productRevenue
                        )}
                      </td>

                      <td className="py-3 px-4">

                        <span
                          className={`text-sm ${
                            product.stock <= 0
                              ? 'text-red-500 font-medium'
                              : product.stock < 5
                              ? 'text-[#C44D2B] font-medium'
                              : 'text-gray-600'
                          }`}
                        >
                          {formatNumber(
                            product.stock
                          )}
                        </span>

                      </td>

                    </tr>
                  );
                }
              )}

            </Table>
          )}

        </SectionCard>


        {/* ====================================================
            LOW STOCK
        ==================================================== */}

        <SectionCard title="Low Stock Alerts">

          {lowStock.length === 0 ? (

            <div className="py-12 text-center">

              <Package
                size={22}
                className="mx-auto text-gray-300"
              />

              <p className="text-sm text-gray-500 mt-3">
                All products well stocked
              </p>

              <p className="text-xs text-gray-400 mt-1">
                No immediate inventory action is required.
              </p>

            </div>

          ) : (

            <div className="space-y-0">

              {lowStock.map(
                (
                  item: AdminInventoryItem
                ) => {

                  const product =
                    products.find(
                      (
                        p: AdminProduct
                      ) =>
                        p.id ===
                        item.productId
                    );

                  return (
                    <div
                      key={
                        item.productId
                      }
                      className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={item.name}
                            className="w-10 h-10 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 flex items-center justify-center shrink-0">
                            <Package
                              size={14}
                              className="text-gray-400"
                            />
                          </div>
                        )}

                        <div className="min-w-0">

                          <p className="text-sm text-gray-800 truncate">
                            {item.name}
                          </p>

                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatNumber(
                              item.totalAvailable
                            )}{' '}
                            total left
                          </p>

                        </div>

                      </div>

                      <StatusBadge
                        status={
                          item.status
                        }
                      />

                    </div>
                  );
                }
              )}

            </div>

          )}

        </SectionCard>

      </div>


      {/* ======================================================
          RECENT ORDERS
      ====================================================== */}

      <SectionCard title="Recent Orders">

        {orders.length === 0 ? (

          <div className="py-12 text-center">

            <ShoppingCart
              size={22}
              className="mx-auto text-gray-300"
            />

            <p className="text-sm text-gray-500 mt-3">
              No orders yet.
            </p>

            <p className="text-xs text-gray-400 mt-1">
              Recent orders will appear here.
            </p>

          </div>

        ) : (

          <Table
            headers={[
              'Order',
              'Customer',
              'Total',
              'Payment',
              'Fulfillment',
              'Date',
            ]}
          >

            {orders.map(
              (
                order: AdminOrder
              ) => (
                <tr
                  key={order.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >

                  <td className="py-3 px-4">

                    <span className="text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </span>

                  </td>

                  <td className="py-3 px-4">

                    <div className="min-w-0">

                      <p className="text-sm text-gray-700 truncate">
                        {order.customerName ||
                          'Guest'}
                      </p>

                      {order.customerEmail && (
                        <p className="text-[10px] text-gray-400 truncate">
                          {order.customerEmail}
                        </p>
                      )}

                    </div>

                  </td>

                  <td className="py-3 px-4 text-sm text-gray-600">
                    {formatCurrency(
                      order.total
                    )}
                  </td>

                  <td className="py-3 px-4">

                    <StatusBadge
                      status={
                        order.paymentStatus
                      }
                    />

                  </td>

                  <td className="py-3 px-4">

                    <StatusBadge
                      status={
                        order.fulfillmentStatus
                      }
                    />

                  </td>

                  <td className="py-3 px-4 text-sm text-gray-500">
                    {formatOrderDate(
                      order.date
                    )}
                  </td>

                </tr>
              )
            )}

          </Table>

        )}

      </SectionCard>

    </div>
  );
};


export default AdminOverview;