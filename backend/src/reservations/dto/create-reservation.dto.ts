import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReservationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  customerPhone: string;

  @IsDateString()
  reservationDate: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'reservationTime must be in HH:mm format',
  })
  reservationTime: string;

  @IsInt()
  @Min(1)
  @Max(20)
  guestCount: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  specialRequest?: string;
}
