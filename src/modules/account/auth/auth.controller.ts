import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from 'src/guard/jwt/jwt-auth.guard';
import { JwtManageService } from 'src/guard/jwt/jwt-manage.service';
import { LocalAuthGuard } from 'src/guard/local/local-auth.guard';
import { Account } from '../entities/account';
import { AuthService } from './auth.service';
import { SignUpAdminCommand } from './command/signup-admin.command';
import { SignUpUserCommand } from './command/signup-user.command';
import { FindIdDto } from './dto/findid.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignUpAdminDto } from './dto/signup-admin.dto';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UserKakaoDto } from './dto/user.kakao.dto';
import { SignInAdminCommand } from './command/signin-admin.command';
import { SignInUserCommand } from './command/signin-user.command';
import JwtRefreshAuthGuard from 'src/guard/jwt/jwt-refresh-auth.guard';
import { KakaoSignUpAdminDto } from './dto/kakao-signup-admin.dto';
import { KakaoSignUpAdminCommand } from './command/kakao-signup-admin.command';
import { UserNaverDto } from './dto/user.naver.dto';
import { NaverSignUpAdminDto } from './dto/naver-signup-admin.dto';
import { NaverSignUpAdminCommand } from './command/naver-signup-admin.command';
import { GoogleSignUpAdminDto } from './dto/google-signup-admin.dto';
import { GoogleSignUpAdminCommand } from './command/google-signup-admin.command';
import { UserGoogleDto } from './dto/user.google.dto';
import { GetAuthInfoQuery } from './query/get-auth-info.query';
import { AdminUpdateInfoDto } from './dto/admin-update-info.dto';
import { AdminUpdateInfoCommand } from './command/admin-update-info.command';
import { AdminUpdatePasswordDto } from './dto/admin-update-password.dto';
import { AdminUpdatePasswordCommand } from './command/admin-update-password.command';

/**
 * 회원가입, 로그인 등 계정 관련 auth API controller
 */
