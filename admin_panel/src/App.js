import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { MainFrame } from "./pages/ManeFrame";
import { UsersPage } from "./pages/Users";
import { NotFoundPage } from "./pages/NotFound";
import { connect } from "react-redux";
import { hasAccess } from "./assets/selectors/selectors";
import { auth } from "./actions/actions";
import { ArticlesPage } from "./pages/Articles";
import { CommentsPage } from "./pages/Comments";

class App extends React.Component {
	componentDidMount = () => {
		this.props.auth();
	};

	render() {
		const hasAccess = this.props.hasAccess;

		return (
			<BrowserRouter>
				<Switch>
					{hasAccess ? (
						<div>
							<Route exact path="/">
								<Redirect to="/users" />
							</Route>
							<Route path="/users">
								<MainFrame page={<UsersPage />} />
							</Route>
							<Route path="/articles">
								<MainFrame page={<ArticlesPage />} />
							</Route>
							<Route path="/comments">
								<MainFrame page={<CommentsPage />} />
							</Route>
						</div>
					) : null}

					<Route path="/" component={NotFoundPage} />
				</Switch>
			</BrowserRouter>
		);
	}
}

const mapStateToProps = (store) => {
	return {
		hasAccess: hasAccess(store),
	};
};

const mapDispatchToPros = {
	auth,
};

App = connect(mapStateToProps, mapDispatchToPros)(App);
export default App;
