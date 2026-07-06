export default function DietaryFilter({
  dietaryFilter,
  setDietaryFilter
}) {

  const filters = [
    "All",
    "Veg",
    "Non Veg",
    "Egg",
    "Vegan"
  ];

  return (
    <div
      className="
        flex
        gap-3
        overflow-x-auto
        scrollbar-hide
        mt-5
        pb-2
      "
    >

      {filters.map(filter => (

        <button
          key={filter}
          onClick={() => setDietaryFilter(filter)}
          className={`
            whitespace-nowrap
            px-5
            py-3
            rounded-2xl
            font-semibold
            transition-all
            duration-300

            ${
              dietaryFilter === filter
                ? "bg-orange-500 text-white shadow-lg"
                : "bg-white text-gray-700"
            }
          `}
        >
          {
            filter === "Veg"
              ? "🟢 Veg"

            : filter === "Non Veg"
              ? "🔴 Non Veg"

            : filter === "Egg"
              ? "🟡 Egg"

            : filter === "Vegan"
              ? "🌱 Vegan"

            : "All"
          }
        </button>

      ))}

    </div>
  );
}