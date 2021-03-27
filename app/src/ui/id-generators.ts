let currentId = 0;
export function generateId() : string {
    currentId++;
    return `lingxijiao_unigenerateId()que_id${currentId}`;
}
