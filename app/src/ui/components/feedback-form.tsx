import * as React from 'react';
import {connect} from 'react-redux';
import {closeFeedbackAction} from '../store/reducers';
import {submitFeedbackThunk} from '../store/asyncs';
import {Modal, Button, Form} from 'react-bootstrap';
import {ThunkDispatch} from 'redux-thunk';
import {RootState} from '../store/states';
import i18n from '../i18n/config';


interface State {
    validated: boolean;
    feedbackMessage: string;
}

interface OwnProps {
    visible: boolean;
}

interface DispatchProps {
  submitFeedback: (feedback: string) => Promise<void>;
  closeFeedback: () => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps


class FeedbackFormComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            validated: false,
            feedbackMessage: '',
        };
    }
    onSubmit(event: React.FormEvent) {
        event.preventDefault();
        event.stopPropagation();
        const form = event.currentTarget as HTMLFormElement;
        if (form.checkValidity()) {
            this.props.submitFeedback(this.state.feedbackMessage);
        } 
        this.setState({
            validated: true,
        });
    }

    onModalShow() {
        this.setState({
            validated: false,
            feedbackMessage: '',
        });
    }

    render() {
        return <Modal
            centered
            onHide={() => this.props.closeFeedback()}
            onEnter={() => this.onModalShow()}
            show={this.props.visible}>
            <Modal.Header closeButton>
                <Modal.Title >
                    {i18n.t('feedbackModal.modalHeader')}
                </Modal.Title>
            </Modal.Header>
            <Form noValidate validated={this.state.validated} onSubmit={(event: React.FormEvent) => this.onSubmit(event)} >
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>{i18n.t('feedbackModal.message')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={5}
                            value={this.state.feedbackMessage}
                            onChange={(event) => this.setState({feedbackMessage: event.target.value})}
                            required
                        />
                        <Form.Control.Feedback type="invalid">
                            {i18n.t('error.empty_feedback')}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => this.props.closeFeedback()}>{i18n.t('modal.close')}</Button>
                    <Button variant="primary" type="submit"> {i18n.t('modal.submit')} </Button>
                </Modal.Footer>
            </Form>
        </Modal>;
    }
}


const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        submitFeedback: async (feedback:string) => {
            await dispatch(submitFeedbackThunk(feedback));
        },

        closeFeedback: () => {
            return dispatch(closeFeedbackAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(null, mapDispatchToProps)(FeedbackFormComponent);
