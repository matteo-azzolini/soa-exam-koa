import fs from "fs";
import https from "https";
import app from './app/app.js';

const options = {
  key: fs.readFileSync('cert/key.pem'),
  cert: fs.readFileSync('cert/cert.pem')
};

https.createServer(options, app.callback()).listen(process.env.HTTPS_PORT);
