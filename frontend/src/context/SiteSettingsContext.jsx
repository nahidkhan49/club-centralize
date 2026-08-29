import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axiosInstance';

const SiteSettingsContext = createContext();

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=240&q=80';
const DEFAULT_NAME = 'Club Centralize';
const DEFAULT_TAGLINE = 'Empowering Campus Student Organizations';
const DEFAULT_APK = '/static/uploads/club-centralize.apk';
const DEFAULT_BANNER = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80';

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
  const [welcomeBannerImage, setWelcomeBannerImage] = useState(() => {
    return localStorage.getItem('welcome_banner_image') || DEFAULT_BANNER;
  });
  const [welcomeBannerTitle, setWelcomeBannerTitle] = useState(() => {
    return localStorage.getItem('welcome_banner_title') || 'Welcome to Club Centralize';
  });
  const [welcomeBannerSubtitle, setWelcomeBannerSubtitle] = useState(() => {
    return localStorage.getItem('welcome_banner_subtitle') || 'Your centralized hub for campus life, events, and student organizations.';
  });
  const [welcomeBannerEnabled, setWelcomeBannerEnabled] = useState(() => {
    const val = localStorage.getItem('welcome_banner_enabled');
    return val === null ? true : val === 'true';
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
        if (res.data.welcome_banner_image !== undefined) {
          setWelcomeBannerImage(res.data.welcome_banner_image || DEFAULT_BANNER);
          localStorage.setItem('welcome_banner_image', res.data.welcome_banner_image || '');
        }
        if (res.data.welcome_banner_title !== undefined) {
          setWelcomeBannerTitle(res.data.welcome_banner_title || '');
          localStorage.setItem('welcome_banner_title', res.data.welcome_banner_title || '');
        }
        if (res.data.welcome_banner_subtitle !== undefined) {
          setWelcomeBannerSubtitle(res.data.welcome_banner_subtitle || '');
          localStorage.setItem('welcome_banner_subtitle', res.data.welcome_banner_subtitle || '');
        }
        if (res.data.welcome_banner_enabled !== undefined) {
          setWelcomeBannerEnabled(Boolean(res.data.welcome_banner_enabled));
          localStorage.setItem('welcome_banner_enabled', String(res.data.welcome_banner_enabled));
        }
      }
    } catch (err) {
      console.warn('Could not fetch remote branding settings, using cached settings', err);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBranding = async (updatedFields) => {
    setLoading(true);
    try {
      const payload = {
        site_name: updatedFields.site_name !== undefined ? updatedFields.site_name : siteName,
        site_logo: updatedFields.site_logo !== undefined ? updatedFields.site_logo : siteLogo,
        tagline: updatedFields.tagline !== undefined ? updatedFields.tagline : tagline,
        apk_url: updatedFields.apk_url !== undefined ? updatedFields.apk_url : apkUrl,
        app_version: updatedFields.app_version !== undefined ? updatedFields.app_version : appVersion,
        welcome_banner_image: updatedFields.welcome_banner_image !== undefined ? updatedFields.welcome_banner_image : welcomeBannerImage,
        welcome_banner_title: updatedFields.welcome_banner_title !== undefined ? updatedFields.welcome_banner_title : welcomeBannerTitle,
        welcome_banner_subtitle: updatedFields.welcome_banner_subtitle !== undefined ? updatedFields.welcome_banner_subtitle : welcomeBannerSubtitle,
        welcome_banner_enabled: updatedFields.welcome_banner_enabled !== undefined ? updatedFields.welcome_banner_enabled : welcomeBannerEnabled,
      };

      const res = await api.put('/settings/branding', payload);
      const data = res.data || payload;

      setSiteName(data.site_name);
      setSiteLogo(data.site_logo);
      setTagline(data.tagline);
      setApkUrl(data.apk_url);
      setAppVersion(data.app_version);
      setWelcomeBannerImage(data.welcome_banner_image || DEFAULT_BANNER);
      setWelcomeBannerTitle(data.welcome_banner_title || '');
      setWelcomeBannerSubtitle(data.welcome_banner_subtitle || '');
      setWelcomeBannerEnabled(Boolean(data.welcome_banner_enabled));

      localStorage.setItem('site_name', data.site_name);
      localStorage.setItem('site_logo', data.site_logo);
      localStorage.setItem('site_tagline', data.tagline);
      localStorage.setItem('site_apk_url', data.apk_url);
      localStorage.setItem('site_app_version', data.app_version);
      localStorage.setItem('welcome_banner_image', data.welcome_banner_image || '');
      localStorage.setItem('welcome_banner_title', data.welcome_banner_title || '');
      localStorage.setItem('welcome_banner_subtitle', data.welcome_banner_subtitle || '');
      localStorage.setItem('welcome_banner_enabled', String(data.welcome_banner_enabled));
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
        welcomeBannerImage: getImageUrl(welcomeBannerImage) || DEFAULT_BANNER,
        rawWelcomeBannerImage: welcomeBannerImage,
        welcomeBannerTitle,
        welcomeBannerSubtitle,
        welcomeBannerEnabled,
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
      welcomeBannerImage: DEFAULT_BANNER,
      rawWelcomeBannerImage: DEFAULT_BANNER,
      welcomeBannerTitle: 'Welcome to Club Centralize',
      welcomeBannerSubtitle: 'Your centralized hub for campus life, events, and student organizations.',
      welcomeBannerEnabled: true,
      updateBranding: async () => {},
      loading: false,
    };
  }
  return context;
};

export default SiteSettingsContext;
