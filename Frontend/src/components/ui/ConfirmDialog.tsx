import { AlertTriangle } from "lucide-react";

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: "danger" | "primary";
    loading?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmDialog = ({
    open,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "primary",
    loading = false,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">

                <div className="mb-5 flex items-center gap-3">

                    <div className="rounded-full bg-red-100 p-3">

                        <AlertTriangle
                            size={24}
                            className="text-red-600"
                        />

                    </div>

                    <div>

                        <h2 className="text-xl font-semibold">
                            {title}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {description}
                        </p>

                    </div>

                </div>

                <div className="flex justify-end gap-3">

                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 px-5 py-2 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg px-5 py-2 text-white transition disabled:opacity-50 ${confirmVariant === "danger"
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-black hover:bg-gray-800"
                            }`}
                    >
                        {loading
                            ? "Please wait..."
                            : confirmText}
                    </button>

                </div>

            </div>

        </div>
    );
};

export default ConfirmDialog;