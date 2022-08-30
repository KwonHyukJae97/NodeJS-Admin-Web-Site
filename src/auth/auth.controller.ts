import {Body, Controller, Get, HttpCode, Inject, LoggerService, Post, Req, Res, UseGuards} from '@nestjs/common';
import {AuthService} from "./auth.service";
import {LocalAuthGuard} from "../guard/local-auth.guard";
import JwtAuthGuard from "../guard/jwt-auth.guard";
import {response} from "express";
import {WINSTON_MODULE_NEST_PROVIDER} from "nest-winston";

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: LoggerService,
        private readonly authService: AuthService,
    ) {}

    /**
     * 웹 관리자 회원가입
     * @param request
     */
    @HttpCode(200)
    @Post('register/admin')
    registerAdmin(@Req() request) {

    }

    /**
     * 앱 사용자 회원가입
     * @param request
     */
    @HttpCode(200)
    @Post('register/user')
    registerUser(@Req() request) {

    }

    /**
     * 웹 관리자 로그인
     * @param request
     * @param response
     */
    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('login/admin')
    async logInAdmin(@Req() request, @Res() response) {

        const jwtToken = this.authService.getJwtToken(request.user.accountId, request.user.email);

        return response.send({
            userData: request.user,
            accessToken: jwtToken,
        });
    }

    /**
     * 앱 사용자 로그인
     * @param request
     * @param response
     */
    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('login/user')
    async logInUser(@Req() request, @Res() response) {

        const jwtToken = this.authService.getJwtToken(request.user.accountId, request.user.email);

        return response.send({
            userData: request.user,
            accessToken: jwtToken,
        });
    }

    /**
     * 웹 관리자 로그아웃
     * @param request
     * @param Response
     */
    @UseGuards(JwtAuthGuard)
    @Post('logout/admin')
    async logoutAdmin(@Req() request, @Res() Response) {

        return response.sendStatus(200);
    }

    /**
     * 앱 사용자 로그아웃
     * @param request
     * @param Response
     */
    @UseGuards(JwtAuthGuard)
    @Post('logout/user')
    async logoutUser(@Req() request, @Res() Response) {

        return response.sendStatus(200);
    }
}
