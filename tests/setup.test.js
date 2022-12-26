import { logger } from "@oas-tools/commons";
import Account from "../mongo/Account.js";
import server from '../server.js';
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

process.env.NODE_ENV = "test";
logger.configure({ level: "off" });

// Populate test db and cleanup after integration tests
if (process.argv.includes("tests/integration")) {
    const password = bcrypt.hashSync("Test1234", 10);
    
    mongoose.set('strictQuery', false);
    await mongoose.connect("mongodb://localhost:27017/test", {connectTimeoutMS: 3000, serverSelectionTimeoutMS: 3000 }).then(async () => {
        await Account.insertMany([
            {username: "test", password, fullName: "test", birthDate: "1990-01-01", email: "test@example.com", role: "user", plan: "base"},
            {username: "test1", password, fullName: "test1", birthDate: "1991-02-01", email: "test1@example.com", role: "user", plan: "base"},
            {username: "test2", password, fullName: "test2", birthDate: "1992-03-01", email: "test2@example.com", role: "user", plan: "base"},
            {username: "test3", password, fullName: "test3", birthDate: "1993-04-01", email: "test3@example.com", role: "user", plan: "base"},
            {username: "test4", password, fullName: "test4", birthDate: "1994-05-01", email: "test4@example.com", role: "user", plan: "base"},
            {username: "test5", password, fullName: "test5", birthDate: "1995-06-01", email: "test5@example.com", role: "user", plan: "base"},
            {username: "test6", password, fullName: "test6", birthDate: "1996-07-01", email: "test6@example.com", role: "user", plan: "base"},
            {username: "test7", password, fullName: "test7", birthDate: "1997-08-01", email: "test7@example.com", role: "user", plan: "base"}
        ]);

        // Cleans db after tests
        const oldExit = process.exit;
        process.exit = async (code) => {
            await mongoose.connection.db.dropCollection("account");                                                         
            await mongoose.disconnect();
            oldExit(code);
        };
    }).catch((err) => {
        console.log("Failed to connect to test db: ", err.message);
        process.exit(1);
    });
}

else if (process.argv.includes("tests/component")) {
    dotenv.config({ path: ".env.test" }); // load test env variables

    const mongoHost = process.env.MONGO_HOST;
    const mongoDBName = process.env.MONGO_DBNAME;
    const mongoProto = process.env.MONGO_PROTO;
    const mongoUser = process.env.MONGO_USER;
    const mongoPwd = process.env.MONGO_PWD;
    
    const mongoURL = `${mongoProto}://${mongoUser}:${mongoPwd}@${mongoHost}/${mongoDBName}`;

    mongoose.set('strictQuery', false);
    await mongoose.connect(mongoURL).then(async () => {
        const password = bcrypt.hashSync("Test1234", 10);
        
        // populate test db
        await Account.insertMany([
            {username: "test", password, fullName: "test", birthDate: "1990-01-01", email: "test@example.com", role: "user", plan: "base"},
            {username: "test1", password, fullName: "test1", birthDate: "1991-02-01", email: "test1@example.com", role: "user", plan: "base"},
            {username: "test2", password, fullName: "test2", birthDate: "1992-03-01", email: "test2@example.com", role: "user", plan: "base"},
            {username: "test3", password, fullName: "test3", birthDate: "1993-04-01", email: "test3@example.com", role: "user", plan: "base"},
            {username: "test4", password, fullName: "test4", birthDate: "1994-05-01", email: "test4@example.com", role: "user", plan: "base"},
            {username: "test5", password, fullName: "test5", birthDate: "1995-06-01", email: "test5@example.com", role: "user", plan: "base"},
            {username: "test6", password, fullName: "test6", birthDate: "1996-07-01", email: "test6@example.com", role: "user", plan: "base"},
            {username: "test7", password, fullName: "test7", birthDate: "1997-08-01", email: "test7@example.com", role: "user", plan: "base"}
        ]);

        // Cleans db after tests
        const oldExit = process.exit;
        process.exit = async (code) => {
            await mongoose.connection.db.dropCollection("account");                                                         
            await mongoose.disconnect();
            oldExit(code);
        };

        // Starts server
        await server.deploy(process.env.NODE_ENV).catch(err => { console.log(err); });
        
    }).catch((err) => {
        console.log("Failed to connect to test db: ", err.message);
        process.exit(1);
    });
}