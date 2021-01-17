import * as React from 'react';
import {connect} from 'react-redux';
import {closeAlertAction} from '../store/reducers';
import {} from '../store/asyncs';
import {} from 'react-bootstrap';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
  closeAlert: () => void;
}

interface StateProps {
  messageKey?: string;
}

type Props = StateProps & OwnProps & DispatchProps

class AlertComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        messageKey: state.alertMessageKey,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        closeAlert: () => {
            return dispatch(closeAlertAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(AlertComponent);

