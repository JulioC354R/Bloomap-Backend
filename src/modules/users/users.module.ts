import { Module } from '@nestjs/common';
import { PrismaModule } from '@prisma/prisma.module';
import { UserService } from '@users/users.service';
import { UserRepository } from '@users/users.repository';
import { UserController } from '@users/users.controller';

@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
