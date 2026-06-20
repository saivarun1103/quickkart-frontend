import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import VerifiedIcon from "../../admin/components/Fonts/VerifiedIcon";
import LocationIcon from "../../admin/components/Fonts/LocationIcon";
import ClipboardIcon from "../../admin/components/Fonts/ClipBoard";
import InfoIcon from "../../admin/components/Fonts/InfoIcon";
import WhatsappIcon from "../../admin/components/Fonts/WhatsappIcon";
import DownloadIcon from "../../admin/components/Fonts/DownloadIcon";
import { domToPng } from "modern-screenshot";
import { useRef } from "react";
import logoImg from "../../assets/logo.png";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const receiptRef = useRef(null);

  const openGoogleMaps = () => {
    if (!order?.latitude || !order?.longitude) return;
    window.open(
      `https://www.google.com/maps?q=${order.latitude},${order.longitude}`,
      "_blank"
    );
  };

  const getStepState = (stepNumber) => {
    // stepNumber: 1 = Confirmed, 2 = Preparing, 3 = Ready, 4 = Completed
    const status = order?.status;

    if (status === "completed") {
      return "completed";
    }

    if (status === "ready") {
      if (stepNumber < 3) return "completed";
      if (stepNumber === 3) return "active";
      return "upcoming";
    }

    // pending / preparing
    if (stepNumber === 1) return "completed";
    if (stepNumber === 2) return "active";
    return "upcoming";
  };

  useEffect(() => {
    const token = location.search.replace("?", "");

    if (!token) {
      setLoading(false);
      return;
    }

    let intervalId;

    const fetchOrder = () => {
      fetch(`${import.meta.env.VITE_API_URL}/public/order/${token}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.order) {
            setOrder(data.order);
            if (data.order.status === "completed" && intervalId) {
              clearInterval(intervalId);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching order:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchOrder();

    intervalId = setInterval(fetchOrder, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [location.search]);

  const saveBill = async () => {
    try {

      if (!receiptRef.current)
        return;

      const dataUrl =
        await domToPng(
          receiptRef.current,
          {
            quality: 1,
            scale: 2,
            backgroundColor:
              "#ffffff"
          }
        );

      const link =
        document.createElement(
          "a"
        );

      link.download =
        `quickkart-order-${order.id}.png`;

      link.href =
        dataUrl;

      document.body.appendChild(
        link
      );

      link.click();

      document.body.removeChild(
        link );

    } catch (error) {

      console.error(
        "Save bill failed:",
        error
      );

      alert(
        "Unable to save bill. Please try again."
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg bg-gray-50">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl font-semibold bg-gray-50 text-gray-700">
        Unauthorized
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 flex justify-center items-center">
      <div
        ref={receiptRef}
        className="
          w-full
          max-w-xl
          bg-white
          border
          border-gray-100
          rounded-[32px]
          shadow-sm
          p-4
          sm:p-6
          space-y-5
        "
      >
        {/* GoSkipDQ Branding at the top */}
        <div className="flex items-center justify-center gap-1.5 border-b border-gray-100 pb-4">
          <div className="w-8 h-8 rounded-xl bg-white border border-emerald-100/60 flex items-center justify-center shadow-sm">
            <img
              src={logoImg}
              alt="GoSkipDQ Logo"
              className="w-5.5 h-5.5 object-contain"
            />
          </div>
          <span className="text-lg font-black italic tracking-tighter py-1 leading-normal">
            <span className="text-emerald-500">Go</span>
            <span className="text-black">Skip</span>
            <span className="text-emerald-500">DQ</span>
          </span>
        </div>
        
        {/* Success Header */}
        <div className="text-center">
          <div className="relative mb-5">

            <div
              className="
                inline-flex
                items-center
                justify-center
                w-20
                h-20
                rounded-full
                bg-green-500
                text-white
                text-5xl
                shadow-lg
              "
            >
              ✓
            </div>

          </div>
          <h1 className="text-[42px] sm:text-3xl font-extrabold text-green-600 tracking-tight leading-none">
            Payment Successful
          </h1>
          <p className="text-gray-500 text-base sm:text-sm mt-2 font-medium">
            Your order has been confirmed
          </p>
        </div>

        {/* Live Order Status Tracker */}
        <div className="border border-green-500/10 rounded-[28px] bg-[#eef8f0] p-5 shadow-sm space-y-4">
          <style>{`
            @keyframes heartbeat {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.15); }
            }
            .animate-heartbeat {
              animation: heartbeat 1.2s ease-in-out infinite;
            }
          `}</style>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {order.status !== "completed" && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${order.status === "completed" ? "bg-zinc-400" : "bg-green-500"}`}></span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Live Order Status
              </span>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
              order.status === "completed"
                ? "bg-zinc-100 text-zinc-800"
                : order.status === "ready"
                ? "bg-green-100 text-green-800 animate-pulse"
                : "bg-amber-100 text-amber-800"
            }`}>
              {order.status === "completed" ? "Completed" : order.status === "ready" ? "Ready to Pick" : "Preparing"}
            </span>
          </div>

          <div className="text-center py-1">
            <h3 className="text-lg font-black text-gray-800">
              {order.status === "completed" && "Order Completed"}
              {order.status === "ready" && "Your order is ready to pick!"}
              {(order.status === "pending" || order.status === "preparing") && "Your order is getting ready"}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {order.status === "completed" && "Thank you for ordering with us!"}
              {order.status === "ready" && "Show the PIN at the counter to collect your items."}
              {(order.status === "pending" || order.status === "preparing") && "We are packing your items."}
            </p>
          </div>

          {/* Visual steps timeline */}
          <div className="relative px-4">
            {/* Line behind */}
            <div className="absolute left-8 right-8 top-5 h-[3px] bg-gray-100 z-0" />
            {/* Active Line indicator */}
            <div 
              className="absolute left-8 top-5 h-[3px] bg-green-500 z-0 transition-all duration-[1000ms] ease-out" 
              style={{
                width: order.status === "completed" ? "calc(100% - 64px)" : order.status === "ready" ? "50%" : "0%"
              }}
            />

            {/* Steps row */}
            <div className="flex justify-between items-start text-center">
              {/* Step 1: Confirmed */}
              <div className="flex flex-col items-center w-16 z-10">
                <div className="h-10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    ✓
                  </div>
                </div>
                <span className="text-[10px] font-bold text-green-600 mt-1.5">Confirmed</span>
              </div>

              {/* Step 2: Preparing */}
              <div className="flex flex-col items-center w-16 z-10">
                <div className="h-10 flex items-center justify-center">
                  <div className={`rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-500 ${
                    getStepState(2) === "active"
                      ? "w-10 h-10 bg-green-500 text-white animate-heartbeat shadow-md shadow-green-500/20"
                      : getStepState(2) === "completed"
                      ? "w-8 h-8 bg-green-500 text-white"
                      : "w-8 h-8 bg-gray-100 text-gray-400"
                  }`}>
                    📦
                  </div>
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${
                  getStepState(2) !== "upcoming" ? "text-green-600 font-extrabold" : "text-gray-400"
                }`}>
                  Preparing
                </span>
              </div>

              {/* Step 3: Ready */}
              <div className="flex flex-col items-center w-16 z-10">
                <div className="h-10 flex items-center justify-center">
                  <div className={`rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-500 ${
                    getStepState(3) === "active"
                      ? "w-10 h-10 bg-green-500 text-white animate-heartbeat shadow-md shadow-green-500/20"
                      : getStepState(3) === "completed"
                      ? "w-8 h-8 bg-green-500 text-white"
                      : "w-8 h-8 bg-gray-100 text-gray-400"
                  }`}>
                    🛍️
                  </div>
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${
                  getStepState(3) !== "upcoming" ? "text-green-600 font-extrabold" : "text-gray-400"
                }`}>
                  Ready
                </span>
              </div>

              {/* Step 4: Completed */}
              <div className="flex flex-col items-center w-16 z-10">
                <div className="h-10 flex items-center justify-center">
                  <div className={`rounded-full flex items-center justify-center font-bold text-sm shadow-sm transition-all duration-500 ${
                    getStepState(4) === "active"
                      ? "w-10 h-10 bg-green-500 text-white animate-heartbeat shadow-md shadow-green-500/20"
                      : getStepState(4) === "completed"
                      ? "w-8 h-8 bg-green-500 text-white"
                      : "w-8 h-8 bg-gray-100 text-gray-400"
                  }`}>
                    🎉
                  </div>
                </div>
                <span className={`text-[10px] font-bold mt-1.5 ${
                  getStepState(4) !== "upcoming" ? "text-green-600 font-extrabold" : "text-gray-400"
                }`}>
                  Done
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Block Card */}
        <div
          className="
            border
            border-[#c8dfce]
            rounded-[28px]
            overflow-hidden
            divide-y
            divide-[#c8dfce]
            bg-[#eef8f0]
            shadow-sm
            backdrop-blur-sm
          "
        >
          
          {/* Metadata Row */}
          <div className="grid grid-cols-3 text-center bg-[#eef8f0] py-5">
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Order ID</div>
              <div className="font-bold text-gray-800 text-lg">#{order.id}</div>
            </div>
            <div className="border-x border-[#c8dfce]">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">PIN</div>
              <div className="font-extrabold text-blue-600 text-lg">{order.pin}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Status</div>
              <div className="font-bold text-green-600 text-sm tracking-wide uppercase">
                {order.payment_status}
              </div>
            </div>
          </div>

          {/* Business Info Row */}
          <div className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-[#eef8f0]">

            <div
              className="
                w-16
                h-16
                rounded-full
                overflow-hidden
                bg-[#eef8f0]
                border
                border-[#bfd8c6]
                shrink-0
                flex
                items-center
                justify-center
                self-center
              "
            >

              {order.logo_url ? (

                <div className="-translate-y-[1px]">
                  <img
                    src={order.logo_url}
                    crossOrigin="anonymous"
                    alt={order.business_name}
                    className="
                      w-14
                      h-14
                      rounded-full
                      object-cover
                    "
                  />
                </div>

              ) : (

                <div className="text-2xl">
                  🏪
                </div>

              )}

            </div>

            <div className="flex-1">
              <div className="text-sm text-gray-400 font-medium">
                Business
              </div>

              <div className="flex items-center gap-2 flex-nowrap">
                <h2
                  className="
                    font-bold
                    text-[22px]
                    sm:text-[28px]
                    leading-tight
                    text-black
                    break-words
                  "
                >
                  {order.business_name}
                </h2>

                <VerifiedIcon className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
              </div>

              <div className="text-gray-500 text-sm mt-1">
                Order confirmed successfully
              </div>
            </div>

          </div>

          {/* Location / Map Row */}
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-4
              justify-between
              p-4
              sm:p-5
              bg-[#eef8f0]
            "
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-50 border border-[#c8dfce] text-green-600 rounded-full flex items-center justify-center text-xl shrink-0">
                <LocationIcon size={30} color="#21974c"/>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-medium">Location</div>
                <div className="font-bold text-gray-900 text-[20px] sm:text-xl break-words">
                  {order.location_name}
                </div>
              </div>
            </div>
            <button
              onClick={openGoogleMaps}
              className="
                w-full
                sm:w-auto
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-3
                border-2
                border-blue-500
                text-blue-700
                font-bold
                text-sm
                rounded-2xl
                hover:bg-blue-50
                transition
                shadow-sm
              "
            >
              <LocationIcon color="#2563eb"/> Open in Maps
            </button>
          </div>
        </div>

        {/* Order Summary Section */}
        <div
          className="
            border
            border-[#d4ddd6]
            rounded-[28px]
            p-5
            space-y-4
            bg-white
            shadow-[0_8px_24px_rgba(0,0,0,0.06)]
          "
        >
          <div className="flex items-center gap-2 font-bold text-gray-800 text-lg border-b border-[#d4ddd6] pb-3">
            <ClipboardIcon /> Order Summary
          </div>

          <div className="divide-y divide-[#d8e0da]">
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  py-4
                  first:pt-0
                  last:pb-0
                "
              >
                <div className="flex items-center gap-3">
                  {/* Mock Item Image placeholder if URL exists, or fallbacks */}
                  <div
                    className="
                      w-14
                      h-14
                      rounded-xl
                      overflow-hidden
                      bg-gray-100
                      shrink-0
                      border
                      border-gray-100
                    "
                  >

                    {item.image_url ? (

                      <img
                        src={item.image_url}
                        crossOrigin="anonymous"
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div
                        className="
                          w-full
                          h-full
                          flex
                          items-center
                          justify-center
                          text-xl
                        "
                      >
                        🍽️
                      </div>

                    )}

                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">
                      {item.quantity} × {item.name}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">₹{item.price} each</div>
                  </div>
                </div>
                <div className="font-bold text-gray-800 text-base shrink-0">₹{item.subtotal}</div>
              </div>
            ))}
          </div>

          {/* Grand Total Row */}
          <div className="border-t border-[#d4ddd6] pt-4 flex justify-between items-center">
            <span className="font-bold text-gray-800 text-lg">Total</span>
            <span className="font-extrabold text-green-600 text-2xl">₹{order.total}</span>
          </div>
        </div>

        {/*Save Bill*/}
        <button
          id="save-bill-btn"
          onClick={saveBill}
          className="
            w-full
            flex
            items-center
            justify-center
            gap-2
            py-3.5
            rounded-2xl
            font-semibold
            text-sm
            text-blue-700
            bg-gradient-to-b
            from-[#eff6ff]
            to-[#dbeafe]
            border
            border-[#bfdbfe]
            shadow-[0_4px_14px_rgba(37,99,235,0.12)]
            hover:from-[#dbeafe]
            hover:to-[#c7ddff]
            hover:shadow-[0_8px_20px_rgba(37,99,235,0.18)]
            active:scale-[0.99]
            transition-all
            duration-200
          "
        >
          <DownloadIcon
            size={20}
            className="text-blue-600"
          />

          Save Bill
        </button>

        {/* Counter Instruction Info Box */}
        <div
          className="
            bg-blue-50
            border
            border-blue-100
            text-blue-800
            rounded-2xl
            p-4
            shadow-sm
          "
        >
          <div className="flex items-start gap-3">

            <div className="shrink-0 mt-0.5">
              <InfoIcon
                size={24}
                className="text-blue-600"
              />
            </div>

            <p
              className="
                text-sm
                sm:text-base
                font-medium
                leading-relaxed
                text-left
              "
            >
              Please show this{" "}
              <span className="font-bold text-blue-600">
                PIN
              </span>{" "}
              at the counter while collecting your order.
            </p>

          </div>
        </div>

        {/* WhatsApp Notification Inline Block */}
        <div
          className="
            bg-green-50
            border
            border-[#c8dfce]
            rounded-2xl
            p-4
            flex
            flex-col
            sm:flex-row
            gap-4
          "
        >
          <div className="flex items-start gap-3">
            <div
            className="
              shrink-0
              flex
              items-center
              justify-center
              self-center
            "
          >
            <div className="-translate-y-[2px]">
              <WhatsappIcon size={34} />
            </div>
          </div>
            <div>
              <div className="font-bold text-green-800 text-sm">Get WhatsApp Updates</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                Receive order confirmation, ready-for-pickup alerts, and order updates directly on WhatsApp.
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              const message = encodeURIComponent("I want to receive updates for my QuickKart order.");
              window.open(`https://wa.me/918712573890?text=${message}`, "_blank");
            }}
            className="
              w-full
              sm:w-auto
              bg-green-600
              hover:bg-green-700
              text-white
              font-semibold
              text-sm
              px-5
              py-3
              rounded-2xl
              transition
              shadow-sm
            "
          >
            Enable Updates
          </button>
        </div>

      </div>
    </div>
  );
}