import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../user/entities/user";
import { Admin } from "./admin/entities/account.admin.entity";

@Entity('account')
export class Account extends BaseEntity {

    //계정번호
    @PrimaryGeneratedColumn({
        type: "bigint"
    })
    account_id: number;
    
    //아이디
    @Column({
        type: "varchar",
        length: "20",
        unique: true
    })
    id: string;

    //비밀번호
    @Column({
        type: "varchar",
        length: "80"
    })
    password: string;

    //이름
    @Column({
        type: "varchar",
        length: "80"
    })
    name: string;

    //이메일
    @Column({
        type: "varchar",
        length: "100",
        unique: true
    })
    email: string;

    //연락처
    @Column({
        type: "varchar",
        length: "20",
        unique: true
    })
    phone: string;

    //닉네임
    @Column({
        type: "varchar",
        length: "20",
        unique: true
    })
    nickname: string;

    //생년월일
    @Column({
        type: "varchar",
        length: "8"
    })
    birth: string;

    //성별 (0:M, 1:F)
    @Column({
        type: "char"
    })
    gender: string;

    //CI고유번호
    @Column({
        type: "varchar",
        length: "255"
    })
    ci: string;

    //sns아이디
    @Column({
        type: "varchar",
        length: "100"
    })
    sns_id: string;

    //sns타입
    @Column({
        type: "char",
        length: "2"
    })
    sns_type: string;

    //sns토큰
    @Column({
        type: "varchar",
        length: "150"
    })
    sns_token: string;

    //가입 일시
    @Column({
        type: "datetime"
    })
    reg_date: Date;

    //정보수정 일시
    @Column({
        type: "datetime"
    })
    update_date: Date;

    //회원탈퇴 일시
    @Column({
        type: "datetime"
    })
    del_date: Date;

    //최근 로그인 일시
    @Column({
        type: "datetime"
    })
    login_date: Date;

    //관리자 번호 가져오기
    @ManyToOne(() => Admin)
    @JoinColumn({name: "admin_id"})
    admin: Admin;

    //사용자 번호 가져오기
    @ManyToOne(() => User)
    @JoinColumn({name: "user_id"})
    user: User;
}