import * as React from 'react';
import {connect} from 'react-redux';
import {showFeedbackAction} from '../store/reducers';
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
  showFeedback: () => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps

class FeedbackButtonComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        showFeedback: () => {
            return dispatch(showFeedbackAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(null, mapDispatchToProps)(FeedbackButtonComponent);

