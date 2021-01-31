import * as React from 'react';
import {connect} from 'react-redux';
import {closePostCreationModalAction} from '../store/reducers';
import {createPostThunk} from '../store/asyncs';
import {Modal, Button, Form, Alert, Col} from 'react-bootstrap';
import styles from './post-creation-form.module.scss';
import {RootState, PostData} from '../store/states';
import {ErrorCode} from '../../common/error_codes';
import {ThunkDispatch} from 'redux-thunk';
import i18n, {formatErrorCode} from '../i18n/config';
import {BasicFormField, validateBasicFormField, formatSingleFieldErrors} from './forms-utils';
import {Gender} from '../../proto/common.js';
import {MAX_NARRATION_CHARACTER_NUMBER, MAX_QUESTION_CHARACTER_NUMBER} from '../globals';
import validator from 'validator';
import {IoMdFemale, IoMdMale} from 'react-icons/io';
import {InputCharCount} from './input-char-count';

interface Form {
    email: BasicFormField<string>;
    age: BasicFormField<string>;
    gender: BasicFormField<Gender>;
    narrations: BasicFormField<string>[];
    questions: BasicFormField<string>[];
}

interface State {
    form: Form;
    hasFormError: boolean;
}

interface OwnProps {
    visible: boolean;
}

interface DispatchProps {
  submitPost: (post: PostData) => Promise<void>;
  close: () => void;
}

interface StateProps {
  initialPostData?: PostData;
  serverErrors: ErrorCode[];
}

type Props = StateProps & OwnProps & DispatchProps


class PostCreationFormComponent extends React.Component<Props, State> {
    private modalBodyRef: React.RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        // copy initial data.
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
                narrations: [],
                questions: [],
            },
            hasFormError: false,
        };
        this.modalBodyRef = React.createRef();
    }

    private convertApiDataToForm(post: PostData): Form {
        return {
            email: {
                label: '',
                value: post.email || '',
                errors: [],
            },
            age: {
                label: '',
                value: post.age + '',
                errors: [],
            },
            gender: {
                label: '',
                value: post.gender,
                errors: [],
            },
            narrations: post.narrations?.map((narration) => {
                return {
                    label: narration.label,
                    value: narration.content,
                    errors: [],
                };
            }) || [],
            questions: post.questions?.map((question) => {
                return {
                    label: '',
                    value: question,
                    errors: [],
                };
            }) || [],
        };
    }

    private convertFormToApiData(form: Form): PostData {
        return {
            email: form.email.value,
            age: Number(form.age.value),
            gender: form.gender.value,
            narrations: form.narrations.map((narration) => {
                return {
                    label: narration.label!,
                    content: narration.value,
                };
            }),
            questions: form.questions.map((question) => question.value),
        };
    }

    onModalShow() {
        this.setState({
            form: this.convertApiDataToForm(this.props.initialPostData!),
            hasFormError: false,
        });
    }

    onSubmit(event: React.FormEvent) {
        event.preventDefault();
        event.stopPropagation();
        const isFormValid = this.validate();
        if (isFormValid) {
            this.props.submitPost(this.convertFormToApiData(this.state.form));
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

        for (const narration of form.narrations) {
            hasError = validateBasicFormField(narration, (narrationContent: string) => {
                if (narrationContent.length > MAX_NARRATION_CHARACTER_NUMBER) {
                    return [ErrorCode.EXCEED_MAX_NARRATION_CHARACTERS_NUMBER];
                } else if (validator.isEmpty(narrationContent, {ignore_whitespace: true})) {
                    return [ErrorCode.EMPTY_NARRATION];
                }
            }) || hasError;
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const question of form.questions) {
            hasError = validateBasicFormField(question, (questionContent: string) => {
                if (questionContent.length > MAX_QUESTION_CHARACTER_NUMBER) {
                    return [ErrorCode.EXCEED_MAX_QUESTION_CHARACTERS_NUMBER];
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

    private renderNarrations(): React.ReactNode[] {
        return this.state.form.narrations.map((narration, index) => {
            return <Form.Group key={`narrations-${index}`} controlId={styles['narration-input-group'] + index}>
                <Form.Label>
                    {narration.label}
                    <InputCharCount charCount={narration.value.length} charLimit={MAX_NARRATION_CHARACTER_NUMBER}/>
                </Form.Label>
                <Form.Control
                    type="text"
                    value={narration.value}
                    onChange={(event) => this.setState((state) => {
                        const newState: State = Object.assign(state, {});
                        newState.form.narrations[index].value = event.target.value;
                        return newState;
                    })}
                    isInvalid={this.state.form.narrations[index].errors.length > 0}
                />
                <Form.Control.Feedback type="invalid">
                    {formatSingleFieldErrors(this.state.form.narrations[index].errors)}
                </Form.Control.Feedback>
            </Form.Group>;
        });
    }
    private renderQuestions(): React.ReactNode[] {
        return this.state.form.questions.map((question, index) => {
            return <Form.Group key={`questions-${index}`} controlId={styles['question-input-group'] + index}>
                <Form.Control
                    disabled={index == this.state.form.questions.length - 1}
                    type="text"
                    value={question.value}
                    onChange={(event) => this.setState((state) => {
                        const newState: State = Object.assign(state, {});
                        newState.form.questions[index].value = event.target.value;
                        return newState;
                    })}
                    isInvalid={this.state.form.questions[index].errors.length > 0}
                />
                <Form.Control.Feedback type="invalid">
                    {formatSingleFieldErrors(this.state.form.questions[index].errors)}
                </Form.Control.Feedback>
            </Form.Group>;
        });
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
            className={styles['post-creation-modal']}>
            <Modal.Header className={styles['header']} closeButton>
                <Modal.Title >
                    {i18n.t('postCreationModal.modalHeader')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={styles['body']} ref={this.modalBodyRef}>
                {this.renderErrors()}
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
                    {this.renderNarrations()}
                    <Form.Group controlId={styles['questions']}>
                        <Form.Label>{i18n.t('postCreationModal.yourQuestions')}</Form.Label>
                        {this.renderQuestions()}
                    </Form.Group>
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
        initialPostData: state.postCreationForm?.post,
        serverErrors: state.postCreationForm?.errors.slice(0) || [],
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        submitPost: async (post: PostData) => {
            await dispatch(createPostThunk(post));
        },

        close: () => {
            return dispatch(closePostCreationModalAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(PostCreationFormComponent);

