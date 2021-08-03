export const LOCAL_STORAGE_KEY_GENDER = 'gender';
export const LOCAL_STORAGE_KEY_TUTORIAL_SHOWN = 'tutorial_shown';
// i18n keys for post narration labels
export const NARRATION_LABELS = [
    'narrationLabel.bless', // hobby
    'narrationLabel.wish', // hobby
    'narrationLabel.motto', // value
    'narrationLabel.life', // love and accompanying style
] as const;

export const MAX_NARRATION_CHARACTER_NUMBER = 40;
export const MAX_QUESTION_CHARACTER_NUMBER = 20;
export const MAX_ANSWER_CHARACTER_NUMBER = 40;
export const MAX_LOCATION_CHARACTER_NUMBER = 10;

declare let MAX_NUMBER_POST_PER_PERIOD: string;
export const MAX_NUMBER_POST_PER_PERIOD_VAL = Number(MAX_NUMBER_POST_PER_PERIOD);

declare let MAX_NUMBER_RESPONSE_PER_PERIOD: string;
export const MAX_NUMBER_RESPONSE_PER_PERIOD_VAL = Number(MAX_NUMBER_RESPONSE_PER_PERIOD);

declare let PERIOD_DAYS_FOR_MAX_NUMBER_CHECK: string;
export const PERIOD_DAYS_FOR_MAX_NUMBER_CHECK_VAL = Number(PERIOD_DAYS_FOR_MAX_NUMBER_CHECK);

export const availablePostBackgrounds = ['a.jpeg', 'b.jpeg', 'd.jpeg', 'e.jpeg','g.jpeg','h.jpeg','i.jpeg','j.jpeg','k.jpeg','l.jpeg'] as const;

declare let POST_BACKGROUNDS_FOLDER: string;
export const POST_BACKGROUNDS_FOLDER_VAL = POST_BACKGROUNDS_FOLDER;

export const NUMBER_QUESTIONS_ALLOWED = 3;
export const VERSION = '1.1';

declare let TUTORIAL_SCREENSHOTS_FOLDER: string;
export const TUTORIAL_SCREENSHOTS_FOLDER_VAL = TUTORIAL_SCREENSHOTS_FOLDER;
