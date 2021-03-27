// Redux states definitions. 
import {ErrorCode} from '../../common/error_codes';
import {INarration, IPost} from '../../proto/post.js';
import {IQuestionAndAnswer, IResponse} from '../../proto/response.js';
import {Gender} from '../../proto/common.js';
import i18next from 'i18next';
import {NARRATION_LABELS} from '../globals';
import {cookie, COOKIE_KEY_GENDER, NUMBER_QUESTIONS_ALLOWED} from '../globals';

export interface UserData {
    name?: string;
    email?: string;
}

export interface QueryParamsData {
    gender: Gender;
    searchKeyword?: string;
}

export type PostData = IPost;
export type NarrationData = INarration;
export type QuestionAndAnswerData = IQuestionAndAnswer;
export type ResponseData = IResponse;

// Flags indicates if a state is active. 
// Multiple state can be active at the same time.
export interface UiState {
    postCreationModalVisible?: boolean;
    postsLoading?: boolean;
    replyingPost?: boolean;
    feedbackFormVisible?: boolean;
    alertVisible?: boolean;
    noMorePostToLoad?: boolean;
}

export interface BasePostFormData {
    post: PostData;
    errors: ErrorCode[];
}

export interface ResponseFormData extends BasePostFormData {
    response: ResponseData;
}

export interface RootState {
    user?: UserData;
    posts: PostData[];
    // There could be more than one active UI state at one time.  
    // e.g. User can create post while loading posts
    uiStates: UiState;
    postCreationForm?: BasePostFormData;
    responseForm?: ResponseFormData;
    queryParams: QueryParamsData;
    // Show alert on forms submission success for all forms such as post creation, feedback.
    // The alert should disappear automatically after x seconds. This is i18n key to alert message.
    alertMessageKey?: string;
};

export function getCurrentGender(): Gender {
    return Number(cookie.get(COOKIE_KEY_GENDER)) || Gender.MALE;
}

export function createInitialState(gender: Gender): RootState {
    return {
        queryParams: {
            gender,
        },
        posts: [] as PostData[],
        uiStates: {},
    };
}

export function initializeNewPost(gender = Gender.MALE): PostData {
    const questions = [];
    for (let i = 0; i < NUMBER_QUESTIONS_ALLOWED; i++) {
        questions.push('');
    }
     // Default question, not editable in the form..
    questions.push(i18next.t('defaultQuestion'));
    return {
        postId: '',
        narrations: NARRATION_LABELS.map((labelI18nKey) => {
            return {
                label: i18next.t(labelI18nKey),
                content: '',
            };
        }),
        questions,
        email: '',
        gender,
        age: 0,
    };
}
