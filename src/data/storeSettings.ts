// src/data/storeSettings.ts
//
// Thin data-access layer around the `store_settings` table (see
// 20260822141356_notorious_y2_schema_v2.sql). The table is a plain
// key -> jsonb store; this module is what turns that into a typed,
// cached object the rest of the app (AdminSettings.tsx today, the
// storefront later for things like the announcement bar / hero
// section) can read and write without knowing about raw rows.
//
// Cached the same way `hooks/useProducts.ts` caches products: through
// the shared `lib/requestCache.ts` (not `lib/adminCache.ts`), because
// store settings aren't admin-only data — the storefront will read
// `announcement_bar` and `hero_section` directly once Phase 3 wires
// AdminContent.tsx's hardcoded homepage fields up to this table.

import { supabase } from '../lib/supabase';
import { cached, invalidateCache } from '../lib/requestCache';
import { invalidateAdminCache } from '../lib/adminCache';

// ============================================================
// CACHE CONFIG
// ============================================================

const STORE_SETTINGS_CACHE_KEY = 'store-settings:all';

// Store settings change rarely (an admin editing the Settings page),
// so this can be generous — repeated reads across components within
// this window reuse one cached object instead of re-querying.
const STORE_SETTINGS_TTL_MS = 5 * 60_000;

// ============================================================
// TYPES
//
// Shapes mirror the seed rows inserted by the schema migration
// exactly, so `getStoreSettings()` returns something that matches
// what's actually sitting in the `value` jsonb column for each key.
// ============================================================

export interface StoreInfoSettings {
  name: string;
  support_email: string;
  phone: string;
  timezone: string;
  currency: string;
  weight_unit: string;
}

