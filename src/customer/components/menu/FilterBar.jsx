import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FilterBar({
  selectedDietary,
  setSelectedDietary,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories = [],
  totalItemsCount = 0,
  filteredCount = 0
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Active filter count logic
  const activeFilterCount =
    (selectedDietary !== "All" ? 1 : 0) +
    (selectedCategory !== "All" ? 1 : 0) +
    (sortBy !== "default" ? 1 : 0);

  const handleDietaryToggle = (type) => {
    if (selectedDietary === type) {
      setSelectedDietary("All");
    } else {
      setSelectedDietary(type);
    }
  };

  const clearAllFilters = () => {
    setSelectedDietary("All");
    setSelectedCategory("All");
    setSortBy("default");
  };

  return (
    <>
      {/* Sticky Filter Bar */}
      <div
        className="
          sticky
          top-[47px]
          sm:top-[53px]
          z-30
          bg-white/80 dark:bg-zinc-950/80
          backdrop-blur-md
          py-2.5
          my-3
          transition-all
          duration-300
          border-b
          border-zinc-200/60
          dark:border-zinc-800/80
        "
      >
        <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide px-0.5 py-0.5">
          {/* Main Filters Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className={`
              whitespace-nowrap
              px-3.5
              py-2
              rounded-full
              text-xs
              font-bold
              flex
              items-center
              gap-1.5
              transition-all
              duration-200
              cursor-pointer
              shrink-0
              shadow-sm
              ${
                activeFilterCount > 0
                  ? "bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/30 font-extrabold"
                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
              }
            `}
          >
            <svg
              className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </span>
            <svg
              className="w-3 h-3 ml-0.5 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Veg Quick Toggle Pill */}
          <button
            onClick={() => handleDietaryToggle("Veg")}
            className={`
              whitespace-nowrap
              px-3
              py-2
              rounded-full
              text-xs
              font-bold
              flex
              items-center
              gap-1.5
              transition-all
              duration-200
              cursor-pointer
              shrink-0
              shadow-sm
              ${
                selectedDietary === "Veg"
                  ? "bg-emerald-950/80 dark:bg-[#0e2717] border border-emerald-600 text-emerald-400 ring-1 ring-emerald-500/40"
                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-emerald-500/50"
              }
            `}
          >
            <span className="w-3.5 h-3.5 border border-emerald-600 dark:border-emerald-500 rounded-sm flex items-center justify-center shrink-0 p-0.5 bg-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
            </span>
            <span>Veg</span>
            {selectedDietary === "Veg" && (
              <span className="ml-0.5 text-xs text-emerald-400 hover:text-white font-black">
                ✕
              </span>
            )}
          </button>

          {/* Egg Quick Toggle Pill */}
          <button
            onClick={() => handleDietaryToggle("Egg")}
            className={`
              whitespace-nowrap
              px-3
              py-2
              rounded-full
              text-xs
              font-bold
              flex
              items-center
              gap-1.5
              transition-all
              duration-200
              cursor-pointer
              shrink-0
              shadow-sm
              ${
                selectedDietary === "Egg"
                  ? "bg-amber-950/80 dark:bg-[#28200d] border border-amber-500 text-amber-300 ring-1 ring-amber-500/40"
                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-amber-500/50"
              }
            `}
          >
            <span className="w-3.5 h-3.5 border border-amber-500 dark:border-amber-400 rounded-sm flex items-center justify-center shrink-0 p-0.5 bg-white/10">
              <svg
                className="w-2.5 h-2.5 fill-amber-500 dark:fill-amber-400 shrink-0"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C8.5 2 5 8 5 14c0 4.4 3.1 7 7 7s7-2.6 7-7c0-6-3.5-12-7-12z" />
              </svg>
            </span>
            <span>Egg</span>
            {selectedDietary === "Egg" && (
              <span className="ml-0.5 text-xs text-amber-300 hover:text-white font-black">
                ✕
              </span>
            )}
          </button>

          {/* Non-veg Quick Toggle Pill */}
          <button
            onClick={() => handleDietaryToggle("Non-veg")}
            className={`
              whitespace-nowrap
              px-3
              py-2
              rounded-full
              text-xs
              font-bold
              flex
              items-center
              gap-1.5
              transition-all
              duration-200
              cursor-pointer
              shrink-0
              shadow-sm
              ${
                selectedDietary === "Non-veg"
                  ? "bg-rose-950/80 dark:bg-[#2a1215] border border-rose-600 text-rose-400 ring-1 ring-rose-500/40"
                  : "bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:border-rose-500/50"
              }
            `}
          >
            <span className="w-3.5 h-3.5 border border-rose-600 dark:border-rose-500 rounded-sm flex items-center justify-center shrink-0 p-0.5 bg-white/10">
              <svg
                className="w-2.5 h-2.5 fill-rose-600 dark:fill-rose-500 shrink-0"
                viewBox="0 0 100 100"
              >
                <polygon points="50,15 88,82 12,82" />
              </svg>
            </span>
            <span>Non-veg</span>
            {selectedDietary === "Non-veg" && (
              <span className="ml-0.5 text-xs text-rose-400 hover:text-white font-black">
                ✕
              </span>
            )}
          </button>

          {/* Reset button if filters active */}
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="whitespace-nowrap px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shrink-0 underline decoration-zinc-300 dark:decoration-zinc-700 underline-offset-2"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Filter Modal Sheet */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content Box */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.96 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="
                relative
                w-full
                max-w-lg
                bg-white
                dark:bg-zinc-900
                rounded-t-3xl
                sm:rounded-3xl
                p-6
                shadow-2xl
                border
                border-zinc-200/80
                dark:border-zinc-800
                max-h-[85vh]
                flex
                flex-col
                z-10
              "
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white tracking-tight">
                    Filter Options
                  </h3>
                  {activeFilterCount > 0 && (
                    <span className="text-[11px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                      {activeFilterCount} Active
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
                {/* 1. Dietary Choice */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 block">
                    Dietary Preference
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "All", label: "All Items", icon: "🍽️" },
                      { id: "Veg", label: "Veg Only", icon: "🟢" },
                      { id: "Egg", label: "Egg Contains", icon: "🥚" },
                      { id: "Non-veg", label: "Non-Veg", icon: "🔺" }
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setSelectedDietary(opt.id)}
                        className={`
                          px-3
                          py-2.5
                          rounded-2xl
                          text-xs
                          font-bold
                          flex
                          items-center
                          justify-center
                          gap-2
                          border
                          transition-all
                          cursor-pointer
                          ${
                            selectedDietary === opt.id
                              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700"
                          }
                        `}
                      >
                        <span className="text-sm">{opt.icon}</span>
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Category Selection */}
                {categories.length > 0 && (
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 block">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory("All")}
                        className={`
                          px-3.5
                          py-2
                          rounded-xl
                          text-xs
                          font-bold
                          border
                          transition-all
                          cursor-pointer
                          ${
                            selectedCategory === "All"
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm"
                              : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                          }
                        `}
                      >
                        All Categories
                      </button>
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`
                              px-3.5
                              py-2
                              rounded-xl
                              text-xs
                              font-bold
                              border
                              transition-all
                              cursor-pointer
                              ${
                                selectedCategory === cat
                                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-sm"
                                  : "bg-zinc-50 dark:bg-zinc-800/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300"
                              }
                            `}
                          >
                            {cat}
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                {/* 3. Sort By Options */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 block">
                    Sort Items By
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: "default", label: "Relevancy (Default)" },
                      { id: "price_low", label: "Price: Low to High" },
                      { id: "price_high", label: "Price: High to Low" },
                      { id: "name_asc", label: "Name: A to Z" }
                    ].map((sortOpt) => (
                      <button
                        key={sortOpt.id}
                        onClick={() => setSortBy(sortOpt.id)}
                        className={`
                          w-full
                          px-4
                          py-3
                          rounded-2xl
                          text-xs
                          font-bold
                          flex
                          items-center
                          justify-between
                          border
                          transition-all
                          cursor-pointer
                          ${
                            sortBy === sortOpt.id
                              ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              : "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/70 dark:border-zinc-800/70 text-zinc-700 dark:text-zinc-300"
                          }
                        `}
                      >
                        <span>{sortOpt.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            sortBy === sortOpt.id
                              ? "border-emerald-500 bg-emerald-500"
                              : "border-zinc-300 dark:border-zinc-700"
                          }`}
                        >
                          {sortBy === sortOpt.id && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-3.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="
                    flex-1
                    bg-[#1ea753]
                    hover:bg-emerald-600
                    text-white
                    font-extrabold
                    text-sm
                    py-3.5
                    rounded-2xl
                    shadow-lg
                    shadow-emerald-500/25
                    transition-all
                    cursor-pointer
                    text-center
                  "
                >
                  Apply Filters ({filteredCount} {filteredCount === 1 ? "item" : "items"})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
