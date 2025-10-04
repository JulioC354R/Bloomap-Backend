import { Prisma } from '@prisma/client';

export enum OrderByDirection {
  asc = 'asc',
  desc = 'desc',
}

export const getUserOrderByFields = () => {
  const { name, email, createdAt } = Prisma.UserScalarFieldEnum;
  return [name, email, createdAt] as const;
};

export const OrderByEnum = {
  USERS: getUserOrderByFields(),
};
