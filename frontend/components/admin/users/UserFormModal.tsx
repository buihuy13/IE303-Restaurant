"use client";

import { User } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// 1. Define Props
type UserFormModalProps = {
        isOpen: boolean;
        onClose: () => void;
        // userToEdit = null: "Add New" mode
        // userToEdit = User: "Edit" mode
        userToEdit: User | null;
        // onSave function will receive form data for parent component to handle
        onSave: (userData: { username: string; phone: string }) => void;
};

export default function UserFormModal({ isOpen, onClose, userToEdit, onSave }: UserFormModalProps) {
        // 2. Internal form state
        const [username, setUsername] = useState("");
        const [phone, setPhone] = useState("");
        const [loading, setLoading] = useState(false);

        const isEditMode = userToEdit !== null;
        const title = isEditMode ? "Edit User" : "Add New User";
        const titleId = "user-form-modal-title";

        // 3. Effect to sync 'userToEdit' props into form state
        // When modal opens or user to edit changes -> update form
        useEffect(() => {
                if (isOpen) {
                        if (isEditMode && userToEdit) {
                                // Edit mode: Load user data into form
                                setUsername(userToEdit.username || "");
                                setPhone(userToEdit.phone || "");
                        } else {
                                // Add mode: Reset form
                                setUsername("");
                                setPhone("");
                        }
                }
        }, [isOpen, userToEdit, isEditMode]);

        // 4. Handle form submission
        const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                if (!username.trim()) {
                        toast.error("Username is required");
                        return;
                }

                setLoading(true);
                try {
                        // Send data to parent component (UserList)
                        await onSave({ username: username.trim(), phone: phone.trim() });
                } catch {
                        // Error handling is done in parent component
                } finally {
                        setLoading(false);
                }
        };

        return (
                <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
                        <Dialog.Portal>
                                <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity" />
                                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl outline-none">
                                        <Dialog.Close
                                                title="Close Modal"
                                                aria-label="Close user form"
                                                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                                        >
                                                <X className="w-6 h-6" />
                                        </Dialog.Close>

                                <Dialog.Title id={titleId} className="text-2xl font-bold mb-6">{title}</Dialog.Title>

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                                <label
                                                        htmlFor="username"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Username <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                        id="username"
                                                        name="username"
                                                        type="text"
                                                        autoComplete="username"
                                                        spellCheck={false}
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-50 disabled:bg-gray-100"
                                                        required
                                                        disabled={loading}
                                                />
                                        </div>

                                        <div>
                                                <label
                                                        htmlFor="phone"
                                                        className="block text-sm font-medium text-gray-700"
                                                >
                                                        Phone
                                                </label>
                                                <input
                                                        id="phone"
                                                        name="phone"
                                                        type="tel"
                                                        autoComplete="tel"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="mt-1 w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-50 disabled:bg-gray-100"
                                                        placeholder="Enter phone number"
                                                        disabled={loading}
                                                />
                                        </div>

                                        {/* Display read-only fields */}
                                        {isEditMode && userToEdit && (
                                                <>
                                                        <div>
                                                                <label
                                                                        htmlFor="email"
                                                                        className="block text-sm font-medium text-gray-700"
                                                                >
                                                                        Email
                                                                </label>
                                                                <input
                                                                        id="email"
                                                                        name="email"
                                                                        type="email"
                                                                        autoComplete="email"
                                                                        value={userToEdit.email}
                                                                        className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                                                        disabled
                                                                        readOnly
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                        Email cannot be changed
                                                                </p>
                                                        </div>

                                                        <div>
                                                                <label
                                                                        htmlFor="role"
                                                                        className="block text-sm font-medium text-gray-700"
                                                                >
                                                                        Role
                                                                </label>
                                                                <input
                                                                        id="role"
                                                                        name="role"
                                                                        type="text"
                                                                        value={userToEdit.role}
                                                                        className="mt-1 w-full px-3 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
                                                                        disabled
                                                                        readOnly
                                                                />
                                                                <p className="mt-1 text-xs text-gray-500">
                                                                        Role cannot be changed
                                                                </p>
                                                        </div>
                                                </>
                                        )}

                                        {/* Buttons */}
                                        <div className="flex justify-end gap-3 pt-4">
                                                <button
                                                        type="button" // Important: type="button" to prevent form submission
                                                        onClick={onClose}
                                                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                                        disabled={loading}
                                                >
                                                        Cancel
                                                </button>
                                                <button
                                                        type="submit"
                                                        className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
                                                        disabled={loading}
                                                >
                                                        {loading ? (
                                                                <>
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        Saving...
                                                                </>
                                                        ) : (
                                                                "Save"
                                                        )}
                                                </button>
                                        </div>
                                </form>
                                </Dialog.Content>
                        </Dialog.Portal>
                </Dialog.Root>
        );
}