@Controller('auth')
export class SignController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly authService: AuthService,
    private readonly jwtManageService: JwtManageService,
    private queryBus: QueryBus,
  ) {}

  /**
   * 사용자 정보 조회
   * @returns : account 정보 반환
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getAuthInfo(@Req() req) {
    //토큰정보 빼놓기 까지 완료, 뺴놓은 토큰을 넘겨 로컬스토리지에 담고 처리
    const authInfo = req.user;
    const tokenInfo = req.cookies;
    console.log('로그인 정보', req.user);
    console.log('토큰 정보', req.cookies);
    return authInfo;
  }

  //프로필 버튼 클릭 시 어카운트 아이디로 데이터 조회
  @Get(':id')
  getUserInfo(@Param('id') accountId: number) {
    const getUserInfoQuery = new GetAuthInfoQuery(accountId);
    console.log('프로필입니다', accountId);
    return this.queryBus.execute(getUserInfoQuery);
  }

  /**
   * 관리자 상세 정보 수정
   * @Param : accountId
   * @return : 관리자 정보 수정 커맨드 전송
   */
  // admin 컨트롤러로 이관 작업
  // @Patch(':id')
  // updateInfo(@Param('id') accountId: number, @Body() dto: AdminUpdateInfoDto) {
  //   const { email, phone, nickname } = dto;
  //   console.log('수정 데이터111?', email);
  //   console.log('수정 데이터222?', phone);
  //   console.log('수정 데이터333?', nickname);
  //   const command = new AdminUpdateInfoCommand(accountId, email, phone, nickname);
  //   return this.commandBus.execute(command);
  // }

  /**
   * 비밀번호 수정
   * @param accountId
   * @param dto : 비밀번호
   * @returns : 관리자 비밀번호 수정 커멘드 전송
   */
  @Patch('/update_password/:id')
  updatePassword(@Param('id') accountId: number, @Body() dto: AdminUpdatePasswordDto) {
    const { password } = dto;
    console.log('변경하는 비밀번호', password);
    const command = new AdminUpdatePasswordCommand(accountId, password);
    return this.commandBus.execute(command);
  }

  /**
   * 카카오 2차정보 가입 메소드
   * @param kakaoSignUpAdinDto : 2차정보 저장에 필요한 dto
   * @returns : 카카오 2차 정보 저장 커멘드 전송
   */
  @Post('/register/kakao/admin')
  async kakaoSignUpAdmin(
    @Body(ValidationPipe) kakaoSignUpAdminDto: KakaoSignUpAdminDto,
  ): Promise<string> {
    const {
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    } = kakaoSignUpAdminDto;
    console.log('Kakao 2차 정보 컨트롤러', kakaoSignUpAdminDto.snsToken);

    const command = new KakaoSignUpAdminCommand(
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 네이버 2차정보 가입 메소드
   * @param naverSignUpAdminDto : 2차정보 저장에 필요한 dto
   * @returns : 네이버 2차 정보 저장 커멘드 전송
   */
  @Post('/register/naver/admin')
  async naverSignUpAdmin(
    @Body(ValidationPipe) naverSignUpAdminDto: NaverSignUpAdminDto,
  ): Promise<string> {
    const {
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    } = naverSignUpAdminDto;
    console.log('Naver 2차 정보 컨트롤러', naverSignUpAdminDto);

    const command = new NaverSignUpAdminCommand(
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 구글 2차정보 가입 메소드
   * @param googleSignUpAdminDto : 2차정보 저장에 필요한 dto
   * @returns : 구글 2차 정보 저장 커멘드 전송
   */
  @Post('/register/google/admin')
  async googleSignUpAdmin(
    @Body(ValidationPipe) googleSignUpAdminDto: GoogleSignUpAdminDto,
  ): Promise<string> {
    const {
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    } = googleSignUpAdminDto;
    console.log('Naver 2차 정보 컨트롤러', googleSignUpAdminDto);

    const command = new GoogleSignUpAdminCommand(
      name,
      phone,
      nickname,
      birth,
      gender,
      snsId,
      snsToken,
      companyName,
      companyCode,
      businessNumber,
    );

    return this.commandBus.execute(command);
  }

  /**
   * 사용자 정보(이메일) 조회
   * @returns : 해당이메일이 DB에 존재유무
   */
  @Post('/get_email/:id')
  getByEmail(@Param('id') email: string) {
    return this.authService.getByEmail(email);
  }

  /**
   * 사용자 정보(연락쳐) 조회
   * @returns : 해당연락처가 DB에 존재유무
   */
  @Post('/get_phone/:id')
  getByPhone(@Param('id') phone: string) {
    return this.authService.getByPhone(phone);
  }

  /**
   * 사용자 정보(넥네임) 조회
   * @returns : 해당닉네임이 DB에 존재유무
   */
  @Post('/get_nickname/:id')
  getByNickname(@Param('id') nickname: string) {
    return this.authService.getByNickname(nickname);
  }

  /**
   * 관리자 회원가입 메소드
   * @param SignUpAdminDto : 관리자 회원가입에 필요한 dto
   * @returns : 관리자 회원가입 커맨드 전송
   */
  @Post('/register/admin')
  async signUpAdmin(@Body(ValidationPipe) signUpAdminDto: SignUpAdminDto): Promise<string> {
    console.log('company정보!!!');
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
      companyName,
      companyCode,
      businessNumber,
    } = signUpAdminDto;
    console.log('Admin 컨트롤러 로그', signUpAdminDto);
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
      companyName,
      companyCode,
      businessNumber,
    );
    return this.commandBus.execute(command);
  }

  /**
   * 사용자 회원가입 메소드
   * @param SignUpUserDto : 사용자 회원가입에 필요한 dto
   * @returns : 사용자 회원가입 커맨드 전송
   */
  @Post('/register/user')
  async signUpUser(@Body(ValidationPipe) signUpUserDto: SignUpUserDto): Promise<string> {
    const { id, password, name, email, phone, nickname, birth, gender, grade } = signUpUserDto;

    console.log('User 컨트롤러 로그', signUpUserDto);
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
   * 관리자 로그인 메소드
   * @param signInAdminDto : 관리자 로그인에 필요한 dto
   * @returns : 관리자 로그인 커맨드 전송
   */
  @UseGuards(LocalAuthGuard)
  @Post('/login/admin')
  async loginAdmin(
    @Body(ValidationPipe) signInAdminDto: SignInAdminDto,
    @Res({ passthrough: true }) response,
  ) {
    const { id, password } = signInAdminDto;

    console.log('cqrs 방식 관리자 로그인 테스트', signInAdminDto);

    const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken(
      id,
      null,
    );
    const { refreshToken, refreshOption } = await this.authService.getCookieWithJwtRefreshToken(
      id,
      null,
    );

    const command = new SignInAdminCommand(id, password, accessToken, refreshToken);
    await this.authService.setCurrentRefreshToken(refreshToken, id);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    console.log('쿠키 값 조회 command', command);
    console.log('쿠키 값 조회 accessToken', accessToken);
    console.log('쿠키 값 조회 refreshToken', refreshToken);

    return this.commandBus.execute(command);
  }

  /**
   * 사용자 로그인 메소드
   * @param signInAdminDto :사용자 로그인에 필요한 dto
   * @returns : 사용자 로그인 커맨드 전송
   */
  @UseGuards(LocalAuthGuard)
  @Post('/login/user')
  async loginUser(
    @Body(ValidationPipe) signInUserDto: SignInUserDto,
    @Res({ passthrough: true }) response,
  ) {
    const { id, password } = signInUserDto;

    console.log('cqrs 방법으로 사용자 로그인 테스트', signInUserDto);

    const command = new SignInUserCommand(id, password);

    const { accessToken, accessOption } = await this.authService.getCookieWithJwtAccessToken(
      id,
      null,
    );
    const { refreshToken, refreshOption } = await this.authService.getCookieWithJwtRefreshToken(
      id,
      null,
    );

    await this.authService.setCurrentRefreshToken(refreshToken, id);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    console.log('쿠키 값 조회 command', command);
    console.log('쿠키 값 조회 accessToken', accessToken);
    console.log('쿠키 값 조회 refreshTokn', refreshToken);
    return this.commandBus.execute(command);
  }

  /**
   * 관리자 로그아웃 메소드
   * @param request
   * @param response
   * @returns 로그아웃시 엑세스, 리프래쉬 토큰 옵션을 초기화 시키고 상태 값 리턴
   */
  @UseGuards(JwtAuthGuard)
  @Post('/logout/admin')
  async logoutAdmin(@Req() request, @Res() response) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut();
    await this.authService.removeRefreshToken(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200), '로그아웃 완료';
  }

  /**
   * 사용자 로그아웃 메소드
   * @param : request
   * @param : response
   * @returns : 로그아웃시 엑세스, 리프래쉬 토큰 옵션을 초기화 시키고 상태 값 리턴
   */
  @UseGuards(JwtAuthGuard)
  @Post('/logout/user')
  async logoutUser(@Req() request, @Res() response) {
    const { accessOption, refreshOption } = this.authService.getCookiesForLogOut();
    await this.authService.removeRefreshToken(request.user.accountId);
    response.cookie('authentication', '', accessOption);
    response.cookie('Refresh', '', refreshOption);

    return response.sendStatus(200), '로그아웃 완료';
  }

  /**
   * 아이디 찾기 메소드
   * @param  findIdDto : 아이디 찾기에 필요한 dto
   * @returns : findIdDto(name, phone)을 findId라는 변수에 담아 리턴
   */
  @Post('/find_id')
  async findId(@Body(ValidationPipe) findIdDto: FindIdDto) {
    const findid = await this.authService.findId(findIdDto);
    console.log('아이디찾는 값 추출', findIdDto);
    return findid;
  }

  /**
   * 임시 비밀번호 발송(이메일) 메소드
   * @param Dto: 입력한 이메일 주소
   * @returns : 이메일주소
   */
  @Post('/temporary_password')
  async findPassword(@Body() Dto) {
    return this.authService.findPassword(Dto);
  }

  /**
   * 카카오 로그인 메소드
   * @param req : FE에서 넘어오는 카카오 유저 정보
   * @returns : 카카오 유저정보를 담은 dto를 카카오 로그인 서비스에 전송
   */
  @Post('/login/admin/kakao')
  async kakaoLoginUserInfo(@Req() req, @Res({ passthrough: true }) response) {
    const userKakaoDto: UserKakaoDto = req.body;
    const snsToken = req.body.resKakaoAccessToken;

    const snsId = userKakaoDto.snsId;
    const snsType = '01';

    const { accessToken, accessOption } = await this.authService.socialGetCookieWithJwtAccessToken(
      snsId,
      snsType,
    );
    const { refreshToken, refreshOption } =
      await this.authService.socialGetCookieWithJwtRefreshToken(snsId, snsType);

    await this.authService.setSocialCurrentRefreshToken(refreshToken, snsId);

    await this.authService.setSocialToken(snsToken, snsId);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.kakaoUserInfos(userKakaoDto);
  }

  /**
   * 네이버 로그인 메소드
   * @param req : FE에서 넘어오는 네이버 유저 정보
   * @returns : 네이버 유저정보를 담은 dto를 카카오 로그인 서비스에 전송
   */
  @Post('/login/admin/naver')
  async naverLoginUserInfo(@Req() req, @Res({ passthrough: true }) response) {
    const userNaverDto: UserNaverDto = req.body;
    const snsToken = req.body.resNaverAccessToken;

    console.log('네이버 정보', userNaverDto);
    const snsId = userNaverDto.snsId;
    const snsType = '00';

    const { accessToken, accessOption } = await this.authService.socialGetCookieWithJwtAccessToken(
      snsId,
      snsType,
    );
    const { refreshToken, refreshOption } =
      await this.authService.socialGetCookieWithJwtRefreshToken(snsId, snsType);

    await this.authService.setSocialCurrentRefreshToken(refreshToken, snsId);

    await this.authService.setSocialToken(snsToken, snsId);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.naverUserInfos(userNaverDto);
  }

  /**
   * 구글 로그인 메소드
   * @param req : FE에서 넘어오는 구글 유저 정보
   * @returns : 구글 유저정보를 담은 dto를 카카오 로그인 서비스에 전송
   */
  @Post('/login/admin/google')
  async googleLoginUserInfo(@Req() req, @Res({ passthrough: true }) response) {
    const userGoogleDto: UserGoogleDto = req.body;
    const snsToken = req.body.resKakaoAccessToken;

    const snsId = userGoogleDto.snsId;
    const snsType = '02';

    const { accessToken, accessOption } = await this.authService.socialGetCookieWithJwtAccessToken(
      snsId,
      snsType,
    );
    const { refreshToken, refreshOption } =
      await this.authService.socialGetCookieWithJwtRefreshToken(snsId, snsType);

    await this.authService.setSocialCurrentRefreshToken(refreshToken, snsId);

    await this.authService.setSocialToken(snsToken, snsId);

    response.cookie('authentication', accessToken, accessOption);
    response.cookie('Refresh', refreshToken, refreshOption);

    return this.authService.kakaoUserInfos(userGoogleDto);
  }

  //리프레쉬 토큰 유효성 검사 후 통과되면 엑세스 토큰 재발급
  @UseGuards(JwtRefreshAuthGuard)
  @Get('/refresh')
  refresh(@Req() req, @Res({ passthrough: true }) res) {
    const account = req.user;
    const id = account.id;
    const { accessToken, ...accessOption } = this.authService.getCookieWithJwtAccessToken(id, null);
    res.cookie('authentication', accessToken, accessOption);

    return account;
  }

  // TODO: 리프레쉬 토큰
  @UseGuards(JwtRefreshAuthGuard)
  @Post('/refresh')
  async refreshToken(@Req() request, @Res() response) {
    const account: Account = request.user;

    if (account) {
      const payload: TokenPayload = {
        accountId: account.accountId,
        id: account.id,
        snsType: account.snsType,
        snsId: account.snsId,
      };
      const { accessToken, accessOption } =
        this.jwtManageService.getCookieWithJwtAccessToken(payload);
      response.cookie('authentication', accessToken, accessOption);

      const refreshToken = request?.cookies?.refresh;
      const newRefreshToken = await this.authService.refreshTokenChange(
        account.id,
        payload,
        refreshToken,
      );
      if (newRefreshToken) {
        response.cookie('refresh', newRefreshToken.refreshToken, newRefreshToken.refreshOption);
      }
    }
    return response.send({
      userData: request.user,
    });
  }
}
