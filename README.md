# soa-exam-koa

Simple Rest API for Service-Oriented Architectures exam

Written with [Koa js](https://github.com/koajs/koa)

## Requests example

Examples of http requests can be found in [requests.rest](./requests.rest) file or inside [./test](./test/) directory

## Setup

Setup environement variables inside [./.env](./.env) file.

### Generate secret

Set a value to
```properties
# .env
ACCESS_TOKEN_SECRET=$insert-secret
```

> **Warning**: you need to generate an access token secret in order to sign jwt tokens

Example of secret generation with `nodejs`:
```shell
node

require('crypto').randomBytes(64).toString('hex')
```

[.env](./.env)

## Run

### Install dependencies

```
npm install
```

### Start http server

```
npm run start:http
```

### Start https server (require cert)

> **Warning**: Requires cert
```
npm run start:https
```

### Run tests

```
npm run test
```
