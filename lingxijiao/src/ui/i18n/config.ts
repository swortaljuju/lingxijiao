import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {initReactI18next} from 'react-i18next';
import {ErrorCode} from '../../common/error_codes';


i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'zh',
        supportedLngs: ['zh'],
        detection: {
            order: ['navigator'],
        },
        backend: {
        // for all available options read the backend's repository readme file
            loadPath: '/messages_{{lng}}.json',
        },
    });

export function errorCodeToMessageKey(errorCode: ErrorCode): string {
    return `error.$errorCode`;
}
