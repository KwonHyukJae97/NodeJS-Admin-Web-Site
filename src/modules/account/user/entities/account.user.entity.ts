import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('user')
export class User extends BaseEntity {

    //회원 번호
    @PrimaryGeneratedColumn({
        type: "bigint"
    })
    user_id: number;

    //계정 번호
    @Column({
        type: "bigint"
    })
    account_id: number;

    //학년 정보
    @Column({
        type: "tinyint"
    })
    grade: number;
}