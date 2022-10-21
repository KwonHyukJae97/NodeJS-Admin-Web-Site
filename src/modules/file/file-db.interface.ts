/**
 * 파일 관련 파일 DB 저장/수정/삭제용 인터페이스 정의
 */
export interface FileDbInterface {
  // file 저장 메서드 정의
  save(id: number, fileInfo: any);

  // file 삭제 메서드 정의
  delete(id: number);
}
