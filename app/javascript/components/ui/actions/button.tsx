import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import styles from "./button.module.css"

const buttonVariants = cva(styles.button, {
  variants: {
    variant: {
      default: styles.default,
      outline: styles.outline,
      secondary: styles.secondary,
      ghost: styles.ghost,
      destructive: styles.destructive,
      link: styles.link,
    },
    size: {
      default: styles.sizeDefault,
      xs: styles.sizeExtraSmall,
      sm: styles.sizeSmall,
      lg: styles.sizeLarge,
      icon: styles.sizeIcon,
      "icon-xs": styles.sizeIconExtraSmall,
      "icon-sm": styles.sizeIconSmall,
      "icon-lg": styles.sizeIconLarge,
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
