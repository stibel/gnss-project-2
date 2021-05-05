import React from "react";
import {BrowserRouter as Router,
  Switch,
  Route,
  Redirect} from "react-router-dom";
import { StyleContext } from "./styles/StyleContext";
import mainTheme from "./styles/Styles";
import HomeScreen from "./screens/HomeScreen";
import Header from "./components/Header";

function App() {
  return (
    <StyleContext.Provider value={mainTheme}>
      <Router>
        <Header destFirst={'Strona Główna'} destSecond={'Parametry'} destThird={'Wyniki'} />
        <Switch>
          <Route exact path={'/'}>
            <HomeScreen />
          </Route>
          <Route path={'*'}>
            <Redirect exact to={'/'}/>
          </Route>
        </Switch>
      </Router>
    </StyleContext.Provider>
  );
}

export default App;
