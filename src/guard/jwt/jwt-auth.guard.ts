import { ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export default class JwtAuthGuard2 extends AuthGuard('jwt') {
  constructor(private readonly jwtService: JwtService) {
    super();
  }
}
