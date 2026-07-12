import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { toSafeUser } from '../common/safe-user.util';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map((u) => toSafeUser(u));
  }

  async updateRole(id: number, dto: UpdateRoleDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
    });
    return toSafeUser(user);
  }
}
