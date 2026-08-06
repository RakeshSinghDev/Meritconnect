import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
    {
        variants: {
            variant: {
                primary:
                    "bg-black text-white hover:bg-neutral-800",
                secondary:
                    "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
                outline:
                    "border border-neutral-300 bg-white hover:bg-neutral-50",

                ghost:
                    "bg-transparent text-gray-700 hover:bg-gray-100 hover:text-black",
            },
            size: {
                sm: "h-9 px-3 text-sm",
                md: "h-11 px-5",
                lg: "h-12 px-6 text-lg",
            },
        },

        defaultVariants: {
            variant: "primary",
            size: "md",
        },
    }
);