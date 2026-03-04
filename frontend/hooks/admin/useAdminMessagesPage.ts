import { mockAdminMessages } from "@/constants";

export function useAdminMessagesPage() {
  const messages = mockAdminMessages;
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("vi-VN");
    }
    return d;
  };
  return { messages, formatDate };
}
