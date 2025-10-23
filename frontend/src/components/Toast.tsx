import { useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = "success", onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: "bg-green-600",
    error: "bg-red-600",
    info: "bg-blue-600",
  }[type];

  const icon = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  }[type];

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-up">
      <div className={`${bgColor} flex items-center gap-3 rounded-lg px-6 py-4 text-white shadow-2xl`}>
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
          {icon}
        </div>
        <p className="text-base font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
