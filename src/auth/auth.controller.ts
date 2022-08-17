import {Body, Controller, Get, HttpCode, Inject, LoggerService, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalAuthGuard} from "./local-auth.guard";
import RequestWithUser from "./request-with-user.interface";
import JwtAuthGuard from "./jwt-auth.guard";
import {response} from "express";
import {WINSTON_MODULE_NEST_PROVIDER} from "nest-winston";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly authService: AuthService,
    ) {}

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('log-in')
    async logIn(@Req() request, @Res() response) {

        const jwtToken = this.authService.getJwtToken(request.user.account_id, request.user.email);

        return response.send({
            account_id: request.user.account_id,
            email: request.user.email,
            token: jwtToken,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Post('log-out')
    async logOut(@Req() request: RequestWithUser, @Res() Response) {

        return response.sendStatus(200);
    }
}
