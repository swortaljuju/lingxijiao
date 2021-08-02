import * as nodejieba from 'nodejieba';
import {setupMongoose, setupEnv} from './setup';
import {PostModel} from '../server/schema/models';

setupEnv(process.argv[2]);
setupMongoose();

(async () => {
    try {
        const postArray = await PostModel.find({
            $or: [
                {'narrations.contentTokens': {
                    $exists: false,
                }},
                {'narrations.contentTokens': ''},
            ],
        }).exec();
        for (const post of postArray) {
            for (const narration of post.narrations) {
                if (!narration.contentTokens) {
                    await PostModel.updateOne({
                        _id: post._id,
                        narrations: {$elemMatch: {content: narration.content}},
                    }, {
                        $set: {
                            'narrations.$.contentTokens': nodejieba.cutForSearch(narration.content, true).join(' ') 
                        },
                    });
                }
            }
        }
        console.log('script all finished');
    } catch (err) {
        console.error(`Fail to execute script. error: ${err}`);
    } finally {
        process.exit();
    }
})();

