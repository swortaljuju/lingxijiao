import * as React from 'react';
import i18n from '../i18n/config';
import {connect} from 'react-redux';
import {updateGenderAction, updateSearhKeywordAction, showPostCreationModalAction, showFeedbackAction, showTutorialAction} from '../store/reducers';
import {loadPostThunk} from '../store/asyncs';
import {Navbar, Nav, NavDropdown, Form, FormCheck} from 'react-bootstrap';
import styles from './header.module.scss';
import {Gender} from '../../proto/common.js';
import {RootState} from '../store/states';
import {getDefaultPostCountToLoad} from './post-helpers';
import {VERSION} from '../globals';
import {ThunkDispatch} from 'redux-thunk';
import {generateId} from '../id-generators';

interface State {
}

interface OwnProps {
}

interface DispatchProps {
    updateGender: (gender: Gender) => void;
    updateSearhKeyword: (keyword: string) => void;
    showPostCreationModal: () => void;
    loadPost: (postNumber: number) => Promise<void>;
    showFeedback: () => void;
    showTutorial: () => void;
}

interface StateProps {
    gender?: Gender;
}

type Props = StateProps & OwnProps & DispatchProps

class HeaderComponent extends React.Component<Props, State> {
    private readonly genderToggleId: string = generateId();

    onGenderChange(event: React.FormEvent<HTMLInputElement>) {
        this.props.updateGender((event.target as HTMLInputElement).checked? Gender.FEMALE : Gender.MALE);
        this.props.loadPost(getDefaultPostCountToLoad());
    }

    onKeywordSearch(event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.code == 'Enter') {
            this.props.updateSearhKeyword((event.target as HTMLInputElement).value);
            this.props.loadPost(getDefaultPostCountToLoad());
        }
    }

    render() {
        return <Navbar
            className={styles['navbar']}
            collapseOnSelect
            expand="md"
            bg="light"
            variant="light"
            fixed="top">
            <Navbar.Brand className={styles['brand']}>{i18n.t('title')}</Navbar.Brand>
            <div
                className={styles['add-button']}
                onClick={() => this.props.showPostCreationModal()}
                title={i18n.t('createPost')}> + </div>
            <Form inline
                className={styles['search-form']}
                onSubmit={ (e) => e.preventDefault()}>
                <FormCheck
                    inline
                    className={styles['gender-toggle']}>
                    <FormCheck.Input
                        id={this.genderToggleId}
                        className={styles['gender-toggle-input']}
                        onChange={(event: React.FormEvent<HTMLInputElement>) => this.onGenderChange(event)}
                        type="checkbox"
                        checked={this.props.gender == Gender.FEMALE}
                    />
                    <FormCheck.Label
                        htmlFor={this.genderToggleId}
                        className={styles['gender-toggle-label']}
                        title={i18n.t('search.genderLabel')}
                    ></FormCheck.Label>
                </FormCheck>
                <Form.Control
                    type="text"
                    className={styles['search']}
                    placeholder={i18n.t('search.searchLabel')}
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => this.onKeywordSearch(event)}
                />
            </Form>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse className={styles['menu-bar']} id="responsive-navbar-nav">
                <Nav>
                    <Nav.Link onClick={() => this.props.showTutorial()}> {i18n.t('tutorial.title')}</Nav.Link> 
                    <NavDropdown title={i18n.t('about')} id="collasible-nav-dropdown">
                        <NavDropdown.Item href={`https://github.com/swortaljuju/lingxijiao/releases/tag/${VERSION}`} target="_blank" >{`v${VERSION}`}</NavDropdown.Item>
                        <NavDropdown.Item href="https://github.com/swortaljuju/lingxijiao/tree/master/app" target="_blank" >Github</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item className={styles['developers']} > {i18n.t('menu.developers')} </NavDropdown.Item>
                        <NavDropdown.Item href="https://swortal.blogspot.com" target="_blank"> Swortal </NavDropdown.Item>
                    </NavDropdown> 
                    <Nav.Link onClick={() => this.props.showFeedback()}> {i18n.t('feedback')}  </Nav.Link>          
                </Nav>
            </Navbar.Collapse>

        </Navbar>;
    }
}


const mapStateToProps = (state: RootState): StateProps => {
    return {
        gender: state.queryParams.gender,
    };
};

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, any>, ownProps: OwnProps): DispatchProps => {
    return {
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
        showFeedback: () => {
            return dispatch(showFeedbackAction());
        },
        
        showTutorial: () => {
            return dispatch(showTutorialAction());
        },
    };
};

export default connect<StateProps, DispatchProps, OwnProps, RootState>(mapStateToProps, mapDispatchToProps)(HeaderComponent);


