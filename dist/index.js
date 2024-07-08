"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const data_source_1 = require("./data-source");
const dotenv_1 = __importDefault(require("dotenv"));
exports.app = (0, express_1.default)();
dotenv_1.default.config();
exports.app.use(express_1.default.json());
const port = process.env.PORT || 7000;
exports.app.set("trust proxy", true);
exports.app.use("/api", [index_1.organizationRouter, index_1.userRouter]);
exports.app.use("/auth", index_1.userRouter);
exports.app.use("/", index_1.indexRouter);
data_source_1.AppDataSource.initialize()
    .then(() => {
    exports.app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Error during Data Source initialization:", error);
});
