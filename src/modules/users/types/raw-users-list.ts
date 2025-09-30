import { Prisma } from '@prisma/client';

export type RawUsersList = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    createdAt: true;
    updatedAt: true;
  };
}>;
