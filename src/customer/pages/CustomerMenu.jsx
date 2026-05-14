import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import FoodCard from "../components/menu/FoodCard";
import BusinessHeader from "../components/layout/BusinessHeader";
import FloatingCart from "../components/cart/FloatingCart";
import CartDrawer from "../components/cart/CartDrawer";
import { motion } from "framer-motion";
import CategoryTabs from "../components/menu/CategoryTabs";
// import DietaryFilter from "../components/menu/DietaryFilter";
import ThemeToggle from "../components/ui/ThemeToggle";
import { API_BASE } from "../../config";

export default function CustomerMenu(){
  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const { businessSlug, sessionToken } =
  useParams();
  const [business, setBusiness] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = 
  useState("All");
  const [slug, setSlug] =
  useState("");
  const categories = [
    "All",
    ...new Set(
        items.map(item => item.category)
    )
  ];
  const [showNamePopup, setShowNamePopup] =
    useState(false)

  const [customerName, setCustomerName] =
    useState("")
  
  const [businessPhone, setBusinessPhone] =
    useState("")

  const [sessionExpired, setSessionExpired] =
    useState(false)
//   const [dietaryFilter, setDietaryFilter] =
//     useState("All");
  const filteredItems = items.filter((item) => {

    const matchesCategory =
        activeCategory === "All"
        ? true
        : item.category === activeCategory;

    // const matchesDietary =
    //     dietaryFilter === "All"
    //     ? true
    //     : item.dietary_type === dietaryFilter;

    return matchesCategory /*&& matchesDietary*/;
  });


  useEffect(() => {

      if (!sessionToken) return;

      fetch(`${API_BASE}/api/session/${sessionToken}`)

      .then(async (res) => {

          console.log("SESSION STATUS:", res.status)

          if (!res.ok) {

              const text = await res.text()

              console.log("SESSION ERROR:", text)

              setSessionExpired(true)

              return null
          }

          return res.json()
      })

      .then((data) => {

          console.log("SESSION DATA:", data)

          if (!data) return

          setSlug(data.business_slug)

          setBusinessPhone(data.business_phone)
      })

      .catch((err) => {

          console.error("SESSION FETCH ERROR:", err)

          setSessionExpired(true)
      })

  }, [sessionToken]);
    
  

  // Fetch menu from backend
  useEffect(() => {

      if (!slug) return;

      fetch(`${API_BASE}/api/menu/${slug}`)

      .then(res => res.json())

      .then(data => {

          setBusiness(data.business);

          setItems(data.items);
      });

  }, [slug]);

  // Add item to cart
  function addToCart(item) {
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      setCart(cart.map(i =>
        i.id === item.id ? { ...i, qty: i.qty + 1 } : i
      ));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
  }

  // Increase quantity
  function increaseQty(id) {
    setCart(cart.map(i =>
      i.id === id ? { ...i, qty: i.qty + 1 } : i
    ));
  }

  // Decrease quantity
  function decreaseQty(id) {
    const updated = cart
      .map(i =>
        i.id === id ? { ...i, qty: i.qty - 1 } : i
      )
      .filter(i => i.qty > 0);

    setCart(updated);
  }

  //checkout
  async function checkout() {

    if (cart.length === 0) {

      alert("Cart is empty");

      return;
    }

    try {

      // -------------------------
      // PREPARE ITEMS
      // -------------------------

      const items = {};

      cart.forEach(item => {

        items[item.name] = item.qty;
      });

      // -------------------------
      // CALCULATE TOTAL
      // -------------------------

      const total = cart.reduce(

        (sum, item) =>

          sum + item.price * item.qty,

        0
      );

      // -------------------------
      // CREATE RAZORPAY ORDER
      // -------------------------

      const response = await fetch(

        `${API_BASE}/api/create-razorpay-order`, // change here

        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            session_token:
              sessionToken,

            items,

            total,

            business_id:
              business.id,

            customer_name:
              customerName
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        setSessionExpired(true);

        return;
      }

      // -------------------------
      // OPEN RAZORPAY
      // -------------------------

      const options = {

        key: data.key,

        amount: data.amount,

        currency: "INR",

        name: business.name,

        description:
          "Order Payment",

        order_id:
          data.razorpay_order_id,

        handler: async function (
          response
        ) {

          // -------------------------
          // VERIFY PAYMENT
          // -------------------------

          const verifyRes = await fetch(

            `${API_BASE}/api/verify-payment`, // change here to

            {

              method: "POST",

              headers: {

                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({

                order_id:
                  data.order_id,

                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature
              })
            }
          );

          const verifyData =
            await verifyRes.json();

          // -------------------------
          // SUCCESS REDIRECT
          // -------------------------

          if (verifyData.success) {

            window.location.href =

              `/order-success?${sessionToken}:::${data.order_id}`;

          } else {

            alert("Payment verification failed");
          }
        },

        theme: {

          color: "#f97316"
        }
      };

      const razorpay =

        new window.Razorpay(options);

      razorpay.open();

    } catch (err) {

      console.error(err);

      alert("Checkout failed");
    }
  }

  const handleCheckoutClick = async () => {

    try {

      const response = await fetch(

        `${API_BASE}/api/check-customer/${sessionToken}`

      )

      const data = await response.json()

      if (data.has_name) {

        checkout()

      } else {

        setShowNamePopup(true)
      }

    } catch (error) {

      console.error(error)

      alert("Something went wrong")
    }
  }

  const saveNameAndCheckout = async () => {

    if (!customerName.trim()) {

      alert("Please enter your name")

      return
    }

    try {

      await fetch(

        `${API_BASE}/api/save-customer-name`,

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            session_token: sessionToken,

            customer_name: customerName
          })
        }
      )

      setShowNamePopup(false)

      checkout()

    } catch (error) {

      console.error(error)

      alert("Failed to save name")
    }
  }

  if (sessionExpired) {

      return (

          <div className="
              min-h-screen

              bg-black

              flex
              items-center
              justify-center

              p-6
          ">

              <div className="
                  bg-zinc-900

                  border
                  border-zinc-800

                  rounded-3xl

                  p-8

                  max-w-md
                  w-full

                  text-center

                  text-white
              ">

                  <h1 className="
                      text-3xl
                      font-bold

                      mb-4
                  ">
                      Session Expired
                  </h1>

                  <p className="
                      text-zinc-400
                      leading-relaxed
                  ">
                      Your menu session has expired.

                      <br /><br />

                      Please send

                      <span className="
                          text-white
                          font-semibold
                      ">
                          {" "}HI{" "}
                      </span>

                      on WhatsApp to receive a new menu link.
                  </p>

                  <button

                    onClick={() => {

                        const phone = businessPhone

                        const encoded =
                            encodeURIComponent("hi")

                        window.location.href =
                            `https://wa.me/${phone}?text=${encoded}`
                    }}

                    className="
                        mt-8

                        w-full

                        bg-green-600
                        hover:bg-green-500

                        transition

                        text-white

                        font-semibold

                        py-4

                        rounded-2xl

                        cursor-pointer
                    "
                >
                    Open WhatsApp
                </button>

              </div>

          </div>
      )
  }
 
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-black">
        <ThemeToggle  />
        <div className="max-w-7xl mx-auto p-5 pb-40">   
            <BusinessHeader business={business} />
            <CategoryTabs
                categories={categories}
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
            />

            {/* <DietaryFilter
                dietaryFilter={dietaryFilter}
                setDietaryFilter={setDietaryFilter}
            /> */}

            {/* <div className="mt-6">
                <input
                    type="text"
                    placeholder="Search delicious food..."
                    className="
                    w-full
                    bg-white dark:bg-zinc-900
                    rounded-3xl
                    px-6
                    py-5
                    text-lg
                    dark:text-white
                    shadow-sm
                    border
                    border-gray-100
                    dark:border-zinc-800
                    outline-none
                    focus:ring-2
                    focus:ring-orange-400
                    "
                />
            </div> */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.7,
                    ease: "easeOut"
                }}
                className="
                    grid
                    grid-cols-1
                    sm:grid-cols-2
                    lg:grid-cols-3
                    gap-6
                    mt-8
                "
            >
                <FloatingCart
                    cart={cart}
                    checkout={() => setIsCartOpen(true)}
                />
                <CartDrawer
                    isOpen={isCartOpen}
                    cart={cart}
                    increaseQty={increaseQty}
                    decreaseQty={decreaseQty}
                    checkout={handleCheckoutClick}
                    onClose={() => setIsCartOpen(false)}
                    showNamePopup={showNamePopup}
                    customerName={customerName}
                    setCustomerName={setCustomerName}
                    saveNameAndCheckout={saveNameAndCheckout}
                    closeNamePopup={() =>
                      setShowNamePopup(false)
                    }
                />
                {[...filteredItems]

                .sort((a, b) => {

                    if (a.available === b.available)
                        return 0;

                    return a.available ? -1 : 1;
                })

                .map((item, index) => {

                    const cartItem = cart.find(
                    i => i.id === item.id
                    );

                    return (
                    <FoodCard
                        key={item.id}
                        item={item}
                        cartItem={cartItem}
                        addToCart={addToCart}
                        increaseQty={increaseQty}
                        decreaseQty={decreaseQty}
                        index={index}
                    />
                    );
                })}
            </motion.div>
        </div>
    </div>
  );
    // return (
    //     <div className="text-5xl text-red-500">
    //         CUSTOMER MENU WORKING
    //     </div>
    // )
} 