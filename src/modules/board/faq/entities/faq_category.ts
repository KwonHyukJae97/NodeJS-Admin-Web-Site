import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsString } from 'class-validator';
import { Faq } from './faq';

/**
 * FAQ 카테고리에 대한 엔티티 정의
 */

@Entity()
export class FaqCategory {
  // 분류 번호
  @PrimaryGeneratedColumn({
    name: 'category_id',
  })
  categoryId: number;

  // 분류명
  @IsString()
  @Column({
    name: 'category_name',
  })
  categoryName: string;

  // 사용여부
  @IsBoolean()
  @Column({
    name: 'is_use',
  })
  isUse: boolean;

  @OneToMany((type) => Faq, (faq) => faq.categoryId)
  faqList: Faq[];
}
