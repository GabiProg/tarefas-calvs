import faker from "@faker-js/faker";
import { prisma } from "@/config";

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      name: faker.name.findName(),
      image: faker.image.imageUrl(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.past()
    }
  });
}

export async function createTicketTypeValid() {
  return prisma.ticketType.create({
    data: {
      name: "Valid",
      price: 1500,
      isRemote: false,
      includesHotel: true,
    }
  });
}
