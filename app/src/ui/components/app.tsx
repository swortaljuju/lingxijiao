import * as React from 'react';
import {} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './root-css-variables.scss';
import HeaderComponent from './header';
import PostsComponent from './posts';
import ModalsComponent from './modals';


export const App = () => (
    <>
        <HeaderComponent />
        <PostsComponent />
        <ModalsComponent />
    </>
);
