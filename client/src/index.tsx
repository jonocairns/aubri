import './style.scss';

import {createBrowserHistory} from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {applyMiddleware, compose, createStore} from 'redux';
import {createLogger} from 'redux-logger';
import thunk from 'redux-thunk';

import {Settings} from '../../server/src/controllers/settings';
import App from './App';
import {Auth0Provider} from './Auth';
import {rootReducer} from './reducers/index';
import * as serviceWorker from './serviceWorker';

const middleware = [thunk];
if (process.env.NODE_ENV !== 'production') {
  middleware.push(createLogger() as any);
}

interface ClientSettings extends Settings {
  baseUrl: string;
}

export let settings: ClientSettings = {
  clientId: '',
  domain: '',
  baseUrl: process.env.REACT_APP_API_BASE_URL ?? '',
};

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

const fetchSettings = async () => {
  const response = await fetch(`${settings.baseUrl}api/settings`);
  return await response.json();
};

const renderApp = async () => {
  const apiSettings = await fetchSettings();
  settings = {...settings, ...apiSettings};

  ReactDOM.render(
    <Auth0Provider
      domain={settings.domain}
      client_id={settings.clientId}
      redirect_uri={window.location.origin}
      onRedirectCallback={onRedirectCallback}
    >
      <Provider store={store}>
        <App />
      </Provider>
    </Auth0Provider>,
    document.getElementById('root')
  );
};

renderApp();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
