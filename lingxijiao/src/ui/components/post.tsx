import * as React from 'react';
import {connect} from 'react-redux';
import {replyPostAction} from '../store/reducers';
import {} from 'react-bootstrap';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState, PostData} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';


interface State {
}

interface OwnProps extends PostData {
  key: string;
}

interface DispatchProps {
  replyPost: (post: PostData) => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps

class PostComponent extends React.Component<Props, State> {
    render() {
        return <h1></h1>;
    }
}


const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        replyPost: (post: PostData) => {
            return dispatch(replyPostAction(post));
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(null, mapDispatchToProps)(PostComponent);

