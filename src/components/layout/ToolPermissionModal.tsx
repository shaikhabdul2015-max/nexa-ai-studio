import React from "react";
import { useApp } from "../../context/AppContext";
import { ShieldAlert, Check, X, AlertTriangle } from "lucide-react";

export const ToolPermissionModal: React.FC = () => {
  const { permissionModal, respondPermission } = useApp();

  if (!permissionModal) return null;

  return (
    <div
      id="tool-permission-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div
        id="tool-permission-dialog"
        className="w-full max-w-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              AI Action Authorization Required
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              An agent or model has requested permission to invoke an external capability.
            </p>
          </div>
        </div>

        <div className="space-y-3 my-4">
          {/* What will happen? */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              What will happen?
            </h4>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {permissionModal.actionDescription}
            </p>
          </div>

          {/* What data will be used? */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800">
            <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              What data will be used?
            </h4>
            <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 break-all leading-relaxed">
              {permissionModal.dataToUse}
            </p>
          </div>

          {/* Audit trail notice */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>This action will be logged in your secure activity audit trail.</span>
          </div>
        </div>

        {/* Allow / Cancel buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <button
            id="tool-permission-cancel-btn"
            onClick={() => respondPermission(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            id="tool-permission-allow-btn"
            onClick={() => respondPermission(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-sm"
          >
            <Check className="w-3.5 h-3.5" />
            Allow Action
          </button>
        </div>
      </div>
    </div>
  );
};
