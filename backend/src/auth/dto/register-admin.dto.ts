import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class RegisterAdminDto {
  @IsString()
  @Length(2, 100)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 100)
  password: string;

  @IsOptional()
  @IsString()
  @Length(9, 20)
  phone?: string;
}
