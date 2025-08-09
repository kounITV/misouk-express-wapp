"use client";
// import { Button } from "@/components/containers/button";
// import { Form } from "@/components/containers/form";
// import { hookLoginForm } from "./hook";
// // import { IconBackground } from "@tabler/icons-react";
// export function LoginForm() {
//   const { form, onSubmit, isLoading } = hookLoginForm();
//   return (
//     <div className="mx-10 bg-amber-50">
//       <Form formInstance={form} onSubmit={onSubmit} showButton={false} className="m-auto flex w-full flex-col justify-center space-y-2 sm:w-[350px] bg-card rounded-lg">
//         <div className="flex flex-col space-y-2 text-left">
//           <h1 className="text-2xl font-semibold tracking-tight font-noto-lao" style={{color: 'red'}}>
//             ເຂົ້າລະບົບ.
//           </h1>
//           <p className="text-red-500 test">
//             ປ້ອນບັນຊີເຂົ້າໃຊ້ງານລະບົບແລະລະຫັດຜ່ານຂອງທ່ານຂ້າງລຸ່ມນີ້ <br />
//             ເພື່ອເຂົ້າສູ່ບັນຊີຂອງທ່ານ
//           </p>
//         </div>
//         <div className="grid gap-2">
//           <Form.Field name="username" control={form.control} label="ບັນຊີເຂົ້າໃຊ້ງານລະບົບ">
//             <Form.Input.Input placeholder="ປ້ອນຊື່ຜູ້ໃຊ້" />
//           </Form.Field>
//           <Form.Field name="password" control={form.control} label="ລະຫັດຜ່ານ">
//             <Form.Input.Password placeholder="ປ້ອນລະຫັດຜ່ານ" isCreating={false} />
//           </Form.Field>
//           {form.formState.errors.root && (
//             <p className="text-red-600 text-sm">{form.formState.errors.root.message}</p>
//           )}
//         </div>
//         <Button className="mt-11 w-full" loading={isLoading}>
//           ເຂົ້າສູ່ລະບົບ
//         </Button>
//       </Form >
//     </div>
//   );
// }
