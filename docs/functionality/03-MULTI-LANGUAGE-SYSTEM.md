# 03 - Multi-Language System

**Status:** ✅ Complete  
**Dependencies:** 01-Scaffold

---

## Overview

9-language support with URL-based routing, cookie persistence, and translation fallback to English.

---

## Supported Languages

| Code | Language | Native |
|------|----------|--------|
| en | English | English |
| zh | Chinese | 中文 |
| ru | Russian | Русский |
| ko | Korean | 한국어 |
| ja | Japanese | 日本語 |
| fr | French | Français |
| it | Italian | Italiano |
| es | Spanish | Español |
| id | Indonesian | Bahasa Indonesia |

---

## URL Structure

```
/{lang}/                    → Homepage
/{lang}/tours               → Tours listing
/{lang}/tours/{slug}        → Tour detail
/{lang}/checkout            → Checkout
```

---

## Implementation

### Middleware (`middleware.ts`)
- Detects language from URL > cookie > Accept-Language header
- Redirects non-prefixed URLs to `/{lang}/{path}`
- Protects `/admin/*` routes

### Language Context (`lib/contexts/LanguageContext.tsx`)
- Provides current language to all components
- `setLanguage()` updates URL, cookie, and localStorage

### Language Switcher (`components/LanguageSwitcher.tsx`)
- Dropdown in header
- Navigates to new language URL on selection

---

## Translation Resolution

```typescript
resolveTranslation(translations, requestedLang, fallbackLang = 'en')
```

1. Try requested language
2. Try English fallback
3. Return first available or empty

---

## Key Files

- `types/index.ts` - Language type definitions
- `lib/i18n.ts` - Translation helpers + UI translations
- `lib/contexts/LanguageContext.tsx` - React context
- `middleware.ts` - Route handling

---

## Acceptance Criteria

- [x] Language stored in URL
- [x] Language persists in cookie
- [x] Switcher updates URL and re-renders
- [x] Missing translations show English
- [x] Hreflang tags generated





