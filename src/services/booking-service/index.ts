import enrollmentRepository from "@/repositories/enrollment-repository";
import hotelRepository from "@/repositories/hotels-repository";
import bookingRepository from "@/repositories/booking-repository";
import { notFoundError, forbiddenError } from "@/errors";

async function getUserBooking(userId: number) {
  const getBooking = bookingRepository.getUserBooking(userId);
  if (!getBooking) throw notFoundError();

  return getBooking;
}

async function postUserBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError();

  const room = await bookingRepository.getRoomByRoomId(roomId);
  if (!room) throw notFoundError();
    
  const getPaidTicket = await hotelRepository.getPaidTicket(enrollment.id);
  if (!getPaidTicket) throw forbiddenError();

  const getPresentialTicket = await hotelRepository.getHotelsList(getPaidTicket.id);
  if (!getPresentialTicket) throw forbiddenError();

  const getBooking = await bookingRepository.getUserBooking(userId);
  if (!getBooking) throw notFoundError();

  const listBooking = await bookingRepository.getBookingByRoomId(roomId);
  const bookingCapacity = listBooking.length + 1;
  const capacity = Number(room.capacity);
  if (bookingCapacity >= capacity) throw forbiddenError();

  await bookingRepository.postBooking(userId, roomId);

  const newBooking = await bookingRepository.getBookingByUserId(userId);
  return newBooking;
}

async function updateBooking(userId: number, bookingId: number, roomId: number) {
  const room = await bookingRepository.getRoomByRoomId(roomId);
  if (!room) throw notFoundError();

  const booking = await bookingRepository.getBookingByBookingId(bookingId);
  if (!booking) throw notFoundError();

  const getBooking = bookingRepository.getUserBooking(userId);
  if (!getBooking) throw forbiddenError();

  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError();
    
  const getPaidTicket = await hotelRepository.getPaidTicket(enrollment.id);
  if (!getPaidTicket) throw forbiddenError();

  const listBooking = await bookingRepository.getBookingByRoomId(roomId);
  const bookingCapacity = listBooking.length + 1;
  const capacity = Number(room.capacity);
  if (bookingCapacity >= capacity) throw forbiddenError();

  await bookingRepository.updateBooking(userId, roomId);

  const newBooking = await bookingRepository.getBookingByUserId(userId);
  return newBooking;
}

const bookingService = {
  getUserBooking,
  postUserBooking,
  updateBooking
};

export default bookingService;
