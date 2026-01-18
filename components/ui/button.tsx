import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Pressable, Text as RNText } from "react-native";

const buttonVariants = cva(
  "flex items-center justify-center gap-2 rounded-md font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary",
        destructive: "bg-destructive",
        outline: "border border-input bg-background",
        secondary: "bg-secondary",
        ghost: "bg-transparent",
        link: "bg-transparent",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    Omit<React.ComponentProps<typeof Pressable>, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  textClassName?: string; // Adicionado para customizar o texto se necessário
}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, children, textClassName, ...props }, ref) => {
  // Mapeamento de cores de texto baseado no variante
  const textVariants = {
    default: "text-primary-foreground",
    destructive: "text-destructive-foreground",
    outline: "text-foreground",
    secondary: "text-secondary-foreground",
    ghost: "text-foreground",
    link: "text-primary underline",
  };

  return (
    <Pressable
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    >
      <RNText
        className={cn(
          "text-sm font-medium",
          textVariants[variant || "default"],
          textClassName,
        )}
      >
        {children}
      </RNText>
    </Pressable>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
