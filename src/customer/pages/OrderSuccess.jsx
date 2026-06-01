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

  useEffect(() => {
    const token = location.search.replace("?", "");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/public/order/${token}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
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