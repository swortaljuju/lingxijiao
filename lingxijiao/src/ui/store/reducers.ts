// React reducers. Further split this file if necessary.
import {combineReducers} from 'redux';
import {getCurrentGender, QueryParamsData, UiState, PostData, BasePostFormData, initializeNewPost, ResponseFormData, ResponseData, UserData} from './states';
import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Gender} from '../../proto/common.js';
import {loadPostThunk, LoadPostResult, createPostThunk, submitFeedbackThunk, submitResponseThunk, updatePostAction, updateResponseAction} from './asyncs';
import { ErrorCode } from '../../common/error_codes';
import {cookie, COOKIE_KEY_GENDER} from '../globals';


const userSlice = createSlice({
    name: 'user',
    initialState: {
        name: '',
        email: '',
    } as UserData,
    reducers: {},
});

const queryParamsSlice = createSlice({
    name: 'queryParams',
    initialState: {
        gender: Gender.MALE,
        searchKeyword: '',
    } as QueryParamsData,
    reducers: {
        updateGender: (state: QueryParamsData, action: PayloadAction<Gender>) => {
            console.log('updategender');
            state.gender = action.payload;
            cookie.set(COOKIE_KEY_GENDER, state.gender);
        },
        updateSearchKeyword: (state: QueryParamsData, action: PayloadAction<string>) => {
            console.log('updateSearchKeyword');

            state.searchKeyword = action.payload;
        },
    },
});

const uiStateSlice = createSlice({
    name: 'uiState',
    initialState: {} as UiState,
    reducers: {
        showPostCreationModal: (state: UiState) => {
            console.log('showPostCreationModal');
            state.postCreationModalVisible = true;
        },
        closePostCreationModal: (state: UiState) => {
            state.postCreationModalVisible = false;
        },
        replyPost: (state: UiState, action: PayloadAction<PostData>) => {
            console.log('replying post');
            state.replyingPost = true;
        },
        closeReplyPostModal: (state: UiState) => {
            state.replyingPost = false;
        },
        closeAlert: (state: UiState) => {
            // Alert could be closed either by user or after a timeout.
            state.alertVisible = false;
        },
        showFeedback: (state: UiState) => {
            console.log('showFeedback');
            state.feedbackFormVisible = true;
        },
        closeFeedback: (state: UiState) => {
            state.feedbackFormVisible = false;
        },
    },
    extraReducers: {
        // update postloading and replyingPost states based on thunk result
        [loadPostThunk.pending.type]: (state: UiState) => {
            state.postsLoading = true;
            state.noMorePostToLoad = false;
        },

        [loadPostThunk.fulfilled.type]: (state: UiState, action) => {
            state.postsLoading = false;
            state.noMorePostToLoad = (action.payload as LoadPostResult).noMorePostToLoad;
        },

        [loadPostThunk.rejected.type]: (state: UiState) => {
            state.postsLoading = false;
        },

        [createPostThunk.fulfilled.type]: (state: UiState) => {
            // After a post is successfully created, close the modal and show alert with success message.
            state.postCreationModalVisible = false;
            state.alertVisible = true;
        },

        [submitResponseThunk.fulfilled.type]: (state: UiState) => {
            // After a post is successfully replied, close the modal and show alert with success message.
            state.replyingPost = false;
            state.alertVisible = true;
        },

        [submitFeedbackThunk.fulfilled.type]: (state: UiState) => {
            state.feedbackFormVisible = false;
            state.alertVisible = true;
        },

        [submitFeedbackThunk.rejected.type]: (state: UiState) => {
            state.feedbackFormVisible = false;
        },
    },
});

const postsSlice = createSlice({
    name: 'posts',
    initialState: [] as PostData[],
    reducers: {},
    extraReducers: {
        // Reset posts so that it could reload posts based on new query params
        [queryParamsSlice.actions.updateSearchKeyword.type]: () => [],
        [queryParamsSlice.actions.updateGender.type]: () => [],
        [loadPostThunk.fulfilled.type]: (state: PostData[], action) => {
            state.push(...(action.payload as LoadPostResult).posts);
        },
    },

});

