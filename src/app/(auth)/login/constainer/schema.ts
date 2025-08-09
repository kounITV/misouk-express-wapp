import { z } from "zod";

export const formSchema = z.object({
  username: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ລະຫັດຜ່ານຂອງທ່ານ" }),
  password: z
    .string()
    .min(1, { message: "ກະລຸນາໃສ່ລະຫັດຜ່ານຂອງທ່ານ" })
    // .min(8, { message: "ລະຫັດຜ່ານຕ້ອງຍາວຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" }),
});
