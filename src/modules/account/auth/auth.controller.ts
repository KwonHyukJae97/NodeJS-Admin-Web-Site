import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { request } from 'http';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { LocalAuthGuard } from 'src/guard/local/local-auth.guard';
import { AuthService2 } from './auth2.service';
import { Account2 } from '../entities/account';

import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignUpAdminDto } from './dto/signup-admin.dto';
import { SignUpUserDto } from './dto/signup-user.dto';

/**
 * 회원가입, 로그인 등 계정 관련 auth 컨트롤러
 */
@Controller('auth')
export class SignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly authService2: AuthService2,
  ) {}

  /**
   * 관리자 회원가입 컨트롤러
   */
  @Post('/register/admin')
  async signUpAdmin(@Body(ValidationPipe) SignUpAdminDto: SignUpAdminDto): Promise<string> {
    const {
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    } = SignUpAdminDto;
    console.log('Admin 컨트롤러 로그', SignUpAdminDto);
    const command = new SignUpAdminCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      companyId,
      roleId,
      isSuper,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 회원가입 컨트롤러
   */
  @Post('/register/user')
  async signUpUser(@Body(ValidationPipe) SignUpUserDto: SignUpUserDto): Promise<string> {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = SignUpUserDto;

    console.log('User 컨트롤러 로그', SignUpUserDto);
    const command = new SignUpUserCommand(
      id,
      password,
      name,
      email,
      phone,
      nickname,
      birth,
      gender,
      grade,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 로그인 컨트롤러
   */
  @Post('/signin/users')
  signInUser(@Body(ValidationPipe) signinUserDto: SignInUserDto): Promise<{ accessToken: string }> {
    console.log('사용자 로그인 컨트롤러 로그', signinUserDto);

    return this.authService2.signInUser(signinUserDto);
  }

  /**
   * 관리자 로그인 컨트롤러
   */
  @Post('/signin/admin')
  signInAdmin(
    @Body(ValidationPipe) signinAdminDto: SignInAdminDto,
  ): Promise<{ accessToken: string }> {
    console.log('관리자 로그인 컨트롤러 로그', signinAdminDto);

    return this.authService2.signInAdmin(signinAdminDto);
  }

  // /**
  //  * 사용자 로그인 컨트롤러
  //  */
  // @HttpCode(200)
  // @UseGuards(LocalAuthGuard)
  // @Post('/signin/user')
  // async signInUser(@Req() request, @Res() response) {
  //   const { accessToken, accessOption, refreshToken, refreshOption } =
  //     await this.authService.getCookieForLogin(request.user.accountId, request.user.id);

  //   response.cookie('authorization', accessToken, accessOption);
  //   response.cookie('refresh', refreshToken, refreshOption);

  //   return response.send({
  //     userData: request.user,
  //   });
  // }

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refreshtoken')
  // async refresh(@Req() request, @Res() response) {
  //   const account: Account2 = request.user;

  //   if (account) {
  //     const payload: TokenPayload = {
  //       accountId: account.accountId,
  //       email: account.email,
  //     };
  //     const { accessToken, accessOption } =
  //       this.jwtManageService.getCookieWithJwtAccessToken(payload);
  //     response.cookie('authorization', accessToken, accessOption);

  //     const refreshToken = request?.cookie?.refresh;
  //     const newRefreshToken = await this.authService.refreshTokenChange(
  //       account.accountId,
  //       payload,
  //       refreshToken,
  //     );

  //     if (newRefreshToken) {
  //       response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
  //     }
  //   }

  //   return response.send({
  //     userData: request.user,
  //   });
  // }
}
