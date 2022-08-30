import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNumber, IsOptional, IsString} from "class-validator";

@Entity()
export class Account {

    @PrimaryGeneratedColumn({
        name: 'account_id',
    })
    accountId: number;

    @IsString()
    @Column({unique: true})
    email: string;

    @IsString()
    @Column({
        nullable: true,
        length: 18
    })
    password: string;

    @IsString()
    @Column({
        nullable: true
    })
    nickname: string;

    @IsString()
    @Column({
        nullable: true
    })
    name: string;

    @IsString()
    @Column({
        nullable: true
    })
    hp: string;

    @IsOptional()
    @IsString()
    @Column({
        nullable: true
    })
    ci: string | null;

    @IsOptional()
    @IsString()
    @Column({
        nullable: true
    })
    di: string | null;

    @IsNumber()
    @Column({
        name: 'role_id',
        nullable: true
    })
    roleId: number;

    @CreateDateColumn({
        name: 'reg_date'
    })
    regDate: Date;

    @IsString()
    role: string;
    ability;

    static from(email: string, password: string, nickname: string, name: string, hp: string) {
        const account = new Account();
        account.email = email;
        account.password = password;
        account.nickname = nickname;
        account.name = name;
        account.hp = hp;
        return account;
    }
}
