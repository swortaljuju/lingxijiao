import i18next from 'i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import {ErrorCode} from '../../common/error_codes';
import {MAX_LOCATION_CHARACTER_NUMBER, MAX_ANSWER_CHARACTER_NUMBER, MAX_QUESTION_CHARACTER_NUMBER, MAX_NARRATION_CHARACTER_NUMBER, MAX_NUMBER_POST_PER_PERIOD_VAL, MAX_NUMBER_RESPONSE_PER_PERIOD_VAL, PERIOD_DAYS_FOR_MAX_NUMBER_CHECK_VAL} from '../globals';

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
            escapeValue: false, // react already safes from xss
        },
        backend: {
        // for all available options read the backend's repository readme file
            loadPath: '/messages_{{lng}}.json',
        },
    });

export function errorCodeToMessageKey(errorCode: ErrorCode): string {
    return `error.${errorCode}`;
}

export function formatErrorCode(errorCode: ErrorCode): string {
    let tOption = {};
    switch (errorCode) {
    case ErrorCode.EXCEED_MAX_ANSWER_CHARACTERS_NUMBER:
        tOption = {max: MAX_ANSWER_CHARACTER_NUMBER};
        break;
    case ErrorCode.EXCEED_MAX_QUESTION_CHARACTERS_NUMBER:
        tOption = {max: MAX_QUESTION_CHARACTER_NUMBER};
        break;
    case ErrorCode.EXCEED_MAX_NARRATION_CHARACTERS_NUMBER:
        tOption = {max: MAX_NARRATION_CHARACTER_NUMBER};
        break;
    case ErrorCode.EXCEED_MAX_LOCATION_CHARACTERS_NUMBER:
        tOption = {max: MAX_LOCATION_CHARACTER_NUMBER};
        break;
    case ErrorCode.EXCEED_POST_CREATION_LIMIT:
        tOption = {day: PERIOD_DAYS_FOR_MAX_NUMBER_CHECK_VAL, count: MAX_NUMBER_POST_PER_PERIOD_VAL};
        break;
    case ErrorCode.EXCEED_RESPONSE_LIMIT:
        tOption = {day: PERIOD_DAYS_FOR_MAX_NUMBER_CHECK_VAL, count: MAX_NUMBER_RESPONSE_PER_PERIOD_VAL};
        break;

    default:
        break;
    }

    return i18next.t(errorCodeToMessageKey(errorCode), tOption);
}
export default i18next;
