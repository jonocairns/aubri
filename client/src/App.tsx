import React from 'react';
import Grid from './Grid';
import Detail from './Detail';
import { Nav } from './Nav';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import { GlobalPlayer } from './components/GlobalPlayer';

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
      <GlobalPlayer />
    </div>
  );
}

export default App;
