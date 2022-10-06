# soa-exam-koa

Simple Rest API for Service-Oriented Architectures exam

Written with [Koa js](https://github.com/koajs/koa)

## Requests example

Examples of http requests can be found in [requests.rest](./requests.rest) file or inside [./test](./test/) directory

## Setup

Setup environement variables inside [.env](./.env) file.

### ACCESS_TOKEN_SECRET

> **Warning** It is mandatory to generate a secret to start the server

Set a value to ACCESS_TOKEN_SECRET so that the server can sign jwt token for authentication

```properties
# .env
ACCESS_TOKEN_SECRET=$insert-secret
```

Example of secret generation with `nodejs`:

```console
node

require('crypto').randomBytes(64).toString('hex')
```

## Run

### Install dependencies

```
npm install
```

### Start http server

```
npm run start:http
```

### Start https server

> **Warning**: Requires cert
```
npm run start:https
```

### Run tests

```
npm run test
```
