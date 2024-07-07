//import "reflect-metadata";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  BeforeInsert,
} from "typeorm";
import { IsNotEmpty, IsString } from "class-validator";
import { User } from "./User";

@Entity()
export class Organization {
  @PrimaryGeneratedColumn("uuid")
  orgId!: string;

  @Column()
  @IsNotEmpty({ message: "Name must not be null" })
  @IsString()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @ManyToMany(() => User, (user) => user.organizations)
  @JoinTable()
  users!: User[];

  @BeforeInsert()
  setNameFormat() {
    if (!this.name.includes("Organization")) {
      this.name = `${this.name}'s Organization`;
    }
  }
}
