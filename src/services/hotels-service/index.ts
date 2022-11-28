import hotelRepository from "@/repositories/hotels-repository";
import enrollmentRepository from "@/repositories/enrollment-repository";
import { unauthorizedError, notFoundError, invalidDataError } from "@/errors";

async function getHotelsList(userId: number) {
  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollmentId) throw notFoundError();
    
  const getPaidTicket = await hotelRepository.getPaidTicket(enrollmentId.id);
  if (!getPaidTicket) throw notFoundError();

  const listHotels = await hotelRepository.getHotelsList(getPaidTicket.ticketTypeId);
  if (!listHotels) throw notFoundError();

  const getAllHotels = await hotelRepository.getAllHotels();
  return getAllHotels;
}

async function getHotelRoomsById(userId: number, hotelId: number) {
  if (!hotelId) throw invalidDataError([]);

  const enrollmentId = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollmentId) throw unauthorizedError();
     
  const getPaidTicket = await hotelRepository.getPaidTicket(enrollmentId.id);
  if (!getPaidTicket) throw notFoundError();
    
  const listHotels = await hotelRepository.getHotelsList(getPaidTicket.ticketTypeId);
  if (!listHotels) throw notFoundError();

  const getHotelRooms = await hotelRepository.getHotelRoomsById(hotelId);
  if (!getHotelRooms) throw notFoundError();
  return getHotelRooms;
}

const hotelService = {
  getHotelsList,
  getHotelRoomsById
};

export default hotelService;
