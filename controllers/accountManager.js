import * as service from '../services/accountManager.js';

export function getAccounts(req, res) {
    service.getAccounts(req, res);
}

export function findByusername(req, res) {
    service.findByusername(req, res);
}

export function updateAccount(req, res) {
    service.updateAccount(req, res);
}

export function deleteAccount(req, res) {
    service.deleteAccount(req, res);
}

