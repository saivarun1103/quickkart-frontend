export default function CategoryTabs({
  categories,
  activeCategory,
  setActiveCategory
}) {

  return (
    <div
      className="
        sticky
        top-0
        z-30
        bg-[#ededed] dark:bg-black
        backdrop-blur-xl
        py-4
        mt-6
        
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