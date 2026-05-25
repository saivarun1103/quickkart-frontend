import { useEffect, useState } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = useLocation();

  useEffect(() => {
    const token = location.search.replace(
      "?",
      ""
    );

    if (!token) {

      setLoading(false);

      return;
    }
    
    fetch(
    `${import.meta.env.VITE_API_URL}/public/order/${token}`
    )
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
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading order...
      </div>
    );
  }

  if (!order) {
    return (
        <div
            className="
                min-h-screen
                flex
                items-center
                justify-center
                text-2xl
                font-semibold
            "
        >
            Unauthorized
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">

        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">✅</div>

          <h1 className="text-3xl font-bold text-green-600">
            Payment Successful
          </h1>

          <p className="text-gray-500 mt-2">
            Your order has been confirmed
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">

          <div className="flex justify-between mb-3">
            <span className="text-gray-500">Order ID</span>

            <span className="font-semibold">
              #{order.id}
            </span>
          </div>

          <div className="flex justify-between mb-3">
            <span className="text-gray-500">PIN</span>

            <span className="font-bold text-xl text-blue-600">
              {order.pin}
            </span>
          </div>

          <div className="flex justify-between mb-3">
            <span className="text-gray-500">Status</span>

            <span className="text-green-600 font-semibold uppercase">
              {order.payment_status}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Estimated Time</span>

            <span>15 mins</span>
          </div>

        </div>

        {/* Order Summary */}
        <div className="mb-6">

          <h2 className="font-semibold text-xl mb-4">
            Order Summary
          </h2>

          <div className="space-y-4">

            {order.items.map((item) => (
              <div
                key={item.name}
                className="flex justify-between items-start"
              >

                <div>
                  <div className="font-medium">
                    {item.quantity} × {item.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    ₹{item.price} each
                  </div>
                </div>

                <div className="font-semibold">
                  ₹{item.subtotal}
                </div>

              </div>
            ))}

          </div>

          <div className="border-t mt-5 pt-5 flex justify-between font-bold text-2xl">

            <span>Total</span>

            <span>₹{order.total}</span>

          </div>

        </div>

        {/* Footer Message */}
        <div className="bg-blue-50 text-blue-700 rounded-xl p-4 text-sm text-center">
          Please show this PIN at the counter while collecting your order.
        </div>

      </div>
    </div>
  );
}