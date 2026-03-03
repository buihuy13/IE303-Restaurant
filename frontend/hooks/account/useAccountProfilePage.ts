import { useAuthStore } from "@/stores/use-auth-store";

export function useAccountProfilePage() {
  const { user, reset } = useAuthStore();

  const handleMockLogout = () => {
    reset();
  };

  return {
    user,
    handleMockLogout,
  };
}

