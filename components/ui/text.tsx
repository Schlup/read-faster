import { cn } from "@/lib/utils";
import * as React from "react";
import { Text as RNText, TextProps as RNTextProps } from "react-native";

// Base text component with forwarded ref
interface TextProps extends RNTextProps {
  className?: string;
}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-foreground", className)}
      {...props}
    />
  ),
);
Text.displayName = "Text";

// Heading variants
const H1 = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn(
        "text-4xl font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
H1.displayName = "H1";

const H2 = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn(
        "text-3xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
);
H2.displayName = "H2";

const H3 = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-2xl font-semibold text-foreground", className)}
      {...props}
    />
  ),
);
H3.displayName = "H3";

const H4 = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-xl font-semibold text-foreground", className)}
      {...props}
    />
  ),
);
H4.displayName = "H4";

// Paragraph and helper text
const P = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-base leading-7 text-foreground", className)}
      {...props}
    />
  ),
);
P.displayName = "P";

const Lead = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    />
  ),
);
Lead.displayName = "Lead";

const Large = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  ),
);
Large.displayName = "Large";

const Small = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-sm font-medium leading-none text-foreground", className)}
      {...props}
    />
  ),
);
Small.displayName = "Small";

const Muted = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, ...props }, ref) => (
    <RNText
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  ),
);
Muted.displayName = "Muted";

export { H1, H2, H3, H4, Large, Lead, Muted, P, Small, Text };

