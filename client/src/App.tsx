import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';
import {Spinner} from 'reactstrap';

import {useAuth0} from './Auth';
import {GlobalPlayer} from './components/GlobalPlayer';
import {Nav} from './components/Nav';
import Detail from './Detail';
import Grid from './Grid';

const App: React.FC = () => {
  const {isInitializing, isAuthenticated, loginWithRedirect} = useAuth0();

  if (isInitializing) {
    return (
      <div className="d-flex justify-content-center align-items-center text-white mt-5 pt-5">
        <Spinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    loginWithRedirect({});
    return null;
  }

  return (
    <div className="container-fluid px-0">
      <Nav />
      <Router>
        <Switch>
          <Route path="/detail/:id">
            <Detail />
          </Route>
          <Route path="/">
            <Grid />
          </Route>
        </Switch>
      </Router>
      {/* this div is to ensure the global player doesn't hang over existing content */}
      <div style={{height: '150px'}}></div>
      <GlobalPlayer />
    </div>
  );
};

export default App;
