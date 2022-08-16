import {OmitType} from "@nestjs/mapped-types";
import {Word} from "../entities/word.entity";

export class CreateWordDto extends OmitType(Word, ['word_id', 'reg_date', 'del_date']){

    public toWordEntity() {
        return Word.from(this.company_id, this.level_code, this.word, this.mean, this.diacritic);
    }
}
