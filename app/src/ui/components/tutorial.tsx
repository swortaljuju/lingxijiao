import * as React from 'react';
import {connect} from 'react-redux';
import {closeTutorialAction} from '../store/reducers';
import {Modal, Image} from 'react-bootstrap';
import {RootState} from '../store/states';
import i18n from '../i18n/config';
import {LOCAL_STORAGE_KEY_TUTORIAL_SHOWN, TUTORIAL_SCREENSHOTS_FOLDER_VAL} from '../globals';
import {ThunkDispatch} from 'redux-thunk';
import styles from './tutorial.module.scss';


interface State {}

interface OwnProps {
    visible: boolean;
}

interface DispatchProps {
  closeTutorial: () => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps


class TutorialComponent extends React.Component<Props, State> {
    onModalShow() {
        window.localStorage.setItem(LOCAL_STORAGE_KEY_TUTORIAL_SHOWN, 'true');
    }

    render() {
        return <Modal
            className={styles['tutorial']}
            scrollable
            onHide={() => this.props.closeTutorial()}
            onEnter={() => this.onModalShow()}
            show={this.props.visible}>
            <Modal.Header closeButton>
                <Modal.Title >
                    {i18n.t('tutorial.title')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <h2>{i18n.t('tutorial.welcome')}</h2> 
                <p>{i18n.t('tutorial.summary')}</p>  
                <h3>{i18n.t('tutorial.searchTitle')}</h3>
                <div><b>{i18n.t('tutorial.searchByGender')}</b></div>  
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/search-by-gender.png`}/>
                <br/> 
                <br/>
                <div><b>{i18n.t('tutorial.searchByText')}</b></div>  
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/search-by-text.png`}/>
                <br/>
                <br/> 
                <h3>{i18n.t('tutorial.postTitle')}</h3> 
                <p>{i18n.t('tutorial.postSummary')}</p>
                <div><b>{i18n.t('tutorial.clickToPost')}</b></div>
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/create-post-button.png`}/>
                <br/>
                <br/>
                <div><b>{i18n.t('tutorial.fillPostForm')}</b></div>  
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/create-post-form.png`}/>
                <br/>
                <br/>
                <h3>{i18n.t('tutorial.replyTitle')}</h3>
                <p>{i18n.t('tutorial.replySummary')}</p>
                <div><b>{i18n.t('tutorial.clickToReply')}</b></div>   
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/click-to-reply-post.png`}/>
                <br/>
                <br/>
                <div><b>{i18n.t('tutorial.fillReplyForm')}</b></div>  
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/reply-post-form.png`}/> 
                <br/>
                <br/>
                <div><b>{i18n.t('tutorial.receiveResponse')}</b></div>  
                <Image src={`${TUTORIAL_SCREENSHOTS_FOLDER_VAL}/post-response-email.png`}/> 
                <br/>
                <br/>
            </Modal.Body>
        </Modal>;
    }
}


const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
        closeTutorial: () => {
            return dispatch(closeTutorialAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(null, mapDispatchToProps)(TutorialComponent);
