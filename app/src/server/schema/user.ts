import {prop, Ref} from '@typegoose/typegoose';
import {Post} from './post';

export enum Gender {
    // eslint-disable-next-line no-unused-vars
    MALE = 'male',
    // eslint-disable-next-line no-unused-vars
    FEMALE = 'female'
  }

/** A user */
export class User {
    @prop({unique: true, required: true, index: true, type: String})
    public email!: string;

    @prop({required: true, enum: Gender})
    public gender!: Gender;

    @prop({required: true, type: Number})
    public birthYear!: number;

    @prop({ref: () => Post})
    public posts?: Ref<Post>[];

    @prop({ref: () => Post})
    public respondedPosts?: Ref<Post>[];
}

