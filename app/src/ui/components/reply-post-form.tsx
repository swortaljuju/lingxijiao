import * as React from 'react';
import {connect} from 'react-redux';
import {closeReplyPostModalAction} from '../store/reducers';
import {submitResponseThunk} from '../store/asyncs';
import {Modal, Button, Form, Alert, Col, Card, Accordion, Spinner} from 'react-bootstrap';
import replyPostFormStyles from './reply-post-form.module.scss';
import postFormStyles from './post-form.module.scss';
import {RootState, PostData, ResponseData} from '../store/states';
import {ErrorCode} from '../../common/error_codes';
import {ThunkDispatch} from 'redux-thunk';
import i18n, {formatErrorCode} from '../i18n/config';
import validator from 'validator';
import {IoMdFemale, IoMdMale} from 'react-icons/io';
import {InputCharCount} from './input-char-count';
import {BasicFormField, validateBasicFormField, formatSingleFieldErrors} from './forms-utils';
import {Gender} from '../../proto/common.js';
import {MAX_ANSWER_CHARACTER_NUMBER, MAX_LOCATION_CHARACTER_NUMBER} from '../globals';
import {generateId} from '../id-generators';

interface Form {
    email: BasicFormField<string>;
    age: BasicFormField<string>;
    location: BasicFormField<string>;
    gender: BasicFormField<Gender>;
    answers: BasicFormField<string>[];
}

interface State {
    form: Form;
    hasFormError: boolean;
    isSaving: boolean;
}

interface OwnProps {
    visible: boolean;
}

interface DispatchProps {
  submitResponse: (response: ResponseData) => Promise<void>;
  close: () => void;
}

interface StateProps {
  post: PostData;
  initialResponseData?: ResponseData;
  serverErrors: ErrorCode[];
}

type Props = StateProps & OwnProps & DispatchProps

class ReplyPostFormComponent extends React.Component<Props, State> {
    private modalBodyRef: React.RefObject<HTMLDivElement>;
    private readonly formId = generateId();
    private readonly genderRadioId = generateId();

    constructor(props: Props) {
        super(props);
        this.state = {
            form: {
                email: {
                    label: '',
                    value: '',
                    errors: [],
                },
                age: {
                    label: '',
                    value: '',
                    errors: [],
                },
                location: {
                    label: '',
                    value: '',
                    errors: [],
                },
                gender: {
                    label: '',
                    value: Gender.MALE,
                    errors: [],
                },
                answers: [],
            },
            hasFormError: false,
            isSaving: false,
        };
        this.modalBodyRef = React.createRef();
    }

    private convertApiDataToForm(response: ResponseData): Form {
        return {
            email: {
                label: '',
                value: response.email || '',
                errors: [],
            },
            age: {
                label: '',
                value: response.age + '',
                errors: [],
            },
            location: {
                label: '',
                value: response.location + '',
                errors: [],
            },
            gender: {
                label: '',
                value: response.gender,
                errors: [],
            },
            answers: response.questionAndAnswers?.map((questionAndAnswer) => {
                return {
                    label: questionAndAnswer.question,
                    value: questionAndAnswer.answer,
                    errors: [],
                };
            }) || [],
        };
    }

    private convertFormToApiData(form: Form, postId: string): ResponseData {
        return {
            postId,
            email: form.email.value,
            age: Number(form.age.value),
            gender: form.gender.value,
            location: form.location.value,
            questionAndAnswers: form.answers.map((answer) => {
                return {
                    question: answer.label!,
                    answer: answer.value,
                };
            }),
        };
    }

    onModalShow() {
        this.setState({
            form: this.convertApiDataToForm(this.props.initialResponseData!),
            hasFormError: false,
        });
    }

    async onSubmit(event: React.FormEvent) {
        event.preventDefault();
        event.stopPropagation();
        if (this.state.isSaving) {
            return;
        }
        const isFormValid = this.validate();
        this.setState({
            hasFormError: !isFormValid,
        });

        if (isFormValid) {
            this.setState({
                isSaving: true,
            });
            await this.props.submitResponse(this.convertFormToApiData(this.state.form, this.props.post.postId!));
            this.setState({
                isSaving: false,
            });
        }
    }

