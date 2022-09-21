import http from "http";
import app from './app/app.js';

const server = http.createServer(app.callback()).listen(8080)

export default server;
