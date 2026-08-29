import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axiosInstance';

const SiteSettingsContext = createContext();

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=240&q=80';
const DEFAULT_NAME = 'Club Centralize';
const DEFAULT_TAGLINE = 'Empowering Campus Student Organizations';
const DEFAULT_APK = '/static/uploads/club-centralize.apk';

export const SiteSettingsProvider = ({ children }) => {
  const [siteName, setSiteName] = useState(() => {
    return localStorage.getItem('site_name') || DEFAULT_NAME;
  });
  const [siteLogo, setSiteLogo] = useState(() => {
    return localStorage.getItem('site_logo') || DEFAULT_LOGO;
  });
  const [tagline, setTagline] = useState(() => {
    return localStorage.getItem('site_tagline') || DEFAULT_TAGLINE;
  });
  const [apkUrl, setApkUrl] = useState(() => {
    return localStorage.getItem('site_apk_url') || DEFAULT_APK;
  });
  const [appVersion, setAppVersion] = useState(() => {
    return localStorage.getItem('site_app_version') || '1.0.0';
  });
  const [loading, setLoading] = useState(false);

  const fetchBranding = async () => {
    try {
      const res = await api.get('/settings/branding');
      if (res.data) {
        if (res.data.site_name) {
          setSiteName(res.data.site_name);
          localStorage.setItem('site_name', res.data.site_name);
          document.title = res.data.site_name;
        }
        if (res.data.site_logo) {
          setSiteLogo(res.data.site_logo);
          localStorage.setItem('site_logo', res.data.site_logo);
        }
        if (res.data.tagline) {
          setTagline(res.data.tagline);
          localStorage.setItem('site_tagline', res.data.tagline);
        }
        if (res.data.apk_url) {
          setApkUrl(res.data.apk_url);
          localStorage.setItem('site_apk_url', res.data.apk_url);
        }
        if (res.data.app_version) {
          setAppVersion(res.data.app_version);
          localStorage.setItem('site_app_version', res.data.app_version);
        }
      }
    } catch (err) {
      console.warn('Could not fetch remote branding settings, using cached settings', err);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBranding = async ({ site_name, site_logo, tagline: newTagline, apk_url, app_version }) => {
    setLoading(true);
    try {
      const payload = {
        site_name: site_name || siteName,
        site_logo: site_logo || siteLogo,
        tagline: newTagline || tagline,
        apk_url: apk_url || apkUrl,
        app_version: app_version || appVersion,
      };
      const res = await api.put('/settings/branding', payload);
      const data = res.data || payload;

      setSiteName(data.site_name);
      setSiteLogo(data.site_logo);
      setTagline(data.tagline);
      setApkUrl(data.apk_url);
      setAppVersion(data.app_version);

      localStorage.setItem('site_name', data.site_name);
      localStorage.setItem('site_logo', data.site_logo);
      localStorage.setItem('site_tagline', data.tagline);
      localStorage.setItem('site_apk_url', data.apk_url);
      localStorage.setItem('site_app_version', data.app_version);
      document.title = data.site_name;

      return data;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SiteSettingsContext.Provider
      value={{
        siteName,
        siteLogo: getImageUrl(siteLogo) || DEFAULT_LOGO,
        rawSiteLogo: siteLogo,
        tagline,
        apkUrl: getImageUrl(apkUrl) || DEFAULT_APK,
        rawApkUrl: apkUrl,
        appVersion,
        updateBranding,
        loading,
        refetchBranding: fetchBranding,
      }}
    >
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    return {
      siteName: DEFAULT_NAME,
      siteLogo: DEFAULT_LOGO,
      rawSiteLogo: DEFAULT_LOGO,
      tagline: DEFAULT_TAGLINE,
      apkUrl: DEFAULT_APK,
      rawApkUrl: DEFAULT_APK,
      appVersion: '1.0.0',
      updateBranding: async () => {},
      loading: false,
    };
  }
  return context;
};

export default SiteSettingsContext;
