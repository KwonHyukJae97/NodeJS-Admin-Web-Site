import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsDate, IsNumber, IsString} from "class-validator";

@Entity()
export class Account {

    @PrimaryGeneratedColumn()
    account_id: number;

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

    static from(password: string, nickname: string, name: string, hp: string) {
        const account = new Account();
        account.password = password;
        account.nickname = nickname;
        account.name = name;
        account.hp = hp;
        return account;
    }
}
