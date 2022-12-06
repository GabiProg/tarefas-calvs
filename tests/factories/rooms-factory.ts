import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createRoomHotel(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: faker.datatype.number(),
      hotelId
    }
  });
}

export async function createRoomWithSmallCapacity(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.name.findName(),
      capacity: 1,
      hotelId
    }
  });
}
