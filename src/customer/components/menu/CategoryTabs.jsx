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
        py-3
        mt-4
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
          gap-2.5
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
              py-2
              rounded-2xl
              text-sm
              font-semibold
              transition-all
              duration-300
              cursor-pointer

              ${
                activeCategory === category
                  ? "bg-[#1ea753] text-white shadow-md shadow-[#1ea753]/25 font-bold"
                  : "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400"
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