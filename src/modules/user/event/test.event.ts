import { CqrsEvent } from './cqrs-event';
import { IEvent } from '@nestjs/cqrs';

export class TestEvent extends CqrsEvent implements IEvent {
  constructor() {
    super(TestEvent.name);
  }
}
