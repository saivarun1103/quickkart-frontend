import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodCard from "../components/menu/FoodCard";
import BusinessHeader from "../components/layout/BusinessHeader";
import FloatingCart from "../components/cart/FloatingCart";
import CartDrawer from "../components/cart/CartDrawer";
import { motion } from "framer-motion";
import CategoryTabs from "../components/menu/CategoryTabs";
// import DietaryFilter from "../components/menu/DietaryFilter";
import ThemeToggle from "../components/ui/ThemeToggle";
import { API_BASE } from "../../config";
import logoImg from "../../assets/logo.png";
import skipImgLight from "../../assets/queue_skip_transparent_black.png";
import skipImgDark from "../../assets/queue_skip_transparent_white.png";

export default function CustomerMenu(){
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const handleThemeChange = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    window.addEventListener("theme-changed", handleThemeChange);
    handleThemeChange();
    return () => window.removeEventListener("theme-changed", handleThemeChange);
  }, []);

  const skipImg = isDarkMode ? skipImgDark : skipImgLight;

  const [items, setItems] = useState([]);
  const [cart, setCart] = useState([]);
  const { businessSlug, sessionToken } =
  useParams();
  const [business, setBusiness] = useState(null);
  const [
    businessStatus,
    setBusinessStatus
  ] = useState("open");
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

  const [showPhonePopup,
    setShowPhonePopup] =
    useState(false)

  const [phoneNumber,
    setPhoneNumber] =
    useState("")

  const [existingCustomer,
    setExistingCustomer] =
    useState(false)

  const [customerName, setCustomerName] =
    useState("")
  
  const [businessPhone, setBusinessPhone] =
    useState("")

  const [sessionPhone, setSessionPhone] =
    useState("")

  const [sessionExpired, setSessionExpired] =
    useState(false)

  const [checkoutError, setCheckoutError] =
    useState(null)

  const [
    isCheckoutLoading,
    setIsCheckoutLoading
  ] = useState(false);

  const isBusinessOpen =
    businessStatus === "open";

  const isMaintenance =
    businessStatus ===
    "maintenance";
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

      // -------------------------
      // SESSION MENU
      // -------------------------

      if (sessionToken) {

          fetch(
            `${API_BASE}/api/session/${sessionToken}`
          )

          .then(async (res) => {

              console.log(
                "SESSION STATUS:",
                res.status
              )

              if (!res.ok) {

                  const text =
                    await res.text()

                  console.log(
                    "SESSION ERROR:",
                    text
                  )

                  setSessionExpired(true)

                  return null
              }

              return res.json()
          })

          .then((data) => {

              if (!data) return

              setSlug(
                data.business_slug
              )

              setBusinessPhone(
                data.business_phone
              )

              setSessionPhone(
                data.customer_phone
              )
          })

          .catch((err) => {

              console.error(
                "SESSION FETCH ERROR:",
                err
              )

              setSessionExpired(true)
          })
      }

      // -------------------------
      // PUBLIC MENU
      // -------------------------

      else if (businessSlug) {

          setSlug(businessSlug)
      }

  }, [sessionToken, businessSlug])
    
  

  // Fetch menu from backend
  useEffect(() => {

      console.log("SLUG:", slug)

      if (!slug) return;

      console.log(
        "FETCHING MENU:",
        slug
      )

      fetch(
        `${API_BASE}/api/menu/${slug}`
      )

      .then(async res => {

          console.log(
            "MENU STATUS:",
            res.status
          )

          const data =
            await res.json()

          console.log(
            "MENU DATA:",
            data
          )

          return data
      })

      .then(data => {

          setBusiness(
            data.business
          )
          console.log(
            "BUSINESS:",
            data.business
          );

          setBusinessStatus(
            data.business.status
          )

          setItems(
            data.items
          )
      })

      .catch(err => {

          console.error(
            "MENU ERROR:",
            err
          )
      })

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

  function removeFromCart(id) {

    setCart(prev =>
      prev.filter(item =>
        item.id !== id
      )
    );

    setCheckoutError(null);
  }

  //checkout
  async function checkout() {

    if (
      isCheckoutLoading
    ) return;

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

            // SESSION FLOW
            ...(sessionToken && {

              session_token:
                sessionToken
            }),

            // PUBLIC FLOW
            ...(!sessionToken && {

              business_slug:
                businessSlug,

              phone:
                phoneNumber,

              customer_name:
                customerName || null
            }),

            items,

            total,

            business_id:
              business.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        // -------------------------
        // SESSION EXPIRED
        // -------------------------

        if (response.status === 401) {

          setSessionExpired(true);
          return;
        }

        // -------------------------
        // OUT OF STOCK / VALIDATION
        // -------------------------

        if (response.status === 400) {

          const errors =
            data?.detail?.items || [];

          if (errors.length > 0) {

            const unavailableItems =
              data?.detail?.items || [];

            setCart(prev =>
              prev.map(item => {

                const unavailable =
                  unavailableItems.find(
                    i => i.name === item.name
                  );

                return {
                  ...item,

                  unavailable:
                    !!unavailable
                };
              })
            );

            setCheckoutError(
              "Some items are unavailable"
            );

          } else {

            setCheckoutError(
              data?.detail?.message ||
              "Checkout failed"
            );
          }

          return;
        }

        // -------------------------
        // BUSINESS CLOSED
        // -------------------------

        if (response.status === 403) {

          setCheckoutError(
            data?.detail ||
            "Business is closed"
          );
          return;
        }

        alert("Checkout failed");

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

        prefill: {

          contact:
            sessionToken
              ? sessionPhone
              : phoneNumber
        },

        readonly: {

          contact: true
        },

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
            `/order-success?${verifyData.access_token}`;

          } else {

            alert("Payment verification failed");
          }
        },

        theme: {
          color: "#2563eb"
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

  async function validateCart() {

    try {

      const items = {};

      cart.forEach(item => {

        items[item.name] = item.qty;
      });

      const response = await fetch(

        `${API_BASE}/api/create-razorpay-order`,

        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            business_id:
              business.id,

            items,

            validate_only: true
          })
        }
      );

      const data =
        await response.json();

      // STOCK ERROR
      if (
        response.status === 400
      ) {

        const unavailableItems =
          data?.detail?.items || [];

        setCart(prev =>
          prev.map(item => {

            const unavailable =
              unavailableItems.find(
                i => i.name === item.name
              );

            if (unavailable) {

              return {
                ...item,
                unavailable: true
              };
            }

            return item;
          })
        );

        setCheckoutError(
          "Some items are unavailable"
        );

        return false;
      }

      // SESSION EXPIRED
      if (
        response.status === 401
      ) {

        setSessionExpired(true);

        return false;
      }

      return true;

    } catch (error) {

      console.error(error);

      setCheckoutError(
        "Failed to validate cart"
      );

      return false;
    }
  }

  const handleCheckoutClick =
    async () => {

      // prevent multiple clicks
      if (isCheckoutLoading)
        return;

      setIsCheckoutLoading(
        true
      );

      try {

        // -------------------------
        // VALIDATE STOCK FIRST
        // -------------------------

        const valid =
          await validateCart();

        if (!valid) {

          setIsCheckoutLoading(
            false
          );

          return;
        }

        // -------------------------
        // SESSION FLOW
        // -------------------------

        if (sessionToken) {

          try {

            const response =
              await fetch(
                `${API_BASE}/api/check-customer/${sessionToken}`
              );

            const data =
              await response.json();

            if (data.has_name) {

              await checkout();

            } else {

              setShowNamePopup(
                true
              );
            }

          } catch (error) {

            console.error(error);

            alert(
              "Something went wrong"
            );
          }

          setIsCheckoutLoading(
            false
          );

          return;
        }

        // -------------------------
        // PUBLIC FLOW
        // -------------------------

        setShowPhonePopup(
          true
        );

        setIsCheckoutLoading(
          false
        );

      } catch (error) {

        console.error(error);

        setIsCheckoutLoading(
          false
        );
      }
    };

  const continueWithPhone =
    async () => {

      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {

        alert(
          "Enter a valid 10-digit mobile number"
        )

        return
      }

      try {

        const response =
          await fetch(

          `${API_BASE}/api/check-phone`,

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({
              phone: phoneNumber
            })
          }
        )

        const data =
          await response.json()

        // -------------------------
        // EXISTING USER
        // -------------------------

        if (data.exists) {

          setExistingCustomer(true)

          setShowPhonePopup(false)

          checkout()

        }

        // -------------------------
        // NEW USER
        // -------------------------

        else {

          setExistingCustomer(false)

          setShowPhonePopup(false)

          setShowNamePopup(true)
        }

      } catch (error) {

        console.error(error)

        alert(
          "Failed to verify phone"
        )
      }
  }

  const saveNameAndCheckout =
    async () => {

      if (!customerName.trim()) {

        alert(
          "Please enter your name"
        )

        return
      }

      // -------------------------
      // PUBLIC FLOW
      // -------------------------

      if (!sessionToken) {

        setShowNamePopup(false)

        checkout()

        return
      }

      // -------------------------
      // SESSION FLOW
      // -------------------------

      try {

        await fetch(

          `${API_BASE}/api/save-customer-name`,

          {

            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body: JSON.stringify({

              session_token:
                sessionToken,

              customer_name:
                customerName
            })
          }
        )

        setShowNamePopup(false)

        checkout()

      } catch (error) {

        console.error(error)

        alert(
          "Failed to save name"
        )
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

  if (isMaintenance) {
    return (
      <div className="
        min-h-screen
        bg-gray-100
        dark:bg-black
        transition-colors
        duration-500
      ">
        {/* BRAND NAVBAR */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-500/5 dark:border-emerald-500/10 px-5 py-2 transition-all duration-500">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Brand Logo & Name */}
            <div 
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group" 
              onClick={() => {
                navigate("/");
              }}
            >
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-center shadow-sm group-hover:border-emerald-300 transition-all duration-300">
                  <img
                    src={logoImg}
                    alt="GoSkipDQ Logo"
                    className="w-5.5 h-5.5 object-contain" 
                  />
                </div>
                <span className="hidden sm:inline-block text-lg sm:text-xl font-black italic tracking-tighter py-1 leading-normal">
                  <span className="text-emerald-500">Go</span>
                  <span className="text-black dark:text-white">Skip</span>
                  <span className="text-emerald-500">DQ</span>
                </span>
              </div>

              {/* Dynamic collaboration section */}
              {business && (
                <div className="flex items-center gap-1.5 sm:gap-2 ml-0.5 min-w-0">
                  <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-zinc-500 shrink-0">
                    ✕
                  </span>
                  
                  {/* Business Logo (if available) */}
                  {business.logo_url && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-white border border-gray-100 dark:border-zinc-800/80 flex items-center justify-center shadow-sm shrink-0">
                      <img
                        src={business.logo_url}
                        alt={business.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  {/* Business Name */}
                  <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[120px] sm:max-w-[180px] leading-tight">
                    {business.name}
                  </span>
                </div>
              )}
            </div>

            {/* Right Action Items */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                <ThemeToggle />
                <img
                  src={skipImg}
                  alt="GoSkipDQ Illustration"
                  className="h-8 sm:h-9.5 w-auto object-contain"
                />
            </div>

          </div>
        </header>

        <div className="
          max-w-7xl
          mx-auto
          p-5
        ">

          <BusinessHeader
            business={business}
          />

          <div
            className="
              mt-8

              rounded-[2rem]

              border
              border-green-500/20

              bg-green-500/10

              px-8
              py-16

              text-center
            "
          >

            <div className="
              text-6xl
              mb-5
            ">
              🛠️
            </div>

            <h1
              className="
                text-4xl
                font-bold

                text-green-500
              "
            >
              Under Maintenance
            </h1>

            <p
              className="
                text-zinc-500

                mt-4

                text-lg

                max-w-md
                mx-auto
              "
            >
              We're updating our
              menu right now.

              Please check back
              shortly.
            </p>

          </div>

        </div>

      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-[#ededed] dark:bg-black transition-colors duration-500">
      {/* BRAND NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 border-b border-emerald-500/5 dark:border-emerald-500/10 px-5 py-2 transition-all duration-500">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group" 
            onClick={() => {
              navigate("/");
            }}
          >
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-100/60 dark:border-emerald-900/40 flex items-center justify-center shadow-sm group-hover:border-emerald-300 transition-all duration-300">
                <img
                  src={logoImg}
                  alt="GoSkipDQ Logo"
                  className="w-5.5 h-5.5 object-contain" 
                />
              </div>
              <span className="hidden sm:inline-block text-lg sm:text-xl font-black italic tracking-tighter py-1 leading-normal">
                <span className="text-emerald-500">Go</span>
                <span className="text-black dark:text-white">Skip</span>
                <span className="text-emerald-500">DQ</span>
              </span>
            </div>

            {/* Dynamic collaboration section */}
            {business && (
              <div className="flex items-center gap-2 sm:gap-2 ml-0.5 min-w-0">
                <span className="text-xs sm:text-sm font-medium text-gray-400 dark:text-zinc-500 shrink-0">
                  ✕
                </span>
                
                {/* Business Logo (if available) */}
                {business.logo_url && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden bg-white border border-gray-100 dark:border-zinc-800/80 flex items-center justify-center shadow-sm shrink-0">
                    <img
                      src={business.logo_url}
                      alt={business.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Business Name */}
                <span className="text-sm sm:text-base font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[120px] sm:max-w-[180px] leading-tight">
                  {business.name}
                </span>
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <ThemeToggle />
              <img
                src={skipImg}
                alt="GoSkipDQ Illustration"
                className="h-8 sm:h-9.5 w-auto object-contain"
              />
          </div>

        </div>
      </header>
        {
          checkoutError && (

            <div
              className="
                fixed inset-0
                bg-black/60
                backdrop-blur-sm
                z-[100]
                flex
                items-center
                justify-center
                p-5
                
              "
            >

              <div
                className="
                  bg-white
                  dark:bg-zinc-900

                  rounded-[2rem]

                  w-full
                  max-w-md

                  p-7

                  shadow-2xl

                  border
                  border-red-100
                  dark:border-zinc-800
                "
              >

                <div
                  className="
                    w-16 h-16
                    mx-auto
                    rounded-full

                    bg-red-100
                    dark:bg-red-500/10

                    flex
                    items-center
                    justify-center

                    text-3xl
                  "
                >
                  ❌
                </div>

                <h2
                  className="
                    text-2xl
                    font-bold
                    text-center
                    mt-5

                    text-zinc-900
                    dark:text-white
                  "
                >
                  Item Unavailable
                </h2>

                <p
                  className="
                    text-center
                    text-zinc-500
                    mt-3
                    whitespace-pre-line
                  "
                >
                  {checkoutError}
                </p>

                <button
                  onClick={() =>
                    setCheckoutError(null)
                  }

                  className="
                    mt-6
                    w-full

                    bg-red-500
                    hover:bg-red-600

                    text-white
                    font-semibold

                    py-4

                    rounded-2xl

                    transition
                  "
                >
                  Got it
                </button>

              </div>

            </div>
          )
        }
        <div className="max-w-7xl mx-auto p-5 pb-40">   
            <BusinessHeader business={business} />
            {
              !isBusinessOpen && (

                <div
                  className="
                    mt-6
                    mb-6

                    rounded-3xl

                    border
                    border-green-300/30

                    bg-green-500/10

                    px-6
                    py-5

                    flex
                    items-center
                    gap-4
                  "
                >

                  <div
                    className="
                      w-3
                      h-3

                      rounded-full

                      bg-green-500

                      animate-pulse
                    "
                  />

                  <div>

                    <h2
                      className="
                        text-lg
                        font-bold

                        text-green-600 dark:text-green-400
                      "
                    >
                      Business Closed
                    </h2>

                    <p
                      className="
                        text-zinc-500
                        mt-1
                      "
                    >
                      We are currently not
                      accepting orders and
                      will open shortly.
                    </p>

                  </div>

                </div>
              )
            }
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
                {
                  isBusinessOpen && (

                    <FloatingCart
                      cart={cart}
                      checkout={() =>
                        setIsCartOpen(true)
                      }
                    />
                  )
                }
                {
                  isBusinessOpen && (

                    <CartDrawer
                      isOpen={isCartOpen}
                      cart={cart}
                      increaseQty={increaseQty}
                      decreaseQty={decreaseQty}
                      removeFromCart={removeFromCart}
                      checkout={handleCheckoutClick}
                      isCheckoutLoading={
                        isCheckoutLoading
                      }
                      onClose={() =>
                        setIsCartOpen(false)
                      }

                      showPhonePopup={showPhonePopup}
                      phoneNumber={phoneNumber}
                      setPhoneNumber={setPhoneNumber}

                      continueWithPhone=
                        {continueWithPhone}

                      setShowPhonePopup=
                        {setShowPhonePopup}

                      showNamePopup={showNamePopup}
                      customerName={customerName}
                      setCustomerName={setCustomerName}
                      saveNameAndCheckout={
                        saveNameAndCheckout
                      }

                      closeNamePopup={() =>
                        setShowNamePopup(false)
                      }
                    />
                  )
                }
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

                      addToCart={
                        isBusinessOpen
                          ? addToCart
                          : () => {}
                      }

                      increaseQty={
                        isBusinessOpen
                          ? increaseQty
                          : () => {}
                      }

                      decreaseQty={
                        isBusinessOpen
                          ? decreaseQty
                          : () => {}
                      }

                      businessClosed={
                        !isBusinessOpen
                      }

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