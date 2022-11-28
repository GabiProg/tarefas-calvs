import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";

async function getPaidTicket(enrollmentId: number) {
  return prisma.ticket.findFirst({
    where: {
      enrollmentId,
      status: TicketStatus.PAID
    }
  });
}

async function getHotelsList(ticketTypeId: number) {
  return prisma.ticketType.findFirst({
    where: {
      id: ticketTypeId,
      isRemote: false,
      includesHotel: true
    }
  });
}

async function getAllHotels() {
  return prisma.hotel.findMany();
}

async function getHotelRoomsById(hotelId: number) {
  return prisma.hotel.findMany({
    where: {
      id: hotelId
    }, include: {
      Rooms: true
    }
  });
}

const hotelRepository = {
  getPaidTicket,
  getHotelsList,
  getAllHotels,
  getHotelRoomsById
};

export default hotelRepository;
