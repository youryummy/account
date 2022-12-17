# Account Service

Required env vars:
* PORT: ExpressJS application port (default: 8080)
* MONGO_PROTO: Mongo database protocol (default: mongodb)
* MONGO_HOST: Mongo database host (default: localhost)
* MONGO_PORT: Mongo database port (default: 27017)
* MONGO_DBNAME: Mongo database name (default: default-db)
* MONGO_USER: Mongo database user
* MONGO_PWD: Mongo database password
* FIREBASE_BUCKET: Bucket where files are stored in firebase
* FIREBASE_EMAIL: Client email for firebase connection
* FIREBASE_PROJECT_ID: Firebase project id
* FIREBASE_KEY: Firebase private PEM key
* JWT_SECRET: Secret for token encoding
* JWT_ISSUER: Token issuer
* COOKIE_DOMAIN: Hosts to where the cookie will be sent