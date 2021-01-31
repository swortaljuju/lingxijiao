import * as React from 'react';
import {connect} from 'react-redux';
import {closeReplyPostModalAction} from '../store/reducers';
import {submitResponseThunk} from '../store/asyncs';
import {Modal, Button, Form, Alert, Col, Card, Accordion} from 'react-bootstrap';
import styles from './reply-post-form.module.scss';
import {RootState, PostData, ResponseData} from '../store/states';
import {ErrorCode} from '../../common/error_codes';
import {ThunkDispatch} from 'redux-thunk';
import i18n, {formatErrorCode} from '../i18n/config';
import validator from 'validator';
import {IoMdFemale, IoMdMale} from 'react-icons/io';
import {InputCharCount} from './input-char-count';
import {BasicFormField, validateBasicFormField, formatSingleFieldErrors} from './forms-utils';
import {Gender} from '../../proto/common.js';
import {MAX_ANSWER_CHARACTER_NUMBER} from '../globals';


interface Form {
    email: BasicFormField<string>;
    age: BasicFormField<string>;
    gender: BasicFormField<Gender>;
    answers: BasicFormField<string>[];
}

interface State {
    form: Form;
    hasFormError: boolean;
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
                gender: {
                    label: '',
                    value: Gender.MALE,
                    errors: [],
                },
                answers: [],
            },
            hasFormError: false,
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

    onSubmit(event: React.FormEvent) {
        event.preventDefault();
        event.stopPropagation();
        const isFormValid = this.validate();
        if (isFormValid) {
            this.props.submitResponse(this.convertFormToApiData(this.state.form, this.props.post.postId!));
        }
        this.setState({
            hasFormError: !isFormValid,
        });
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


        return <Alert variant="danger" className={styles['error']}>
            <Alert.Heading className={styles['error-heading']}>{i18n.t('error.general')}</Alert.Heading>
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
            return <Form.Group key={`answers-${index}`} controlId={styles['answer-input-group'] + index}>
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
                <div key={`narration_content_${i}`} className={styles['narration-content']}>
                    {this.props.post.narrations![i].content}
                </div>,
            );
        }
        return <Accordion className={styles['original-post']}>
            <Card>
                <Accordion.Toggle as={Card.Header} eventKey="0" className={styles['original-post-header']}>
                    {i18n.t('replyPostModal.originalPost')}
                </Accordion.Toggle>
                <Accordion.Collapse eventKey="0" className={styles['original-post-body']}>
                    <Card.Body>
                        <div>
                            <div className={styles['gender']}>
                                {(this.props.post.gender == Gender.MALE) ?
                                    <IoMdMale className={styles['male']}/> :
                                    <IoMdFemale className={styles['female']}/>}
                            </div>
                            <div className={styles['age']}>
                                {i18n.t('age', {age: this.props.post.age})}
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
            className={styles['reply-post-modal']}>
            <Modal.Header className={styles['header']} closeButton>
                <Modal.Title >
                    {i18n.t('replyPostModal.modalHeader')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles['body']} ref={this.modalBodyRef}>
                {this.renderErrors()}
                {this.renderOriginalPost()}
                <Form id={styles['form']} className={styles['form']} noValidate onSubmit={(event: React.FormEvent) => this.onSubmit(event)} >
                    <Form.Group className={styles['email-input-group']} controlId={styles['email-input-group']}>
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
                        <Form.Group as={Col} className={styles['age-input-group']} controlId={styles['age-input-group']}>
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

                        <Form.Group as={Col} className={styles['gender-input-group']} controlId={styles['gender-input-group']}>
                            <Form.Label>{i18n.t('gender')}</Form.Label>
                            <div>
                                <Form.Check inline type='radio' name={styles['gender-input-group']}>
                                    <Form.Check.Input type='radio'
                                        checked={this.state.form.gender.value == Gender.MALE}
                                        value='male'
                                        onChange={(event: React.FormEvent<HTMLInputElement>) => this.onGenderChange(event)} />
                                    <Form.Check.Label><IoMdMale className={styles['male']}/></Form.Check.Label>
                                </Form.Check>
                                <Form.Check inline type='radio' name={styles['gender-input-group']}>
                                    <Form.Check.Input type='radio'
                                        checked={this.state.form.gender.value == Gender.FEMALE}
                                        value='female'
                                        onChange={(event: React.FormEvent<HTMLInputElement>) => this.onGenderChange(event)}/>
                                    <Form.Check.Label><IoMdFemale className={styles['female']}/></Form.Check.Label>
                                </Form.Check>
                            </div>
                        </Form.Group>
                    </Form.Row>
                    {this.renderAnswers()}
                </Form>
            </Modal.Body>
            <Modal.Footer className={styles['footer']}>
                <Button variant="secondary" onClick={() => this.props.close()}>{i18n.t('modal.close')}</Button>
                <Button variant="primary" type="submit" form={styles['form']}> {i18n.t('modal.submit')} </Button>
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

