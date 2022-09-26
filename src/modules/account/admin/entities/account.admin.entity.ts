import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('admin')
export class Admin  extends BaseEntity {

    //관리자 번호
    @PrimaryGeneratedColumn({
        type: "int"
    })
    admin_id: number;

    //계정번호
    @Column({
        type: "bigint"
    })
    account_id: number;

    //회원사 번호
    @Column({
        type: "int"
    })
    company_id: number;

    //관리자 타입
    @Column({
        type: "boolean"
    })
    is_super: boolean;
}