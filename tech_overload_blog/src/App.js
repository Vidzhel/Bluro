import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import { HomePage } from "./pages/Home";
import { LoggingPage } from "./pages/Logging";
import { ProfilePage } from "./pages/Profile";
import { BlogPostPage } from "./pages/BlogPost";
import { NoMatch } from "./pages/NoMatch";
import { Header } from "./containers/Header";
import styled from "styled-components";
import { connect } from "react-redux";
import { logIn } from "./actions/session";
import { ModalsController } from "./containers/ModalsController";

const StyledContainer = styled.div`
	a {
		text-decoration: none;
		color: black;
	}
`;

class App extends React.Component {
	componentDidMount() {
		this.props.logIn(null);
	}

	render() {
		return (
			<BrowserRouter>
				<StyledContainer>
					<ModalsController />
					<Header />
					<Switch>
						<Route exact path="/" component={HomePage} />
						<Route path="/auth" component={LoggingPage} />
						<Route path="/profiles/:verbose" component={ProfilePage} />
						<Route path={"/articles/:verbose"} component={BlogPostPage} />
						<Route component={NoMatch} path="/not-found" />
						<Route component={NoMatch} />
					</Switch>
				</StyledContainer>
			</BrowserRouter>
		);
	}
}

const mapDispatchToProps = {
	logIn,
};

App = connect(null, mapDispatchToProps)(App);
export default App;
