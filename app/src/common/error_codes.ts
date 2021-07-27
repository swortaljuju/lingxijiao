// Contains error code enum shared by both frontend and backend.
export enum ErrorCode {
    EXCEED_POST_CREATION_LIMIT = 'exceed_post_creation_limit',
    EXCEED_RESPONSE_LIMIT = 'exceed_response_limit',
    ERROR_PARSING_REQUEST = 'error_parsing_request',
    INVALID_EMAIL = 'invalid_email',
    POST_RESPONDED = 'post_responded',
    INVALID_AGE = 'invalid_age',
    EXCEED_MAX_LOCATION_CHARACTERS_NUMBER = 'exceed_max_location_characters_number',
    EXCEED_MAX_NARRATION_CHARACTERS_NUMBER = 'exceed_max_narration_characters_number',
    EXCEED_MAX_QUESTION_CHARACTERS_NUMBER = 'exceed_max_question_characters_number',
    EXCEED_MAX_ANSWER_CHARACTERS_NUMBER = 'exceed_max_answer_characters_number',
    EMPTY_NARRATION = 'empty_narration',
    UNEXPECTED_SERVER_ERROR = 'unexpected_server_error'
}
