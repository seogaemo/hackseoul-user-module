import { status } from "@grpc/grpc-js";
import { Role as PrismaRole } from "@prisma/client";
import {
  CreateUserRequest,
  CreateUserResponse,
  Role as ProtoRole,
  UserResponse,
} from "@shared/generated/user.proto";
import { hash } from "bcrypt";

import { Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";

import { PrismaService } from "src/common/modules/prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  convertProtoRoleToPrismaRole(role: ProtoRole): PrismaRole {
    switch (role) {
      case ProtoRole.ADMIN:
        return PrismaRole.ADMIN;
      case ProtoRole.DISTRIBUTOR:
        return PrismaRole.DISTRIBUTOR;
      default:
        throw new RpcException("Role not recognized");
    }
  }

  convertPrismaRoleToProtoRole(role: PrismaRole): ProtoRole {
    switch (role) {
      case PrismaRole.ADMIN:
        return ProtoRole.ADMIN;
      case PrismaRole.DISTRIBUTOR:
        return ProtoRole.DISTRIBUTOR;
      default:
        throw new RpcException("Role not recognized");
    }
  }

  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.prismaService.user.findFirst({
      where: { id },
    });

    if (!user) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: "User not found",
      });
    }

    return {
      uid: user.uid,
      name: user.name,
      id: user.id,
      role: this.convertPrismaRoleToProtoRole(user.role),
    };
  }

  async createUser(user: CreateUserRequest): Promise<CreateUserResponse> {
    const res = await this.prismaService.user.create({
      data: {
        id: user.id,
        password: await hash(user.password, 10),
        name: user.name,
        role: this.convertProtoRoleToPrismaRole(user.role),
      },
    });

    return { uid: res.uid };
  }
}
