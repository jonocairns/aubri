import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './style.scss';
import * as serviceWorker from './serviceWorker';

import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import { rootReducer } from './reducers/index';
import { createStore, applyMiddleware, compose } from 'redux';

const middleware = [thunk];
if (process.env.NODE_ENV !== 'production') {
    middleware.push((createLogger() as any));
}

const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, /* preloadedState, */ composeEnhancers(
    applyMiddleware(...middleware)
));

ReactDOM.render(
    <Provider store={store}><App /></Provider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
