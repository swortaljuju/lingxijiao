import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {ErrorCode} from '../../common/error_codes';


export const i18nLoadPromise = i18next
    .use(Backend)
    .use(LanguageDetector)
    .init({
        fallbackLng: 'zh',
        supportedLngs: ['zh'],
        detection: {
            order: ['navigator'],
        },

        interpolation: {
            escapeValue: false // react already safes from xss
        },
        backend: {
        // for all available options read the backend's repository readme file
            loadPath: '/messages_{{lng}}.json',
        },
    });

export function errorCodeToMessageKey(errorCode: ErrorCode): string {
    return `error.$errorCode`;
}

export default i18next;
