import { IsEnum } from 'class-validator';
import { ReservationStatus } from '../entities/reservation.entity';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
