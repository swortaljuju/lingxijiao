import * as React from 'react';
import {connect} from 'react-redux';
import {showMenuAction, updateGenderAction, updateSearhKeywordAction, showPostCreationModalAction} from '../store/reducers';
import {loadPostThunk} from '../store/asyncs';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.scss';
// import styles from './App.module.scss';
import {Gender} from '../../proto/common.js';
import {RootState} from '../store/states';

import {ThunkDispatch} from 'redux-thunk';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
    showMenu: () => void;
    updateGender: (gender: Gender) => void;
    updateSearhKeyword: (keyword: string) => void;
    showPostCreationModal: () => void;
    loadPost: (postNumber: number) => Promise<void>;
}

interface StateProps {
    gender?: Gender;
}

type Props = StateProps & OwnProps & DispatchProps

class HeaderComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        gender: state.queryParams.gender,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        showMenu: () => {
            return dispatch(showMenuAction());
        },

        updateGender: (gender: Gender) => {
            return dispatch(updateGenderAction(gender));
        },

        updateSearhKeyword: (keyword: string) => {
            return dispatch(updateSearhKeywordAction(keyword));
        },

        showPostCreationModal: () => {
            return dispatch(showPostCreationModalAction());
        },

        loadPost: async (postNumber: number) => {
            await dispatch(loadPostThunk(postNumber));
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(HeaderComponent);


