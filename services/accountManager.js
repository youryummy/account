import Account from "../mongo/Account.js";
import {logger} from "@oas-tools/commons";
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

export function updateAccount(req, res) {
    res.send({
        message: 'This is the mockup controller for updateAccount'
    });
}

export function deleteAccount(req, res) {
    res.send({
        message: 'This is the mockup controller for deleteAccount'
    });
}

