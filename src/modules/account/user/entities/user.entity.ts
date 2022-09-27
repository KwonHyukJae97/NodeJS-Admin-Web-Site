import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User extends BaseEntity {

    //회원 번호
    @PrimaryGeneratedColumn({
        name: "user_id",
        type: "bigint"
    })
    userId: number;

    //계정 번호
    @Column({
        name: "account_id",
        type: "bigint"
    })
    accountId: number;

    //학년 정보
    @Column({
        name: "grade",
        type: "tinyint"
    })
    grade: number;
}