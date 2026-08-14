import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@/components/ui/input";
import { FormField } from "./FormField";
import { cn } from "@/lib/utils";

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  hint,
  className,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField id={id} label={label} error={error} hint={hint} className={className}>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          className={cn("h-11 pr-11", error && "border-error focus-visible:ring-error/40")}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground"
        >
          <motion.span
            key={visible ? "on" : "off"}
            initial={{ opacity: 0, scale: 0.8, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.15 }}
            className="flex"
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </motion.span>
        </button>
      </div>
    </FormField>
  );
}
