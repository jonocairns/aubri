import React from 'react';
import Grid from './Grid';
import Detail from './Detail';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const App: React.FC = () => {

  return (
    <div className="container-fluid">
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
    </div>
  );
}

export default App;
