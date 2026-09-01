import { supabase } from './supabase';

const SESSION_KEY = 'ny2-session-id';

const getSessionId = (): string => {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
};

const getDevice = (): string =>
  /Mobi|Android/i.test(navigator.userAgent) ? 'mobile'
  : /Tablet|iPad/i.test(navigator.userAgent) ? 'tablet'
  : 'desktop';

export const trackEvent = (eventType: string, path?: string): void => {
  void supabase.from('analytics_events').insert({
    event_type: eventType,
    path: path ?? window.location.pathname,
    referrer: document.referrer || null,
    device: getDevice(),
    session_id: getSessionId(),
  }).then(({ error }) => {
    if (error) console.error('Failed to track event:', error);
  });
};