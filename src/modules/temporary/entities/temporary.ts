import { Account } from 'src/modules/account/entities/account';
import { BaseEntity, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('temporary')
export class Temporary extends BaseEntity {
  @PrimaryGeneratedColumn({
    name: 'temporary_id',
    type: 'bigint',
  })
  temporaryId: number;

  @OneToOne(() => Account, (account) => account.temporaryId, { eager: true })
  @JoinColumn({
    name: 'account_id',
  })
  accountId: Account;
}
