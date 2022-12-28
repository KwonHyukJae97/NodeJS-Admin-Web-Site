// import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
// import { FilesCreateEvent } from './files-create-event';
// import { FilesUpdateEvent } from './files-update-event';
// import { FilesDeleteEvent } from './files-delete-event';
// import { FileService } from '../file.service';
// import { Inject } from '@nestjs/common';
// import { BoardFileDb } from '../../board/board-file-db';
// import { AccountFileDb } from '../../account/account-file-db';
// import { FileUpdateEvent } from './file-update-event';
// import { FileDeleteEvent } from './file-delete-event';
// import { FileCreateEvent } from './file-create-event';
// import { DataSource } from 'typeorm';
// import { ConvertException } from '../../../common/utils/convert-exception';
//
// /**
//  * 파일 등록/수정/삭제용 이벤트 핸들러
//  */
// @EventsHandler(
//   FilesCreateEvent,
//   FilesUpdateEvent,
//   FilesDeleteEvent,
//   FileCreateEvent,
//   FileUpdateEvent,
//   FileDeleteEvent,
// )
// export class FileEventsHandler
//   implements
//     IEventHandler<
//       | FilesCreateEvent
//       | FilesUpdateEvent
//       | FilesDeleteEvent
//       | FileCreateEvent
//       | FileUpdateEvent
//       | FileDeleteEvent
//     >
// {
//   constructor(
//     private fileService: FileService,
//     @Inject('boardFile') private boardFileDb: BoardFileDb,
//     @Inject('accountFile') private accountFileDb: AccountFileDb,
//     @Inject(ConvertException) private convertException: ConvertException,
//     private dataSource: DataSource,
//   ) {}
//
//   /**
//    * 파일 관련 이벤트 핸들링 메소드
//    * @param evnet : 각 파일 이벤트에 필요한 파라미터
//    * @returns : S3/DB처리 실패 시 에러 메시지 반환 / 이벤트 성공 시 void 반환
//    */
//   // 하나의 이벤트 핸들러에 여러 이벤트를 받을 수 있기에, 하나의 이벤트 핸들러로 관리하도록 개선
//   async handle(
//     event:
//       | FilesCreateEvent
//       | FilesUpdateEvent
//       | FilesDeleteEvent
//       | FileCreateEvent
//       | FileUpdateEvent
//       | FileDeleteEvent,
//   ) {
//     const queryRunner = this.dataSource.createQueryRunner();
//     await queryRunner.connect();
//     await queryRunner.startTransaction();
//
//     try {
//       switch (event.name) {
//         // 다중 파일 업로드 이벤트
//         case FilesCreateEvent.name: {
//           console.log('다중 파일 업로드 이벤트 발생!');
//           const { id, fileType, files, fileDbInterface } = event as FilesCreateEvent;
//           // await this.fileService.uploadFiles(id, fileType, files, fileDbInterface);
//           break;
//         }
//         // 다중 파일 업로드 및 삭제 이벤트 (업데이트)
//         case FilesUpdateEvent.name: {
//           console.log('다중 파일 업데이트 이벤트 발생!');
//           const { id, fileType, files, fileDbInterface } = event as FilesUpdateEvent;
//           await this.fileService.updateFiles(id, fileType, files, fileDbInterface);
//           break;
//         }
//         // 다중 파일 삭제 이벤트
//         case FilesDeleteEvent.name: {
//           console.log('파일 삭제 이벤트 발생!');
//           const { id, fileDbInterface } = event as FilesDeleteEvent;
//           await this.fileService.deleteFiles(id, fileDbInterface);
//           break;
//         }
//         // 단일 파일 업로드 이벤트
//         case FileCreateEvent.name: {
//           console.log('단일 파일 업로드 이벤트 발생!');
//           const { id, fileType, file, fileDbInterface } = event as FileCreateEvent;
//           await this.fileService.uploadFile(id, fileType, file, fileDbInterface);
//           break;
//         }
//         // 단일 파일 업로드 및 삭제 이벤트 (업데이트)
//         case FileUpdateEvent.name: {
//           console.log('단일 파일 업데이트 이벤트 발생!');
//           const { id, fileType, file, fileDbInterface } = event as FileUpdateEvent;
//           await this.fileService.updateFile(id, fileType, file, fileDbInterface);
//           break;
//         }
//         // 단일 파일 삭제 이벤트
//         case FileDeleteEvent.name: {
//           console.log('단일 파일 삭제 이벤트 발생!');
//           const { id, fileDbInterface } = event as FileDeleteEvent;
//           await this.fileService.deleteFile(id, fileDbInterface);
//           break;
//         }
//         default:
//           break;
//       }
//       await queryRunner.commitTransaction();
//     } catch (err) {
//       await queryRunner.rollbackTransaction();
//       // await queryRunner.release();
//       // return this.convertException.CommonError(500);
//     }
//   }
// }
