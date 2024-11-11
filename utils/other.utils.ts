import crypto from "crypto";

export function isValidEmail(email: string) {
    const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}

export function generateToken(length: number) {
    return crypto.randomBytes(length).toString('hex');
}