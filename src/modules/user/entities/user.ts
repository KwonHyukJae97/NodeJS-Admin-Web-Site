import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsNumber, IsString} from "class-validator";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    user_id: number;

    @IsNumber()
    @Column()
    account_id!: number;

    @IsString()
    @Column()
    state!: string;

    static from(account_id: number, state: string) {
        const user = new User();
        user.account_id = account_id;
        user.state = state;
        return user;
    }
}
