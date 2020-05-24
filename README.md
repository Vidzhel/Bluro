# Bluro

## Structure

## Features

## API

### API endpoints

/signup - POST - register account

/login - POST - user authentication

### Request

#### Authentication

```
{
  "auth": {
    "email": "email",
    "pass": "pass"
  },
{
```

200 - Logged in

400 - Wrong data format

403 - Wrong username or password

#### Registration

```
}
"auth": {
    "login": "login",
    "email": "email",
    "blogName": "blogName",
    "pass": "pass",
    "repPass": "pass"
  }
}
```

201 - Created

400 - Wrong data format

### Response

```
{
    errors: [], // Error messages
    success: [], // Success messages
    collection: {
        count: number // Number of items in the collection
        data: [] // Collection of data
    }
}
```

### Codes

200 **OK** - Standard response for successful HTTP requests. Data Updated, Delete

201 **Created** - The request has been fulfilled, resulting in the creation of a new resource.

202 **Accepted** - The request has been accepted for processing, but the processing has not been completed. Async operation e.g. DELETE resource

400 **Bad Request** - The HTTP request that was sent to the server has invalid syntax.

401 **Unauthorized** - The user trying to access the resource has not been authenticated or has not been authenticated correctly.

403 **Forbidden** - The user made a valid request but the server is refusing to serve the request, due to a lack of permission to access the requested resource.

404 **Not Found** - The user is able to communicate with the server but it is unable to locate the requested file or resource.

500 **Internal Server Error** - Server cannot process the request for an unknown reason.
