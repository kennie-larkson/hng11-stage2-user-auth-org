"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
//import "reflect-metadata";
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const User_1 = require("./User");
let Organization = class Organization {
    setNameFormat() {
        if (!this.name.includes("Organization")) {
            this.name = `${this.name}'s Organization`;
        }
    }
};
exports.Organization = Organization;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Organization.prototype, "orgId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, class_validator_1.IsNotEmpty)({ message: "Name must not be null" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Organization.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Organization.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => User_1.User, (user) => user.organizations),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Organization.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Organization.prototype, "setNameFormat", null);
exports.Organization = Organization = __decorate([
    (0, typeorm_1.Entity)()
], Organization);
