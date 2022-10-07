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
import { InjectRepository } from '@nestjs/typeorm';
import { response } from 'express';
import { request } from 'http';
import { authenticate } from 'passport';
import JwtAuthGuard2 from 'src/guard/jwt/jwt-auth.guard';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { LocalAuthGuard } from 'src/guard/local/local-auth.guard';
import { AccountService } from 'src/modules/account-bak/account.service';
import { Repository } from 'typeorm';
import { GetAccount, GetUser } from '../decorator/account.decorator';
import { Account2 } from '../entities/account';
import { User } from '../user/entities/user';
import { AuthService2 } from './auth2.service';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { FindIdDto } from './dto/findid.dto';
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
    private readonly accountService: AccountService,
    private readonly jwtManageService: JwtManageService,
    @InjectRepository(Account2)
    private accountRepository2: Repository<Account2>,
  ) {}

  /**
   * 관리자 회원가입 컨트롤러
   */
  @HttpCode(200)
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
      division,
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
      division,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 회원가입 컨트롤러
   */
  @HttpCode(200)
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

  //관리자 로그인
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login/admin')
  async loginAdmin2(
    @Res({ passthrough: true }) response,
    @Body(ValidationPipe) signInAdminDto: SignInAdminDto,
  ) {
    const { accessToken, accessOption, refreshToken, refreshOption, account } =
      await this.authService2.loginAdmin(signInAdminDto);
    console.log('로그인할때 값???!!!', signInAdminDto);
    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);
    console.log('AccessToken 테스트', accessToken);
    console.log('RefreshToken 테스트', refreshToken);
    console.log('AccessOption 테스트', accessOption);
    console.log('RefreshOption 테스트', refreshOption);
    return { account };
  }

  //사용자 로그인
  @HttpCode(200)
  @UseGuards(LocalAuthGuard)
  @Post('/login/user')
  async loginUser2(
    @Res({ passthrough: true }) response,
    @Body(ValidationPipe) signInUserDto: SignInUserDto,
  ) {
    const { accessToken, accessOption, refreshToken, refreshOption, account } =
      await this.authService2.loginUser(signInUserDto);
    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);
    console.log('AccessToken 테스트', accessToken);
    console.log('RefreshToken 테스트', refreshToken);
    console.log('AccessOption 테스트', accessOption);
    console.log('RefreshOption 테스트', refreshOption);
    return { account };
  }

  //토큰 정보 삭제
  async removeRefreshToken2(accountId: number) {
    console.log('리무브리부므', accountId);
    return this.accountRepository2.update({ accountId }, { currentHashedRefreshToken: null });
  }

  //관리자 로그아웃
  @UseGuards(JwtAuthGuard2)
  @Post('/logout/admin')
  async logoutAdmin(@Req() request, @Res() response) {
    console.log('account!!!', request.user.accountId);
    //logout동작시 accountid가 맨위에 있는 걸로 동작함s
    const { accessOption, refreshOption } = this.authService2.getCookiesForLogOut2();

    // await this.accountRepository2.update(request.user.id, {
    //   currentHashedRefreshToken: null,
    // });
    //method 방식
    await this.removeRefreshToken2(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200);
  }

  //사용자 로그아웃
  @UseGuards(JwtAuthGuard2)
  @Post('/logout/user')
  async logoutUser(@Req() request, @Res() response) {
    console.log('userLogOut Test', request.user.accountId);
    const { accessOption, refreshOption } = this.authService2.getCookiesForLogOut2();
    await this.removeRefreshToken2(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200);
  }

  //아이디 찾기
  @Post('/find_id')
  async findId(@Body(ValidationPipe) findIdDto: FindIdDto) {
    const findid = await this.authService2.findId(findIdDto);
    console.log('아이디찾는 값 추출', findIdDto);
    return findid;
  }

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh')
  // async refresh(@Req() request, @Res() response) {
  //   const account: Account2 = request.user;

  //   if (account) {
  //     const payload: TokenPayload2 = {
  //       accountId: account.accountId,
  //       id: account.id,
  //     };
  //     const { accessToken, accessOption } =
  //       this.jwtManageService.getCookieWithJwtAccessToken(payload);
  //     response.cookie('authentication', accessToken, accessOption);

  //     const refreshToken = request?.cookies?.refresh;
  //     const newRefreshToken = await this.authService2.refreshTokenChange(
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

  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh')
  // refresh(@Req() request, @Res({ passthrough: true }) response) {
  //   const user = request.user;
  //   const { accessToken, ...accessOption } = this.authService2.getCookieWithJwtAccessToken2(
  //     request.user.id,
  //   );
  //   response.cookie('authentication', accessToken, accessOption);
  //   return user;
  // }

  // RefreshToken 유효한지 확인 후 AccessToken 발급
  // @UseGuards(JwtRefreshAuthGuard)
  // @Post('/refresh2')
  // async refresh2(@Req() request, @Res() response) {
  //   const account: Account2 = request.user;
  //   if (account) {
  //     const { accessToken, accessOption } = await this.authService2.getCookieWithJwtAccessToken2(
  //       account.id,
  //     );
  //     response.cookie('authentication', accessToken, accessOption);
  //     return { account };
  //   }
  // }

  // const account: Account2 = request.user;

  // if (account) {
  //   const payload: TokenPayload2 = {
  //     accountId: account.accountId,
  //     id: account.id,
  //   };
  //   const { accessToken, accessOption } = this.authService2.getCookieWithJwtAccessToken2(payload);
  //   response.cookie('Authoriztion', accessToken, accessOption);

  //   const refreshToken = request?.cookies?.refresh;
  //   const newRefreshToken = await this.authService2.refreshTokenChange2(
  //     account.accountId,
  //     payload,
  //     refreshToken,
  //   );

  //   if (newRefreshToken) {
  //     response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
  //   }
  // }
  // }
}
