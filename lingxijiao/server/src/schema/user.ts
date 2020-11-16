import {prop, Ref, getModelForClass} from '@typegoose/typegoose';
import {Post} from './post';

export enum Gender {
    // eslint-disable-next-line no-unused-vars
    MALE = 'male',
    // eslint-disable-next-line no-unused-vars
    FEMALE = 'female'
  }

/** A user */
export class User {
    @prop({unique: true, required: true, index: true})
    public email!: String;

    @prop({unique: true, required: true, enum: Gender})
    public gender!: Gender;

    @prop({ref: () => Post})
    public posts?: Ref<Post>[];

    @prop({ref: () => Post})
    public respondedPosts?: Ref<Post>[];
}

export const UserModel = getModelForClass(User);
