import * as React from 'react';
import {connect} from 'react-redux';
import {RootState} from '../store/states';
import AlertModal from './alerts';
import FeedbackFormModal from './feedback-form';
import PostCreationFormModal from './post-creation-form';
import ReplyPostFormModal from './reply-post-form';
import Tutorial from './tutorial';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
}

enum VisibleModal {
    POST_CREATION_FORM,
    REPLY_POST_FORM,
    SUBMIT_FEEDBACK_FORM,
    ALERT,
    TUTORIAL,
    NONE,
}

interface StateProps {
    visibleModal: VisibleModal;
}

type Props = StateProps & OwnProps & DispatchProps


class ModalsComponent extends React.Component<Props, State> {
    render() {
        return <div>
            <AlertModal visible={this.props.visibleModal == VisibleModal.ALERT}/>
            <FeedbackFormModal visible={this.props.visibleModal == VisibleModal.SUBMIT_FEEDBACK_FORM}/>
            <PostCreationFormModal visible={this.props.visibleModal == VisibleModal.POST_CREATION_FORM}/>
            <ReplyPostFormModal visible={this.props.visibleModal == VisibleModal.REPLY_POST_FORM}/> 
            <Tutorial visible={this.props.visibleModal == VisibleModal.TUTORIAL}/> 
        </div>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    let visibleModal = VisibleModal.NONE;
    if (state.uiStates.alertVisible) {
        visibleModal = VisibleModal.ALERT;
    } else if (state.uiStates.feedbackFormVisible) {
        visibleModal = VisibleModal.SUBMIT_FEEDBACK_FORM;
    } else if (state.uiStates.postCreationModalVisible) {
        visibleModal = VisibleModal.POST_CREATION_FORM;
    } else if (state.uiStates.replyingPost) {
        visibleModal = VisibleModal.REPLY_POST_FORM;
    } else if (state.uiStates.tutorialVisible) {
        visibleModal = VisibleModal.TUTORIAL;
    }
    return {
        visibleModal,
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps)(ModalsComponent);
