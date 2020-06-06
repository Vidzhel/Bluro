import React from "react";
import { Router, Redirect, Route, Switch } from "react-router-dom";
import { MainFrame } from "./pages/ManeFrame";
import { UsersPage } from "./pages/Users";
import { NotFoundPage } from "./pages/NotFound";
import { connect } from "react-redux";
import { hasAccess } from "./assets/selectors/selectors";
import { auth } from "./actions/actions";
import { ArticlesPage } from "./pages/Articles";
import { CommentsPage } from "./pages/Comments";
import { HISTORY } from "./assets/constants";
import {MessagesController} from "./components/MessagesController";

class App extends React.Component {
	componentDidMount = () => {
		this.props.auth();
	};

	render() {
		const hasAccess = this.props.hasAccess;

		return (
			<Router history={HISTORY}>
				<MessagesController />
				<Switch>
					{hasAccess ? (
						<div>
							<Route exact path="/admin">
								<Redirect to="/admin/users" />
							</Route>
							<Route path="/admin/users">
								<MainFrame page={<UsersPage />} />
							</Route>
							<Route path="/admin/articles">
								<MainFrame page={<ArticlesPage />} />
							</Route>
							<Route path="/admin/comments">
								<MainFrame page={<CommentsPage />} />
							</Route>
						</div>
					) : null}

					<Route path="/admin" component={NotFoundPage} />
				</Switch>
			</Router>
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
