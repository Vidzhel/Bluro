# Bluro

**Bluro** is a headless content management system (CMS) that was built with a clear goal to
achieve - create something interesting and learn useful skills and technologies. As a part of the
project a blog "Tech Overload" was build.

Backend uses neither **no express** nor **no sequelize or other ORMs** only bare bones, only
hardcore

Frontend on the other hand makes use of **React and bunch of other dependencies** to simplify
development

## Table of content

-   [Bluro](#bluro)
    -   [Table of content](#table-of-content)
    -   [Installation](#installation)
    -   [Running dev server with docker](#running-dev-server-with-docker)
    -   [Running components separately](#running-components-separately)
    -   [TechOverload](#techoverload)
    -   [Walk through the UI](#walk-through-the-ui)
    -   [API](#api)
    -   [Configs](#configs)
    -   [API endpoints](#api-endpoints)
    -   [Authentication](#authentication)
    -   [Profiles](#profiles)
    -   [Articles](#articles)
    -   [Comments](#comments)
    -   [Notifications](#notifications)
    -   [General Response](#general-response)
    -   [Collection Response](#collection-response)
    -   [Entity Response](#entity-response)
    -   [Codes](#codes)
    -   [Architecture](#architecture)

## Installation

Go to folder where you want a new folder with the source code to be downloaded, run:

```bash
git clone https://github.com/Vidzhel/Bluro.git
```

### Running dev server with docker

Running the server with docker requires creation of config files under `configs` directory:

-   `.env` file stores the only variable that determines what image will be used for db, by default
    it uses `mysql:5.7.30` but if you want to run the server on a raspberry, you have to replace it
    with `hypriot/rpi-mysql`
-   `api.env` file stores configurations for Bluro API (see [Configs](#Configs))
-   `db.env` file stores root password and the name of the database

```env
MYSQL_ROOT_PASSWORD=n5}47}^FAU6VdY28
MYSQL_DATABASE=bluro
```

`Note:` database name and password in `db.env` and `api.env` must be the same

-   `front.env` file stores variables for the blog and admin panel
    -   REACT_APP_API - sets Bluro API address like `http:/domain_name:8080/api` (in my case it
        redirects to the same domain name and port but different path)
    -   HOST - sets IP to listen (in my case all the IPs)
    -   PORT - sets port to listen

```env
REACT_APP_API=/api
HOST=0.0.0.0
PORT=3000
```

Then you can build and start docker containers by running:

-   For Linux:

```bash
./configs/build_dev.sh
```

-   For Windows:

```ps1
.\configs\build_dev.ps1
```

`Note:` for Windows make sure that file `./configs/dev_entrypoint.sh` has `LF` as End Of Line
Sequence, in other way you'll see error ([more info](https://stackoverflow.com/a/53165472))

Now you're able to visit `localhost`, it'll open Tech Overload blog page. All the paths that starts
with `/admin` are redirected to admin panel. All of the requests that follows paths starting with
`/api` are redirected to Bluro API, so you can use `Postmen` to test API separately.

### Running components separately

If you want to test components separately or debug them, you can run nodejs dev server. For the
purpose you have to run `npm run start` in a folder of a component. To run Bluro API you have to
fill in `bluro_cms/config.json` (see [Configs](#Configs)) beforehand.

Bluro API starts on the port `8000`, Tech Overload Blog on `3000`, Admin panel on `3001`. You can
change the ports but note: if you change the port of the Bluro API, you'll need to change `BASE`
constant in the `admin_panel\src\assets\configs.js` and `tech_overload_blog\src\assets\configs.js`

## TechOverload

Is a blog that was written with React and utilizes "Bluro CMS"'s API. The blog consists of two parts
separated into components

-   Tech Overload blog - a platform where people can read blog posts and if registered, create owns,
    follow others, leave comments.
-   Admin panel - a place where moderators can view all the articles, comments, user's profiles and
    delete them.

### Walk through the UI

#### Blog

Once on the blog's website, you will be greeted by a homepage listing all published articles. Each
article is displayed in the form of a card, which consists of three parts: information about the
author and time of publication (when clicked, redirects to the user's page), pictures, and a title
with a brief description of the article. In the upper right corner you can see the search, and on
the left a call to action to register. It should be noted that to read articles and view profiles,
you do not need to create an account. It is needed if you want to publish articles, subscribe, write
comments.

<p align="center">
	<img src="https://i.imgur.com/Zg3jgcg.png" alt="Home page"/>
</p>

After clicking the "Become a member" button, it sends you to the page with the registration form. If
you have an account, you can click "Have an account?" then it will take you to the login page.

<p align="center">
	<img src="https://i.imgur.com/0uOl2cs.png" alt="Login"/>
</p>

After logging in to your account, it redirects you back to the main page. A message appears in the
upper right corner, now it says that the login was successful. You need to notice some changes in
the interface, namely the disappearance of the call to action button and the appearance of the bell
with messages (there is no new messages yet) and the user's image. If you click on the image, a list
will appear, where when you click on the first item, with advanced user information, you will be
redirected to the profile page. There are also two more items, the first of which is needed to
create a new article, and the second to log out.

<p align="center">
	<img src="https://i.imgur.com/V4GjyMD.png" alt="Home page after logging in"/>
</p>

The user page consists of a header and content. The header contains the name, description, enlarged
image, and number of subscribers and subscriptions. The content part has sections.

<p align="center">
	<img src="https://i.imgur.com/2skYMHy.png" alt="User page"/>
</p>

If you are on your account page, then you will have access to two additional sections: "Settings" (a
place where you can change personal information or delete an account), "Drafts" (a list of all
articles that are saved as drafts).

<p align="center">
	<img src="https://i.imgur.com/HZELJoc.png" alt="Profile Settings"/>
</p>

When you click on "Create new story", a modal window appears with fields to fill. You must add a
title, a description, a preview image, and a file with the extension “md” or “markdown” which
content will be downloaded as an article. Optionally, you can specify the resource name (verbose
name) that will be used in the link, if it is not specified, a random hash will be generated. After
filling in the form you will have the opportunity to publish the article, or save in drafts in order
to do so later.

<p align="center">
	<img src="https://i.imgur.com/WDY3VLE.png" alt="Create article modal window"/>
</p>

All articles (including drafts) created by you will have a pen mark in the upper right part, when
you click on it, a familiar modal window will open, in which you can change the information. If you
click on the article itself, you will be redirected to a page with its content.

<p align="center">
	<img src="https://i.imgur.com/tJVy3Sy.png" alt="Article's content"/>
</p>

At the bottom of the article are the comments. If someone other than you writes and publishes a
comment under your article, then you receive a message (upper right corner red indicator with the
number of unread messages), messages also come if someone subscribed to you, unsubscribed, the
author to whom you subscribe , published a new article or the administrator blocked your article or
comment (all messages are duplicated to the e-mail specified during registration). The administrator
also has the ability to send you messages. You can also edit your comments.

<p align="center">
	<img src="https://i.imgur.com/DCupOkf.png" alt="Article's comments"/>
</p>

#### Admin Panel

The admin panel is divided into three tabs: Users, Articles, Comments, each of which is responsible
for a specific resource that can be moderated. The right part is divided into search and resource
list. You can click on each entity, and additional information about this resource will expand.

<p align="center">
	<img src="https://i.imgur.com/w4OoeMg.png" alt="Admin panel Users tab content"/>
</p>

In the right part of each entity there are two buttons "Info" and "Block". The first sends you to
the page of this resource, the second blocks the resource (the "Enter block cause" field have to be
filled in beforehand). Moderators have additional fields to create a message.

<p align="center">
	<img src="https://i.imgur.com/VrqHgiM.png" alt="Amin panel search"/>
</p>

## API

### Configs

All configs can be added to `bluro_cms/configs.json` file at the root of the project or introduced
as environment variables to make them more secure.

-   `host` - defines ip that the server will be listening
-   `port` - defines port that the server will be listening
-   `secret` - secret string that is used to encode JWT tokens
-   `dbhost` - the address of db's server
-   `database` - name of an already created database
-   `dbConnectionTries` - tries before app fails to connect (default 3)
-   `dbConnectionTryDelay` - delay between tries in milliseconds (default 3000)
-   `connectionTimeout` - max time that the server will be waiting for connection to the db
-   `user` - db user name
-   `password` - db user password
-   `rootUserName` - user name of the admin that will be created in case it doesn't exist
-   `rootEmail` - user name of the admin
-   `rootPassword` - password of the admin
-   `rootVerbose` - verbose name that will be used in the link to profile page (without spaces)
-   `mailService` - a service that will be used to send notification e.g. `gmail`
-   `mailUser` - a login of a service user (if available)
-   `mailPass` - a password of the service user (or API token)
-   `mailSubject` - subject that will be used to send emails
-   `modules` - a list of connected modules (order is matter as db tables will be built the order)
-   `allowedMethods` (optional) - CRUD allowed HTTP methods e.g. `POST`. The parameter is used in a
    default global rule that is named crud.
-   `allowedOrigins` (optional) - allowed hosts e.g `localhost`
-   `exposedHeaders` (optional) - headers that are allowed to be send by client-side code e.g.
    `Cookies`
-   `exposedHeaders` (optional) - headers that are allowed to be read by client-side code e.g
    `X-Custom-Header`
-   `permissionAge` (optional) - notes how long a CORS preflight request is valid (value in seconds)
-   `allowCredentials` (options) - tells browsers whether to expose the response to frontend
    JavaScript code when the request's credentials mode is `include` (boolean value)

## API endpoints

### Authentication

#### Logging in

**Endpoints**

-   /login - POST

**Requests**

```json
{
    "email": "string",
    "pass": "string"
{
```

**Response**

```jsonc
{
	"session": {
		"verbose": "id that is used to get profile info",
		"userName": "userName",
		"role": "user role: 'ADMIN', 'USER'",
		"email": "email",
		"login": "login",
		"img": "name of img resource"
	},

	"errors": "list of descriptions of errors",
	"success": "list of success strings",
	"info": "list of info strings"
}
```

Cookie `token` is sent in header, used to authorize following requests from a client

**Codes**  
200 - Logged in  
403 - Wrong username or password

#### Registration

**Endpoints**

-   /signup - POST

**Request**

```json
{
	"login": "login",
	"email": "email",
	"pass": "password",
	"repPass": "repeated password"
}
```

**Response**

```jsonc
{
	"session": {
		"verbose": "id that is used to get profile info",
		"userName": "userName",
		"role": "user role: 'ADMIN', 'USER'",
		"email": "email",
		"login": "login",
		"img": "name of img resource"
	}

	// Other common parameters
}
```

**Codes**  
201 - Created  
400 - Invalid data was provided 403 - An user with the same name

### Profiles

#### Get or modify profile data

**Endpoints**

-   /profiles/:verbose - GET - get profile by id - responses with an entry (see
    [Entry response](#entity-response))
-   /profiles - GET - get all profiles - responses with collection (see
    [Collection response](#collection-response))

Query parameters `count` and `offset` may be specified to get a part of collection, default 10 and 0
respectively

-   /profiles/:verbose - PUT - update profile with parameters
-   /profiles/:verbose - DELETE - delete profile (no other data is required)

`NOTE:` only admins and owners of profiles can update or delete them

Headers: `Content-Type: multipart/form-data` OR `json` (if you need to update profile image, request
update with the use of multipart form data content type header)

Files:

-   `[img]` - new profile image

**Request**

```jsonc
{
	// all parameters are optional
	"verbose": "new id that is used to get profile info",
	"userName": "new use name",
	"role": "new user role: 'ADMIN', 'USER'",
	"email": "new email",
	"pass": "new pass",
	"repPass": "repeat new pass",
	"about": "new about user"
}
```

`NOTE:` all of the request parameters are optional and may be omitted if you don't want you update
them. Role can only be changed by admins. To change password you need to specify both passwords.
Only an user and an admin can change the user's profile info

400 - Bad data  
403 - User with the same verbose has already been registered 404 - User not found  
200 - OK

#### Get or modify followers

`NOTE:` Only an user and an admin can delete the user's profile info

-   /profiles/:verbose/followers - GET - get user's followers - returns collection (see
    [Collection response](#collection-response))
-   /profiles/:verbose/followings - GET - get user's subscriptions - returns collection
-   /profiles/:verbose/followers/:verbose - GET - is an user follows another user - returns entry
    (see [Entry response](#entity-response))

200 - OK

**Endpoints**

-   /profiles/:verbose/followers - POST - subscribe for an user
-   /profiles/:verbose/followers - DELETE - unsubscribe from an user

404 - User not found  
403 - You're not subscribed or you've already subscribed 200 - OK

### Articles

#### Modify article (create, delete or update)

**Endpoints**

-   /articles/:verbose - PUT - modify
-   /articles/:verbose - DELETE - delete article (no other data is required)
-   /articles - POST - create

`Note`: Only admins and owners of articles can update or delete them

**Request**

Headers: `Content-Type: multipart/form-data` if you send with files or `json` with just data

Files:

-   `content` - text content of an article
-   `previewImg` - preview image

```jsonc
{
	"verbose": "human readable name, if not specified, auto generated will be used",
	"state": "PUBLISHED or PENDING_PUBLISHING",
	"title": "string",
	"description": "string"
}
```

`NOTE:` in the case of updating article all request parameters (including files) are optional but at
least one has to be specified

**Codes**  
201 - Created  
200 - Updated  
403 - Forbidden updating someone else's article  
401 - Unauthorized user

#### Get articles

**Endpoints**

-   /articles/:verbose - GET - returns en entry with an article's specific data (see
    [Collection response](#collection-response))
-   /articles - GET - returns collection of articles (see
    [Collection response](#collection-response))

Query parameters `count` and `offset` may be specified to get a part of collection, default 10 and 0
respectively

**Response**

```jsonc
{
	"entry": {
		"verbose": "verbose name",
		"user": {
			// user data
		},
		"dateOfPublishing": "2020-06-11T09:26:00.000Z",
		"dateOfChanging": "2020-06-11T09:26:00.000Z",
		"title": "string",
		"description": "string",
		"state": "`PUBLISHED` or `PENDING_PUBLISHING`",
		"textSourceName": "name that you can use to access the resource by using different endpoint",
		"previewImageName": "name that you can use to access the resource by using different endpoint"
	}

	// other default parameters
}
```

**Codes**  
200 - Ok  
404 - Article or articles weren't found

#### Get an user's articles

**Endpoints**

-   /profiles/:verbose/articles/:verbose - GET - returns an article of the specified user (see
    [Entry response](#entity-response))
-   /profiles/:verbose/articles - GET - returns collection of articles of the specified user

### Comments

#### Modify comment (create, update, delete)

**Endpoints**

-   /articles/:verbose/comments - POST - create comment
-   /comments/:verbose - PUT - update comment (no other data is required)
-   /comments/:verbose - DELETE - delete comment

`Note` only admins and owners of a comment can update or delete it

**Request**

```jsonc
{
	"content": "content of a comment"
}
```

**Codes**  
201 - Created  
200 - Updated  
403 - Forbidden updating someone else's comment  
404 - Article or comment wasn't found

#### Get comments

**Endpoints**

-   /comments - GET - get all comments (see [Collection response](#collection-response))
-   /articles/:verbose/comments - GET - get all comments for an article
-   /comments/:verbose - GET - get a comment (see [Entry response](#entity-response))
-   /articles/:verbose/comments/:verbose - GET - get a comment

Query parameters `count` and `offset` may be specified to get a part of collection, default 10 and 0
respectively

**Response**

```jsonc
{
	"entity": {
		"user": {
			// creator data
		},
		"content": "content of a comment",
		"creationDate": "date of creation",
		"lastUpdateDate": "date of update"
	}
}
```

**Codes**  
200 - Ok  
404 - Articles or comments weren't found

### Notifications

#### Modify a notification (create, update, delete)

**Endpoints**

-   /profiles/:verbose/notification - POST - create notification
-   /profiles/:verbose/notification/:verbose - PUT - read notification
-   /profiles/:verbose/notification/:verbose - DELETE - delete notification

**Request**

```jsonc
{
	"message": "notification message"
}
```

**Codes**  
201 - Created  
200 - Updated  
403 - Forbidden updating someone else's notification  
404 - Notification or profile wasn't found

#### Get notifications

Notification are sent with a general response (see [General Response](#general-response))

### General Response

```jsonc
{
	"session": {
		"verbose": "id that is used to get profile info",
		"userName": "userName",
		"role": "user role: 'ADMIN', 'USER'",
		"email": "email"
	},

	"errors": "error's descriptions list",
	"success": "success's descriptions list",
	"info": "info's descriptions list",

	"notifications": [
		// collection of notifications
	]
}
```

### Collection Response

```jsonc
{
	"collection": {
		"data": [],
		"offset": "offset in the list of all entries in database",
		"count": "requested count of entries",
		"actualCount": "count of entries in `data` field"
	}

	// Other usual parameters
}
```

### Entity Response

```jsonc
{
	"entity": {
		// Entry parameters
	}

	// Other usual parameters
}
```

### Codes

200 **OK** - Standard response for successful HTTP requests. Data Updated, Delete

201 **Created** - The request has been fulfilled, resulting in the creation of a new resource.

202 **Accepted** - The request has been accepted for processing, but the processing has not been
completed. Async operation e.g. DELETE resource

400 **Bad Request** - The HTTP request that was sent to the server has invalid syntax.

401 **Unauthorized** - The user trying to access the resource has not been authenticated or has not
been authenticated correctly.

403 **Forbidden** - The user made a valid request but the server is refusing to serve the request,
due to a lack of permission to access the requested resource.

404 **Not Found** - The user is able to communicate with the server but it is unable to locate the
requested file or resource.

500 **Internal Server Error** - Server cannot process the request for an unknown reason.

## Architecture

The web application consists of blocks that doesn't affect each other, and therefore are able to be
developed separately and scaled without unnecessary problems.

<p align="center">
	<img src="https://i.imgur.com/iAB3F1T.png" alt="System components"/>
</p>

JavaScript is used to write the server part, namely the NodeJS runtime. The core of the server part
will consist of 7 main components, which together form a system, implementing the MVC pattern:

<p align="center">
	<img src="https://i.imgur.com/qYXiqDx.png" alt="CMS structure"/>
</p>

The part of the web application that accesses the API and which users work with. The admin panel and
blog page use an API to retrieve and modify data. To write these blocks I used ReactJS together with
several additional libraries:

<p align="center">
	<img src="https://i.imgur.com/cqNozhj.png" alt="Front end structure"/>
</p>
