import {prop, Ref, index} from '@typegoose/typegoose';
import {TimeStamps} from '@typegoose/typegoose/lib/defaultClasses';
import {User, Gender} from './user';

/** Post narration shown on front card. */
@index({content: 'text'})
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
@index({questions: 'text'})
export class Post extends TimeStamps {
    @prop({required: true, ref: () => User})
    public poster!: Ref<User>;

    @prop({type: PostNarration})
    public narrations!: PostNarration[];

    @prop({type: String})
    public questions!: string[];

    @prop({_id: false})
    public responses!: PostResponse[];

    // Dup user's gender to enable filtering based on gender.
    @prop({required: true, enum: Gender})
    public gender!: Gender;

    @prop({required: true, type: Number})
    public birthYear!: number;
}

