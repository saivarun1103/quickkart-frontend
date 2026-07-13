import { useEffect, useState } from "react";

export default function ThemeToggle() {

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" ||
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

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
    
    window.dispatchEvent(new Event("theme-changed"));
  }

  return (
    <button
      onClick={toggleTheme}
      className="
        w-8
        h-8
        sm:w-9
        sm:h-9
        rounded-xl
        bg-white
        dark:bg-zinc-900
        border
        border-emerald-100/60
        dark:border-emerald-900/40
        hover:border-emerald-300
        dark:hover:border-emerald-800
        shadow-sm
        flex
        items-center
        justify-center
        text-base
        sm:text-lg
        transition-all
        duration-300
        hover:scale-105
        cursor-pointer
      "
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
}