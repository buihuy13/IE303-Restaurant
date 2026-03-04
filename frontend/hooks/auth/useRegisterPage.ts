"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export function useRegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Registration (mock) – redirecting.");
    router.push("/login");
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    password,
    setPassword,
    handleSubmit,
  };
}
