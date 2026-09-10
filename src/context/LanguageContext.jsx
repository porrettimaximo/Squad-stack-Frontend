import React, { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext({
  language: "es",
  setLanguage: () => {},
  toggleLanguage: () => {},
  isSpanish: true,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem("digitalars_language");
      return saved === "en" ? "en" : "es";
    } catch {
      return "es";
    }
  });

  const setLanguage = (newLang) => {
    const validLang = newLang === "en" ? "en" : "es";
    setLanguageState(validLang);
    try {
      localStorage.setItem("digitalars_language", validLang);
    } catch {}
  };

  const toggleLanguage = () => {
    setLanguage(language === "es" ? "en" : "es");
  };

  useEffect(() => {
    try {
      const langCode = language === "en" ? "en-US" : "es-AR";
      document.documentElement.setAttribute("lang", langCode);
      document.documentElement.lang = langCode;
    } catch {}
  }, [language]);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isSpanish: language === "es",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export default LanguageProvider;
