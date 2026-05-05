export const colors = {
  bg: "#050505",
  card: "#121212",
  sheet: "#1A1A1C",
  glassBase: "rgba(255,255,255,0.04)",
  glassActive: "rgba(255,255,255,0.12)",
  border: "rgba(255,255,255,0.08)",
  borderActive: "rgba(255,255,255,0.2)",

  // accents
  lighting: "#FFD60A",
  cool: "#0A84FF",
  heat: "#FF453A",
  security: "#FF9F0A",
  energy: "#32D74B",

  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textTertiary: "#71717A",
  textInverse: "#000000",
};

export const radii = { sm: 12, md: 20, lg: 32, pill: 9999 };
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };

export const typography = {
  h1: { fontSize: 40, lineHeight: 48, fontWeight: "800" as const, letterSpacing: -0.5 },
  h2: { fontSize: 32, lineHeight: 40, fontWeight: "800" as const, letterSpacing: -0.4 },
  h3: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.3 },
  bodyLg: { fontSize: 18, lineHeight: 26, fontWeight: "400" as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyMd: { fontSize: 15, lineHeight: 22, fontWeight: "500" as const },
  small: { fontSize: 13, lineHeight: 18, fontWeight: "500" as const },
  overline: { fontSize: 11, fontWeight: "800" as const, letterSpacing: 1.5 },
};

export const colorForType = (type: string): string => {
  switch (type) {
    case "light":
      return colors.lighting;
    case "fan":
    case "ac":
      return colors.cool;
    case "thermostat":
      return colors.heat;
    case "lock":
    case "doorbell":
    case "sensor":
      return colors.security;
    case "outlet":
      return colors.energy;
    default:
      return colors.textPrimary;
  }
};

export const iconForType = (type: string): string => {
  switch (type) {
    case "light":
      return "lightbulb-outline";
    case "fan":
      return "fan";
    case "ac":
      return "air-conditioner";
    case "lock":
      return "lock";
    case "doorbell":
      return "doorbell-video";
    case "thermostat":
      return "thermostat";
    case "outlet":
      return "power-socket";
    case "sensor":
      return "motion-sensor";
    default:
      return "chip";
  }
};
