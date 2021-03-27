import React from 'react';
import ReactDOM from 'react-dom';
import {i18nLoadPromise} from './i18n/config';
import {App} from './components/app';

import {Provider} from 'react-redux';
import {store} from './store/store';

// Load i18n resources before rendering the whole app.
i18nLoadPromise.then(() => {
    const rootElement = document.getElementById('root');
    ReactDOM.render(
        <Provider store={store}>
            <App />
        </Provider>,
        rootElement,
    );
});
