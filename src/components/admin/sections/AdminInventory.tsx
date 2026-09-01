import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Package,
  PackageX,
  RefreshCw,
  Search,
} from 'lucide-react';

import {
  PageTitle,
  SectionCard,
  StatusBadge,
  Table,
} from '../AdminUI';

import { getAdminInventory, getAdminInventoryHistory } from '../../../data/admin';
import { AdminInventoryHistory, AdminInventoryItem } from '../../../types/admin';


// ============================================================
// TYPES
// ============================================================

type InventorySize = AdminInventoryItem['sizes'][number];

interface AdminInventoryProps {
  // Whether this section is currently visible in the admin dashboard.
  // AdminDashboard keeps sections mounted, so this prevents the
  // inventory query from running while the section is hidden.
  isActive?: boolean;
}


// ============================================================
// CONSTANTS
// ============================================================

const LOW_STOCK_THRESHOLD = 5;


// ============================================================
// ADMIN INVENTORY
// ============================================================

const AdminInventory: React.FC<AdminInventoryProps> = ({
  isActive = true,
}) => {
  const [
    inventory,
    setInventory,
  ] = useState<AdminInventoryItem[]>([]);

  const [
    history,
    setHistory,
  ] = useState<AdminInventoryHistory[]>([]);

  const [
    expandedProducts,
    setExpandedProducts,
  ] = useState<Set<string>>(
    new Set()
  );

  const [
    search,
    setSearch,
  ] = useState('');

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

    const [
    reloadKey,
    setReloadKey,
  ] = useState(0);

  const [
    hasLoadedOnce,
    setHasLoadedOnce,
  ] = useState(false);

  // ============================================================
  // LOAD INVENTORY & HISTORY
  // ============================================================

  useEffect(() => {
    /*
     * AdminDashboard keeps this component mounted even when
     * another admin section is visible.
     *
     * Do not fetch inventory while this section is hidden.
     */
    if (!isActive) {
      return;
    }

    let cancelled = false;

        const loadData = async () => {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const [inventoryData, historyData] = await Promise.all([
          getAdminInventory(),
          getAdminInventoryHistory().catch(() => []),
        ]);

        if (cancelled) {
          return;
        }

        setInventory(inventoryData);
        setHistory(historyData);
        setHasLoadedOnce(true);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'Failed to load inventory data:',
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load inventory.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, isActive]);


  // ============================================================
  // INVENTORY ALERTS
  // ============================================================

  const outOfStock = useMemo(
    () =>
      inventory.filter(
        item =>
          item.status ===
          'Out of Stock'
      ),
    [inventory]
  );


  const lowStock = useMemo(
    () =>
      inventory.filter(
        item =>
          item.status ===
          'Low Stock'
      ),
    [inventory]
  );


  // ============================================================
  // FILTER
  // ============================================================

  const filteredInventory =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return inventory;
      }

      return inventory.filter(
        item =>
          item.name
            .toLowerCase()
            .includes(query) ||
          item.sku
            .toLowerCase()
            .includes(query)
      );
    }, [
      inventory,
      search,
    ]);


  // ============================================================
  // TOTALS
  // ============================================================

  const totalAvailable =
    inventory.reduce(
      (sum, item) =>
        sum +
        item.totalAvailable,
      0
    );


  // ============================================================
  // TOGGLE EXPAND
  // ============================================================

  const toggleExpand = (
    id: string
  ) => {
    setExpandedProducts(
      previous => {
        const next =
          new Set(previous);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
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
          title="Inventory"
          subtitle="Track stock levels across all products"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

        <SectionCard title="Inventory">
          <div className="space-y-0">
            {Array.from({
              length: 7,
            }).map((_, index) => (
              <div
                key={index}
                className="h-16 border-b border-gray-50 bg-gray-50/50 animate-pulse"
              />
            ))}
          </div>
        </SectionCard>
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
          title="Inventory"
          subtitle="Track stock levels across all products"
        />

        <div className="border border-gray-200 bg-white p-8">
          <div className="flex items-start gap-4">

            <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
              <PackageX
                size={18}
                className="text-red-500"
              />
            </div>

            <div className="flex-1">

              <p className="text-sm font-medium text-gray-900">
                Failed to load inventory
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
                <RefreshCw
                  size={13}
                />

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

      {/* ======================================================
          PAGE TITLE
      ====================================================== */}

      <PageTitle
        title="Inventory"
        subtitle="Track stock levels across all products"
      />


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

        <div className="border border-gray-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Products
            </p>

            <Package
              size={15}
              className="text-gray-400"
            />

          </div>

          <p className="text-2xl font-light text-gray-900 mt-3">
            {inventory.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Catalog items
          </p>

        </div>


        <div className="border border-gray-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Available
            </p>

            <Package
              size={15}
              className="text-gray-400"
            />

          </div>

          <p className="text-2xl font-light text-gray-900 mt-3">
            {totalAvailable.toLocaleString(
              'en-ZA'
            )}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Units currently available
          </p>

        </div>


        <div className="border border-gray-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Low Stock
            </p>

            <AlertTriangle
              size={15}
              className="text-[#C44D2B]"
            />

          </div>

          <p className="text-2xl font-light text-[#C44D2B] mt-3">
            {lowStock.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Products need attention
          </p>

        </div>


        <div className="border border-gray-200 bg-white p-5">

          <div className="flex items-center justify-between">

            <p className="text-[11px] uppercase tracking-wider text-gray-400">
              Out of Stock
            </p>

            <PackageX
              size={15}
              className="text-red-500"
            />

          </div>

          <p className="text-2xl font-light text-red-500 mt-3">
            {outOfStock.length}
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Products unavailable
          </p>

        </div>

      </div>


      {/* ======================================================
          ALERTS
      ====================================================== */}

      {(outOfStock.length > 0 ||
        lowStock.length > 0) && (

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* OUT OF STOCK */}

          {outOfStock.length > 0 && (

            <SectionCard title="Out of Stock">

              <div className="space-y-2">

                {outOfStock.map(
                  item => (

                    <button
                      key={
                        item.productId
                      }
                      type="button"
                      onClick={() =>
                        toggleExpand(
                          item.productId
                        )
                      }
                      className="w-full flex items-center justify-between gap-3 p-3 bg-red-50 hover:bg-red-100 transition-colors text-left"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <PackageX
                          size={18}
                          className="text-red-500 shrink-0"
                        />

                        <span className="text-sm text-gray-700 truncate">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-[10px] uppercase tracking-wide text-red-500 shrink-0">
                        0 available
                      </span>

                    </button>

                  )
                )}

              </div>

            </SectionCard>

          )}


          {/* LOW STOCK */}

          {lowStock.length > 0 && (

            <SectionCard title="Low Stock">

              <div className="space-y-2">

                {lowStock.map(
                  item => (

                    <button
                      key={
                        item.productId
                      }
                      type="button"
                      onClick={() =>
                        toggleExpand(
                          item.productId
                        )
                      }
                      className="w-full flex items-center justify-between gap-3 p-3 bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <AlertTriangle
                          size={18}
                          className="text-yellow-600 shrink-0"
                        />

                        <span className="text-sm text-gray-700 truncate">
                          {item.name}
                        </span>

                      </div>

                      <span className="text-sm text-yellow-700 font-medium shrink-0">
                        {item.totalAvailable}{' '}
                        left
                      </span>

                    </button>

                  )
                )}

              </div>

            </SectionCard>

          )}

        </div>

      )}


      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="relative w-full max-w-md mb-6">

        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search by product name or SKU..."
          value={search}
          onChange={event =>
            setSearch(
              event.target.value
            )
          }
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 bg-white focus:outline-none focus:border-gray-400 transition-colors"
        />

      </div>


      {/* ======================================================
          INVENTORY TABLE
      ====================================================== */}

      <SectionCard
        title={`Inventory (${filteredInventory.length} products)`}
      >

        {filteredInventory.length === 0 ? (

          <div className="py-16 text-center">

            <Package
              size={24}
              className="mx-auto text-gray-300"
            />

            <p className="text-sm text-gray-500 mt-3">
              {search
                ? 'No inventory matches your search.'
                : 'No inventory found.'}
            </p>

          </div>

        ) : (

          <Table
            headers={[
              'Product',
              'SKU',
              'Available',
              'Reserved',
              'Sold',
              'Status',
              '',
            ]}
          >

            {filteredInventory.map(
              item => {

                const isExpanded =
                  expandedProducts.has(
                    item.productId
                  );

                const reserved =
                  item.sizes.reduce(
                    (
                      sum: number,
                      size: InventorySize
                    ) =>
                      sum +
                      size.reserved,
                    0
                  );

                const sold =
                  item.sizes.reduce(
                    (
                      sum: number,
                      size: InventorySize
                    ) =>
                      sum +
                      size.sold,
                    0
                  );

                return (
                  <React.Fragment
                    key={
                      item.productId
                    }
                  >

                    {/* ==================================================
                        PRODUCT ROW
                    ================================================== */}

                    <tr
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() =>
                        toggleExpand(
                          item.productId
                        )
                      }
                    >

                      <td className="py-3 px-4 text-sm text-gray-800">
                        {item.name}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-500 font-mono">
                        {item.sku}
                      </td>

                      <td className="py-3 px-4 text-sm">

                        <span
                          className={
                            item.totalAvailable <= 0
                              ? 'text-red-500 font-medium'
                              : item.totalAvailable <= LOW_STOCK_THRESHOLD
                              ? 'text-[#C44D2B] font-medium'
                              : 'text-gray-600'
                          }
                        >
                          {item.totalAvailable.toLocaleString(
                            'en-ZA'
                          )}
                        </span>

                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {reserved.toLocaleString(
                          'en-ZA'
                        )}
                      </td>

                      <td className="py-3 px-4 text-sm text-gray-600">
                        {sold.toLocaleString(
                          'en-ZA'
                        )}
                      </td>

                      <td className="py-3 px-4">

                        <StatusBadge
                          status={
                            item.status
                          }
                        />

                      </td>

                      <td className="py-3 px-4 text-xs text-gray-400 text-center">
                        {isExpanded
                          ? '▲'
                          : '▼'}
                      </td>

                    </tr>


                    {/* ==================================================
                        EXPANDED SIZE INVENTORY
                    ================================================== */}

                    {isExpanded && (

                      <tr className="bg-gray-50">

                        <td
                          colSpan={7}
                          className="py-4 px-8"
                        >

                          <div className="flex items-center justify-between mb-3">

                            <div>

                              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Size Inventory
                              </p>

                              <p className="text-[11px] text-gray-400 mt-1">
                                Stock breakdown for{' '}
                                {item.name}
                              </p>

                            </div>

                            <span className="text-xs text-gray-400 font-mono">
                              {item.sku}
                            </span>

                          </div>


                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

                            {item.sizes.map(
                              (
                                size
                              ) => (

                                <div
                                  key={
                                    size.size
                                  }
                                  className="p-4 bg-white border border-gray-100"
                                >

                                  <div className="flex items-center justify-between mb-3">

                                    <span className="text-sm text-gray-900 font-medium">
                                      {size.size}
                                    </span>

                                    <span
                                      className={
                                        size.available <= 0
                                          ? 'text-xs text-red-500 font-medium'
                                          : size.available <= LOW_STOCK_THRESHOLD
                                          ? 'text-xs text-[#C44D2B] font-medium'
                                          : 'text-xs text-gray-500'
                                      }
                                    >
                                      {size.available}{' '}
                                      available
                                    </span>

                                  </div>

                                  <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-400">

                                    <div className="flex justify-between">

                                      <span>
                                        Reserved
                                      </span>

                                      <span className="text-gray-700">
                                        {
                                          size.reserved
                                        }
                                      </span>

                                    </div>

                                    <div className="flex justify-between">

                                      <span>
                                        Sold
                                      </span>

                                      <span className="text-gray-700">
                                        {
                                          size.sold
                                        }
                                      </span>

                                    </div>

                                  </div>

                                </div>

                              )
                            )}

                          </div>

                        </td>

                      </tr>

                    )}

                  </React.Fragment>
                );
              }
            )}

          </Table>

        )}

      </SectionCard>


      {/* ======================================================
          INVENTORY HISTORY
      ====================================================== */}

      <div className="mt-6">

        <SectionCard title="Inventory History">

          {history.length === 0 ? (

            <div className="py-10 text-center">

              <Clock
                size={22}
                className="mx-auto text-gray-300"
              />

              <p className="text-sm text-gray-500 mt-3">
                No inventory history recorded yet.
              </p>

            </div>

          ) : (

            <Table
              headers={[
                'Date',
                'Product',
                'Action / Type',
                'Quantity Change',
                'Reference',
              ]}
            >

              {history.map(record => (
                <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(record.date).toLocaleString('en-ZA')}
                  </td>

                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">
                    {record.productName}
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                      {record.reason}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm">
                    <span className={record.change > 0 ? 'text-green-600 font-medium' : record.change < 0 ? 'text-red-600 font-medium' : 'text-gray-600'}>
                      {record.change > 0 ? `+${record.change}` : record.change}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-sm text-gray-500 font-mono text-xs">
                    {record.size}
                  </td>
                </tr>
              ))}

            </Table>

          )}

        </SectionCard>

      </div>

    </div>
  );
};


export default AdminInventory;