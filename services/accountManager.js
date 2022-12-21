import Account from "../mongo/Account.js";
import {logger} from "@oas-tools/commons";
import { fileRef } from "../server.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import _ from "lodash";

export function getAccounts(_req, res) {
    Account.find({}).then((results) => {      
        res.send(results.map(acc => 
            _.set(
                _.pick(acc, ['username', 'fullName', 'email', 'cellPhone', 'birthDate', 'avatar', 'role', 'plan']),
                'birthDate',
                acc.birthDate?.toISOString().split('T')[0]
            )
        ));
    }).catch((err) => {
        logger.error(`Error while getting all accounts: ${err.message}`);
        res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
    });
}

export function findByusername(_req, res) {
    Account.findOne({username: res.locals.oas.params.username}).then((acc) => {
        if (acc) {
            res.send(
                _.set(
                    _.pick(acc, ['username', 'fullName', 'email', 'cellPhone', 'birthDate', 'avatar', 'role', 'plan']),
                    'birthDate',
                    acc.birthDate?.toISOString().split('T')[0]
                )  
            );
        } else {
            res.status(404).send({message: `Account with username '${res.locals.oas.params.username}' does not exist`})
        }
    }).catch((err) => {
        logger.error(`Error while getting all accounts: ${err.message}`);
        res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
    })
}

export async function updateAccount(req, res) {
    const secret = process.env.JWT_SECRET ?? "testsecret";

    let acc = await Account.findOne({username: res.locals.oas.params?.username}).catch((err) => logger.error(err.message));
    if (acc) {
        const accountInfo = res.locals.oas.body.AccountInfo;
        const {username: oldUsername, role: oldRole} = acc;

        if (req.file?.publicUrl) {
            fileRef(acc)?.delete().catch((err) => logger.warn(`Couldn't delete firebase file: ${err}`));
            accountInfo.avatar = req.file?.publicUrl;
        }
        if (accountInfo.password) accountInfo.password = bcrypt.hashSync(accountInfo.password, 10);

        Object.entries(accountInfo).forEach(([key, val]) => _.set(acc, key, val));
        acc.save()
            .then(() => {
                // Update token if modified by an user and old username != newUsername
                if (oldRole === "user" && oldUsername !== accountInfo.username) {
                    const secure = process.env.COOKIE_DOMAIN ? 'Secure;' : ';';
                    // TODO add attributes from other services ( create a function to sign the token )
                    const token = jwt.sign({
                        username: acc.username,
                        role: acc.role,
                        plan: acc.plan
                    }, secret, {
                        issuer: process.env.JWT_ISSUER ?? "youryummy",
                        expiresIn: '24h'
                    });
                    res.setHeader('Set-Cookie',
                        `authToken=${token}; HttpOnly; ${secure} Max-Age=${60 * 60 * 24}; Path=/; Domain=${process.env.COOKIE_DOMAIN || 'localhost'}`
                    );
                }
                res.status(204).send();
            })
            .catch((err) => {
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
    } else {
        res.status(404).send({message: `Account with username '${res.locals.oas.params.username}' does not exist`})
    }
}

export function deleteAccount(_req, res) {
    //TODO Delete recipebook
    Account.findOneAndDelete({username: res.locals.oas.params.username}).then((acc) => {
        fileRef(acc)?.delete().catch((err) => logger.warn(`Couldn't delete firebase file: ${err}`));
        res.status(204).send();
    }).catch((err) => {
        logger.error(`Error while getting all accounts: ${err.message}`);
        res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
    })
}

