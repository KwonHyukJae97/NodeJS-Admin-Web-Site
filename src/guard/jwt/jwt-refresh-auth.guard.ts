import {ExecutionContext, HttpException, HttpStatus, Injectable} from "@nestjs/common";
import {AuthGuard} from "@nestjs/passport";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export default class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh-token') {
    constructor(
        private readonly jwtService: JwtService,
    ) {
        super();
    }

}