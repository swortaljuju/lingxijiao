import * as React from 'react';
import {connect} from 'react-redux';
import {closeFeedbackAction} from '../store/reducers';
import {submitFeedbackThunk} from '../store/asyncs';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.scss';
// import styles from './App.module.scss';
import {ThunkDispatch} from 'redux-thunk';
import {RootState} from '../store/states';


interface State {
}

interface OwnProps {
}

interface DispatchProps {
  submitFeedback: (feedback: string) => Promise<void>;
  closeFeedback: () => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps


class FeedbackFormComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
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
