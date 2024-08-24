import { status } from "@grpc/grpc-js";
import {
  CreateUser,
  CreateUserResponse,
  GetUserById,
  GetUserByUid,
  UserResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from "@shared/generated/user.proto";
import { Observable } from "rxjs";

import { Controller } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

import { UserService } from "./user.service";

@Controller()
@UserServiceControllerMethods()
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  getUserById(
    request: GetUserById,
  ): Promise<UserResponse> | Observable<UserResponse> | UserResponse {
    return this.userService.getUserById(request.id);
  }

  getUserByUid(
    request: GetUserByUid,
  ): Promise<UserResponse> | Observable<UserResponse> | UserResponse {
    throw new Error("Method not implemented.");
  }
  createUser(
    request: CreateUser,
  ):
    | Promise<CreateUserResponse>
    | Observable<CreateUserResponse>
    | CreateUserResponse {
    if (!request.user) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: "User not provided",
      });
    }

    return this.userService.createUser(request.user);
  }
}
