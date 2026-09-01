import React, { useEffect, useState } from 'react';
import {
  getStoreSettings,
  type AnnouncementBarSettings,
} from '../data/storeSettings';

const DEFAULT_ANNOUNCEMENT: AnnouncementBarSettings = {
  enabled: false,
  text: '',
  bg: '#000000',
  color: '#FFFFFF',
};

interface AnnouncementBarProps {
  override?: AnnouncementBarSettings;
}

const AnnouncementBar: React.FC<AnnouncementBarProps> = ({ override }) => {
  const [settings, setSettings] =
    useState<AnnouncementBarSettings>(DEFAULT_ANNOUNCEMENT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (override) {
      setSettings(override);
      setLoaded(true);
      return;
    }

    let cancelled = false;

    const loadSettings = async () => {
      try {
        const storeSettings = await getStoreSettings();

        if (!cancelled) {
          setSettings(storeSettings.announcement_bar);
        }
      } catch (error) {
        if (!cancelled) {
          setSettings(DEFAULT_ANNOUNCEMENT);
        }

        console.error(
          'Failed to load announcement bar settings:',
          error
        );
      } finally {
        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    void loadSettings();

    return () => {
      cancelled = true;
    };
  }, [override]);

  if (!loaded || !settings.enabled || !settings.text.trim()) {
    return null;
  }

  return (
    <div
      className="w-full px-3 py-2 text-center text-[10px] sm:text-xs tracking-[0.15em] uppercase"
      style={{
        backgroundColor: settings.bg,
        color: settings.color,
      }}
      role="status"
    >
      {settings.text}
    </div>
  );
};

export default AnnouncementBar;