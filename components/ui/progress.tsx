import * as React from "react";
import { View, ViewStyle } from "react-native";

interface ProgressProps extends React.ComponentProps<typeof View> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<React.ElementRef<typeof View>, ProgressProps>(
  ({ className, value = 0, max = 100, style, ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));

    // Combine passed style with default styles to avoid NativeWind transition issues
    const containerStyle: ViewStyle = {
      height: 8,
      width: "100%",
      overflow: "hidden",
      borderRadius: 9999,
      backgroundColor: "#262626",
      ...(style as ViewStyle),
    };

    const fillStyle: ViewStyle = {
      height: "100%",
      width: `${percentage}%`,
      backgroundColor: "#fafafa",
    };

    return (
      <View ref={ref} style={containerStyle} {...props}>
        <View style={fillStyle} />
      </View>
    );
  },
);
Progress.displayName = "Progress";

export { Progress };

