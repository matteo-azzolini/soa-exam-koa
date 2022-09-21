import fs from "fs";
import https from "https";
import app from './app/app.js';

const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

const server = https.createServer(options, app.callback()).listen(8443);

export default server;
