import { CircuitBreaker } from "../utils/circuitBreaker.js";
import commons from "../utils/commons.js";
import Account from "../mongo/Account.js";
import {logger} from "@oas-tools/commons";
import serverExports from "../server.js";
import bcrypt from "bcrypt";
import _ from "lodash";

export function getAccounts(_req, res) {
    CircuitBreaker.getBreaker(Account, res, {onlyOpenOnInternalError: true}).fire("find", {}).then((results) => {
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
    CircuitBreaker.getBreaker(Account, res, {onlyOpenOnInternalError: true})
    .fire("findOne", {username: res.locals.oas.params.username}).then((acc) => {
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

export function updateAccount(req, res) {
    const update = {
        ...res.locals.oas.body.AccountInfo,
        ...(req.file?.publicUrl ? { avatar: req.file.publicUrl } : {}),
        ...(res.locals.oas.body.AccountInfo.password ? { password: bcrypt.hashSync(res.locals.oas.body.AccountInfo.password, 10) } : {})
    };

    CircuitBreaker.getBreaker(Account, res, {onlyOpenOnInternalError: true})
    .fire("findOneAndUpdate", {username: res.locals.oas.params?.username}, update, {runValidators: true})
    .then((oldAcc) => {
        if (!oldAcc) {
            res.status(404).send({message: `Account with username '${res.locals.oas.params.username}' does not exist`});
        } else {
            serverExports.fileRef(oldAcc)?.delete().catch((err) => logger.warn(`Couldn't delete firebase file: ${err}`));
            commons.signToken(req, res, update);           
            res.status(204).send();
        }
    }).catch((err) => {
        if (err.message?.toLowerCase().includes("validation failed")) {
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

export function deleteAccount(_req, res) {
    CircuitBreaker.getBreaker(Account, res, {onlyOpenOnInternalError: true})
    .fire("findOneAndDelete", {username: res.locals.oas.params.username}).then((acc) => {
        //TODO Delete recipebook
        serverExports.fileRef(acc)?.delete().catch((err) => logger.warn(`Couldn't delete firebase file: ${err}`));
        res.status(204).send();
    }).catch((err) => {
        logger.error(`Error while getting all accounts: ${err.message}`);
        res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
    })
}

