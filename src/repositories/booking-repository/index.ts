import { prisma } from "@/config";

async function getUserBooking(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    }, include: {
      Room: true
    }
  });
}

async function getRoomByRoomId(roomId: number) {
  return prisma.room.findFirst({
    where: {
      id: roomId
    }
  });
}

async function getBookingByRoomId(roomId: number) {
  return prisma.booking.findMany({
    where: {
      roomId
    }
  });
}

async function postBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

async function getBookingByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: {
      userId
    }
  });
}

async function getBookingByBookingId(bookingId: number) {
  return prisma.booking.findFirst({
    where: {
      id: bookingId
    }
  });
}

async function updateBooking(userId: number, roomId: number) {
  return prisma.booking.create({
    data: {
      userId,
      roomId
    }
  });
}

const bookingRepository = {
  getUserBooking,
  getRoomByRoomId,
  getBookingByRoomId,
  postBooking,
  getBookingByUserId,
  getBookingByBookingId,
  updateBooking
};

export default bookingRepository;
