/**
 * 이벤트 핸들러에서 이벤트 구분을 위한 추상클래스 정의
 */
export abstract class CqrsEvent {
  constructor(readonly name: string) {}
}
