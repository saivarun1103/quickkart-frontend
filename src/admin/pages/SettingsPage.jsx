import { useEffect, useState } from "react";
import axios from "axios";

export default function SettingsPage() {

  const [loading, setLoading] =
    useState(true);

  const [
    pickupVerificationEnabled,
    setPickupVerificationEnabled
  ] = useState(true);

  const [
    businessStatus,
    setBusinessStatus
  ] = useState("open");

  const [
    logoPreview,
    setLogoPreview
  ] = useState("");

  const [
    bannerPreview,
    setBannerPreview
  ] = useState("");

  const [
    uploadingBranding,
    setUploadingBranding
  ] = useState(false);

  useEffect(() => {

    fetchSettings();

  }, []);

  const fetchSettings =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "token"
          );

        const response =
          await axios.get(
            `${import.meta.env.VITE_API_URL}/business/settings`,
            {
              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );

        setPickupVerificationEnabled(
          response.data
            .pickup_verification_enabled
        );

        setBusinessStatus(
            response.data.status
        );

        setLogoPreview(
            response.data.logo_url || ""
        );

        setBannerPreview(
            response.data.banner_url || ""
        );

      } catch (error) {

        console.error(
          "Failed to fetch settings",
          error
        );

      } finally {

        setLoading(false);

      }
    };

  const handlePickupToggle =
    async () => {

        const newValue =
        !pickupVerificationEnabled;

        setPickupVerificationEnabled(
        newValue
        );

        try {

        const token =
            localStorage.getItem(
            "token"
            );

        await axios.patch(
            `${import.meta.env.VITE_API_URL}/business/settings`,
            {
            pickup_verification_enabled:
                newValue,

            status:
                businessStatus
            },
            {
            headers: {
                Authorization:
                `Bearer ${token}`
            }
            }
        );

        } catch (error) {

        console.error(error);
        }
    };

    const updateBusinessStatus =
        async (newStatus) => {

            setBusinessStatus(
            newStatus
            );

            try {

            const token =
                localStorage.getItem(
                "token"
                );

            await axios.patch(
                `${import.meta.env.VITE_API_URL}/business/settings`,
                {
                pickup_verification_enabled:
                    pickupVerificationEnabled,

                status:
                    newStatus
                },
                {
                headers: {
                    Authorization:
                    `Bearer ${token}`
                }
                }
            );

            } catch (error) {

            console.error(error);
            }
        };

    const updateBranding =
        async (
            file,
            type
        ) => {

            try {

            setUploadingBranding(
                true
            );

            const token =
                localStorage.getItem(
                "token"
                );

            const formData =
                new FormData();

            formData.append(
                type,
                file
            );

            const response =
                await axios.patch(

                `${import.meta.env.VITE_API_URL}/business/settings/business/branding`,

                formData,

                {
                    headers: {
                    Authorization:
                        `Bearer ${token}`,

                    "Content-Type":
                        "multipart/form-data"
                    }
                }
                );

            if (
                response.data.logo_url
            ) {

                setLogoPreview(
                response.data.logo_url
                );
            }

            if (
                response.data.banner_url
            ) {

                setBannerPreview(
                response.data.banner_url
                );
            }

            } catch (error) {

            console.error(error);

            } finally {

            setUploadingBranding(
                false
            );
            }
        };

  if (loading) {

    return (
      <div>
        Loading...
      </div>
    );
  }

  return (
    <div className="px-3 py-5 sm:p-6">

      <h1 className="text-3xl font-bold mb-6">
        Settings
      </h1>

      <div
        className="
          bg-zinc-900
          rounded-2xl
          p-6
          border
          border-zinc-800
          w-full 
          max-w-xl
        "
      >

        <h2 className="text-xl font-semibold">
          Secure Pickup Verification
        </h2>

        <p className="text-gray-400 mt-2">
          Require customer PIN
          for order pickup.
        </p>

        <div className="mt-6">

          <label
            className="
              flex
              items-center
              justify-between
            "
          >

            <span>
              Enable verification
            </span>

            <button
                onClick={handlePickupToggle}

                className={`
                    relative

                    w-14
                    h-8

                    rounded-full

                    transition-all
                    duration-300

                    ${
                    pickupVerificationEnabled

                        ? `
                            bg-[#1ea753]
                        `

                        : `
                            bg-zinc-700
                        `
                    }
                `}
                >

                <div
                    className={`
                    absolute
                    top-1

                    w-6
                    h-6

                    rounded-full
                    bg-white

                    shadow-md

                    transition-all
                    duration-300

                    ${
                        pickupVerificationEnabled

                        ? "translate-x-7"

                        : "translate-x-1"
                    }
                    `}
                />

                </button>

          </label>

        </div>

      </div>

      <div
        className={`
            rounded-2xl
            p-6
            border
            w-full max-w-xl
            mt-5

            transition-all
            duration-300

            ${
            businessStatus === "open"

                ? `
                    bg-green-500/5
                    border-green-500/20
                `

                : businessStatus ===
                "closed"

                ? `
                    bg-red-500/5
                    border-red-500/20
                `

                : `
                    bg-yellow-500/5
                    border-yellow-500/20
                `
            }
        `}
      >

        <h2 className="
            text-xl
            font-semibold
        ">
            Business Status
        </h2>

        <p className="
            text-gray-400
            mt-2
        ">
            Control whether
            customers can place
            orders.
        </p>

        <div className="
            flex
            gap-3
            mt-8
            flex-wrap
        ">

            <button
            onClick={() =>
                updateBusinessStatus(
                "open"
                )
            }

            className={`
                px-5
                py-3

                rounded-2xl

                font-semibold

                transition-all

                ${
                businessStatus ===
                "open"

                    ? `
                        bg-green-500
                        text-white
                    `

                    : `
                        bg-zinc-800
                        text-zinc-400
                    `
                }
            `}
            >
            🟢 Open
            </button>

            <button
            onClick={() =>
                updateBusinessStatus(
                "closed"
                )
            }

            className={`
                px-5
                py-3

                rounded-2xl

                font-semibold

                transition-all

                ${
                businessStatus ===
                "closed"

                    ? `
                        bg-red-500
                        text-white
                    `

                    : `
                        bg-zinc-800
                        text-zinc-400
                    `
                }
            `}
            >
            🔴 Closed
            </button>

            <button
            onClick={() =>
                updateBusinessStatus(
                "maintenance"
                )
            }

            className={`
                px-5
                py-3

                rounded-2xl

                font-semibold

                transition-all

                ${
                businessStatus ===
                "maintenance"

                    ? `
                        bg-yellow-500
                        text-black
                    `

                    : `
                        bg-zinc-800
                        text-zinc-400
                    `
                }
            `}
            >
            🟡 Maintenance
            </button>

        </div>

        </div>

    <div
        className="
            bg-zinc-900
            rounded-2xl
            p-6
            border
            border-zinc-800
            w-full max-w-xl
            mt-5
        "
    >

        <h2 className="
            text-xl
            font-semibold
        ">
            Business Branding
        </h2>

        <p className="
            text-gray-400
            mt-2
        ">
            Update your logo
            and banner image.
        </p>

        <div className="
            mt-8
            space-y-8
        ">

            {/* LOGO */}

            <div>

            <label className="
                block
                text-sm
                text-zinc-400
                mb-3
            ">
                Business Logo
            </label>

            <div className="
                flex
                items-center
                gap-4
            ">

                <div
                className="
                    w-24
                    h-24

                    rounded-2xl
                    overflow-hidden

                    bg-zinc-800
                    border
                    border-zinc-700

                    flex
                    items-center
                    justify-center
                "
                >

                {
                    logoPreview ? (

                    <img
                        src={
                        logoPreview
                        }
                        alt="logo"

                        className="
                        w-full
                        h-full
                        object-cover
                        "
                    />

                    ) : (

                    <span className="
                        text-zinc-500
                        text-sm
                    ">
                        No Logo
                    </span>
                    )
                }

                </div>

                <label
                className={`
                    px-5
                    py-3

                    rounded-2xl

                    bg-[#1ea753]
                    hover:bg-[#1ea753]/90

                    text-white
                    font-medium

                    cursor-pointer

                    transition
                    ${uploadingBranding ? "opacity-75 cursor-not-allowed pointer-events-none" : ""}
                `}
                >

                {
                    uploadingBranding ? (
                        <span className="btn-loading-content">
                            <span className="spinner"></span>
                            Uploading...
                        </span>
                    ) : (
                        "Upload Logo"
                    )
                }

                <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={uploadingBranding}

                    onChange={(e) => {

                    const file =
                        e.target.files[0];

                    if (file) {

                        updateBranding(
                        file,
                        "logo"
                        );
                    }
                    }}
                />

                </label>

            </div>

            </div>

            {/* BANNER */}

            <div>

            <label className="
                block
                text-sm
                text-zinc-400
                mb-3
            ">
                Banner Image
            </label>

            <div
                className="
                w-full
                h-44

                rounded-3xl
                overflow-hidden

                border
                border-zinc-700

                bg-zinc-800
                "
            >

                {
                bannerPreview ? (

                    <img
                    src={
                        bannerPreview
                    }

                    alt="banner"

                    className="
                        w-full
                        h-full
                        object-cover
                    "
                    />

                ) : (

                    <div className="
                    w-full
                    h-full

                    flex
                    items-center
                    justify-center

                    text-zinc-500
                    ">
                    No Banner Image
                    </div>
                )
                }

            </div>

            <label
                className={`
                inline-flex
                mt-4

                px-5
                py-3

                rounded-2xl

                bg-[#1ea753]
                hover:bg-[#1ea753]/90

                text-white
                font-medium

                cursor-pointer
                transition
                ${uploadingBranding ? "opacity-75 cursor-not-allowed pointer-events-none" : ""}
                `}
            >

                {
                uploadingBranding ? (
                    <span className="btn-loading-content">
                        <span className="spinner"></span>
                        Uploading...
                    </span>
                ) : (
                    "Upload Banner"
                )
                }

                <input
                type="file"
                accept="image/*"
                hidden
                disabled={uploadingBranding}

                onChange={(e) => {

                    const file =
                    e.target.files[0];

                    if (file) {

                    updateBranding(
                        file,
                        "banner"
                    );
                    }
                }}
                />

            </label>

            </div>

        </div>

    </div>

    </div>
  );
}