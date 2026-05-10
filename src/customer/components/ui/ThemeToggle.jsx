import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [darkMode, setDarkMode] =
    useState(false);

  useEffect(() => {

    const savedTheme =
      localStorage.getItem("theme");

    if (savedTheme === "dark") {
      setDarkMode(true);

      document.documentElement.classList.add(
        "dark"
      );
    }

  }, []);

  function toggleTheme() {

    const newDarkMode = !darkMode;

    setDarkMode(newDarkMode);

    if (newDarkMode) {

      document.documentElement.classList.add(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "dark"
      );

    } else {

      document.documentElement.classList.remove(
        "dark"
      );

      localStorage.setItem(
        "theme",
        "light"
      );
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        fixed
        top-6
        right-6
        z-50

        w-10
        h-10

        rounded-2xl

        bg-white/80
        dark:bg-zinc-900/80

        backdrop-blur-xl

        border
        border-white/20
        dark:border-zinc-700

        shadow-xl

        flex
        items-center
        justify-center

        text-2xl

        transition-all
        duration-300

        hover:scale-110
      "
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}