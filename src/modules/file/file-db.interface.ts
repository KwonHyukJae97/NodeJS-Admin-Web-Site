/**
 * 파일 관련 DB 저장/수정/삭제 시, 공통으로 사용되는 메서드를 정의한 인터페이스
 */

export interface FileDbInterface {
  // file 저장 메서드 정의
  save(id: number, fileInfo: any);

  // 기본 이미지 file 저장 메서드 정의
  initSave(id: number);

  // file 삭제 메서드 정의
  delete(id: number);
}
