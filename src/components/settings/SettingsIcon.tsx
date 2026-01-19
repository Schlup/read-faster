// @/src/components/settings/SettingsIcon.tsx
import SettingsIconSVG from "@/src/assets/svgs/icons/SettingsIconSVG";
import { Link } from "expo-router";

export default function SettingsIcon() {
  return (
    <Link href="/settings">
      <SettingsIconSVG width={28} height={28} stroke="white" />
    </Link>
  );
}
