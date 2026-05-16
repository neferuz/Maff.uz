import localFont from "next/font/local";

export const evolventa = localFont({
  src: [
    {
      path: "../fonts/evolventa/Evolventa-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/evolventa/Evolventa-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-evolventa",
});
