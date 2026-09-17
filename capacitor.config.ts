import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.danish5767.luma",
  appName: "Luma",
  webDir: ".",
  bundledWebRuntime: false,
  android: {
    backgroundColor: "#faf9fc"
  },
  server: {
    androidScheme: "https"
  }
};

export default config;
