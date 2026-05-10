import { useEffect } from "react";

export default function Modal({
    children,
    onClose
}) {

    // LOCK BACKGROUND SCROLL
    useEffect(() => {

        document.body.style.overflow = "hidden";

        return () => {

            document.body.style.overflow = "auto";
        };

    }, []);


    // ESC KEY CLOSE
    useEffect(() => {

        const handleEscape = (e) => {

            if (e.key === "Escape") {

                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {

            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };

    }, [onClose]);


    return (

        <div
            onClick={onClose}

            className="
                fixed
                inset-0

                z-[99999]

                bg-black/80
                backdrop-blur-2xl

                flex
                items-center
                justify-center

                p-4

                animate-in
                fade-in
                duration-300
            "
        >

            {/* MODAL BOX */}
            <div
                onClick={(e) =>
                    e.stopPropagation()
                }

                className="
                    relative

                    w-full
                    max-w-xl

                    max-h-[90vh]

                    overflow-y-auto

                    rounded-[32px]

                    border
                    border-white/10

                    bg-zinc-950/95

                    shadow-2xl
                    shadow-black/60

                    p-6
                    md:p-8

                    animate-in
                    zoom-in-95
                    slide-in-from-bottom-4
                    duration-300

                    scrollbar-thin
                    scrollbar-thumb-zinc-700
                "
            >

                {/* GLOW EFFECT */}
                <div
                    className="
                        absolute
                        inset-0

                        rounded-[32px]

                        bg-gradient-to-br
                        from-blue-500/5
                        via-transparent
                        to-purple-500/5

                        pointer-events-none
                    "
                />


                {/* CLOSE BUTTON */}
                <button
                    onClick={(e) => {

                        e.stopPropagation();

                        onClose();
                    }}

                    className="
                        absolute
                        top-5
                        right-5

                        z-20

                        w-11
                        h-11

                        rounded-2xl

                        bg-zinc-900/90
                        hover:bg-zinc-800

                        border
                        border-white/10

                        text-zinc-400
                        hover:text-white

                        text-2xl
                        leading-none

                        transition-all
                        duration-300

                        flex
                        items-center
                        justify-center

                        hover:rotate-90
                    "
                >
                    ×
                </button>


                {/* CONTENT */}
                <div className="relative z-10">
                    {children}
                </div>

            </div>

        </div>
    );
}