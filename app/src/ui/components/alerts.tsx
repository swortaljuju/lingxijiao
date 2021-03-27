import * as React from 'react';
import {connect} from 'react-redux';
import {closeAlertAction} from '../store/reducers';
import {} from '../store/asyncs';
import {Modal, Button} from 'react-bootstrap';
// import './App.scss';
// import styles from './App.module.scss';
import {RootState} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';
import i18n from '../i18n/config';

interface State {
}

interface OwnProps {
    visible: boolean;
}

interface DispatchProps {
  closeAlert: () => void;
}

interface StateProps {
  messageKey?: string;
}

type Props = StateProps & OwnProps & DispatchProps

class AlertComponent extends React.Component<Props, State> {
    private closeTimeout?: number;

    onShow() {
        this.closeTimeout = window.setTimeout(() => {
            // Automatically close the alert after some time.
            this.props.closeAlert();
        }, 5000);
    }

    onHide() {
        clearTimeout(this.closeTimeout);
        this.props.closeAlert();
    }

    render() {
        return <Modal show={this.props.visible}
            onHide={() => this.onHide()}
            centered
            onShow={() => this.onShow()}
        >
            <Modal.Body>{i18n.t(this.props.messageKey || '')}</Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={() => this.onHide()}>{i18n.t('modal.close')}</Button>
            </Modal.Footer>
        </Modal>;
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

