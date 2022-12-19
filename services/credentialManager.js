import Account from "../mongo/Account.js";
import {logger} from "@oas-tools/commons";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export function login(_req, res) {
    const { username, password } = res.locals.oas.body;
    const secret = process.env.JWT_SECRET ?? "testsecret";
    
    Account.findOne({username}).then((userAcc) => {
        if (bcrypt.compareSync(password, userAcc?.password ?? "")) {

            //TODO Auth: Add ownership params from other services
            const token = jwt.sign({
                username: userAcc.username,
                role: userAcc.role,
                plan: userAcc.plan
            }, secret, {
                issuer: process.env.JWT_ISSUER ?? "youryummy",
                expiresIn: '24h'
            });
            
            const secure = process.env.COOKIE_DOMAIN ? 'Secure;' : ';';

            res.setHeader('Set-Cookie',
                `authToken=${token}; HttpOnly; ${secure} Max-Age=${60 * 60 * 24}; Path=/; Domain=${process.env.COOKIE_DOMAIN || 'localhost'}`
            ).status(201).send();

        } else {
            res.status(400).send({ message: 'Invalid username or password' });
        }
    }).catch((err) => {
        logger.error(`Error while signing JWT: ${err.message}`);
        res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
    });
}

export function register(req, res) {
    const accountInfo = res.locals.oas.body.AccountInfo;

    //TODO Create new recipebook
    accountInfo.avatar = req.file?.publicUrl;
    new Account({...accountInfo, password: bcrypt.hashSync(accountInfo.password, 10)}).save()
    .then(() => {
        res.status(201).send();
    }).catch(err => {
        if (err.message?.includes("Account validation failed")) {
            req.file?.fileRef?.delete();
            res.status(400).send({ message: `Validation error: ${err.message}` })
        } else if (err.message?.includes("duplicate key error")) {
            res.status(400).send({ message: `${err.message?.match(/\{.*\}/gm).map(s => s.replace(/"/g, "'").replace(/{|}/g, "")).join(',').trim()} is duplicated, must be unique` })
        } else {
            req.file?.fileRef?.delete();
            logger.error(`Error while saving account in db: ${err.message}`);
            res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
        }
    });
}

