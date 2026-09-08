import React from "react";
import { useApp } from "../../context/AppContext";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export const Notifications: React.FC = () => {
  const { notifications, dismissNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div
      id="notifications-toast-stack"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {notifications.map((notif) => {
        const icons = {
          success: <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />,
          warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
          error: <XCircle className="w-4 h-4 text-rose-500 shrink-0" />,
          info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
        };

        return (
          <div
            key={notif.id}
            id={`toast-${notif.id}`}
            className="pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl text-xs animate-in slide-in-from-bottom-2 fade-in duration-200"
          >
            <div className="flex items-start gap-2.5">
              {icons[notif.type]}
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white">
                  {notif.title}
                </p>
                <p className="text-neutral-500 dark:text-neutral-400 mt-0.5 leading-relaxed">
                  {notif.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
