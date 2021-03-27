import * as React from 'react';
import {connect} from 'react-redux';
import {} from '../store/reducers';
import {loadPostThunk} from '../store/asyncs';
import {CardGroup, Card, Spinner} from 'react-bootstrap';
import styles from './posts.module.scss';
import {RootState, PostData} from '../store/states';
import {ThunkDispatch} from 'redux-thunk';
import PostComponent from './post';
import {getDefaultPostCountToLoad, getNumberOfPostPerRow} from './post-helpers';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
  loadMorePost: (postNumber: number) => Promise<void>;
}

interface StateProps {
    posts: PostData[];
    postsLoading: boolean;
    noMorePostToLoad: boolean;
}

type Props = StateProps & OwnProps & DispatchProps

class PostsComponent extends React.Component<Props, State> {
    private postListRef: React.RefObject<HTMLDivElement>;
    // A timeout handle to throttle scroll handler execution frequency to improve performance
    private scrollThrottleTimeout?: number;

    constructor(props: Props) {
        super(props);
        if (props.posts.length == 0 && !props.postsLoading && !props.noMorePostToLoad) {
            props.loadMorePost(getDefaultPostCountToLoad());
        }
        this.postListRef = React.createRef();
    }

    render() {
        const postCards = this.props.posts.map((post) => {
            return (<PostComponent key={post.postId!} post={post}></PostComponent>);
        });
        if (this.props.postsLoading) {
            // Append spinner as last post.
            postCards.push(
                <Card key='postListSpinner' className={styles['spinner-card']}>
                    <Card.Body>
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Loading...</span>
                        </Spinner>
                    </Card.Body>
                </Card>,
            );
        }
        return (
            <div className={styles['posts-container']} onScroll={() => this.onPostListScroll()}>
                <CardGroup
                    className={styles['posts']}
                    ref={this.postListRef}
                > {postCards} </CardGroup>
            </div>);
    }

    componentDidUpdate() {
        if (this.props.postsLoading || this.props.noMorePostToLoad) {
            return;
        }

        const listRect = this.postListRef.current?.getBoundingClientRect();
        if (this.props.posts.length > 0 && listRect &&
            listRect.height > 0 && listRect.bottom <= window.innerHeight) {
            // estimate how many posts are needed to fill the window and load 2 times of that number.
            this.props.loadMorePost(Math.max(10,
                Math.ceil(this.props.posts.length * (window.innerHeight / listRect.height - 1) *2)));
        }
    }

    private onPostListScroll() {
        if (!this.scrollThrottleTimeout) {
            this.scrollThrottleTimeout = window.setTimeout(() => {
                this.scrollThrottleTimeout = undefined;
                if (this.props.postsLoading || this.props.noMorePostToLoad) {
                    return;
                }
                const listRect = this.postListRef.current?.getBoundingClientRect();
                if (listRect) {
                    const rowHeight = listRect.height * getNumberOfPostPerRow() / this.props.posts.length;
                    if ( (listRect.bottom - window.innerHeight) <= (2 * rowHeight)) {
                        // Load more posts if less than 2 rows of posts are below.
                        this.props.loadMorePost(getDefaultPostCountToLoad());
                    }
                }
            }, 200);
        }
    }

    componentWillUnmount() {
        clearTimeout(this.scrollThrottleTimeout);
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        posts: state.posts,
        postsLoading: Boolean(state.uiStates.postsLoading),
        noMorePostToLoad: Boolean(state.uiStates.noMorePostToLoad),
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

