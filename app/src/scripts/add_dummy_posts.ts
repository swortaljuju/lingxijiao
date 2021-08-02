// Command format: ts-node add_dummy_posts {number of users} {number of posts per user} {user email prefix} {gender}

// eslint-disable-next-line no-unused-vars
import {Post, PostNarration} from '../server/schema/post';
// eslint-disable-next-line no-unused-vars
import {Gender} from '../server/schema/user';
import {UserModel, PostModel} from '../server/schema/models';

import {DocumentType} from '@typegoose/typegoose';
import {setupMongoose, setupEnv} from './setup';

setupEnv('dev');
setupMongoose();

const userNumber = Number(process.argv[2]) || 10;
const postNumberPerUser = Number(process.argv[3]) || 10;
const userEmailPrefix = process.argv[4] || 'default_email';
const gender = process.argv[5] == 'male' ? Gender.MALE : Gender.FEMALE;

(async () => {
    try {
        for (let i=0; i < userNumber; i++) {
            const birthYear = 1900 + Math.floor(Math.random() * 200);
            const userData = await UserModel.create({
                email: `${userEmailPrefix}_${i}@gmail.com`,
                gender,
                posts: [],
                respondedPosts: [],
                birthYear,
            });

            for (let j=0; j < postNumberPerUser; j++) {
                const narrations: PostNarration[] = [];
                for (let k = 0; k < 4; k++) {
                    narrations.push({
                        label: `User ${i} Post ${j} Narration label ${k}`,
                        content: `User ${i} Post ${j} Narration content ${k}`,
                        contentTokens: `User ${i} Post ${j} Narration content ${k}`,
                    });
                }
                const questions: string[] = [];
                for (let k = 0; k < 3; k++) {
                    questions.push( `User ${i} Post ${j} Question ${k}`);
                }
                const createdPost: DocumentType<Post> = await PostModel.create({
                    poster: userData._id,
                    narrations,
                    questions,
                    responses: [],
                    gender: userData.gender,
                    birthYear,
                });
                // add the new post to user's posts list.
                await UserModel.updateOne({
                    _id: userData._id,
                }, {$push: {posts: createdPost._id}});
            }
        }
        console.log('script all finished');
    } catch (err) {
        console.error(`Fail to execute script. error: ${err}`);
    } finally {
        process.exit();
    }
})();

