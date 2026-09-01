// src/components/admin/AdminNotificationsDropdown.tsx

import React from 'react';
import {
  Bell,
  Trash2,
  ShoppingCart,
  AlertTriangle,
  UserPlus,
  X,
} from 'lucide-react';

import { AdminNotification } from '../../data/admin';

const FONT = "'Helvetica Neue', Arial, sans-serif";
const ACCENT = '#C44D2B';

interface AdminNotificationsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AdminNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const formatRelativeTime = (iso: string): string => {
  const timestamp = new Date(iso).getTime();

  if (Number.isNaN(timestamp)) {
    return '';
  }

  const diffMs = Date.now() - timestamp;
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return 'just now';

  if (mins < 60) {
    return `${mins}m ago`;
  }

  const hrs = Math.floor(mins / 60);

  if (hrs < 24) {
    return `${hrs}h ago`;
  }

  return `${Math.floor(hrs / 24)}d ago`;
};

export const AdminNotificationsDropdown: React.FC<
  AdminNotificationsDropdownProps
> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}) => {
  if (!isOpen) return null;

  const unreadCount = notifications.filter(
    notification => !notification.read
  ).length;

  const getIcon = (
    type: AdminNotification['type']
  ) => {
    switch (type) {
      case 'order':
        return (
          <ShoppingCart
            size={14}
            strokeWidth={1.5}
            className="text-black"
          />
        );

      case 'stock':
        return (
          <AlertTriangle
            size={14}
            strokeWidth={1.5}
            style={{ color: ACCENT }}
          />
        );

      case 'customer':
        return (
          <UserPlus
            size={14}
            strokeWidth={1.5}
            className="text-gray-500"
          />
        );

      default:
        return (
          <Bell
            size={14}
            strokeWidth={1.5}
            className="text-gray-400"
          />
        );
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 shadow-xl z-50 overflow-hidden"
      style={{ fontFamily: FONT }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <h3 className="text-[10px] uppercase tracking-[0.25em] font-[100] text-black">
            Notifications
          </h3>

          {unreadCount > 0 && (
            <span
              className="px-1.5 py-0.5 text-[8px] text-white font-light"
              style={{ backgroundColor: ACCENT }}
            >
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[8px] uppercase tracking-[0.15em] text-gray-400 hover:text-black transition-colors"
            >
              Mark all read
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
            aria-label="Close notifications"
          >
            <X
              size={14}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Notification Items */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-gray-50">
        {notifications.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-[10px] uppercase tracking-[0.15em] font-light">
            No notifications
          </div>
        ) : (
          notifications.map(item => (
            <div
              key={item.id}
              onClick={() => onMarkAsRead(item.id)}
              className={`
                p-4
                transition-colors
                cursor-pointer
                flex
                gap-3
                items-start
                hover:bg-gray-50
                ${
                  !item.read
                    ? 'bg-gray-50/60'
                    : 'bg-white'
                }
              `}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0 p-2 bg-white border border-gray-100">
                {getIcon(item.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`
                      text-[11px]
                      tracking-[0.05em]
                      truncate
                      ${
                        !item.read
                          ? 'text-black font-normal'
                          : 'text-gray-700 font-[100]'
                      }
                    `}
                  >
                    {item.title}
                  </p>

                  <span className="text-[8px] text-gray-400 tracking-[0.1em] shrink-0 font-light">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>

                {item.description && (
                  <p className="text-[10px] text-gray-500 font-light tracking-[0.03em] mt-1 line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>

              {/* Unread Indicator */}
              {!item.read && (
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                  style={{
                    backgroundColor: ACCENT,
                  }}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <button
            type="button"
            onClick={onClearAll}
            className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.15em] text-gray-400 hover:text-[#C44D2B] transition-colors"
          >
            <Trash2
              size={11}
              strokeWidth={1.5}
            />
            Clear all
          </button>

          <span className="text-[8px] text-gray-400 uppercase tracking-[0.15em] font-light">
            System Live
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminNotificationsDropdown;