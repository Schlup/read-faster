import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View } from "react-native";

const cardVariants = cva("rounded-lg border bg-card", {
  variants: {
    variant: {
      default: "border-border",
      ghost: "border-transparent bg-transparent",
      elevated: "border-transparent shadow-lg",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface CardProps
  extends React.ComponentProps<typeof View>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, variant, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(cardVariants({ variant, className }))}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-col gap-1.5 p-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  React.ElementRef<typeof View>,
  React.ComponentProps<typeof View>
>(({ className, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-row items-center p-4 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardContent, CardFooter, CardHeader, cardVariants };

