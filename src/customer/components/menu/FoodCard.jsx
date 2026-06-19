// import { motion } from "framer-motion";

export default function FoodCard({
  item,
  cartItem,
  addToCart,
  increaseQty,
  decreaseQty,
  businessClosed,
  index
}) {
  return (
    <div
      className="
        bg-[#ffffff]
        rounded-3xl
        overflow-hidden
        shadow-sm
        border
        border-gray-100
        transition-all
        duration-300
        hover:shadow-xl
        hover:-translate-y-1
        flex
        flex-col
        h-full
        dark:bg-zinc-900
        dark:border-zinc-800
      "
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: "easeOut"
      }}
      whileHover={{
        y: -6
      }}
    >

      {/* FOOD IMAGE */}
      <div className="relative">
        <img
          src={item.image}
          alt={item.name}
          className="
            w-full
            h-56
            object-cover
            

          "
        />
        

        {/* OUT OF STOCK OVERLAY */}
        {!item.available && (
          <div
            className="
              absolute
              inset-0
              bg-black/60
              flex
              items-center
              justify-center
            "
          >
            <span
              className="
                bg-white
                text-black
                px-4
                py-2
                rounded-full
                text-sm
                font-semibold
              "
            >
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        className="
            p-4
            flex
            flex-col
            flex-1
        "
      >

        {/* TITLE + PRICE */}
        <div
          className="
            flex
            justify-between
            items-start
            gap-3
          "
        >
          <div>
            <h3
              className="
                text-lg
                font-bold
                text-gray-900 dark:text-white
              "
            >
              {item.name}
            </h3>


            <p
                className="
                    text-sm
                    text-gray-500 dark:text-zinc-400
                    mt-2
                    leading-relaxed
                    line-clamp-2
                "
                >
                {item.description}
            </p>
          </div>

          <span
            className="
              text-lg
              font-bold
              text-[#26b34d] dark:text-[#26b34d]
              whitespace-nowrap
            "
          >
            ₹{item.price}
          </span>
        </div>

        {/* BUTTON SECTION */}
        <div className="mt-auto pt-5">

          {
            !item.available ? (

              <button
                disabled
                className="
                  w-full
                  py-3
                  rounded-2xl
                  bg-gray-300
                  text-gray-600
                  font-semibold
                  cursor-not-allowed
                "
              >
                Currently Unavailable
              </button>

            ) : businessClosed ? (

              <div
                className="
                  w-full
                  py-3

                  rounded-2xl

                  bg-zinc-800
                  text-zinc-400

                  font-semibold
                  text-center

                  cursor-not-allowed
                "
              >
                Business Closed
              </div>

            ) : cartItem ? (

              <div
                className="
                  flex
                  items-center
                  justify-between
                  bg-green-200/70 dark:bg-green-200/50
                  rounded-2xl
                  p-2
                "
              >

                <button
                  onClick={() =>
                    decreaseQty(item.id)
                  }

                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-white
                    text-lg
                    font-bold
                    shadow-sm
                    transition-all
                    duration-200
                    hover:scale-110
                    active:scale-95
                  "
                >
                  -
                </button>

                <span
                  className="
                    text-lg
                    font-semibold
                  "
                >
                  {cartItem.qty}
                </span>

                <button
                  onClick={() =>
                    increaseQty(item.id)
                  }

                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#52c472]
                    text-white
                    text-lg
                    font-bold
                    transition-all
                    duration-200
                    hover:scale-110
                    active:scale-95
                  "
                >
                  +
                </button>

              </div>

            ) : (

              <button
                onClick={() =>
                  addToCart(item)
                }

                className="
                  w-full
                  py-3
                  rounded-2xl
                  bg-[#52c472]
                  text-white
                  font-semibold
                  transition-all
                  duration-300
                  hover:bg-[#41a35a]
                  hover:scale-[1.02]
                  active:scale-[0.98]
                "
              >
                Add to Cart
              </button>
            )
          }

        </div>

      </div>
    </div>
  );
}