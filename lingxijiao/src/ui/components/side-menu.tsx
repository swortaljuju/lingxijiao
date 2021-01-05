import * as React from 'react';
import {connect} from 'react-redux';
import {closeMenuAction} from '../store/reducers';
import {} from '../store/asyncs';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
//import './App.scss';
//import styles from './App.module.scss';
import {RootState} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
  closeMenu: () => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps

class SideMenuComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        closeMenu: () => {
            return dispatch(closeMenuAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(null, mapDispatchToProps)(SideMenuComponent);

