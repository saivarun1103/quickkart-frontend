import { motion } from "framer-motion";

export default function FloatingCart({ cart, checkout }) {

  const totalItems = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  if (cart.length === 0) return null;

  return (
    <motion.div
      className="
        fixed
        bottom-5
        left-1/2
        -translate-x-1/2
        w-[95%]
        max-w-2xl
        z-50
      "
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 120
      }}
    >

      <button
        onClick={checkout}
        className="
          w-full
          bg-black
          text-white
          rounded-3xl
          px-6
          py-5
          shadow-2xl
          flex
          items-center
          justify-between
          backdrop-blur-xl
          border
          border-white/10
          transition-all
          duration-300
          hover:scale-[1.02]
        "
      >

        {/* LEFT */}
        <div className="flex items-center gap-4">

          <div
            className="
              w-12
              h-12
              rounded-2xl
              bg-green-500
              flex
              items-center
              justify-center
              text-2xl
            "
          >
            🛒
          </div>

          <div className="text-left">

            <p
              className="
                text-lg
                font-bold
              "
            >
              {totalItems} Items
            </p>

            <p
              className="
                text-sm
                text-white/70
              "
            >
              Ready for checkout
            </p>

          </div>

        </div>

        {/* RIGHT */}
        <div className="text-right">

          <p
            className="
              text-2xl
              font-black
            "
          >
            ₹{totalPrice}
          </p>

          <p
            className="
              text-sm
              text-green-400
              font-medium
            "
          >
            View Cart →
          </p>

        </div>

      </button>

    </motion.div>
  );
}