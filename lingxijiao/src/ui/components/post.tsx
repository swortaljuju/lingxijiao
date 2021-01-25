import * as React from 'react';
import {connect} from 'react-redux';
import {replyPostAction} from '../store/reducers';
import {Card, ListGroup} from 'react-bootstrap';
import styles from './posts.module.scss';
import {RootState, PostData} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';
import i18n from '../i18n/config';
import {POST_BACKGROUNDS_FOLDER_VAL, availablePostBackgrounds} from '../globals';
import {IoMdFemale, IoMdMale} from 'react-icons/io';
import {Gender} from '../../proto/common.js';

function createRandomPostBackgroundImageUrl(): string {
    return `${POST_BACKGROUNDS_FOLDER_VAL}/${
        availablePostBackgrounds[Math.floor(Math.random() * (availablePostBackgrounds.length))]}`;
}

interface State {
}

interface OwnProps {
  post: PostData;
}

interface DispatchProps {
  replyPost: (post: PostData) => void;
}

interface StateProps {
}

type Props = StateProps & OwnProps & DispatchProps

class PostComponent extends React.Component<Props, State> {
    render() {
        const narrationItems = [];

        for (let i=0; i < this.props.post.narrations!.length; i++) {
            narrationItems.push(
                <ListGroup.Item key={`narration_label_${i}`}>
                    {this.props.post.narrations![i].label}
                </ListGroup.Item>,
            );
            narrationItems.push(
                <ListGroup.Item key={`narration_content_${i}`} className={styles['narration-content']}>
                    {this.props.post.narrations![i].content}
                </ListGroup.Item>,
            );
        }
        return (
            <Card className={styles['post']}
                onClick={() => this.props.replyPost(this.props.post)}
                title={i18n.t('replyPost')}
                style={{backgroundImage: `url("${createRandomPostBackgroundImageUrl()}")`}}>
                <Card.Header className={styles['gender-age-container']}>
                    <div className={styles['gender']}>
                        {(this.props.post.gender == Gender.MALE) ?
                            <IoMdMale className={styles['male']}/> :
                            <IoMdFemale className={styles['female']}/>}
                    </div>
                    <div>
                        {i18n.t('age', {age: this.props.post.age})}
                    </div>
                </Card.Header>
                <ListGroup className={styles['narrations']}>
                    {narrationItems}
                </ListGroup>
            </Card>);
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

