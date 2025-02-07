import {
  ConflictException,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<{ message: string }> {
    const { email, password, ...otherDetails } = signupDto;

    const emailExists = await this.userRepository.findOne({ where: { email } });
    if (emailExists) {
      throw new ConflictException({
        field: 'email',
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...otherDetails,
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);

    return { message: 'User Registered Successfully' };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ message: string; access_token: string }> {
    const { email, password } = loginDto;

    // No normalization, use the email as is
    const emailExists = await this.userRepository.findOne({ where: { email } });

    if (!emailExists) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Email does not exist',
        error: 'Bad Request',
        field: 'email',
      });
    }

    // Check if the password matches
    const passwordMatch = await bcrypt.compare(password, emailExists.password);
    if (!passwordMatch) {
      throw new BadRequestException({
        statusCode: 400,
        message: 'Invalid password',
        error: 'Bad Request',
        field: 'password',
      });
    }

    const payload = { sub: emailExists.id, email: emailExists.email };

    return {
      message: 'User Logged In Successfully',
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async dashboard(): Promise<any> {
    // Fetch all user data excluding password and email
    return await this.userRepository.find({
      select: ['firstname', 'lastname', 'mobile_number'],
    });
  }

  async verifyToken(): Promise<boolean> {
    return true;
  }
}
