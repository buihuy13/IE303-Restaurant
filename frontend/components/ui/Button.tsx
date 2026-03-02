import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "icon";
};

const variantClassMap: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-brand-purple text-white hover:opacity-90",
  secondary: "bg-brand-yellowlight text-brand-black hover:opacity-90",
  ghost: "bg-transparent text-brand-black hover:bg-gray-100",
};

const sizeClassMap: Record<NonNullable<ButtonProps["size"]>, string> = {
  default: "px-4 py-2 text-sm",
  icon: "h-10 w-10 p-0",
};

export default function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition",
        variantClassMap[variant],
        sizeClassMap[size],
        className,
      )}
      data-variant={variant}
      {...props}
    />
  );
}
