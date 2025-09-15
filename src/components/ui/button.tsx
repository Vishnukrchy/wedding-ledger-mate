import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-white shadow-lg hover:shadow-xl hover:scale-105 transform",
        destructive:
          "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg hover:shadow-xl hover:from-red-600 hover:to-red-700",
        outline:
          "border-2 border-primary/20 bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary/5 hover:border-primary/40 hover:scale-105 transform",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/90 text-secondary-foreground shadow-md hover:shadow-lg hover:scale-105 transform",
        ghost: "text-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 transform",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary/80",
        elegant: "bg-gradient-elegant text-white shadow-elegant hover:shadow-glow hover:scale-105 transform backdrop-blur-sm",
        wedding: "bg-gradient-rose text-white shadow-glow hover:shadow-xl hover:scale-105 transform backdrop-blur-sm",
        marigold: "bg-gradient-marigold text-white shadow-glow hover:shadow-xl hover:scale-105 transform backdrop-blur-sm",
        premium: "bg-gradient-to-r from-primary via-primary-glow to-primary text-white shadow-xl hover:shadow-2xl hover:scale-110 transform border border-white/20",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 hover:scale-105 transform shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
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
