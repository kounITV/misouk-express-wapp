import { cn } from "@/lib/utils"
import { Check, Eye, EyeOff, X } from "lucide-react"
import * as React from "react"
import { forwardRef, useEffect, useMemo, useState } from "react"
import { Input } from "../ui/input"

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  strengthIndicator?: boolean
  isCreating?: boolean,
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, strengthIndicator = true, value: propValue, isCreating, ...props }, ref) => {
    const [password, setPassword] = useState(propValue as string || "")
    const [isVisible, setIsVisible] = useState<boolean>(false)

    useEffect(() => {
      if (propValue !== undefined) {
        setPassword(propValue as string)
      }
    }, [propValue])

    const toggleVisibility = () => { setIsVisible((prevState) => !prevState); }

    // const checkStrength = (pass: string) => {
    //   // const requirements = [
    //   //   // { regex: /.{6,}/, text: "ຢ່າງນ້ອຍ 8 ຕົວອັກສອນ" },
    //   //   // { regex: /[0-9]/, text: "ຢ່າງນ້ອຍ 1 ຕົວເລກ" },
    //   //   // { regex: /[a-z]/, text: "ຢ່າງນ້ອຍ 1 ຕົວອັກສອນຂຽນນ້ອຍ" },
    //   //   // { regex: /[A-Z]/, text: "ຢ່າງນ້ອຍ 1 ຕົວອັກສອນຂຽນໃຫຍ່" },
    //   // ]
    //   // return requirements.map((req) => ({
    //   //   met: req.regex.test(pass),
    //   //   text: req.text,
    //   // }))
    // }

    // const strength = checkStrength(password)
    // const strengthScore = useMemo(() => {
    //   return strength.filter((req) => req.met).length
    // }, [strength])

    const getStrengthColor = (score: number) => {
      if (score === 0) { return "bg-border" }
      if (score <= 1) { return "bg-red-500" }
      if (score <= 2) { return "bg-orange-500" }
      if (score === 3) { return "bg-amber-500" }
      return "bg-emerald-500"
    }

    const getStrengthText = (score: number) => {
      if (score === 0) { return "ກະລຸນາໃສ່ລະຫັດຜ່ານ" }
      if (score <= 2) { return "ລະຫັດຜ່ານອ່ອນແອ" }
      if (score === 3) { return "ລະຫັດຜ່ານລະດັບກາງ" }
      return "ລະຫັດຜ່ານປອດໄພ"
    }

    return (
      <div className={cn("space-y-2", className)}>
        <div className="relative">
          <Input
            {...props}
            type={isVisible ? "text" : "password"}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              props.onChange?.(e)
            }}
            ref={ref}
            className={cn("pe-9")}
            // aria-invalid={strengthScore < 4}
            aria-describedby={
              strengthIndicator ? "password-strength" : undefined
            }
          />
          <button
            className="absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
            type="button"
            onClick={toggleVisibility}
            aria-label={isVisible ? "Hide password" : "Show password"}
            aria-pressed={isVisible}
            aria-controls={props.id}
          >
            {isVisible
              ? (
                <EyeOff size={16} strokeWidth={2} aria-hidden="true" />
              )
              : (
                <Eye size={16} strokeWidth={2} aria-hidden="true" />
              )}
          </button>
        </div>
        {(strengthIndicator && isCreating) && (
          <>
            <div
              className="mb-4 mt-3 h-1 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
              // aria-valuenow={strengthScore}
              aria-valuemin={0}
              aria-valuemax={4}
              aria-label="Password strength"
            >
              <div
                className={`h-full  transition-all duration-500 ease-out`}
                // style={{ width: `${(strengthScore / 4) * 100}%` }}
              ></div>
            </div>

            <p
              id="password-strength"
              className="mb-2 text-sm font-medium text-foreground"
            >
              {/* {getStrengthText(strengthScore)}. ຕ້ອງມີ: */}
            </p>

            <ul className="space-y-1.5" aria-label="Password requirements">
              {/* {strength.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  {req.met
                    ? (
                      <Check
                        size={16}
                        className="text-emerald-500"
                        aria-hidden="true"
                      />
                    )
                    : (
                      <X
                        size={16}
                        className="text-muted-foreground/80"
                        aria-hidden="true"
                      />
                    )}
                  <span
                    className={`text-xs ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                  >
                    {req.text}
                    <span className="sr-only">
                      {req.met
                        ? " - Requirement met"
                        : " - Requirement not met"}
                    </span>
                  </span>
                </li>
              ))} */}
            </ul>
          </>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
