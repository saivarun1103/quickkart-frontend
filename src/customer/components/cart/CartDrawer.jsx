export default function CartDrawer({
  isOpen,
  cart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  checkout,

  isCheckoutLoading,

  onClose,

  showPhonePopup,
  phoneNumber,
  setPhoneNumber,

  continueWithPhone,
  setShowPhonePopup,

  showNamePopup,
  customerName,
  setCustomerName,
  saveNameAndCheckout,
  closeNamePopup
}) {

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`
          fixed
          inset-0
          bg-black/50
          backdrop-blur-sm
          z-40
          transition-all
          duration-500
          ease-out

          ${isOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible"
          }
        `}
      />

      {/* DRAWER */}
      <div
        className={`
          fixed
          bottom-0
          left-0
          right-0
          bg-white
          rounded-t-[32px]
          z-50
          transition-all
          duration-300
          max-h-[85vh]
          overflow-y-auto
          shadow-2xl

          ${isOpen
            ? "translate-y-0"
            : "translate-y-full"
          }
        `}
      >

        {/* HANDLE */}
        <div className="flex justify-center pt-4">
          <div
            className="
              w-14
              h-1.5
              rounded-full
              bg-gray-300
            "
          />
        </div>

        {/* CONTENT */}
        <div className="p-6">

          {/* HEADER */}
          <div
            className="
              flex
              justify-between
              items-center
              mb-6
            "
          >

            <h2
              className="
                text-3xl
                font-black
                text-gray-900
              "
            >
              Your Cart
            </h2>

            <button
              onClick={onClose}
              className="
                w-10
                h-10
                rounded-full
                bg-gray-100
                text-xl
              "
            >
              ✕
            </button>

          </div>

          {/* CART ITEMS */}
          <div className="space-y-4">

            {cart.map(item => (

              <div
                key={item.id}
                className="
                  flex
                  justify-between
                  items-center
                  bg-gray-50
                  rounded-2xl
                  p-4
                "
              >

                {/* LEFT */}
                <div>

                  <h3
                    className="
                      font-bold
                      text-gray-900
                    "
                  >
                    {item.name}
                  </h3>

                  <p
                    className="
                      text-sm
                      text-gray-500
                      mt-1
                    "
                  >
                    ₹{item.price} each
                  </p>

                  {
                    item.unavailable && (

                      <div
                        className="
                          mt-2
                          inline-flex
                          items-center

                          rounded-full

                          bg-red-100
                          text-red-600

                          px-3
                          py-1

                          text-xs
                          font-semibold
                        "
                      >
                        Out of stock
                      </div>
                    )
                  }

                </div>

                {/* RIGHT */}
                <div
                  className="
                    flex
                    flex-col
                    items-end
                    gap-2
                  "
                >

                  {/* QTY CONTROLS */}
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >

                    <button
                      onClick={() =>
                        decreaseQty(item.id)
                      }

                      disabled={item.unavailable}

                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-white
                        shadow-sm
                        font-bold

                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      -
                    </button>

                    <span
                      className="
                        text-lg
                        font-bold
                        w-6
                        text-center
                      "
                    >
                      {item.qty}
                    </span>

                    <button
                      onClick={() =>
                        increaseQty(item.id)
                      }

                      disabled={item.unavailable}

                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-[#52c472]
                        text-white
                        font-bold

                        disabled:opacity-50
                        disabled:cursor-not-allowed
                      "
                    >
                      +
                    </button>

                  </div>

                  {/* REMOVE BUTTON */}
                  {
                    item.unavailable && (

                      <button
                        onClick={() =>
                          removeFromCart(item.id)
                        }

                        className="
                          bg-red-500
                          hover:bg-red-600

                          text-white
                          font-semibold
                          text-sm

                          px-4
                          py-2

                          rounded-xl

                          transition
                          duration-200

                          shadow-sm
                        "
                      >
                        Remove
                      </button>
                    )
                  }

                </div>

              </div>

            ))}

          </div>

          {/* TOTAL */}
          <div
            className="
              mt-8
              border-t
              pt-6
            "
          >

            <div
              className="
                flex
                justify-between
                items-center
                mb-6
              "
            >

              <span
                className="
                  text-xl
                  font-bold
                "
              >
                Total
              </span>

              <span
                className="
                  text-3xl
                  font-black
                  text-[#52c472]
                "
              >
                ₹{total}
              </span>

            </div>

            {/* CHECKOUT BUTTON */}
            <button
              onClick={checkout}

              disabled={
                isCheckoutLoading
              }

              className="
                w-full

                bg-black
                text-white

                py-5

                rounded-2xl

                font-semibold

                transition

                disabled:opacity-70
                disabled:cursor-not-allowed

                flex
                items-center
                justify-center
                gap-3
              "
            >

              {
                isCheckoutLoading ? (
                  <>

                    <div
                      className="
                        w-5
                        h-5

                        border-2
                        border-white/30
                        border-t-white

                        rounded-full

                        animate-spin
                      "
                    />

                    Processing...
                  </>
                ) : (

                  <>
                    Continue to Checkout →
                  </>
                )
              }

            </button>

          </div>

        </div>

      </div>
      
      {/* PHONE POPUP */}
      {
        showPhonePopup && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              z-[100]
              flex
              items-center
              justify-center
              p-6
            "
          >

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                w-full
                max-w-md
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  mb-2
                "
              >
                Enter Phone Number
              </h2>

              <p
                className="
                  text-gray-500
                  mb-5
                "
              >
                Please enter your WhatsApp number to get your order status.
              </p>

              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/\D/g, "") // numbers only
                    .slice(0, 10) // max 10 digits
                  setPhoneNumber(value)
                }}
                maxLength={10}
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                placeholder="Enter Phone number"
                className="
                  w-full
                  border
                  rounded-2xl
                  p-4
                  outline-none
                "
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={() => {

                    setPhoneNumber("")

                    setShowPhonePopup(false)
                  }}
                  className="
                    flex-1
                    py-4
                    rounded-2xl
                    bg-gray-100
                    font-bold
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={continueWithPhone}
                  className="
                    flex-1
                    py-4
                    rounded-2xl
                    bg-black
                    text-white
                    font-bold
                  "
                >
                  Continue
                </button>

              </div>

            </div>

          </div>
        )
      }

      {/* NAME POPUP */}
      {
        showNamePopup && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              z-[100]
              flex
              items-center
              justify-center
              p-6
            "
          >

            <div
              className="
                bg-white
                rounded-3xl
                p-6
                w-full
                max-w-md
              "
            >

              <h2
                className="
                  text-2xl
                  font-black
                  mb-2
                "
              >
                Enter Your Name
              </h2>

              <p
                className="
                  text-gray-500
                  mb-5
                "
              >
                We’ll use this for your order.
              </p>

              <input
                type="text"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                placeholder="Your name"
                className="
                  w-full
                  border
                  rounded-2xl
                  p-4
                  outline-none
                "
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={closeNamePopup}
                  className="
                    flex-1
                    py-4
                    rounded-2xl
                    bg-gray-100
                    font-bold
                  "
                >
                  Cancel
                </button>

                <button
                  onClick={saveNameAndCheckout}
                  className="
                    flex-1
                    py-4
                    rounded-2xl
                    bg-black
                    text-white
                    font-bold
                  "
                >
                  Continue
                </button>

              </div>

            </div>

          </div>
        )
      }
    </>
  );
}