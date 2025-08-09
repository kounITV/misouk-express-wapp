
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "./schema";

const authenticateUser = async (username: string, password: string) => {
  const response = await signIn("credentials", {
    username,
    password,
    redirect: false,
  });
  if (!response || response?.error) {
    throw new Error(response?.error || "An unexpected error occurred");
  }

  return response;
};

export const hookLoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await authenticateUser(data.username, data.password);
    } catch {
      form.setError("root", { type: "manual", message: "ຊຶ່ບັນຊີ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ" });
    } finally {
      setIsLoading(false);
    }
  };

  return { form, onSubmit, isLoading };
};