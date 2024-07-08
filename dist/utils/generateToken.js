"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Generate JWT token
function generateToken(user) {
    const accessToken = jsonwebtoken_1.default.sign({ userId: user.userId }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });
    return accessToken;
}
function verifyToken(req, res, next, token) {
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}
