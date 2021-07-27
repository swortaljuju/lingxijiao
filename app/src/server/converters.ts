import {Gender as ClientGender} from '../proto/common.js';
import {Gender as DbGender} from './schema/user';
import {Post as DbPost, PostNarration as DbPostNarration} from './schema/post';
import {IPost as ClientIPost, INarration as ClientIPostNarration, Post as ClientPost, Narration as ClientPostNarration} from '../proto/post.js';
import {DocumentType} from '@typegoose/typegoose';


export function fromDbGenderToClientGender(gender: DbGender): ClientGender {
    return (gender == DbGender.MALE) ? ClientGender.MALE : ClientGender.FEMALE;
}

export function fromClientGenderToDbGender(gender: ClientGender): DbGender {
    return (gender == ClientGender.MALE) ? DbGender.MALE : DbGender.FEMALE;
}

export function fromDbPostToClientPost(post: DocumentType<DbPost>): ClientIPost {
    return {
        postId: post._id.toString(),
        gender: fromDbGenderToClientGender(post.gender),
        questions: post.questions,
        narrations: post.narrations.map(fromDbPostNarrationToClientPostNarration),
        creationTimestamp: post.createdAt?.valueOf(),
        age: new Date().getFullYear() - post.birthYear,
        location: post.location,
    };
}

export function fromDbPostNarrationToClientPostNarration(narration: DbPostNarration): ClientIPostNarration {
    return {
        label: narration.label,
        content: narration.content,
    };
}
