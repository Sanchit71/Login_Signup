import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  email: string;

  @MinLength(0)
  password: string;
}
