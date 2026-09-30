import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'user_id',
    type: 'int',
  })
  userId: number;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 100,
  })
  customerName: string;

  @Column({
    name: 'customer_phone',
    type: 'varchar',
    length: 20,
  })
  customerPhone: string;

  @Column({
    name: 'reservation_date',
    type: 'date',
  })
  reservationDate: string;

  @Column({
    name: 'reservation_time',
    type: 'time',
  })
  reservationTime: string;

  @Column({
    name: 'guest_count',
    type: 'int',
  })
  guestCount: number;

  @Column({
    name: 'special_request',
    type: 'text',
    nullable: true,
  })
  specialRequest: string | null;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
  })
  updatedAt: Date;
}
