import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, View } from "react-native";

const iconButtonVariants = cva(
  "flex items-center justify-center rounded-full active:opacity-70",
  {
    variants: {
      variant: {
        default: "bg-secondary",
        ghost: "bg-transparent",
        outline: "border border-border bg-transparent",
      },
      size: {
        default: "h-10 w-10",
        sm: "h-8 w-8",
        lg: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface IconButtonProps
  extends Omit<React.ComponentProps<typeof Pressable>, "children">,
    VariantProps<typeof iconButtonVariants> {
  children?: React.ReactNode;
}

const IconButton = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  IconButtonProps
>(({ className, variant, size, children, ...props }, ref) => {
  return (
    <Pressable
      className={cn(iconButtonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      <View className="items-center justify-center">{children}</View>
    </Pressable>
  );
});
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
