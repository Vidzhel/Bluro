import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Provider } from "react-redux";

import { store } from "./assets/store";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import { LoggingPage } from "./pages/Logging";
import { NoMatch } from "./pages/NoMatch";

function App() {
	return (
		<Provider store={store}>
			<Layout>
				<BrowserRouter>
					<Switch>
						<Route exact path="/" component={HomePage} />
						<Route path="/auth" component={LoggingPage} />
						<Route component={NoMatch} />
					</Switch>
				</BrowserRouter>
			</Layout>
		</Provider>
	);
}

export default App;
