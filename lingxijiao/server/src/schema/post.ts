import {prop, getModelForClass, Ref} from '@typegoose/typegoose';
import {TimeStamps} from '@typegoose/typegoose/lib/defaultClasses';
import {User} from './user';

/** Post narration shown on front card. */
export class PostNarration {
    @prop({required: true})
    public label!: string;

    @prop({required: true})
    public content!: string;
}

/** Response to the post. */
export class PostResponse {
    @prop({required: true, ref: () => User})
    public responder!: Ref<User>;

    @prop({type: String})
    public answers!: string[];
}

/** A post */
export class Post extends TimeStamps {
    @prop({required: true, ref: () => User})
    public poster!: Ref<User>;

    @prop({type: PostNarration})
    public narrations!: PostNarration[];

    @prop({type: String})
    public questions!: string[];

    @prop({type: Response})
    public responses!: Response[];
}

export const PostModel = getModelForClass(Post);
