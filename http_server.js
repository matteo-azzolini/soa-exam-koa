import http from "http";
import app from './app/app.js';

http.createServer(app.callback()).listen(process.env.HTTP_PORT);
