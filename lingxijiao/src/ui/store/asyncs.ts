// Contain functions to call backend apis including react's async thunk function
import {RootState, PostData, ResponseData} from './states';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {PostQuery} from '../../proto/query.js';
import axios, {CancelTokenSource} from 'axios';
import {Post} from '../../proto/post';
import {Response} from '../../proto/response';
import {Feedback} from '../../proto/feedback';

const CancelToken = axios.CancelToken;
let postLoadCancelToken: CancelTokenSource|null;

export interface LoadPostResult {
    posts: PostData[],
    noMorePostToLoad: boolean,
}

export const loadPostThunk = createAsyncThunk(
    'post/load',
    async (postNumber: number, {getState, rejectWithValue}) => {
        if (postLoadCancelToken) {
            // Cancel previous post loading request before starting the next in case of race condition.
            postLoadCancelToken.cancel();
            postLoadCancelToken = null;
        }
        const {posts, queryParams} = getState() as RootState;
        const postQuery = new PostQuery({
            gender: queryParams.gender,
            searchKeyword: queryParams.searchKeyword,
            postNumber,
            startTimestamp: (posts.length > 0) ? posts[posts.length - 1].creationTimestamp : (new Date()).valueOf(),
        });

        try {
            postLoadCancelToken = CancelToken.source();
            const response = await axios.post('/post/load', PostQuery.toObject(postQuery), {cancelToken: postLoadCancelToken.token});
            postLoadCancelToken = null;
            const loadedPosts = (response.data as string[]).map((postJson) =>{
                const parsedJson = JSON.parse(postJson);
                const error = Post.verify(parsedJson);
                if (error) {
                    throw error;
                }
                return parsedJson as PostData;
            });

            return {
                posts: loadedPosts,
                noMorePostToLoad: loadedPosts.length < postNumber, 
            } as LoadPostResult;
        } catch (err) {
            postLoadCancelToken = null;
            console.error(`Failed to load post. Error: ${err}`);
            return rejectWithValue(err && err.response && err.response.data);
        }
    },
);

export const createPostThunk = createAsyncThunk(
    'post/create',
    async (postData: PostData, {rejectWithValue}) => {
        try {
            await axios.post('/post/create', Post.toObject(new Post(postData)));
        } catch (err) {
            console.error(`Failed to create post. Error: ${err.response}`);
            return rejectWithValue(err.response.data);
        }
    },
);




export const submitResponseThunk = createAsyncThunk(
    'post/reply',
    async (responseData: ResponseData, {rejectWithValue}) => {
        try {
            await axios.post('/post/reply', Response.toObject(new Response(responseData)));
        } catch (err) {
            console.error(`Failed to reply post. Error: ${err.response.data}`);
            return rejectWithValue(err.response.data);
        }
    },
);

export const submitFeedbackThunk = createAsyncThunk(
    'feedback',
    async (feedback: string) => {
        try {
            await axios.post('/feedback', Feedback.toObject(new Feedback({feedback})));
            return;
        } catch (err) {
            console.error(`submit feedback failed. ${err.response}`);
        }
    },
);
