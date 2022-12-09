import mongoose from 'mongoose';
import server from './server.js';


// Node environment
const env = process.env.NODE_ENV ? process.env.NODE_ENV : 'production';

// Mongo connection variables
const mongoPort = process.env.MONGO_PORT ?? 27017;
const mongoHost = process.env.MONGO_HOST ?? 'localhost';
const mongoDBName = process.env.MONGO_DBNAME ?? 'default-db';
const mongoURL = `mongodb://${mongoHost}:${mongoPort}/${mongoDBName}`;

mongoose.set('strictQuery', false);

mongoose.connect(mongoURL).then(() => {
  server.deploy(env).catch(err => { console.log(err); });
});

// quit on ctrl-c when running docker in terminal
process.on('SIGINT', function onSigint () {
  console.log(`[${new Date().toISOString()}] Got SIGINT (aka ctrl-c in docker). Graceful shutdown`);
  shutdown();
});

// quit properly on docker stop
process.on('SIGTERM', function onSigterm () {
  console.log(`[${new Date().toISOString()}] Got SIGTERM (docker container stop). Graceful shutdown`);
  shutdown();
});

const shutdown = () => {
  server.undeploy();
};
