import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import hotelService from "@/services/hotels-service";

export async function getHotelsLists(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  try {
    const getHotels = await hotelService.getHotelsList(userId);

    res.status(httpStatus.OK).send(getHotels);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}

export async function getHotelRooms(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const { hotelId } = req.params;

  if (!hotelId) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
    
  try {
    const getHotelRooms = await hotelService.getHotelRoomsById(userId, Number(hotelId));
    res.status(httpStatus.OK).send(getHotelRooms);
  } catch (error) {
    if (error.name === "NotFoundError") {
      res.sendStatus(httpStatus.NOT_FOUND);
    }
    res.sendStatus(httpStatus.UNAUTHORIZED);
  }
}
