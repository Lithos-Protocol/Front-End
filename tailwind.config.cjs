const themes = require("daisyui/src/colors/themes");

const lightTheme = themes["[data-theme=light]"];
const darkTheme = themes["[data-theme=dark]"];

const themeCustomizations = {
  "--btn-focus-scale": "0.98",
  primary: lightTheme.primary,
  secondary: lightTheme.primary
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "!@oruga-ui/*"],
  darkMode: "class",
  plugins: [require("daisyui")],
  daisyui: {
    styled: true,
    themes: [
      {
        light: {
          ...lightTheme,
          ...themeCustomizations
        }
      },
      {
        dark: {
          ...darkTheme,
          ...themeCustomizations
        }
      }
    ],
    base: true,
    utils: true,
    logs: true,
    darkTheme: "dark"
  }
};
