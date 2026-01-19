import { cn } from "@/lib/utils";
import * as React from "react";
import { View } from "react-native";

interface SeparatorProps extends React.ComponentProps<typeof View> {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
}

const Separator = React.forwardRef<React.ElementRef<typeof View>, SeparatorProps>(
  ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
    <View
      ref={ref}
      accessibilityRole={decorative ? "none" : undefined}
      className={cn(
        "bg-border shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      {...props}
    />
  ),
);
Separator.displayName = "Separator";

export { Separator };
