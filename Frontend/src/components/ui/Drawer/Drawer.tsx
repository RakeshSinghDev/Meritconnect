import { X } from "lucide-react";
import type { ReactNode } from "react";

interface DrawerProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: ReactNode;
}

const Drawer = ({
    open,
    title,
    onClose,
    children,
}: DrawerProps) => {
    return (
        <>
            {/* Overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${open
                        ? "opacity-100 pointer-events-auto"
                        : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Drawer */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-screen w-full max-w-2xl flex-col bg-white shadow-2xl transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-8 py-6">
                    <h2 className="text-2xl font-semibold">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 transition hover:bg-gray-100"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8">
                    {children}
                </div>
            </div>
        </>
    );
};

export default Drawer;