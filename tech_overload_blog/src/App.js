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
		this.props.logIn(null, this.props.history);
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

const profile = {
	userName: "Someone",
	onFollowClicked: () => console.log("followed"),
	aboutUser: "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
	followers: 228,
	following: 337,
	imgSrc:
		"https://images.pexels.com/photos/3162828/pexels-photo-3162828.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
};

const articles = [
	{
		articleSrc: "/",
		date: "May 18",
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		previewImgSrc:
			"https://images.pexels.com/photos/3565601/pexels-photo-3565601.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
		title: "The promised neverland",
		userImgSrc:
			"https://images.pexels.com/photos/3162828/pexels-photo-3162828.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
		userName: "Someone",
	},
];

const articleInfo = {
	title: "The grate small thing",
	userImgSrc:
		"https://images.pexels.com/photos/3162828/pexels-photo-3162828.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500",
	userName: "Some one",
	date: "May 18",
	onFollowClicked: () => console.log("followed"),
};

const article = `
# Live demo

Changes are automatically rendered as you type.

## Table of Contents

* Implements [GitHub Flavored Markdown](https://github.github.com/gfm/)
* Renders actual, "native" React DOM elements
* Allows you to escape or skip HTML (try toggling the checkboxes above)
* If you escape or skip the HTML, no \`dangerouslySetInnerHTML\` is used! Yay!

## HTML block below

<blockquote>
  This blockquote will change based on the HTML settings above.
</blockquote>

## How about some code?
\`\`\`js
var React = require('react');
var Markdown = require('react-markdown');

React.render(
  <Markdown source="# Your markdown here" />,
  document.getElementById('content')
);
\`\`\`

Pretty neat, eh?

## Tables?

| Feature   | Support |
| --------- | ------- |
| tables    | ✔ |
| alignment | ✔ |
| wewt      | ✔ |

## More info?

Read usage information and more on [GitHub](//github.com/rexxars/react-markdown)

---------------

# Reply - Messenger
This is a C# based application powered by .NET and WPF frameworks that provides the main functions you would expect from messenger such as creating chats(public, private), sending messages, sending photos, search. The project consists of two parts: the server and the user application.

![illustration](https://i.ibb.co/B2hw5Hs/Illustrations2.png)

## Table of contents
* [I have learned](#i-have-learned)
* [Features](#features)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
* [Built With](#built-with)

| [![](https://i.ibb.co/RcbYh3N/Main-Window-8-16-2019-11-56-56-AM.png)](https://i.ibb.co/RcbYh3N/Main-Window-8-16-2019-11-56-56-AM.png)  | [![](https://i.ibb.co/h1hp6Hr/Main-Window-8-16-2019-11-57-33-AM.png)](https://i.ibb.co/h1hp6Hr/Main-Window-8-16-2019-11-57-33-AM.png) |
|:---:|:---:|

| [![](https://i.ibb.co/bs3vCPX/Main-Window-8-16-2019-11-59-01-AM.png)](https://i.ibb.co/bs3vCPX/Main-Window-8-16-2019-11-59-01-AM.png)  | [![](https://i.ibb.co/YWD2Lwc/Main-Window-8-16-2019-12-01-45-PM.png)](https://i.ibb.co/YWD2Lwc/Main-Window-8-16-2019-12-01-45-PM.png) |
|:---:|:---:|
В этой статье вы узнаете о популярной JavaScript библиотеке под названием React и увидите несколько обыденных примеров кода, с которым вы будете ежедневно сталкиваться, если зайдете в эту библиотеку визуализаций.
Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).

Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).

Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).

Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).

Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).Пять столетий спустя Lorem Ipsum испытал всплеск популярности с выпуском сухого переноса листов Letraset в. Эти листы надписи можно потереть на любом месте и были быстро приняты художники-графики, принтеры, архитекторов и рекламодателей для их профессионального вида и простоты использования. Letraset включены Lorem Ipsum проходы в арсеналом шрифтов, стилей и размеров, затвердевание место Латинского-эск фразу целиком в печатной и графической индустрии. Те, с вниманием к деталям будет даже поймали дань классического текста в эпизоде Mad Men (S6E1 вокруг 1:18:55 для тех, кто не сделал).

`;
