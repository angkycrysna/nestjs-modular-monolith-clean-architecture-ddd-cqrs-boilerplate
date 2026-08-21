/**
 * User module public contract.
 *
 * This file defines what other modules (or microservices) can use
 * to communicate with the User module. Contains:
 * - Injection token (USER_FACADE)
 * - Interface (IUserFacade)
 * - Response DTO (UserResponseDto)
 *
 * Import from: @contracts/user
 */

// Injection token
export const USER_FACADE = Symbol('USER_FACADE');

// Response DTO — shared output shape
export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
  createdAt!: Date;
  updatedAt!: Date;

  static from(props: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
  }): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = props.id;
    dto.name = props.name;
    dto.email = props.email;
    dto.createdAt = props.createdAt;
    dto.updatedAt = props.updatedAt;
    return dto;
  }
}

// Facade interface
export interface IUserFacade {
  getUserById(id: string): Promise<UserResponseDto>;
  getUserByEmail(email: string): Promise<UserResponseDto | null>;
}
