import Cookies from 'universal-cookie';

export const cookie = new Cookies();
export const COOKIE_KEY_GENDER = 'gender';
// i18n keys for post narration labels
export const NARRATION_LABELS = [
    'narraionLabel.bless', // hobby
    'narraionLabel.wish', // hobby
    'narraionLabel.motto', // value
    'narraionLabel.life', // love and accompanying style
] as const;

export const MAX_NARRATION_CHARACTER_NUMBER = 40;
export const MAX_QUESTION_CHARACTER_NUMBER = 20;
export const MAX_ANSWER_CHARACTER_NUMBER = 40;

declare let MAX_NUMBER_POST_PER_PERIOD: string;
export const MAX_NUMBER_POST_PER_PERIOD_VAL = Number(MAX_NUMBER_POST_PER_PERIOD);

declare let MAX_NUMBER_RESPONSE_PER_PERIOD: string;
export const MAX_NUMBER_RESPONSE_PER_PERIOD_VAL = Number(MAX_NUMBER_RESPONSE_PER_PERIOD);

declare let PERIOD_DAYS_FOR_MAX_NUMBER_CHECK: string;
export const PERIOD_DAYS_FOR_MAX_NUMBER_CHECK_VAL = Number(PERIOD_DAYS_FOR_MAX_NUMBER_CHECK);