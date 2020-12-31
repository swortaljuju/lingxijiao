import {getModelForClass} from '@typegoose/typegoose';
import {Post} from './post';
import {User} from './user';

// Create models together after all classes are defined. Otherwise it may throws runtime error.
export const UserModel = getModelForClass(User);
export const PostModel = getModelForClass(Post);