    private validate(): boolean {
        let hasError = false;
        // Copy form so that we can error on it.
        const form: Form = Object.assign(this.state.form, {});
        hasError = validateBasicFormField(form.email, (email: string) => {
            if (!email || !validator.isEmail(email)) {
                return [ErrorCode.INVALID_EMAIL];
            }
        });
        hasError = validateBasicFormField(form.age, (age: string) => {
            if (!validator.isInt(age)) {
                return [ErrorCode.INVALID_AGE];
            }
        }) || hasError;

        hasError = validateBasicFormField(form.location, (location: string) => {
            if (location.length > MAX_LOCATION_CHARACTER_NUMBER) {
                return [ErrorCode.EXCEED_MAX_LOCATION_CHARACTERS_NUMBER];
            }
        }) || hasError;

        for (const answer of form.answers) {
            hasError = validateBasicFormField(answer, (answer: string) => {
                if (answer.length > MAX_ANSWER_CHARACTER_NUMBER) {
                    return [ErrorCode.EXCEED_MAX_ANSWER_CHARACTERS_NUMBER];
                }
            }) || hasError;
        }

        this.setState({
            form,
        });
        return !hasError;
    }

    private renderErrors(): React.ReactNode {
        if (this.props.serverErrors.length == 0 && !this.state.hasFormError) {
            return <> </>;
        }
        const errorItems = this.props.serverErrors.map((error: ErrorCode) => {
            return <li key={error}> {formatErrorCode(error)} </li>;
        });


        return <Alert variant="danger" className={postFormStyles['error']}>
            <Alert.Heading className={postFormStyles['error-heading']}>{i18n.t('error.general')}</Alert.Heading>
            <ul>{errorItems}</ul>
        </Alert>;
    }

    private onGenderChange(event: React.FormEvent<HTMLInputElement>) {
        this.setState((state) => {
            const newState: State = Object.assign(state, {});
            newState.form.gender.value = (event.target as HTMLInputElement).value == 'male' ? Gender.MALE : Gender.FEMALE;
            return newState;
        });
    }

    private renderAnswers(): React.ReactNode[] {
        return this.state.form.answers.map((answer, index) => {
            return <Form.Group key={`answers-${index}`} controlId={`${this.formId}-answers-${index}`}>
                <Form.Label>
                    {answer.label}
                    <InputCharCount charCount={answer.value.length} charLimit={MAX_ANSWER_CHARACTER_NUMBER}/>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={answer.value}
                    onChange={(event) => this.setState((state) => {
                        const newState: State = Object.assign(state, {});
                        newState.form.answers[index].value = event.target.value;
                        return newState;
                    })}
                    isInvalid={this.state.form.answers[index].errors.length > 0}
                />
                <Form.Control.Feedback type="invalid">
                    {formatSingleFieldErrors(this.state.form.answers[index].errors)}
                </Form.Control.Feedback>
            </Form.Group>;
        });
    }

    private renderOriginalPost(): React.ReactNode {
        const narrationItems = [];

        for (let i=0; i < this.props.post.narrations!.length; i++) {
            narrationItems.push(
                <div key={`narration_label_${i}`}>
                    {this.props.post.narrations![i].label}
                </div>,
            );
            narrationItems.push(
                <div key={`narration_content_${i}`} className={replyPostFormStyles['narration-content']}>
                    {this.props.post.narrations![i].content}
                </div>,
            );
        }
        return <Accordion className={replyPostFormStyles['original-post']}>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0" className={replyPostFormStyles['original-post-header']}>
                    {i18n.t('replyPostModal.originalPost')}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0" className={replyPostFormStyles['original-post-body']}>
                    <Card.Body>
                        <div>
                            <div className={postFormStyles['gender']}>
                                {(this.props.post.gender == Gender.MALE) ?
                                    <IoMdMale className={postFormStyles['male']}/> :
                                    <IoMdFemale className={postFormStyles['female']}/>}
                            </div>
                            <div className={postFormStyles['age']}>
                                {i18n.t('age', {age: this.props.post.age})}
                            </div>
                            <div className={postFormStyles['location']}>
                                {this.props.post.location}
                            </div>
                            {narrationItems}
                        </div>
                    </Card.Body>
                </Accordion.Collapse>
            </Card>

        </Accordion>;
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const currentServerErrors = this.props.serverErrors.slice().sort();
        const prevServerErrors = prevProps.serverErrors.slice().sort();
        if (((this.state.hasFormError && !prevState.hasFormError) ||
            (this.props.serverErrors.length > 0 && JSON.stringify(currentServerErrors) != JSON.stringify(prevServerErrors))) &&
            this.modalBodyRef.current) {
            // Scroll to top to show user new error.
            this.modalBodyRef.current.scrollTop = 0;
        }
    }

