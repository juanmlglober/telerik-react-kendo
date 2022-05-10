import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import './App.css';
import '@progress/kendo-theme-bootstrap/dist/all.css'

import { BacklogPage } from './modules/backlog/pages/backlog/backlog-page';
import { DashboardPage } from './modules/dashboard/pages/dashboard/dashboard-page';
import { MainMenu } from './shared/components/main-menu/main-menu';
import { SideMenu } from './shared/components/side-menu/side-menu';
import { DetailPage } from './modules/backlog/pages/detail/detail-page';


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <React.Fragment>
          <MainMenu />
          <div className="container-fluid">
            <div className="row">

              <SideMenu></SideMenu>

              <main role="main" className="col-md-9 ml-sm-auto col-lg-10 px-4">
                <Switch>
                  <Route exact path="/">
                    <Redirect exact to={{ pathname: "/dashboard" }} />
                  </Route>
                  <Route exact path="/dashboard" component={DashboardPage} />
                  <Route exact path="/backlog">
                    <Redirect exact to={{ pathname: "/backlog/open" }} />
                  </Route>
                  <Route exact path="/backlog/:preset" component={BacklogPage} />

                  <Route
                    exact
                    path="/detail/:id"
                    render={({ match }) => (
                      <Redirect to={`/detail/${match.params.id}/details`} />
                    )}
                  />

                  <Route exact path="/detail/:id/:screen" component={DetailPage} />
                </Switch>
              </main>
            </div>
          </div>
        </React.Fragment>
      </BrowserRouter>
    );
  }
}

export default App;
