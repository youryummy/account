import * as service from '../services/credentialManager.js';

export function login(req, res) {
    service.login(req, res);
}

export function register(req, res) {
    service.register(req, res);
}

export function refreshToken(req, res) {
    service.refreshToken(req, res);
}
