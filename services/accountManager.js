import Account from "../mongo/Account.js";
import {logger} from "@oas-tools/commons";
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

export async function updateAccount(_req, res) {
    let acc = await Account.findOne({username: res.locals.oas.params?.username}).catch((err) => logger.error(err.message));
    if (acc) {
        if (res.locals.oas.body.password) res.locals.oas.body.password = bcrypt.hashSync(res.locals.oas.body.password, 10);
        Object.entries(res.locals.oas.body).forEach(([key, val]) => _.set(acc, key, val));
        acc.save()
            .then(() => res.status(204).send())
            .catch((err) => {
                if (err.message?.includes("Account validation failed")) {
                    res.status(400).send({ message: `Validation error: ${err.message}` })
                } else if (err.message?.includes("duplicate key error")) {
                    res.status(400).send({ message: `${err.message?.match(/\{.*\}/gm).map(s => s.replace(/"/g, "'").replace(/{|}/g, "")).join(',').trim()} is duplicated, must be unique` })
                } else {
                    logger.error(`Error while saving account in db: ${err.message}`);
                    res.status(500).send({ message: "Unexpected error ocurred, please try again later" });
                }
            });
    } else {
        res.status(404).send({message: `Account with username '${res.locals.oas.params.username}' does not exist`})
    }
}

export function deleteAccount(req, res) {
    //TODO Delete recipebook
    res.send({
        message: 'This is the mockup controller for deleteAccount'
    });
}

