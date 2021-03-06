import {prop, Ref, index} from '@typegoose/typegoose';
import {TimeStamps} from '@typegoose/typegoose/lib/defaultClasses';
import {User, Gender} from './user';

/** Post narration shown on front card. */
export class PostNarration {
    @prop({required: true})
    public label!: string;

    @prop({required: true})
    public content!: string;

    // Store tokenized content so that Chinese text can be correctly indexed.
    @prop({required: true})
    public contentTokens!: string;
}

/** Response to the post. */
export class PostResponse {
    @prop({required: true, ref: () => User})
    public responder!: Ref<User>;

    @prop({type: () => [String]})
    public answers!: string[];
}

/** A post */
@index({'location': 'text', 'narrations.contentTokens': 'text'})
export class Post extends TimeStamps {
    @prop({required: true, ref: () => User})
    public poster!: Ref<User>;

    @prop({_id: false, type: () => [PostNarration]})
    public narrations!: PostNarration[];

    @prop({type: () => [String]})
    public questions!: string[];

    @prop({_id: false, type: () => [PostResponse]})
    public responses!: PostResponse[];

    // Dup user's gender to enable filtering based on gender.
    @prop({required: true, enum: Gender})
    public gender!: Gender;

    @prop({required: true, type: Number})
    public birthYear!: number;

    @prop({type: String})
    public location?: string;
}

