import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user';
import { Account2 } from 'src/modules/account/entities/account';
import { Repository } from 'typeorm';
import { SignInUserDto } from './dto/signin-user.dto';
import { SignInAdminDto } from './dto/signin-admin.dto';

/**
 * 로그인 관련 서비스
 */
@Injectable()
export class AuthService2 {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Account2)
    private accountRepository: Repository<Account2>,
  ) {}

  /**
   * 사용자 로그인 서비스
   */
  async signInUser(signInUserDto: SignInUserDto): Promise<{ accessToken: string }> {
    const { id, password } = signInUserDto;
    const user = await this.accountRepository.findOne({ where: { id } });

    console.log('사용자 로그인 서비스 테스트 로그', user);

    /**
     * bcrypt.compare 함수로 암호화된 비밀번호 비교
     */
    if (user && (await bcrypt.compare(password, user.password))) {
      const payload = { id };
      const accessToken = await this.jwtService.sign(payload);

      console.log('사용자 로그인 TOKEN 테스트', accessToken);

      return { accessToken };
    } else {
      throw new UnauthorizedException('사용자 로그인 실패');
    }
  }

  /**
   * 관리자 로그인 서비스
   */
  async signInAdmin(signinAdminDto: SignInAdminDto): Promise<{ accessToken: string }> {
    const { id, password } = signinAdminDto;
    const admin = await this.accountRepository.findOne({ where: { id } });

    console.log('관리자 로그인 서비스 테스트 로그', admin);

    /**
     * bcrypt.compare 함수로 암호화된 비밀번호 비교
     */
    if (admin && (await bcrypt.compare(password, admin.password))) {
      const payload = { id };
      const accessToken = await this.jwtService.sign(payload);

      console.log('관리자 로그인 TOKEN 테스트', accessToken);

      return { accessToken };
    } else {
      throw new UnauthorizedException('관리자 로그인 실패');
    }
  }
}
