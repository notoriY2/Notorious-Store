import React, { useEffect, useState } from 'react';
import { RefreshCw, AlertCircle, Activity } from 'lucide-react';
import { PageTitle, SectionCard } from '../AdminUI';
import { getAdminActivity } from '../../../data/admin';
import { AdminActivity } from '../../../types/admin';

const AdminActivityLog: React.FC<{ isActive?: boolean }> = ({ isActive = true }) => {
  const [activity, setActivity] = useState<AdminActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    let cancelled = false;

        const loadActivity = async () => {
      if (!hasLoadedOnce) {
        setIsLoading(true);
      }
      setError(null);

      try {
        const data = await getAdminActivity(100);

        if (cancelled) return;

        setActivity(data);
        setHasLoadedOnce(true);
      } catch (err) {
        if (cancelled) return;

        console.error('Failed to load activity log:', err);

        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load activity log.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadActivity();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, isActive]);

  // ============================================================
  // LOADING STATE
  // ============================================================

    if (isLoading && !hasLoadedOnce) {
    return (
      <div>
        <PageTitle title="Activity Log" subtitle="Audit trail of admin actions" />

        <SectionCard title="Recent Activity">
          <div className="space-y-1">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-14 border-b border-gray-50 bg-gray-50/50 animate-pulse rounded-lg"
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
        <PageTitle title="Activity Log" subtitle="Audit trail of admin actions" />

        <div className="border border-gray-200 bg-white p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-50 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-red-500" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Failed to load activity log
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

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div>
      <PageTitle title="Activity Log" subtitle="Audit trail of admin actions" />

      <SectionCard title="Recent Activity">
        {activity.length === 0 ? (
          <div className="py-16 text-center">
            <Activity size={22} className="mx-auto text-gray-300" />
            <p className="text-sm text-gray-500 mt-3">
              No admin activity recorded yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {activity.map((a, i) => (
              <div
                key={a.id}
                className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-mono">
                  {String(activity.length - i).padStart(2, '0')}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{a.action}</p>

                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{a.user}</span>
                    <span className="text-xs text-gray-300">|</span>
                    <span className="text-xs text-gray-500">{a.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
};

export default AdminActivityLog;