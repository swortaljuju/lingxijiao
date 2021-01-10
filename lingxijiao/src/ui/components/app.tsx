import * as React from 'react';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './global.scss';
//import styles from './app.module.scss';
import HeaderComponent from './header';
import PostsComponent from './posts';
import ModalsComponent from './modals';
import FeedbackButtonComponent from './feedback-button';
import SideMenuComponent from './side-menu';

export const App = () => (
    <>
        <HeaderComponent />
        <SideMenuComponent />
        <PostsComponent />
        <ModalsComponent />
        <FeedbackButtonComponent/>
    </>
);
