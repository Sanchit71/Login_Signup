import {IsEmail, IsNotEmpty, MinLength} from '@nestjs/class-validator';

export class SignupDto {
    @IsNotEmpty()
    firstname: string;
  
    @IsNotEmpty()
    lastname: string;
  
    @IsEmail()
    email: string;
  
    @MinLength(8)
    password: string;
  
    @IsNotEmpty()
    mobile_number: string;
  }
  