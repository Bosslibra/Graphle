export const getLocale = async () => "en";

export const getTranslations = async (_namespace?: string) => {
  return (key: string) => {
    const translations: Record<string, string> = {
      title: "Page not found",
      description: "Could not find requested resource",
      "home-link": "Go back home",
    };
    return translations[key] ?? key;
  };
};

export const setRequestLocale = () => {};