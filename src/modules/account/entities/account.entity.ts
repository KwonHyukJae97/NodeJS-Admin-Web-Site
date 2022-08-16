import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsDate, IsNumber, IsString} from "class-validator";

@Entity()
export class Account {

    @PrimaryGeneratedColumn()
    account_id: number;

    @IsString()
    @Column({unique: true})
    email: string;

    @IsString()
    @Column({
        nullable: true
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

    @IsDate()
    @Column()
    reg_date: Date;

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
