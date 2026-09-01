import React, { useEffect, useMemo, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  ShoppingBag,
  Clock,
  DollarSign,
  Users,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  PageTitle,
  SectionCard,
  StatusBadge,
  Table,
  KPICard,
} from '../AdminUI';

import {
  getAdminCustomers,
  getAdminOrders,
} from '../../../data/admin';

import {
  AdminCustomer,
  AdminOrder,
} from '../../../types/admin';


// ============================================================
// CUSTOMER PROFILE
// ============================================================

interface CustomerProfileProps {
  customer: AdminCustomer;
  orders: AdminOrder[];
  onClose: () => void;
}

const CustomerProfile: React.FC<CustomerProfileProps> = ({
  customer,
  orders,
  onClose,
}) => {
  const customerOrders = orders.filter(
    order =>
      order.customerEmail?.toLowerCase() ===
      customer.email?.toLowerCase()
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">

          <div className="flex items-center gap-3 min-w-0">

            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium shrink-0">
              {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-light text-gray-900 truncate">
                {customer.name}
              </h2>

              <p className="text-xs text-gray-500 truncate">
                {customer.email}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            aria-label="Close customer profile"
          >
            <X size={20} />
          </button>

        </div>


        {/* ==================================================
            CONTENT
        ================================================== */}

        <div className="p-6 space-y-6">

          {/* ==================================================
              STATS
          ================================================== */}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <ShoppingBag
                  size={14}
                  className="text-gray-400"
                />

                <span className="text-xs text-gray-500">
                  Orders
                </span>
              </div>

              <p className="text-lg font-light text-gray-900">
                {customer.orders}
              </p>
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign
                  size={14}
                  className="text-gray-400"
                />

                <span className="text-xs text-gray-500">
                  Lifetime Value
                </span>
              </div>

              <p className="text-lg font-light text-gray-900">
                R{customer.totalSpent.toLocaleString('en-ZA')}
              </p>
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign
                  size={14}
                  className="text-gray-400"
                />

                <span className="text-xs text-gray-500">
                  Avg Order
                </span>
              </div>

              <p className="text-lg font-light text-gray-900">
                R{customer.averageOrder.toLocaleString('en-ZA')}
              </p>
            </div>


            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock
                  size={14}
                  className="text-gray-400"
                />

                <span className="text-xs text-gray-500">
                  First Purchase
                </span>
              </div>

              <p className="text-sm text-gray-700">
                {customer.firstPurchase
                  ? new Date(
                      customer.firstPurchase
                    ).toLocaleDateString('en-ZA', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>

          </div>


          {/* ==================================================
              ACCOUNT STATUS
          ================================================== */}

          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Account Status:
            </span>

            <StatusBadge
              status={customer.status}
            />
          </div>


          {/* ==================================================
              PURCHASE HISTORY
          ================================================== */}

          <div>

            <div className="flex items-center justify-between mb-3">

              <h3 className="text-sm font-medium text-gray-700">
                Purchase History
              </h3>

              <span className="text-xs text-gray-400">
                {customerOrders.length} order
                {customerOrders.length === 1 ? '' : 's'}
              </span>

            </div>

            {customerOrders.length === 0 ? (

              <div className="border border-gray-100 bg-gray-50 p-6 text-center">
                <ShoppingBag
                  size={20}
                  className="mx-auto text-gray-300"
                />

                <p className="text-sm text-gray-500 mt-2">
                  No orders found
                </p>
              </div>

            ) : (

              <div className="space-y-2">

                {customerOrders.map(order => (

                  <div
                    key={order.id}
                    className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-lg"
                  >

                    <div className="min-w-0">

                      <p className="text-sm text-gray-800">
                        {order.orderNumber}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(
                          order.date
                        ).toLocaleDateString('en-ZA', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>

                    </div>

                    <div className="flex items-center gap-3 shrink-0">

                      <span className="text-sm text-gray-600">
                        R{order.total.toLocaleString('en-ZA')}
                      </span>

                      <StatusBadge
                        status={order.fulfillmentStatus}
                      />

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>


          {/* ==================================================
              CONTACT
          ================================================== */}

          <div>

            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Contact
            </h3>

            <div className="flex flex-wrap gap-3">

              <a
                href={`mailto:${customer.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Mail size={14} />
                Email
              </a>

              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-400 cursor-not-allowed"
              >
                <Phone size={14} />
                Call
              </button>

            </div>

          </div>


          {/* ==================================================
              NOTES
          ================================================== */}

          <div>

            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Customer Notes
            </h3>

            <textarea
              placeholder="Add a note about this customer..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 transition-colors resize-none"
            />

          </div>

        </div>

      </div>
    </div>
  );
};


// ============================================================
// ADMIN CUSTOMERS
// ============================================================

const AdminCustomers: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {

  const [customers, setCustomers] =
    useState<AdminCustomer[]>([]);

  const [orders, setOrders] =
    useState<AdminOrder[]>([]);

  const [search, setSearch] =
    useState('');

  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

    const [reloadKey, setReloadKey] =
    useState(0);

  const [hasLoadedOnce, setHasLoadedOnce] =
    useState(false);


  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;

        const loadCustomers = async () => {

      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      setError(null);

      try {

        const [
          customerData,
          orderData,
        ] = await Promise.all([
          getAdminCustomers(),
          getAdminOrders(100),
        ]);

        if (cancelled) {
          return;
        }

        setCustomers(customerData);
        setOrders(orderData);
        setHasLoadedOnce(true);

      } catch (err) {

        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load customers:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load customers.'
        );

      } finally {

        if (!cancelled) {
          setIsLoading(false);
        }

      }

    };

    loadCustomers();

    return () => {
      cancelled = true;
    };

  }, [reloadKey, isActive]);


  // ============================================================
  // FILTER
  // ============================================================

  const filtered = useMemo(() => {

    const query =
      search.trim().toLowerCase();

    if (!query) {
      return customers;
    }

    return customers.filter(customer =>
      customer.name
        .toLowerCase()
        .includes(query) ||
      customer.email
        .toLowerCase()
        .includes(query)
    );

  }, [
    customers,
    search,
  ]);


  // ============================================================
  // CUSTOMER METRICS
  // ============================================================

  const totalCustomers =
    customers.length;

  const vipCustomers =
    customers.filter(
      customer =>
        customer.status === 'VIP'
    ).length;

  const activeCustomers =
    customers.filter(
      customer =>
        customer.status === 'Active'
    ).length;

  const averageLifetimeValue =
    totalCustomers > 0
      ? Math.round(
          customers.reduce(
            (sum, customer) =>
              sum +
              customer.totalSpent,
            0
          ) / totalCustomers
        )
      : 0;


  // ============================================================
  // LOADING
  // ============================================================

    if (isLoading && !hasLoadedOnce) {

    return (
      <div>

        <PageTitle
          title="Customers"
          subtitle="Customer database and profiles"
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

          {Array.from({
            length: 4,
          }).map((_, index) => (

            <div
              key={index}
              className="h-24 bg-gray-100 animate-pulse"
            />

          ))}

        </div>

        <div className="h-10 w-full max-w-md bg-gray-100 animate-pulse mb-6" />

        <SectionCard title="Customers">

          <div className="space-y-0">

            {Array.from({
              length: 7,
            }).map((_, index) => (

              <div
                key={index}
                className="h-14 border-b border-gray-50 bg-gray-50/50 animate-pulse"
              />

            ))}

          </div>

        </SectionCard>

      </div>
    );
  }


  // ============================================================
  // ERROR
  // ============================================================

  if (error) {

    return (
      <div>

        <PageTitle
          title="Customers"
          subtitle="Customer database and profiles"
        />

        <div className="border border-gray-200 bg-white p-8">

          <div className="flex items-start gap-4">

            <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
              <Users
                size={18}
                className="text-red-500"
              />
            </div>

            <div className="flex-1">

              <p className="text-sm font-medium text-gray-900">
                Failed to load customers
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setReloadKey(
                    current => current + 1
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
  // MAIN
  // ============================================================

  return (
    <div>

      <PageTitle
        title="Customers"
        subtitle="Customer database and profiles"
      />


      {/* ======================================================
          CUSTOMER PROFILE
      ====================================================== */}

      {selectedCustomer && (
        <CustomerProfile
          customer={selectedCustomer}
          orders={orders}
          onClose={() =>
            setSelectedCustomer(null)
          }
        />
      )}


      {/* ======================================================
          KPIs
      ====================================================== */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">

        <KPICard
          label="Total Customers"
          value={totalCustomers.toLocaleString('en-ZA')}
        />

        <KPICard
          label="VIP Customers"
          value={vipCustomers.toLocaleString('en-ZA')}
        />

        <KPICard
          label="Active"
          value={activeCustomers.toLocaleString('en-ZA')}
        />

        <KPICard
          label="Avg Lifetime Value"
          value={`R${averageLifetimeValue.toLocaleString('en-ZA')}`}
        />

      </div>


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="relative mb-6 max-w-md">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={event =>
            setSearch(event.target.value)
          }
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 bg-white rounded-lg focus:outline-none focus:border-gray-400 transition-colors"
        />

      </div>


      {/* ======================================================
          CUSTOMER TABLE
      ====================================================== */}

      <SectionCard
        title={`Customers (${filtered.length})`}
      >

        {filtered.length === 0 ? (

          <div className="py-16 text-center">

            <Users
              size={24}
              className="mx-auto text-gray-300"
            />

            <p className="text-sm text-gray-500 mt-3">
              {search
                ? 'No customers match your search.'
                : 'No customers found.'}
            </p>

          </div>

        ) : (

          <Table
            headers={[
              'Customer',
              'Email',
              'Orders',
              'Total Spent',
              'Last Order',
              'Status',
              '',
            ]}
          >

            {filtered.map(customer => (

              <tr
                key={customer.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() =>
                  setSelectedCustomer(customer)
                }
              >

                <td className="py-3 px-4 text-sm text-gray-800">
                  {customer.name}
                </td>

                <td className="py-3 px-4 text-sm text-gray-500">
                  {customer.email}
                </td>

                <td className="py-3 px-4 text-sm text-gray-600">
                  {customer.orders}
                </td>

                <td className="py-3 px-4 text-sm text-gray-600">
                  R{customer.totalSpent.toLocaleString('en-ZA')}
                </td>

                <td className="py-3 px-4 text-sm text-gray-500">

                  {customer.lastOrder
                    ? new Date(
                        customer.lastOrder
                      ).toLocaleDateString(
                        'en-ZA',
                        {
                          day: 'numeric',
                          month: 'short',
                        }
                      )
                    : '—'}

                </td>

                <td className="py-3 px-4">
                  <StatusBadge
                    status={
                      customer.status
                    }
                  />
                </td>

                <td className="py-3 px-4 text-xs text-gray-400">
                  View
                </td>

              </tr>

            ))}

          </Table>

        )}

      </SectionCard>

    </div>
  );
};


export default AdminCustomers;