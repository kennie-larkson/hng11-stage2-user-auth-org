"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt_middleware_1 = require("../utils/jwt_middleware");
const userRouter_1 = require("./userRouter");
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
userRouter_1.userRouter.get("/profile", jwt_middleware_1.authenticateJWT, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.user.userId;
    try {
        const userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        const user = yield userRepository.findOneBy({ userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}));
