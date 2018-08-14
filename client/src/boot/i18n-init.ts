import { LANG_ALL } from "domain/core";
import * as i18next from "i18next";
import * as LngDetector from "i18next-browser-languagedetector";
import { ServicesLocator } from "../domain/services";

export async function initI18n(servicesLocator: ServicesLocator): Promise<i18next.i18n> {
  const newInstance = i18next.createInstance();
  return new Promise<i18next.i18n>((resolve, reject) => {
    newInstance.use(LngDetector).init(
      {
        whitelist: ["en", "fr"],
        fallbackLng: "en",
        debug: true,
        // TODO: handle i18n dictionaries properly, of course :-)
        resources: {
          en: {
            translation: {
              page: {
                homepage: {
                  title: "Homepage",
                },
              },
              lang: {
                [LANG_ALL]: "All languages",
                en: "English",
                fr: "French",
                fi: "Finnish",
                nl: "Dutch",
                de: "German",
                es: "Spanish",
                it: "Italian",
                pt: "Portuguese",
              },
            },
          },
          fr: {
            translation: {
              page: {
                homepage: {
                  title: "Accueil",
                },
                lang: {
                  [LANG_ALL]: "Toutes les langues",
                  en: "Anglais",
                  fr: "Français",
                  fi: "Finnois",
                  nl: "Néerlandais",
                  de: "Allemand",
                  es: "Espagnol",
                  it: "Italien",
                  pt: "Portuguais",
                },
              },
            },
          },
        },
      },
      (error: any, t: i18next.TranslationFunction) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(newInstance);
      }
    );
  });
}
