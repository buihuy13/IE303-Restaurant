import { mockAdminUsers } from "@/constants";

export function useAdminUsersPage() {
  const users = mockAdminUsers;
  return { users };
}
