import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  ManyToMany,
} from "typeorm";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";
import bcrypt from "bcryptjs";
import { Organization } from "./Organization";

@Entity()
@Unique(["userId", "email"])
export class User {
  @PrimaryGeneratedColumn("uuid")
  userId!: string;

  @Column()
  @IsNotEmpty({ message: "First name must not be null" })
  @IsString()
  firstName!: string;

  @Column()
  @IsNotEmpty({ message: "Last name must not be null" })
  @IsString()
  lastName!: string;

  @Column()
  @IsEmail({}, { message: "Email must be valid" })
  @IsNotEmpty({ message: "Email must not be null" })
  email!: string;

  @Column()
  @IsNotEmpty({ message: "Password must not be null" })
  @IsString()
  @Length(6, 20, { message: "Password must be between 6 and 20 characters" })
  password!: string;

  @Column({ nullable: true })
  phone?: string;

  @ManyToMany(() => Organization, (organization) => organization.users)
  organizations!: Organization[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  toJSON() {
    const { password, ...user } = this;
    return user;
  }
}
