import { Lang } from "domain/core";
import { Location } from "history";

const URL_LANG_REGEX = /^\/library\/([a-z]{2,3})\//;

export function getBooksLangFromLocation(location: Location): Lang | null {
  const urlWithLangMatch = location.pathname.match(URL_LANG_REGEX);
  if (!urlWithLangMatch) {
    return null;
  }
  const lang = urlWithLangMatch[1];
  return lang;
}

export function replaceBooksLangInLocation(location: Location, lang: Lang): string {
  return location.pathname.replace(URL_LANG_REGEX, `/library/${lang}/`);
}
