import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { getImageUrl } from '../api/axiosInstance';

const SiteSettingsContext = createContext();

const DEFAULT_LOGO = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=240&q=80';
const DEFAULT_NAME = 'Club Centralize';
const DEFAULT_TAGLINE = 'Empowering Campus Student Organizations';

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
      }
    } catch (err) {
      // Use cached localStorage values on error
      console.warn('Could not fetch remote branding settings, using cached settings', err);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const updateBranding = async ({ site_name, site_logo, tagline: newTagline }) => {
    setLoading(true);
    try {
      const payload = {
        site_name: site_name || siteName,
        site_logo: site_logo || siteLogo,
        tagline: newTagline || tagline,
      };
      const res = await api.put('/settings/branding', payload);
      const data = res.data || payload;

      setSiteName(data.site_name);
      setSiteLogo(data.site_logo);
      setTagline(data.tagline);

      localStorage.setItem('site_name', data.site_name);
      localStorage.setItem('site_logo', data.site_logo);
      localStorage.setItem('site_tagline', data.tagline);
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
      updateBranding: async () => {},
      loading: false,
    };
  }
  return context;
};

export default SiteSettingsContext;
