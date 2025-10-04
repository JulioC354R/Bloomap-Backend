export type OrderDirection = 'asc' | 'desc';

export interface OrderByQuery<TField extends string = string> {
  field?: TField;
  direction?: OrderDirection;
}

export function buildOrderBy<TField extends string>(
  orderBy?: OrderByQuery<TField>,
): Record<TField, OrderDirection> | undefined {
  if (!orderBy?.field || !orderBy?.direction) return undefined;

  return {
    [orderBy.field]: orderBy.direction,
  } as Record<TField, OrderDirection>;
}
