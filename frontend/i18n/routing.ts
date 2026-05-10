import { defineRouting } from "next-intl/routing";

export const routing = defineRouting( {
    locales: ['en', 'it'],
    defaultLocale: 'en',
    localePrefix: 'as-needed', // removes the locale prefix for the default locale, TODO:
})