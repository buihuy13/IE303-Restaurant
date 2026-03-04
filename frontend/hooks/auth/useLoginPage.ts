"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function useLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Login (mock) – redirecting.");
    router.push("/");
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
}
