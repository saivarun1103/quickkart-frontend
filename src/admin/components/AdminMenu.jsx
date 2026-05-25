import { useEffect, useState } from "react";
import Modal from "./Modal";
import ImageCropModal from "./ImageCropModal";
import TrashIcon from "./Fonts/TrashIcon";
// const BASE_URL = ""; //https://quickkart-3f8h.onrender.com
import { API_BASE } from "../../config";
import { useOutletContext }
from "react-router-dom";

export default function AdminMenu() {
    
    const { search } =
        useOutletContext();

    const [items, setItems] = useState([]);

    const [name, setName] = useState("");

    const [price, setPrice] = useState("");

    const [description, setDescription] = useState("");

    const [file, setFile] = useState(null);

    const [editingItem, setEditingItem] =
        useState(null);

    const [confirmAction, setConfirmAction] =
        useState(null);

    const [isAddOpen, setIsAddOpen] =
        useState(false);

    const [preview, setPreview] =
        useState(null);

    const [toast, setToast] =
        useState("");

    const [cropModalOpen,
        setCropModalOpen] = useState(false);

    const [cropImage,
        setCropImage] = useState(null);

    const [
        originalFileName,
        setOriginalFileName
    ] = useState("");

    const [
        category,
        setCategory
    ] = useState("");

    const [
        dietaryType,
        setDietaryType
    ] = useState("");

    const [categories,
        setCategories] = useState([]);

    const [
        customCategory,
        setCustomCategory
    ] = useState(false);


    // 🔥 RESET FORM
    const resetForm = () => {

        setName("");

        setPrice("");

        setDescription("");

        setFile(null);

        setPreview(null);

        setCategory("");

        setDietaryType("");
    };


    // 🔥 HANDLE 401
    const handleUnauthorized = () => {

        localStorage.removeItem("token");

        window.location.href = "/admin";
    };


    // 🔥 FETCH ITEMS
    const fetchItems = () => {

        fetch(`${API_BASE}/api/admin/menu`, {  //`${BASE_URL}/admin/menu`
            headers: {
                Authorization:
                    `Bearer ${
                        localStorage.getItem(
                            "token"
                        )
                    }`
            }
        })
            .then((res) => {

                if (res.status === 401) {

                    handleUnauthorized();

                    return null;
                }

                return res.json();
            })

            .then((data) => {

                if (!data) return;

                if (Array.isArray(data)) {

                    setItems(data);

                    const uniqueCategories = [

                        ...new Set(

                            data
                                .map(
                                    (item) =>
                                        item.category
                                )
                                .filter(Boolean)
                        )
                    ];

                    setCategories(
                        uniqueCategories
                    );

                } else {

                    console.error(
                        "Invalid menu response:",
                        data
                    );

                    setItems([]);
                }
            })

            .catch((err) => {

                console.error(err);

                setItems([]);
            });
    };


    useEffect(() => {

        fetchItems();

    }, []);

    const filteredItems = items.filter((item) => {

        const query = search.toLowerCase();

        return (
            item.name?.toLowerCase().includes(query) ||
            item.category?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.dietary_type?.toLowerCase().includes(query)
        );
    });


    // 🔥 ADD ITEM
    const handleSubmit = async () => {

        const formData = new FormData();

        formData.append("name", name);

        formData.append("price", price);

        formData.append("description", description);

        formData.append("category", category);

        formData.append("dietary_type", dietaryType);
        if (file) {

            formData.append(
                "file",
                file
            );
        }

        const response = await fetch(
            `${API_BASE}/api/admin/menu`, //`${BASE_URL}/admin/menu`
            {
                method: "POST",

                headers: {
                    Authorization:
                        `Bearer ${
                            localStorage.getItem(
                                "token"
                            )
                        }`
                },

                body: formData
            }
        );

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }

        setToast(
            "Item added successfully!"
        );

        setTimeout(() => {

            setToast("");

        }, 2000);

        resetForm();

        setIsAddOpen(false);

        fetchItems();
    };


    // 🔥 UPDATE ITEM
    const updateItem = async () => {

        const formData = new FormData();

        // ALWAYS SEND UPDATED VALUES
        formData.append(
            "name",
            editingItem.name || ""
        );

        formData.append(
            "price",
            editingItem.price || ""
        );

        formData.append(
            "description",
            editingItem.description || ""
        );

        formData.append(
            "category",
            editingItem.category || ""
        );

        formData.append(
            "dietary_type",
            editingItem.dietary_type || ""
        );

        // OPTIONAL IMAGE
        if (editingItem.file) {

            formData.append(
                "file",
                editingItem.file
            );
        }

        const response = await fetch(
            `${API_BASE}/api/admin/menu/${editingItem.id}`,  //${BASE_URL}/admin/menu/${editingItem.id}
            {
                method: "PUT",

                headers: {
                    Authorization:
                        `Bearer ${
                            localStorage.getItem(
                                "token"
                            )
                        }`
                },

                body: formData
            }
        );

        if (response.status === 401) {

            handleUnauthorized();

            return;
        }

        setToast("Item updated!");

        setTimeout(() => {

            setToast("");

        }, 2000);

        setEditingItem(null);

        setPreview(null);

        fetchItems();
    };


    // 🔥 CONFIRM ACTION
    const handleConfirm = async () => {

        let response;

        // DELETE
        if (
            confirmAction.type ===
            "delete"
        ) {

            response = await fetch(
                `${API_BASE}/api/admin/menu/${confirmAction.id}`, //${BASE_URL}/admin/menu/${confirmAction.id}
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${
                                localStorage.getItem(
                                    "token"
                                )
                            }`
                    }
                }
            );
        }

        // TOGGLE
        if (
            confirmAction.type ===
            "toggle"
        ) {

            response = await fetch(
                `${API_BASE}/api/admin/menu/${confirmAction.id}/toggle`,  //${BASE_URL}/admin/menu/${confirmAction.id}/toggle
                {
                    method: "PATCH",

                    headers: {
                        Authorization:
                            `Bearer ${
                                localStorage.getItem(
                                    "token"
                                )
                            }`
                    }
                }
            );
        }

        if (
            response &&
            response.status === 401
        ) {

            handleUnauthorized();

            return;
        }

        setToast("Action completed");

        setTimeout(() => {

            setToast("");

        }, 2000);

        setConfirmAction(null);

        fetchItems();
    };


    return (
        <>
            <div style={{
                paddingTop: "0px"
            }}>
                <div
                    className="
                        flex
                        justify-center

                        px-4
                        md:px-8
                    "
                >
                    <div
                        className="
                            w-full
                            max-w-7xl
                        "
                    >

                        {/* TOAST */}
                        {toast && (
                            <div style={{
                                position: "fixed",

                                top: "20px",

                                right: "20px",

                                background: "#111",

                                color: "white",

                                padding:
                                    "12px 18px",

                                borderRadius:
                                    "10px",

                                zIndex: 2000,

                                fontSize: "14px",

                                boxShadow:
                                    "0 10px 25px rgba(0,0,0,0.2)"
                            }}>
                                {toast}
                            </div>
                        )}

                        <div
                            className="
                                flex
                                items-center
                                justify-between

                                mb-8
                            "
                        >

                            <div>

                                <p
                                    className="
                                        text-zinc-500
                                        text-sm
                                        uppercase
                                        tracking-widest
                                    "
                                >
                                    Menu Management
                                </p>

                                <h1
                                    className="
                                        text-3xl md:text-4xl
                                        font-bold
                                        mt-2
                                    "
                                >
                                    Your Menu
                                </h1>

                            </div>

                            {/* ADD ITEM */}
                            <button
                                onClick={() =>
                                    setIsAddOpen(true)
                                }

                                className="
                                    h-12
                                    md:h-14

                                    px-5
                                    md:px-6

                                    whitespace-nowrap

                                    rounded-2xl

                                    bg-blue-600

                                    text-sm
                                    md:text-base

                                    text-white
                                    font-semibold

                                    shadow-lg
                                    shadow-blue-600/20

                                    transition-all
                                    duration-300

                                    hover:scale-105
                                    hover:bg-blue-500

                                    cursor-pointer
                                "
                            >
                                + Add Item
                            </button>

                        </div>

                        


                        {/* GRID */}
                        <div
                            className="
                                grid

                                grid-cols-1
                                md:grid-cols-2
                                xl:grid-cols-3

                                gap-6

                                max-w-[1400px]

                                mx-auto
                            "
                        >

                            {Array.isArray(filteredItems) &&
                                filteredItems.map(
                                    (item) => (
                                        <div
                                            key={item.id}

                                            className="
                                                group

                                                max-w-[460px]
                                                w-full
                                                mx-auto

                                                bg-zinc-900

                                                border
                                                border-zinc-800

                                                rounded-3xl

                                                overflow-hidden

                                                transition-all
                                                duration-300

                                                hover:border-zinc-700
                                                hover:-translate-y-1
                                            "
                                        >

                                            {/* IMAGE */}

                                            <div
                                                className="
                                                    relative
                                                    h-56

                                                    overflow-hidden
                                                "
                                            >

                                                {item.image_url && (
                                                    <img
                                                        src={item.image_url}
                                                        alt={item.name}

                                                        className="
                                                            w-full
                                                            h-full

                                                            object-cover

                                                            transition-transform
                                                            duration-500

                                                            group-hover:scale-105
                                                        "
                                                    />
                                                )}

                                                {/* STATUS BADGE */}

                                                <div
                                                    className={`
                                                        absolute
                                                        top-4
                                                        right-4

                                                        px-3
                                                        py-1

                                                        rounded-full

                                                        text-xs
                                                        font-semibold

                                                        backdrop-blur-xl

                                                        ${
                                                            item.available
                                                                ? `
                                                                    bg-green-500/20
                                                                    text-green-300
                                                                    border
                                                                    border-green-500/20
                                                                `
                                                                : `
                                                                    bg-red-500/20
                                                                    text-red-300
                                                                    border
                                                                    border-red-500/20
                                                                `
                                                        }
                                                    `}
                                                >
                                                    {item.available
                                                        ? "Available"
                                                        : "Out of Stock"}
                                                </div>

                                            </div>

                                            {/* CONTENT */}

                                            <div className="p-5">

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-4
                                                    "
                                                >

                                                    <div>

                                                        <h3
                                                            className="
                                                                text-2xl
                                                                font-bold
                                                            "
                                                        >
                                                            {item.name}
                                                        </h3>

                                                        <p
                                                            className="
                                                                text-zinc-500
                                                                mt-1
                                                            "
                                                        >
                                                            {item.description ||
                                                                "No description"}
                                                        </p>

                                                    </div>

                                                    <div
                                                        className="
                                                            text-2xl
                                                            font-bold
                                                            text-blue-400
                                                            whitespace-nowrap
                                                        "
                                                    >
                                                        ₹{item.price}
                                                    </div>

                                                </div>

                                                {/* ACTIONS */}

                                                <div
                                                    className="
                                                        flex
                                                        gap-3

                                                        mt-6
                                                    "
                                                >

                                                    <button
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                type: "toggle",
                                                                id: item.id
                                                            })
                                                        }

                                                        className="
                                                            flex-1

                                                            h-12

                                                            rounded-2xl

                                                            bg-zinc-800
                                                            hover:bg-zinc-700

                                                            transition-all

                                                            cursor-pointer
                                                        "
                                                    >
                                                        {item.available
                                                            ? "Disable"
                                                            : "Enable"}
                                                    </button>

                                                    <button
                                                        onClick={() => {

                                                            setEditingItem(item);

                                                            setPreview(
                                                                item.image_url ||
                                                                null
                                                            );
                                                        }}

                                                        className="
                                                            flex-1

                                                            h-12

                                                            rounded-2xl

                                                            bg-blue-600
                                                            hover:bg-blue-500

                                                            transition-all

                                                            cursor-pointer
                                                        "
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            setConfirmAction({
                                                                type: "delete",
                                                                id: item.id
                                                            })
                                                        }

                                                        className="
                                                            w-12
                                                            h-12

                                                            rounded-2xl

                                                            bg-red-500/20
                                                            hover:bg-red-500/30

                                                            text-red-300

                                                            transition-all

                                                            cursor-pointer

                                                            flex items-center justify-center
                                                        "
                                                    >
                                                        <TrashIcon/>
                                                    </button>

                                                </div>

                                            </div>

                                        </div>
                                    )
                                )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ADD MODAL */}
            {isAddOpen && (
                <Modal
                    onClose={() => {
                        setIsAddOpen(false);
                        resetForm();
                    }}
                >

                    <div className="space-y-5">

                        <div>
                            <p className="text-zinc-500 text-sm uppercase tracking-widest">
                                Menu Item
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                Add New Item
                            </h2>
                        </div>


                        {/* IMAGE PREVIEW */}
                        <div
                            className="
                                w-full
                                h-52

                                rounded-3xl

                                overflow-hidden

                                border
                                border-zinc-800

                                bg-zinc-900

                                flex
                                items-center
                                justify-center
                            "
                        >
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="preview"

                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />
                            ) : (
                                <p className="text-zinc-500">
                                    Image Preview
                                </p>
                            )}
                        </div>


                        {/* NAME */}
                        <input
                            value={name}

                            onChange={(e) =>
                                setName(e.target.value)
                            }

                            placeholder="Item Name"

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        />


                        {/* PRICE */}
                        <input
                            value={price}

                            onChange={(e) =>
                                setPrice(e.target.value)
                            }

                            placeholder="Price"

                            type="number"

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            value={description}

                            onChange={(e) =>
                                setDescription(
                                    e.target.value
                                )
                            }

                            placeholder="Item Description"

                            rows={4}

                            className="
                                w-full

                                px-5
                                py-4

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                resize-none

                                focus:border-blue-500
                            "
                        />
                        
                        {/* category input select*/}
                        <select
                            value={category}

                            onChange={(e) => {

                                if (
                                    e.target.value ===
                                    "__custom__"
                                ) {

                                    setCustomCategory(
                                        true
                                    );

                                    setCategory("");

                                    return;
                                }

                                setCustomCategory(
                                    false
                                );

                                setCategory(
                                    e.target.value
                                );
                            }}

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        >

                            <option value="">
                                Select Category
                            </option>

                            {categories.map((cat) => (

                                <option
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
                                </option>

                            ))}

                            <option value="__custom__">
                                + Add New Category
                            </option>

                        </select>

                        {/* Custom Category */}
                        {customCategory && (

                            <input
                                value={category}

                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }

                                placeholder="
                                    Enter New Category
                                "

                                className="
                                    w-full
                                    h-14

                                    px-5

                                    rounded-2xl

                                    bg-zinc-900

                                    border
                                    border-zinc-800

                                    outline-none

                                    text-white

                                    focus:border-blue-500
                                "
                            />
                        )}

                        {/* Dietary type */}
                        <select
                            value={dietaryType}

                            onChange={(e) =>
                                setDietaryType(
                                    e.target.value
                                )
                            }

                            className="
                                w-full
                                h-14

                                px-5

                                text-left
                                leading-normal

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        >
                            <option value="">
                                Select Dietary Type
                            </option>

                            <option value="Veg">
                                Veg
                            </option>

                            <option value="Non Veg">
                                Non Veg
                            </option>

                            <option value="Egg">
                                Egg
                            </option>

                            <option value="Vegan">
                                Vegan
                            </option>
                        </select>

                        {/* FILE */}
                        <label
                            className="
                                h-14

                                rounded-2xl

                                border
                                border-dashed
                                border-zinc-700

                                bg-zinc-900

                                flex
                                items-center
                                justify-center

                                cursor-pointer

                                text-zinc-400

                                hover:border-blue-500

                                transition-all
                            "
                        >

                            Upload Image

                            <input
                                type="file"

                                hidden

                                onChange={(e) => {

                                    const selected =
                                        e.target.files[0];

                                    if (!selected) return;

                                    setFile(selected);

                                    setOriginalFileName(
                                        selected.name
                                    );

                                    const imageUrl =
                                        URL.createObjectURL(selected);

                                    setCropImage(imageUrl);

                                    setCropModalOpen(true);
                                }}
                            />
                        </label>


                        {/* BUTTON */}
                        <button
                            onClick={handleSubmit}

                            className="
                                w-full
                                h-14

                                rounded-2xl

                                bg-blue-600
                                hover:bg-blue-500

                                text-white
                                font-semibold

                                transition-all
                                duration-300
                            "
                        >
                            Add Item
                        </button>

                    </div>
                </Modal>
            )}



            {/* EDIT MODAL */}
            {editingItem && (
                <Modal
                    onClose={() => {
                        setEditingItem(null);
                        setPreview(null);
                    }}
                >

                    <div className="space-y-5">

                        <div>
                            <p className="text-zinc-500 text-sm uppercase tracking-widest">
                                Menu Item
                            </p>

                            <h2 className="text-3xl font-bold mt-2">
                                Edit Item
                            </h2>
                        </div>


                        {/* IMAGE */}
                        <div
                            className="
                                w-full
                                h-52

                                rounded-3xl

                                overflow-hidden

                                border
                                border-zinc-800

                                bg-zinc-900
                            "
                        >
                            {(preview ||
                                editingItem.image_url) && (
                                <img
                                    src={
                                        preview ||
                                        editingItem.image_url
                                    }

                                    alt="preview"

                                    className="
                                        w-full
                                        h-full
                                        object-cover
                                    "
                                />
                            )}
                        </div>


                        {/* NAME */}
                        <input
                            value={editingItem.name}

                            onChange={(e) =>
                                setEditingItem({
                                    ...editingItem,
                                    name: e.target.value
                                })
                            }

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        />


                        {/* PRICE */}
                        <input
                            value={editingItem.price}

                            type="number"

                            onChange={(e) =>
                                setEditingItem({
                                    ...editingItem,
                                    price: e.target.value
                                })
                            }

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        />

                        {/* DESCRIPTION */}
                        <textarea
                            value={editingItem.description || ""}

                            onChange={(e) =>
                                setEditingItem({
                                    ...editingItem,
                                    description: e.target.value
                                })
                            }

                            placeholder="Item Description"

                            rows={4}

                            className="
                                w-full

                                px-5
                                py-4

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                resize-none

                                focus:border-blue-500
                            "
                        />

                        {/* category input select*/}
                        <select
                            value={category}

                            onChange={(e) => {

                                if (
                                    e.target.value ===
                                    "__custom__"
                                ) {

                                    setCustomCategory(
                                        true
                                    );

                                    setCategory("");

                                    return;
                                }

                                setCustomCategory(
                                    false
                                );

                                setCategory(
                                    e.target.value
                                );
                            }}

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        >

                            <option value="">
                                Select Category
                            </option>

                            {categories.map((cat) => (

                                <option
                                    key={cat}
                                    value={cat}
                                >
                                    {cat}
                                </option>

                            ))}

                            <option value="__custom__">
                                + Add New Category
                            </option>

                        </select>

                        {/* Custom Category */}
                        {customCategory && (

                            <input
                                value={category}

                                onChange={(e) =>
                                    setCategory(
                                        e.target.value
                                    )
                                }

                                placeholder="
                                    Enter New Category
                                "

                                className="
                                    w-full
                                    h-14

                                    px-5

                                    rounded-2xl

                                    bg-zinc-900

                                    border
                                    border-zinc-800

                                    outline-none

                                    text-white

                                    focus:border-blue-500
                                "
                            />
                        )}

                        {/* Dietary input */}
                        <select
                            value={
                                editingItem.dietary_type || ""
                            }

                            onChange={(e) =>
                                setEditingItem({
                                    ...editingItem,
                                    dietary_type:
                                        e.target.value
                                })
                            }

                            className="
                                w-full
                                h-14

                                px-5

                                rounded-2xl

                                bg-zinc-900

                                border
                                border-zinc-800

                                outline-none

                                text-white

                                focus:border-blue-500
                            "
                        >
                            <option value="">
                                Select Dietary Type
                            </option>

                            <option value="Veg">
                                Veg
                            </option>

                            <option value="Non Veg">
                                Non Veg
                            </option>

                            <option value="Egg">
                                Egg
                            </option>

                            <option value="Vegan">
                                Vegan
                            </option>
                        </select>

                        {/* FILE */}
                        <label
                            className="
                                h-14

                                rounded-2xl

                                border
                                border-dashed
                                border-zinc-700

                                bg-zinc-900

                                flex
                                items-center
                                justify-center

                                cursor-pointer

                                text-zinc-400

                                hover:border-blue-500

                                transition-all
                            "
                        >

                            Change Image

                            <input
                                type="file"

                                hidden

                                onChange={(e) => {

                                    const selected =
                                        e.target.files[0];

                                    if (!selected) return;

                                    setFile(selected);

                                    setOriginalFileName(
                                        selected.name
                                    );

                                    const imageUrl =
                                        URL.createObjectURL(selected);

                                    setCropImage(imageUrl);

                                    setCropModalOpen(true);
                                }}
                            />
                        </label>


                        {/* UPDATE */}
                        <button
                            onClick={updateItem}

                            className="
                                w-full
                                h-14

                                rounded-2xl

                                bg-blue-600
                                hover:bg-blue-500

                                text-white
                                font-semibold

                                transition-all
                            "
                        >
                            Save Changes
                        </button>

                    </div>
                </Modal>
            )}



            {/* CONFIRM MODAL */}
            {confirmAction && (
                <Modal
                    onClose={() =>
                        setConfirmAction(null)
                    }
                >

                    <div className="text-center">

                        <div
                            className="
                                w-20
                                h-20

                                mx-auto

                                rounded-full

                                bg-red-500/20

                                flex
                                items-center
                                justify-center

                                text-4xl
                            "
                        >
                            ⚠
                        </div>

                        <h2
                            className="
                                text-3xl
                                font-bold

                                mt-5
                            "
                        >
                            Are you sure?
                        </h2>

                        <p
                            className="
                                text-zinc-500

                                mt-3
                            "
                        >
                            This action cannot be undone.
                        </p>


                        <div
                            className="
                                flex
                                gap-3

                                mt-8
                            "
                        >

                            <button
                                onClick={() =>
                                    setConfirmAction(null)
                                }

                                className="
                                    flex-1
                                    h-14

                                    rounded-2xl

                                    bg-zinc-800
                                    hover:bg-zinc-700

                                    transition-all
                                "
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleConfirm}

                                className="
                                    flex-1
                                    h-14

                                    rounded-2xl

                                    bg-red-600
                                    hover:bg-red-500

                                    text-white
                                    font-semibold

                                    transition-all
                                "
                            >
                                Confirm
                            </button>

                        </div>

                    </div>
                </Modal>
            )}

            {/* Crop Image Modal */}
            {cropModalOpen && (
                <ImageCropModal
                    image={cropImage}
                    fileName={originalFileName}
                    onClose={() => {

                        setCropModalOpen(false);

                        setCropImage(null);
                    }}

                    onCropDone={(croppedFile) => {

                        const previewUrl =
                            URL.createObjectURL(
                                croppedFile
                            );

                        // 🔥 ADD FLOW
                        setFile(croppedFile);

                        setPreview(previewUrl);

                        // 🔥 EDIT FLOW
                        if (editingItem) {

                            setEditingItem({
                                ...editingItem,
                                file: croppedFile,
                                image_url: previewUrl
                            });
                        }

                        setCropModalOpen(false);
                    }}
                />
            )}
        </>
    );
}