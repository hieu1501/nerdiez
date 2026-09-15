export interface UserRefDTO { username: string; }
export interface CategoryAdminRefDTO { categoryId: number; name: string; slugName: string; }
export interface TagAdminRefDTO { tagId: number; slugName: string; }
export interface VoteStatsDTO { upvoteCount: number; downvoteCount: number; }
export interface PageResponse<T> {
  items: T[];
  size: number;
  offset: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
export interface PageQuery { page?: number; size?: number; sort?: string; }
export function pageQuery(params?: PageQuery): string {
  const query = new URLSearchParams();
  if (params?.page !== undefined) query.set("page", String(params.page));
  if (params?.size !== undefined) query.set("size", String(params.size));
  if (params?.sort) query.set("sort", params.sort);
  return query.size ? `?${query}` : "";
}
