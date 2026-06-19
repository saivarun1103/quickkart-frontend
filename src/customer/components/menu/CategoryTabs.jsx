export default function CategoryTabs({
  categories,
  activeCategory,
  setActiveCategory
}) {

  return (
    <div
      className="
        sticky
        top-[47px]
        sm:top-[53px]
        z-30
        bg-white/70 dark:bg-zinc-950/70
        backdrop-blur-md
        py-2
        mt-6
        transition-all
        duration-500
        border-b
        border-emerald-500/5
        dark:border-emerald-500/10
      "
    >

      <div
        className="
          flex
          gap-3
          overflow-x-auto
          scrollbar-hide
        "
      >

        {categories.map(category => (

          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              whitespace-nowrap
              px-5
              py-3
              rounded-2xl
              font-semibold
              transition-all
              duration-300

              ${
                activeCategory === category
                  ? "bg-black text-white shadow-lg dark:bg-[#26b34d]"
                  : "bg-white text-gray-700 dark:bg-zinc-900 dark:text-zinc-200"
              }
            `}
          >
            {category}
          </button>

        ))}

      </div>

    </div>
  );
}