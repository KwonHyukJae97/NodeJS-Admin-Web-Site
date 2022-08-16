import { PartialType } from '@nestjs/mapped-types';
import { CreateWordDto } from './create-word.dto';
import {Word} from "../entities/word.entity";

export class UpdateWordDto extends PartialType(CreateWordDto) {

    public toUpdateWordEntity() {
        return Word.from(this.company_id, this.level_code, this.word, this.mean, this.diacritic);
    }

    public toDeleteWordEntity() {
        const wordEntity = Word.from(this.company_id, this.level_code, this.word, this.mean, this.diacritic);
        wordEntity.del_date = new Date();

        return wordEntity;
    }
}
