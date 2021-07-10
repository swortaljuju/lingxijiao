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
    // Date() creates better random indexes than Math.random() does. And it better avoids
    // continuously identical index.
    return `${POST_BACKGROUNDS_FOLDER_VAL}/${
        availablePostBackgrounds[new Date().valueOf() % availablePostBackgrounds.length]}`;
}

interface State {
    selected: boolean;
}

interface OwnProps {
  post: PostData;
}

interface DispatchProps {
  replyPost: (post: PostData) => void;
}

interface StateProps {
    replyingPost: boolean;
}

type Props = StateProps & OwnProps & DispatchProps

class PostComponent extends React.Component<Props, State> {
    private replyPostTimeout?: number;
    private backgroundImageUrl?: string;

    constructor(props: Props) {
        super(props);
        this.state = {
            selected: false,
        };
    }

    onClick() {
        this.setState({
            selected: true,
        });

        this.replyPostTimeout = window.setTimeout(() => {
            this.props.replyPost(this.props.post);
        }, 1000);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.replyingPost && !this.props.replyingPost && this.state.selected) {
            this.setState({
                selected: false,
            });
        }
    }

    componentWillUnmount() {
        clearTimeout(this.replyPostTimeout);
    }

    render() {
        if (!this.backgroundImageUrl) {
            this.backgroundImageUrl = createRandomPostBackgroundImageUrl();
        }
        const narrationItems = [];

        for (let i=0; i < this.props.post.narrations!.length; i++) {
            narrationItems.push(
                <ListGroup.Item key={`narration_label_${i}`} className={styles['narration-label']}>
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
            <Card className={`${styles['post']} ${this.state.selected ? styles['selected'] : ''}`}
                onClick={() => this.onClick()}
                title={i18n.t('replyPost')}
                style={{backgroundImage: `url("${this.backgroundImageUrl}")`}}>
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

const mapStateToProps = (state: RootState): StateProps => {
    return {
        replyingPost: Boolean(state.uiStates.replyingPost),
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(PostComponent);