const postCreationFormDataSlice = createSlice({
    name: 'postCreationForm',
    initialState: {
        post: initializeNewPost(),
        errors: [],
    } as BasePostFormData,
    reducers: {},
    extraReducers: {
        [uiStateSlice.actions.showPostCreationModal.type]: (
            state: BasePostFormData,
        ) => {
            // Initialize post data.
            state.post = initializeNewPost(getOppositeGender(getCurrentGender()));
            state.errors = [];
        },
        [uiStateSlice.actions.closePostCreationModal.type]: (
            state: BasePostFormData,
        ) => {
            // Reset post data.
            state.post = initializeNewPost();
            state.errors = [];
        },
        [updatePostAction.type]: (state: BasePostFormData, {payload} ) => {
            state.post = payload as PostData;
        },
        [createPostThunk.rejected.type]: (state: BasePostFormData, {payload}) => {
            if (Array.isArray(payload)) {
                state.errors = payload;
            } else {
                state.errors = [ErrorCode.UNEXPECTED_SERVER_ERROR];
            }
        },
    },
});

function getOppositeGender(gender: Gender): Gender {
    return gender == Gender.MALE? Gender.FEMALE : Gender.MALE;
}

const responseFormDataSlice = createSlice({
    name: 'responseForm',
    initialState: {
        post: {
            postId: '',
            narrations: [],
            questions: [], 
            email: '',
            gender: Gender.MALE,
        },
        errors: [],
        response: {
            postId: '',
            email: '',
            gender: Gender.MALE,
            questionAndAnswers: [],
            age: 0,
        },
    } as ResponseFormData,
    reducers: {},
    extraReducers: {
        // Initialize response form action.
        [uiStateSlice.actions.replyPost.type]: (
            state: ResponseFormData,
            action: PayloadAction<PostData>,
        ) => {
            const post = action.payload;
            state.errors = [];
            state.response = {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                postId: post.postId!,
                email: '',
                gender: getOppositeGender(post.gender),
                questionAndAnswers: post.questions?.map((question) => {
                    return {
                        question,
                        answer: '',
                    };
                }),
                age: 0,
            },
            state.post = post;
        },
        [updateResponseAction.type]: (state: ResponseFormData, {payload} ) => {
            state.response = payload as ResponseData;
        },
        [submitResponseThunk.rejected.type]: (state: ResponseFormData, {payload}) => {
            if (Array.isArray(payload)) {
                state.errors = payload;
            } else {
                state.errors = [ErrorCode.UNEXPECTED_SERVER_ERROR];
            }
        },
    },
});

const alertMessageSlice = createSlice({
    name: 'alertMessage',
    initialState: '',
    reducers: {},
    extraReducers: {
        [createPostThunk.fulfilled.type]: () => 'alert.create_post_success',
        [submitResponseThunk.fulfilled.type]: () => 'alert.submit_response_success',
        [submitFeedbackThunk.fulfilled.type]: () => 'alert.submit_feedback_success',
    },
});


export const rootReducer = combineReducers({
    user: userSlice.reducer,
    queryParams: queryParamsSlice.reducer,
    uiStates: uiStateSlice.reducer,
    posts: postsSlice.reducer,
    postCreationForm: postCreationFormDataSlice.reducer,
    responseForm: responseFormDataSlice.reducer,
    alertMessageKey: alertMessageSlice.reducer,
});

export const showPostCreationModalAction = uiStateSlice.actions.showPostCreationModal;
export const closePostCreationModalAction = uiStateSlice.actions.closePostCreationModal;
export const closeAlertAction = uiStateSlice.actions.closeAlert;
export const showFeedbackAction = uiStateSlice.actions.showFeedback;
export const closeFeedbackAction = uiStateSlice.actions.closeFeedback;
export const replyPostAction = uiStateSlice.actions.replyPost;
export const closeReplyPostModalAction = uiStateSlice.actions.closeReplyPostModal;
export const updateGenderAction = queryParamsSlice.actions.updateGender;
export const updateSearhKeywordAction = queryParamsSlice.actions.updateSearchKeyword;
