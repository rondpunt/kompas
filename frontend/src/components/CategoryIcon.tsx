import React from "react";
import { View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { CATEGORY_STYLES } from "@/src/theme/colors";
import { useTheme } from "@/src/theme/ThemeContext";

interface Props {
  category: string;
  size?: number;
  iconSize?: number;
}

export function CategoryIcon({ category, size = 36, iconSize = 18 }: Props) {
  const { theme } = useTheme();
  const style = CATEGORY_STYLES[category];
  if (!style) {
    return <View style={{ width: size, height: size }} />;
  }
  const bg = theme === "night" ? style.bgNight : style.bgKlaar;
  const fg = theme === "night" ? style.fgNight : style.fgKlaar;
  const Lib = style.iconLib === "Feather" ? Feather : MaterialCommunityIcons;
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Lib name={style.iconName as any} size={iconSize} color={fg} />
    </View>
  );
}
