"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const index_1 = require("./routes/index");
const data_source_1 = require("./data-source");
const dotenv_1 = __importDefault(require("dotenv"));
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
const port = process.env.PORT || 7000;
app.set("trust proxy", true);
app.use("/api", [index_1.organizationRouter, index_1.userRouter]);
app.use("/auth", index_1.authRouter);
app.use("/", index_1.indexRouter);
data_source_1.AppDataSource.initialize()
    .then(() => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
})
    .catch((error) => {
    console.error("Error during Data Source initialization:", error);
});
exports.default = app;
