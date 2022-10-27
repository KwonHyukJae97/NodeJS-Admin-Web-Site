import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// 로그인시 아이디 패스워드 유효성 검사하는 가드
@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
