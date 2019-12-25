import React from 'react';
import {BrowserRouter as Router, Route, Switch} from 'react-router-dom';

import {GlobalPlayer} from './components/GlobalPlayer';
import Detail from './Detail';
import Grid from './Grid';
import {Nav} from './Nav';

const App: React.FC = () => {
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
