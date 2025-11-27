import { useMemo } from "react";
import { UseFormWatch } from "react-hook-form";
import { z } from "zod";

// common email schema
const emailSchema = z.string().email("Please enter a valid email.");

interface UseEmailValidationProps {
  watch: UseFormWatch<any>;
  fieldName?: string;
}

export function useEmailValidation({
  watch,
  fieldName = "email",
}: UseEmailValidationProps) {
  const emailValue = watch(fieldName);

  const isEmailValid = useMemo(() => {
    if (!emailValue) return false;
    try {
      emailSchema.parse(emailValue);
      return true;
    } catch {
      return false;
    }
  }, [emailValue]);

  return {
    emailValue,
    isEmailValid,
  };
}
