import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('admin')
export class Admin  extends BaseEntity {

    //관리자 번호
    @PrimaryGeneratedColumn({
        name: "admin_id",
        type: "int"
    })
    adminId: number;

    //계정번호
    @Column({
        name: "account_id",
        type: "bigint"
    })
    accountId: number;

    //회원사 번호
    @Column({
        name: "company_id",
        type: "int"
    })
    companyId: number;

    //관리자 타입
    @Column({
        name: "is_super",
        type: "boolean"
    })
    isSuper: boolean;
}