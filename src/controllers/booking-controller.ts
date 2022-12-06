import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function sendAllBookings(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const userReservation = await bookingService.getUserBooking(userId);
    const bookingList = {
      id: userReservation.id,
      userId: userReservation.userId,
      roomId: userReservation.roomId,
      createdAt: userReservation.createdAt,
      updatedAt: userReservation.updatedAt,
      Room: {
        id: userReservation.Room.id,
        name: userReservation.Room.name,
        capacity: userReservation.Room.capacity,
        hotelId: userReservation.Room.hotelId,
      }
    };
    res.status(httpStatus.OK).send(bookingList);
  } catch (error) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const { roomId } = req.body;
  if (!roomId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  try {
    const newBookingSuccess = await bookingService.postUserBooking(userId, roomId);
    res.status(httpStatus.OK).send(newBookingSuccess);
  } catch (error) {
    if (error.name === "forbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const { bookingId } = req.params;
    
  const { roomId } = req.body;
  if (!roomId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }

  try {
    const updateSuccess = await bookingService.updateBooking(userId, Number(bookingId), roomId);
    res.status(httpStatus.OK).send(updateSuccess);
  } catch (error) {
    if (error.name === "forbiddenError") {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}
