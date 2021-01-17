import * as React from 'react';
import {connect} from 'react-redux';
import {} from '../store/reducers';
import {} from '../store/asyncs';
import {} from 'react-bootstrap';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState} from '../store/states';


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
    NONE,
}

interface StateProps {
    visibleModal: VisibleModal;
}

type Props = StateProps & OwnProps & DispatchProps


class ModalsComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
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
    }
    return {
        visibleModal,
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps)(ModalsComponent);
