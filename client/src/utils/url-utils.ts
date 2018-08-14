import { Lang } from "domain/core";
import { Location } from "history";

const HOMEPAGE_URL_REGEX = /^(\/)([a-z]{2,3})?(\/|$)/;
const LIBRARY_URL_REGEX = /^(\/library\/)([a-z]{2,3})(\/|$)/;

const URLS_REGEXES = [HOMEPAGE_URL_REGEX, LIBRARY_URL_REGEX];

export function getBooksLangFromLocation(location: Location): Lang | null {
  for (const urlRegexp of URLS_REGEXES) {
    const urlWithLangMatch = location.pathname.match(urlRegexp);
    if (!urlWithLangMatch) {
      continue;
    }
    const lang = urlWithLangMatch[2];
    return lang;
  }
  return null;
}

export function replaceBooksLangInLocation(location: Location, lang: Lang): string {
  for (const urlRegexp of URLS_REGEXES) {
    if (location.pathname.match(urlRegexp)) {
      return location.pathname.replace(urlRegexp, `$1${lang}$3`);
    }
  }
  return "/";
}
