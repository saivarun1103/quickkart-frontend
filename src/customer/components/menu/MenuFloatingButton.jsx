import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function MenuFloatingButton({
  categories = [],
  groupedItems = {},
  activeCategory,
  onSelectCategory
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!categories || categories.length <= 1) return null;

  const validCategories = categories.filter((c) => c !== "All");

  const handleCategoryClick = (category) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Menu Button */}
      <div className="fixed bottom-6 right-5 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="
            flex
            items-center
            gap-2
            bg-zinc-900/90
            dark:bg-zinc-100/90
            text-white
            dark:text-zinc-900
            px-4
            py-3
            rounded-full
            shadow-xl
            shadow-black/20
            backdrop-blur-md
            border
            border-zinc-700/50
            dark:border-zinc-300/50
            text-xs
            font-extrabold
            tracking-wider
            uppercase
            hover:scale-105
            active:scale-95
            transition-all
            cursor-pointer
          "
        >
          <span className="text-sm">🍴</span>
          <span>MENU</span>
        </button>
      </div>

      {/* Category List Drawer / Popover */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-end justify-end p-4 pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto"
            />

            {/* Menu Popover Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="
                relative
                pointer-events-auto
                w-72
                max-h-[70vh]
                bg-white/95
                dark:bg-zinc-900/95
                backdrop-blur-xl
                rounded-3xl
                p-4
                shadow-2xl
                border
                border-zinc-200/80
                dark:border-zinc-800
                flex
                flex-col
                mb-16
                mr-1
                z-10
              "
            >
              <div className="flex items-center justify-between pb-3 px-1 border-b border-zinc-150 dark:border-zinc-800">
                <span className="text-xs font-black tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                  Categories
                </span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:text-zinc-700 dark:hover:text-white flex items-center justify-center text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto py-2 space-y-1 flex-1 pr-1">
                {validCategories.map((cat) => {
                  const itemCount = groupedItems[cat] ? groupedItems[cat].length : 0;
                  const isActive = activeCategory === cat;

                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategoryClick(cat)}
                      className={`
                        w-full
                        px-3.5
                        py-2.5
                        rounded-2xl
                        text-xs
                        font-extrabold
                        flex
                        items-center
                        justify-between
                        transition-all
                        cursor-pointer
                        ${
                          isActive
                            ? "bg-[#1ea753] text-white shadow-md shadow-[#1ea753]/25"
                            : "text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/80"
                        }
                      `}
                    >
                      <span className="truncate max-w-[170px]">{cat}</span>
                      <span
                        className={`
                          text-[10px]
                          px-2
                          py-0.5
                          rounded-full
                          font-black
                          ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500"
                          }
                        `}
                      >
                        {itemCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
