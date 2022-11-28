import { Router } from "express";
import { authenticateToken } from "@/middlewares";
import { getHotelsLists, getHotelRooms } from "@/controllers";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .get("", getHotelsLists)
  .get("/:hotelId", getHotelRooms);

export { hotelsRouter };
