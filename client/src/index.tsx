import './style.scss';

import {createBrowserHistory} from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';

import App from './App';
import {Auth0Provider} from './Auth';
import {rootReducer} from './reducers/index';
import * as serviceWorker from './serviceWorker';

const middleware = [thunk];
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger() as any);
}

interface WindowSettings {
  REACT_APP_API_BASE_URL: string;
  REACT_APP_AUTH0_DOMAIN: string;
  REACT_APP_AUTH0_CLIENT_ID: string;
}

export const settings = (window as any) as WindowSettings;

const composeEnhancers =
  (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  rootReducer,
  /* preloadedState, */ composeEnhancers(applyMiddleware(...middleware))
);

const history = createBrowserHistory();

const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname
  );
};

console.log(process.env.REACT_APP_AUTH0_DOMAIN);
ReactDOM.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN || ''}
    client_id={process.env.REACT_APP_AUTH0_CLIENT_ID || ''}
    redirect_uri={window.location.origin}
    onRedirectCallback={onRedirectCallback}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </Auth0Provider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
