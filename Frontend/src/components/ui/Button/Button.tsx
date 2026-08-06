import type { ButtonHTMLAttributes } from "react";
import { buttonVariants } from "./buttonVariants";
import { cn } from "../../../lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
};

export default function Button({
    className,
    variant,
    size,
    type = "button",
    ...props
}: Props) {
    return (
        <button
            type={type}
            className={cn(
                buttonVariants({
                    variant,
                    size,
                }),
                className
            )}
            {...props}
        />
    );
}