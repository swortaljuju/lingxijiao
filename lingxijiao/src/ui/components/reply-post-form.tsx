import * as React from 'react';
import {connect} from 'react-redux';
import {closeReplyPostModalAction} from '../store/reducers';
import {submitResponseThunk, updateResponseAction} from '../store/asyncs';
import {} from 'react-bootstrap';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState, PostData, ResponseData} from '../store/states';
import {ErrorCode} from '../../common/error_codes';
import {Response} from '../../proto/response.js';
import {ThunkDispatch} from 'redux-thunk';


type State = ResponseData

interface OwnProps {
}

interface DispatchProps {
  updateResponseData: (response: ResponseData) => void;
  submitResponse: (response: ResponseData) => Promise<void>;
  close: () => void;
}

interface StateProps {
  post: PostData;
  initialResponseData?: ResponseData;
  errors?: ErrorCode[];
}

type Props = StateProps & OwnProps & DispatchProps

class ReplyPostFormComponent extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        // copy initial data.
        const initialState: State = Response.toObject(new Response(props.initialResponseData)) as ResponseData;
        this.setState(initialState);
    }

    render() {
        return <h1></h1>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        post: state.responseForm!.post,
        initialResponseData: state.responseForm?.response,
        errors: state.postCreationForm?.errors.slice(0),
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        submitResponse: async (response: ResponseData) => {
            await dispatch(submitResponseThunk(response));
        },

        updateResponseData: (response: ResponseData) => {
            return dispatch(updateResponseAction(response));
        },

        close: () => {
            return dispatch(closeReplyPostModalAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(ReplyPostFormComponent);

