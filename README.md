# Smart Home Authentication

This repo contains the endpoints for authenticating user credentials and registering new users.

## GET /api/auth

Should respond with status 200 and no response body - to show that api is running

## POST /api/login

Example Request -

```json
{ "username": "cloudUser", "password": "cloudIsC00l" }
```

Should respond with 200 status & response body.

```json
{ "msg": "Authorisation successful" }
```

## POST /api/auth/register

Example Request -

```json
{ "username": "anotherCloudUser", "password": "Cloud!Wow!" }
```

Should respond with 201 status & response body.

```json
{ "msg": "Authorisation successful" }
```
