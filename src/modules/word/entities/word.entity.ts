import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import {IsDate, IsNumber, IsString} from "class-validator";

@Entity()
export class Word {

    @PrimaryGeneratedColumn()
    word_id: number;

    @IsNumber()
    @Column()
    company_id: number;

    @IsString()
    @Column({
        nullable: true
    })
    level_code: string;

    @IsString()
    @Column()
    word: string;

    @IsString()
    @Column({
        nullable: true
    })
    mean: string;

    @IsString()
    @Column()
    diacritic: string;

    @IsDate()
    @Column()
    reg_date: Date;

    @IsDate()
    @Column({
        nullable: true
    })
    del_date: Date;

    static from(company_id: number, word: string, level_code: string, mean: string, diacritic: string) {
        const wordEntity = new Word();
        wordEntity.company_id = company_id;
        wordEntity.word = word;
        wordEntity.level_code = level_code;
        wordEntity.mean = mean;
        wordEntity.diacritic = diacritic;
        return wordEntity;
    }
}
