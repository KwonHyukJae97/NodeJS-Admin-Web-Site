import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsBoolean, IsString } from 'class-validator';

/**
 * FAQ 카테고리에 대한 엔티티 정의
 */

@Entity('faq_category')
export class FaqCategory {
  // 분류 번호
  @PrimaryGeneratedColumn({
    name: 'category_id',
    type: 'tinyint',
  })
  categoryId: number;

  // 분류명
  @Column({
    name: 'category_name',
    type: 'varchar',
    length: '20',
  })
  categoryName: string;

  // 사용여부 (0:false(미사용), 1:true(사용))
  @Column({
    name: 'is_use',
    type: 'boolean',
  })
  isUse: boolean;

  // @OneToMany((type) => Faq, (faq) => faq.categoryId)
  // faqList: Faq[];
}
