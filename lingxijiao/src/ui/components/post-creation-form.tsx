import * as React from 'react';
import {connect} from 'react-redux';
import {closePostCreationModalAction} from '../store/reducers';
import {updatePostAction, createPostThunk} from '../store/asyncs';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState, PostData} from '../store/states';
import {ErrorCode} from '../../common/error_codes';
import {Post} from '../../proto/post.js';
import {ThunkDispatch} from 'redux-thunk';


interface State extends PostData {
}

interface OwnProps {
}

interface DispatchProps {
  updatePostForm: (post: PostData) => void;
  submitPost: (post: PostData) => Promise<void>;
  close: () => void;
}

interface StateProps {
  initialPostData?: PostData;
  errors?: ErrorCode[];
}

type Props = StateProps & OwnProps & DispatchProps

class PostCreationFormComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        // copy initial data.
        const initialState: State = Post.toObject(new Post(props.initialPostData)) as PostData;
        this.setState(initialState);
    }

    render() {
        return <h1></h1>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        initialPostData: state.postCreationForm?.post,
        errors: state.postCreationForm?.errors.slice(0),
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        submitPost: async (post: PostData) => {
            await dispatch(createPostThunk(post));
        },

        updatePostForm: (post: PostData) => {
            return dispatch(updatePostAction(post));
        },

        close: () => {
            return dispatch(closePostCreationModalAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(PostCreationFormComponent);