export interface StoreAddressSettings {
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface AnnouncementBarSettings {
  enabled: boolean;
  text: string;
  bg: string;
  color: string;
}

export interface HeroSectionSettings {
  enabled: boolean;
  eyebrow: string;
  headline: string;
  description: string;
  button_text: string;
  product_ids: string[];
  image: string;
}

export interface FeaturedProductsSettings {
  enabled: boolean;
  product_ids: string[];
}

export interface FooterSettings {
  email: string;
  phone: string;
  copyright: string;
  social: {
    instagram: string;
    tiktok: string;
    facebook: string;
    youtube: string;
  };
}

export interface StorefrontTogglesSettings {
  store_open: boolean;
  multi_currency: boolean;
  email_notifications: boolean;
}

export interface NotificationPrefsSettings {
  newOrders: boolean;
  lowStock: boolean;
  newCustomers: boolean;
  dailySummary: boolean;
  abandonedCart: boolean;
}

export interface PaymentTogglesSettings {
  cards: boolean;
  paypal: boolean;
  applePay: boolean;
  googlePay: boolean;
  eft: boolean;
}

export interface StoreSettings {
  store_info: StoreInfoSettings;
  store_address: StoreAddressSettings;
  announcement_bar: AnnouncementBarSettings;
  hero_section: HeroSectionSettings;
  featured_products: FeaturedProductsSettings;
  footer_settings: FooterSettings;
  storefront_toggles: StorefrontTogglesSettings;
  notification_prefs: NotificationPrefsSettings;
  payment_toggles: PaymentTogglesSettings;
}

export type StoreSettingsKey = keyof StoreSettings;

// ============================================================
// DEFAULTS
//
// Used as a base to overlay real rows onto, so a fresh/partially
// seeded database (or a key someone deleted) never produces a
// half-typed object — callers always get every key populated.
// ============================================================

const DEFAULT_STORE_SETTINGS: StoreSettings = {
  store_info: {
    name: 'Notorious.Y2',
    support_email: 'support@notorious.y2',
    phone: '+27 11 234 5678',
    timezone: 'Africa/Johannesburg',
    currency: 'ZAR',
    weight_unit: 'kg',
  },

  store_address: {
    line1: '123 Main Street',
    city: 'Johannesburg',
    state: 'Gauteng',
    zip: '2000',
    country: 'South Africa',
  },

  announcement_bar: {
    enabled: true,
    text: 'Free shipping on orders over R500',
    bg: '#000000',
    color: '#FFFFFF',
  },

  hero_section: {
    enabled: true,
    eyebrow: 'NOTORIOUS.Y2',
    headline: 'Built for the Y2 generation.',
    description: 'Contemporary streetwear with a nostalgic Y2K attitude.',
    button_text: 'Shop Collection',
    product_ids: [],
    image: '',
  },

  featured_products: {
    enabled: true,
    product_ids: [],
  },

  footer_settings: {
    email: 'support@notorious.y2.com',
    phone: '+27 63 503 5882',
    copyright: '© 2025 NOTORIOUS.Y2',
    social: {
      instagram: 'https://instagram.com/notori.y2',
      tiktok: 'https://tiktok.com/@notori.y2',
      facebook: 'https://facebook.com/notori.y2',
      youtube: 'https://youtube.com/@notori.Y2',
    },
  },

  storefront_toggles: {
    store_open: true,
    multi_currency: true,
    email_notifications: true,
  },

  notification_prefs: {
    newOrders: true,
    lowStock: true,
    newCustomers: false,
    dailySummary: true,
    abandonedCart: true,
  },

  payment_toggles: {
    cards: true,
    paypal: true,
    applePay: true,
    googlePay: false,
    eft: false,
  },
};

// ============================================================
// ACTIVITY LOG HELPER
// ============================================================

const logAdminActivity = async (action: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('admin_activity_log')
    .insert({ actor_email: user?.email ?? 'system', action });
  
  if (error) {
    console.error('Failed to log admin activity:', error);
  }
  
  invalidateAdminCache('activity:');
};

// ============================================================
// FETCH
// ============================================================

interface StoreSettingsRow {
  key: string;
  value: unknown;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const fetchStoreSettings = async (): Promise<StoreSettings> => {
  const { data, error } = await supabase
    .from('store_settings')
    .select('key, value');

  if (error) {
    throw error;
  }

  // Deep-clone the defaults (one level is enough here — every value is a
  // flat settings object) so mutating `result` below never touches the
  // shared DEFAULT_STORE_SETTINGS constant.
  const result: StoreSettings = {
    store_info: { ...DEFAULT_STORE_SETTINGS.store_info },
    store_address: { ...DEFAULT_STORE_SETTINGS.store_address },
    announcement_bar: { ...DEFAULT_STORE_SETTINGS.announcement_bar },
    hero_section: {
      ...DEFAULT_STORE_SETTINGS.hero_section,
      product_ids: [...DEFAULT_STORE_SETTINGS.hero_section.product_ids],
    },
    featured_products: {
      ...DEFAULT_STORE_SETTINGS.featured_products,
      product_ids: [...DEFAULT_STORE_SETTINGS.featured_products.product_ids],
    },
    footer_settings: {
      ...DEFAULT_STORE_SETTINGS.footer_settings,
      social: { ...DEFAULT_STORE_SETTINGS.footer_settings.social },
    },
    storefront_toggles: { ...DEFAULT_STORE_SETTINGS.storefront_toggles },
    notification_prefs: { ...DEFAULT_STORE_SETTINGS.notification_prefs },
    payment_toggles: { ...DEFAULT_STORE_SETTINGS.payment_toggles },
  };

  const resultRecord = result as unknown as Record<string, Record<string, unknown>>;

  for (const row of (data ?? []) as StoreSettingsRow[]) {
    if (row.key in resultRecord && isPlainObject(row.value)) {
      resultRecord[row.key] = {
        ...resultRecord[row.key],
        ...row.value,
      };
    }
  }

  return result;
};

/**
 * Returns the full, typed store settings object. Cached for
 * STORE_SETTINGS_TTL_MS — call `updateStoreSettings()` to write a
 * change and invalidate the cache so the next read picks it up.
 */
export const getStoreSettings = async (): Promise<StoreSettings> =>
  cached(STORE_SETTINGS_CACHE_KEY, fetchStoreSettings, STORE_SETTINGS_TTL_MS);

// ============================================================
// UPDATE
// ============================================================

/**
 * Upserts a single settings key with a full replacement value, then
 * busts the store-settings cache so the next `getStoreSettings()`
 * call re-reads from the database instead of serving the stale
 * cached object.
 *
 * Callers should pass the FULL object for that key (not a partial
 * patch) — e.g. `updateStoreSettings('announcement_bar', { ...current, enabled: false })`,
 * mirroring how `store_settings.value` is stored (one jsonb blob per
 * key, not merged field-by-field on the server).
 */
export const updateStoreSettings = async <K extends StoreSettingsKey>(
  key: K,
  value: StoreSettings[K]
): Promise<void> => {
  const { error } = await supabase
    .from('store_settings')
    .upsert({ key, value }, { onConflict: 'key' });

  if (error) {
    console.error('Failed to update store setting:', key, error);
    throw error;
  }

  invalidateCache('store-settings');

  void logAdminActivity(`Updated store setting "${key}"`);
};