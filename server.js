import http from "http";
import multer from "multer";
import express from "express";
import FireBaseStorage from "multer-firebase-storage";
import { initialize, use } from "@oas-tools/core";
import { OASSwagger } from "./middleware/oas-swagger.js";

let fileRef = () => {};

const deploy = async (env) => {
    const firebaseCredential = JSON.parse(Buffer.from(process.env.FIREBASE_CREDENTIALS, 'base64').toString('utf-8'));
    const serverPort = process.env.PORT ?? 8080;
    const app = express();
    app.use(multer({
        storage: FireBaseStorage({
            public: true,
            directoryPath: process.env.NODE_ENV ?? "production",
            bucketName: process.env.FIREBASE_BUCKET,
            credentials: {
                projectId: firebaseCredential.project_id,
                privateKey: firebaseCredential.private_key,
                clientEmail: firebaseCredential.client_email
            },
            hooks: {
                // Modifies the name according to the format <username>-avatar.<extension>
                beforeUpload (req, file) {
                    if (typeof req.body.AccountInfo === "string") req.body.AccountInfo = JSON.parse(req.body.AccountInfo);
                    file.originalname = `${req.body.AccountInfo.username}-avatar.${file.originalname.split(".").at(-1)}`;
                },
                // Exports a function to access the files in controllers
                afterInit (_instance, fb) {
                    fileRef = (userAcc) => {
                        if (userAcc?.avatar) {
                            return fb.storage()
                                .bucket(process.env.FIREBASE_BUCKET)
                                .file(`${process.env.NODE_ENV}/${userAcc.username}-avatar.${userAcc.avatar.split(".").at(-1)}`);
                        }
                    }
                }
            }
        })
    }).single('Avatar'));
    app.use(express.json({limit: '50mb'}));

    // Parse multipart
    app.use((req, _res, next) => {
        if (typeof req.body.AccountInfo === "string") req.body.AccountInfo = JSON.parse(req.body.AccountInfo);
        next();
    });
    
    // Feature toggles
    let config = {}
    if (env === "production") {
        config.middleware = { 
            validator: { requestValidation: false, responseValidation: false } // Done in gateway
        }
    } else if (env === "test") {
        logger.level = "off";
    }

    // Initialize OAS Tools
    use(OASSwagger, {path: "/docs"});
    initialize(app, config).then(() => {
        http.createServer(app).listen(serverPort, () => {
        console.log("\nApp running at http://localhost:" + serverPort);
        console.log("________________________________________________________________");
        if (config?.middleware?.swagger?.disable !== false) {
            console.log('API docs (Swagger UI) available on http://localhost:' + serverPort + '/docs');
            console.log("________________________________________________________________");
        }
        });
    });
}

const undeploy = () => {
  process.exit();
};

export default {deploy, undeploy, fileRef}

