import { motion } from "framer-motion";

export default function BusinessHeader({ business }) {

  return (
    <motion.div
      className="
        relative
        overflow-hidden
        rounded-[32px]
        bg-black
        min-h-[320px]
        shadow-xl
      "
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
        transition={{
            duration: 0.7,
            ease: "easeOut"
        }}
    >

      {/* BACKGROUND IMAGE */}
      <img
        src={
          business?.banner_url ||
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836"
        }
        alt="Restaurant Banner"
        className="
          absolute
          inset-0
          w-full
          h-full
          object-cover
          opacity-60
        "
      />

      {/* DARK OVERLAY */}
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-t
          from-black
          via-black/40
          to-transparent
        "
      />

      {/* CONTENT */}
      <div
        className="
          relative
          z-10
          flex
          flex-col
          justify-end
          h-full
          p-6
          min-h-[320px]
        "
      >

        {/* LOGO */}
        <div
          className="
            w-24
            h-24
            rounded-3xl
            overflow-hidden
            border-4
            border-white/20
            shadow-xl
            backdrop-blur-md
            mb-5
          "
        >

          {business?.logo_url ? (

            <img
              src={business.logo_url}
              alt={business.name}
              className="
                w-full
                h-full
                object-cover
              "
            />

          ) : (

            <div
              className="
                w-full
                h-full
                bg-white/10
                flex
                items-center
                justify-center
                text-3xl
                font-bold
                text-white
              "
            >
              🍽️
            </div>

          )}

        </div>

        {/* BUSINESS NAME */}
        <h1
          className="
            text-4xl
            font-black
            text-white
            tracking-tight
          "
        >
          {business?.name}
        </h1>

        {/* SUBTITLE */}
        <p
          className="
            text-white/80
            mt-2
            text-sm
            font-medium
          "
        >
          Fresh • Fast • Delicious
        </p>

        {/* INFO BADGES */}
        <div
          className="
            flex
            gap-3
            mt-5
            flex-wrap
          "
        >

          <div
            className="
              px-4
              py-2
              rounded-full
              bg-white/10
              backdrop-blur-md
              text-white
              text-sm
              font-medium
              border
              border-white/10
            "
          >
            ⭐ 4.8 Rating
          </div>

          <div
            className="
              px-4
              py-2
              rounded-full
              bg-white/10
              backdrop-blur-md
              text-white
              text-sm
              font-medium
              border
              border-white/10
            "
          >
            ⚡ 20-30 mins
          </div>

        </div>

      </div>

    </motion.div>
  );
}