import { ApplicationError } from "@/protocols";

export function forbiddenError(): ApplicationError {
  return {
    name: "forbiddenError",
    message: "You must have paid a Ticket that also includes Hotel"
  };
}