    render() {
        return <Modal
            onHide={() => this.props.close()}
            onEnter={() => this.onModalShow()}
            show={this.props.visible}
            scrollable
            className={`${replyPostFormStyles['reply-post-modal']} ${postFormStyles['post-modal']}`}
            backdrop='static'
            contentClassName={postFormStyles['modal-content']}>
            <Modal.Header className={postFormStyles['header']} closeButton>
                <Modal.Title className={postFormStyles['header-title']}>
                    {i18n.t('replyPostModal.modalHeader')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${replyPostFormStyles['body']} ${postFormStyles['body']}`} ref={this.modalBodyRef}>
                {this.renderErrors()}
                {this.renderOriginalPost()}
                <Form id={this.formId} noValidate onSubmit={(event: React.FormEvent) => this.onSubmit(event)} >
                    <Form.Group controlId={`${this.formId}-email-input-group`}>
                        <Form.Label>{i18n.t('formLabels.email')}</Form.Label>
                        <Form.Control
                            type="email"
                            value={this.state.form.email.value}
                            onChange={(event) => this.setState((state) => {
                                const newState: State = Object.assign(state, {});
                                newState.form.email.value = event.target.value;
                                return newState;
                            })}
                            isInvalid={this.state.form.email.errors.length > 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formatSingleFieldErrors(this.state.form.email.errors)}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Row>
                        <Form.Group as={Col} controlId={`${this.formId}-age-input-group`}>
                            <Form.Label>{i18n.t('formLabels.age')}</Form.Label>
                            <Form.Control
                                type="number"
                                value={this.state.form.age.value}
                                onChange={(event) => this.setState((state) => {
                                    const newState: State = Object.assign(state, {});
                                    newState.form.age.value = event.target.value;
                                    return newState;
                                })}
                                isInvalid={this.state.form.age.errors.length > 0}
                            />
                            <Form.Control.Feedback type="invalid">
                                {formatSingleFieldErrors(this.state.form.age.errors)}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group as={Col} controlId={this.genderRadioId}>
                            <Form.Label>{i18n.t('gender')}</Form.Label>
                            <div>
                                <Form.Check inline type='radio' name={this.genderRadioId}>
                                    <Form.Check.Input type='radio'
                                        checked={this.state.form.gender.value == Gender.MALE}
                                        value='male'
                                        onChange={(event: React.FormEvent<HTMLInputElement>) => this.onGenderChange(event)} />
                                    <Form.Check.Label><IoMdMale className={postFormStyles['male']}/></Form.Check.Label>
                                </Form.Check>
                                <Form.Check inline type='radio' name={this.genderRadioId}>
                                    <Form.Check.Input type='radio'
                                        checked={this.state.form.gender.value == Gender.FEMALE}
                                        value='female'
                                        onChange={(event: React.FormEvent<HTMLInputElement>) => this.onGenderChange(event)}/>
                                    <Form.Check.Label><IoMdFemale className={postFormStyles['female']}/></Form.Check.Label>
                                </Form.Check>
                            </div>
                        </Form.Group>
                    </Form.Row>
                    <Form.Group controlId={`${this.formId}-location-input-group`}>
                        <Form.Label>
                            {i18n.t('formLabels.location')}
                            <InputCharCount charCount={this.state.form.location.value.length} charLimit={MAX_LOCATION_CHARACTER_NUMBER}/>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={this.state.form.location.value}
                            onChange={(event) => this.setState((state) => {
                                const newState: State = Object.assign(state, {});
                                newState.form.location.value = event.target.value;
                                return newState;
                            })}
                            isInvalid={this.state.form.location.errors.length > 0}
                        />
                        <Form.Control.Feedback type="invalid">
                            {formatSingleFieldErrors(this.state.form.location.errors)}
                        </Form.Control.Feedback>
                    </Form.Group>
                    {this.renderAnswers()}
                </Form>
            </Modal.Body>
            <Modal.Footer className={postFormStyles['footer']}>
                <Button className={postFormStyles['footer-btn']} variant="secondary" onClick={() => this.props.close()}>{i18n.t('modal.close')}</Button>
                <Button className={postFormStyles['footer-btn']} variant="primary" type="submit" form={this.formId} disabled={this.state.isSaving}>
                    {this.state.isSaving ? (<Spinner animation="border" role="status" size="sm">
                        <span className="sr-only">Loading...</span>
                    </Spinner>) : i18n.t('modal.submit')} </Button>
            </Modal.Footer>
        </Modal>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        post: state.responseForm!.post,
        initialResponseData: state.responseForm?.response,
        serverErrors: state.responseForm?.errors.slice(0) || [],
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        submitResponse: async (response: ResponseData) => {
            await dispatch(submitResponseThunk(response));
        },

        close: () => {
            return dispatch(closeReplyPostModalAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(ReplyPostFormComponent);

