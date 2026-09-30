import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  Reservation,
  ReservationStatus,
} from './entities/reservation.entity';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationStatusDto } from './dto/update-reservation-status.dto';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationsRepository: Repository<Reservation>,
  ) {}

  async create(
    userId: number,
    createReservationDto: CreateReservationDto,
  ) {
    const {
      reservationDate,
      reservationTime,
      guestCount,
    } = createReservationDto;

    const existingReservations =
      await this.reservationsRepository
        .createQueryBuilder('reservation')
        .where('reservation.reservationDate = :date', {
          date: reservationDate,
        })
        .andWhere('reservation.reservationTime = :time', {
          time: reservationTime,
        })
        .andWhere('reservation.status IN (:...statuses)', {
          statuses: [
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
          ],
        })
        .getMany();

    const bookedGuests = existingReservations.reduce(
      (total, reservation) =>
        total + reservation.guestCount,
      0,
    );

    const restaurantCapacity = 50;

    if (bookedGuests + guestCount > restaurantCapacity) {
      throw new BadRequestException(
        'There is not enough capacity for this time slot',
      );
    }

    const reservation =
      this.reservationsRepository.create({
        userId,
        customerName:
          createReservationDto.customerName,
        customerPhone:
          createReservationDto.customerPhone,
        reservationDate,
        reservationTime,
        guestCount,
        specialRequest:
          createReservationDto.specialRequest ?? null,
        status: ReservationStatus.PENDING,
      });

    return this.reservationsRepository.save(
      reservation,
    );
  }

  async findMyReservations(userId: number) {
    return this.reservationsRepository.find({
      where: {
        userId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForUser(
    reservationId: number,
    userId: number,
  ) {
    const reservation =
      await this.reservationsRepository.findOne({
        where: {
          id: reservationId,
          userId,
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Reservation not found',
      );
    }

    return reservation;
  }

  async cancel(
    reservationId: number,
    userId: number,
  ) {
    const reservation =
      await this.findOneForUser(
        reservationId,
        userId,
      );

    if (
      reservation.status ===
        ReservationStatus.COMPLETED ||
      reservation.status ===
        ReservationStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'This reservation cannot be cancelled',
      );
    }

    reservation.status =
      ReservationStatus.CANCELLED;

    return this.reservationsRepository.save(
      reservation,
    );
  }

  async findAllForAdmin() {
    return this.reservationsRepository.find({
      relations: {
        user: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOneForAdmin(reservationId: number) {
    const reservation =
      await this.reservationsRepository.findOne({
        where: {
          id: reservationId,
        },
        relations: {
          user: true,
        },
      });

    if (!reservation) {
      throw new NotFoundException(
        'Reservation not found',
      );
    }

    return reservation;
  }

  async updateStatus(
    reservationId: number,
    updateStatusDto: UpdateReservationStatusDto,
  ) {
    const reservation =
      await this.findOneForAdmin(reservationId);

    reservation.status =
      updateStatusDto.status;

    return this.reservationsRepository.save(
      reservation,
    );
  }
  async getAvailability(date: string) {
  const openingHour = 11;
  const closingHour = 22;
  const slotDurationMinutes = 60;
  const restaurantCapacity = 50;

  const reservations = await this.reservationsRepository
    .createQueryBuilder('reservation')
    .where('reservation.reservationDate = :date', {
      date,
    })
    .andWhere('reservation.status IN (:...statuses)', {
      statuses: [
        ReservationStatus.PENDING,
        ReservationStatus.CONFIRMED,
      ],
    })
    .getMany();

  const slots: {
    time: string;
    available: boolean;
    remainingCapacity: number;
  }[] = [];

  for (
    let hour = openingHour;
    hour < closingHour;
    hour++
  ) {
    const time = `${hour
      .toString()
      .padStart(2, '0')}:00`;

    const bookedGuests = reservations
      .filter(
        (reservation) =>
          reservation.reservationTime === time,
      )
      .reduce(
        (total, reservation) =>
          total + reservation.guestCount,
        0,
      );

    const remainingCapacity =
      restaurantCapacity - bookedGuests;

    slots.push({
      time,
      available: remainingCapacity > 0,
      remainingCapacity,
    });
  }

  return {
    date,
    available: slots.some(
      (slot) => slot.available,
    ),
    slots,
  };
}
}
