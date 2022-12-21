import { CircuitBreaker } from "../utils/circuitBreaker.js";
import { signToken } from "../utils/commons.js";
import {logger} from "@oas-tools/commons";
import Account from "../mongo/Account.js";
import bcrypt from "bcrypt";

export function login(req, res) {
    const { username, password } = res.locals.oas.body;
    
    CircuitBreaker.getBreaker(Account).fire("findOne", {username}).then((userAcc) => {
        if (bcrypt.compareSync(password, userAcc?.password ?? "")) {
            signToken(req, res, {
                username: userAcc.username,
                role: userAcc.role,
                plan: userAcc.plan
            });
            res.status(201).send();
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

    CircuitBreaker.getBreaker(new Account({
        ...accountInfo,
        ...(req.file?.publicUrl ? { avatar: req.file?.publicUrl } : {}),
        password: bcrypt.hashSync(accountInfo.password, 10), 
        role: "user",
        plan: "base"
    }), "saveAccount")
    .fire("save")
    .then(() => {
        //TODO Create new recipebook
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

