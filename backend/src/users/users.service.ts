import { ForbiddenException, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { toSafeUser } from '../common/safe-user.util';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryUsersDto } from './dto/query-users.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take: limit }),
      this.prisma.user.count(),
    ]);

    return {
      data: users.map((u) => toSafeUser(u)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateRole(id: number, dto: UpdateRoleDto, requestingUserId: number) {
    if (id === requestingUserId) {
      throw new ForbiddenException('You cannot change your own role');
    }

    if (dto.role !== Role.ADMIN) {
      const adminCount = await this.prisma.user.count({
        where: { role: Role.ADMIN },
      });
      const targetUser = await this.prisma.user.findUnique({ where: { id } });
      if (targetUser?.role === Role.ADMIN && adminCount <= 1) {
        throw new ForbiddenException('Cannot remove the last admin');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });
    return toSafeUser(user);
  }
}
