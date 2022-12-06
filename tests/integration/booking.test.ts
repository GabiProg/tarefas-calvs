import app, { init } from "@/app";
import * as jwt from "jsonwebtoken";
import faker from "@faker-js/faker";
import httpStatus from "http-status";
import supertest from "supertest";
import { prisma } from "@/config";
import { TicketStatus } from "@prisma/client";
import { cleanDb, generateValidToken } from "../helpers";
import {
  createEnrollmentWithAddress,
  createUser,
  createTicket,
  createRoomWithSmallCapacity,
  createBooking,
  createTicketHotel,
  createRoomHotel,
  createPayment,
  createHotel,
  createTicketType,
} from "../factories";

beforeAll(async () => {
  await init();
});
    
beforeEach(async () => {
  await cleanDb();
});
    
const server = supertest(app);

describe("GET /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.get("/booking");
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
        
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
    
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        
    const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
        
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with satuts 404 when there are no booked room", async () => {
      const token = await generateValidToken();
                  
      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);
            
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 200 and with existing booked room data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const room = await createRoomHotel(hotel.id);
      const booking = await createBooking(user.id, room.id);

      const response = await server.get("/booking").set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual(
        expect.objectContaining({
          id: booking.id,
          userId: booking.userId,
          roomId: booking.roomId,
          Room: {
            id: room.id,
            name: room.name,
            capacity: room.capacity,
            hotelId: room.hotelId,
          }
        })
      );
    }); 
  });
});

describe("POST /booking", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.post("/booking");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
      
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
    const response = await server.post("/booking").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when roomId is not present in the body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      await createRoomHotel(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should resposnd with satuts 404 when roomId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      await createRoomHotel(hotel.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user doesn't have an enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketType();

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesn't have a ticket yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesn't have a presential and includes hotel ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(true, false);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there are no more room capacity", async () => {
      const user = await createUser();
      const user2 = await createUser();

      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      const capacityOne = await createRoomWithSmallCapacity(hotel.id);
      await createBooking(user.id, capacityOne.id);
      await createBooking(user2.id, capacityOne.id);

      const response = await server.post("/booking").set("Authorization", `Bearer ${token}`).send({ roomId: capacityOne.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and with created bookingId data", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomHotel(hotel.id);
      const body = { roomId: room.id };
      const beforeCount = await prisma.booking.count();
      await createBooking(user.id, room.id);
      
      await server.post("/booking").set("Authorization", `Bearer ${token}`).send(body);

      const afterCount = await prisma.booking.count();

      expect(beforeCount).toEqual(0);
      expect(afterCount).toEqual(1);
    });
  });
});

describe("PUT /booking/:bookingId", () => {
  it("should respond with status 401 if no token is given", async () => {
    const response = await server.put("/booking/:bookingId");
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if given token is not valid", async () => {
    const token = faker.lorem.word();
      
    const response = await server.put("/booking/:bookingId").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  
  it("should respond with status 401 if there is no session for given token", async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
      
    const response = await server.put("/booking/:bookingId").set("Authorization", `Bearer ${token}`);
      
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    it("should respond with status 404 when roomId is not present in the body", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      await createRoomHotel(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should resposnd with satuts 404 when roomId doesn't exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);

      const hotel = await createHotel();
      await createRoomHotel(hotel.id);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({});

      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it("should respond with status 404 if query param bookingId is missing", async () => {
      const token = await generateValidToken();
  
      const response = await server.put("/booking/:bookingId").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });
  
    it("should respond with status 404 when given bookingId doesnt exist", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);
  
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`);
  
      expect(response.status).toEqual(httpStatus.NOT_FOUND);
    });

    it("should respond with status 403 when user doesn't have an enrollment yet", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const ticketType = await createTicketType();

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when user doesn't have a presential and includes hotel ticket", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(true, false);

      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send({ roomId: 1 });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with satuts 403 when user doesn't have a booked room", async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, false);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);

      const hotel = await createHotel();
      const room = await createRoomHotel(hotel.id);
      const body = { roomId: room.id };
              
      const response = await server.put("/booking/1").set("Authorization", `Bearer ${token}`).send(body);
        
      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 403 when there aren't room capacity anymore", async () => {
      const user = await createUser();
      const user2 = await createUser();
      const user3 = await createUser();

      const hotel2 = await createHotel();
      const room = await createRoomHotel(hotel2.id);
      const booking2 = await createBooking(user3.id, room.id);

      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      
      const hotel = await createHotel();
      const capacityOne = await createRoomWithSmallCapacity(hotel.id);
      await createBooking(user.id, capacityOne.id);
      await createBooking(user2.id, capacityOne.id);

      const response = await server.put(`/booking/${booking2.id}`).set("Authorization", `Bearer ${token}`).send({ roomId: capacityOne.id });

      expect(response.status).toBe(httpStatus.FORBIDDEN);
    });

    it("should respond with status 200 and with updated bookingId data", async () => {
      const user3 = await createUser();

      const hotel2 = await createHotel();
      const room2 = await createRoomHotel(hotel2.id);
      const booking2 = await createBooking(user3.id, room2.id);

      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketType();
      const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
      await createPayment(ticket.id, ticketType.price);
      const hotel = await createHotel();
      const room = await createRoomHotel(hotel.id);
      const body = { roomId: room.id };
      const beforeCount = await prisma.booking.count();
      await createBooking(user.id, room.id);
      
      await server.post(`/booking/${booking2.id}`).set("Authorization", `Bearer ${token}`).send(body);

      const afterCount = await prisma.booking.count();

      expect(beforeCount).toEqual(1);
      expect(afterCount).toEqual(2);
    });
  });
});
