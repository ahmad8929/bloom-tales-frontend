import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-semibold uppercase tracking-luxe ring-offset-background transition-all duration-300 ease-luxe focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] [text-shadow:0_1px_1px_hsl(var(--ink)/0.15)]",
  {
      variants: {
        variant: {
          default: "bg-primary text-primary-foreground hover:bg-hover hover:text-hover-foreground",
          destructive:
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          outline:
            "border border-sage bg-transparent text-sage-deep hover:bg-sage hover:text-white",
          secondary:
            "border border-sage bg-transparent text-sage-deep hover:border-sage-deep hover:text-sage-deep",
          gold: "bg-gold text-gold-foreground hover:bg-hover",
          ghost: "hover:bg-secondary-hover hover:text-heading normal-case tracking-normal",
          link: "text-heading underline-offset-4 hover:underline hover:text-gold normal-case tracking-normal",
        },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 px-4 text-[11px]",
        lg: "h-[3.25rem] px-10",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
