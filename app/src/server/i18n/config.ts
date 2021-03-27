import i18next from 'i18next';


// This is lib is deprecated but it contains a released d.ts 
// while the new lib i18next-http-middleware's d.ts was recently added and not released yet.
import * as i18nMiddleware from 'i18next-express-middleware';

import * as zhTranslation from './zh/translation.json';

export const resources = {
    zh: {
        translation: zhTranslation,
    },
} as const;
