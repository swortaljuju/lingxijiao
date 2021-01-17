// Command format: ts-node add_dummy_posts {number of posts}

import {UserModel, PostModel} from '../server/schema/models';
import {setupMongoose, setupEnv} from './setup';

setupEnv();
setupMongoose();

(async () => {
    try {
        await UserModel.remove({});
        await PostModel.remove({});
        console.log('script all finished');
    } catch (err) {
        console.error(`Fail to execute script. error: ${err}`);
    } finally {
        process.exit();
    }
})();
