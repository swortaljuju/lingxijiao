import * as React from 'react';
import {connect} from 'react-redux';
import {} from '../store/reducers';
import {loadPostThunk} from '../store/asyncs';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.scss';
// import styles from './App.module.scss';

import {RootState, PostData} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';


interface State {
}

interface OwnProps {
}

interface DispatchProps {
  loadMorePost: (postNumber: number) => Promise<void>;
}

interface StateProps {
    posts: PostData[];
}

type Props = StateProps & OwnProps & DispatchProps

class PostsComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        posts: state.posts,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        loadMorePost: async (postNumber: number) => {
            await dispatch(loadPostThunk(postNumber));
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(PostsComponent);

