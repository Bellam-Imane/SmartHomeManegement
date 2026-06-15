import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Pencil, Trash2, X, AlertTriangle, Loader2 } from 'lucide-react';

/**
 * DeviceMenu — Reusable dropdown for device cards with Edit & Delete actions.
 * 
 * Props:
 *   - onEdit: () => void — called when Edit is clicked (opens edit modal in parent)
 *   - onDelete: () => Promise<void> — async function called after user confirms deletion
 *   - deviceName: string — used in confirm dialog text
 *   - dark?: boolean — if true, uses light icons/text on dark backgrounds (for CameraCard)
 *   - disabled?: boolean — disables the menu trigger
 */
const DeviceMenu = ({ onEdit, onDelete, deviceName, dark = false, disabled = false }) => {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef(null);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleDeleteClick = () => {
    setConfirming(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      // Error is handled by parent (toast)
    } finally {
      setDeleting(false);
      setConfirming(false);
      setOpen(false);
    }
  };

  const handleCancel = () => {
    setConfirming(false);
    setOpen(false);
  };

  const handleEditClick = () => {
    setOpen(false);
    onEdit();
  };

  // Color scheme
  const triggerClass = dark
    ? 'text-white bg-black/30 hover:bg-black/50'
    : 'text-gray-700 hover:bg-black/5';

  const dropdownBg = 'bg-white border border-gray-100 shadow-xl';

  return (
    <div ref={menuRef} className="relative inline-block">
      {/* Trigger button */}
      <button
        onClick={() => !disabled && !deleting && setOpen(prev => !prev)}
        disabled={disabled || deleting}
        className={`p-1.5 rounded-full transition-colors cursor-pointer ${triggerClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Menu"
      >
        <MoreVertical size={dark ? 14 : 18} />
      </button>

      {/* Dropdown */}
      {open && !confirming && (
        <div className={`absolute right-0 top-full mt-1 w-48 rounded-2xl ${dropdownBg} z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150`}>
          <button
            onClick={handleEditClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Pencil size={15} className="text-gray-400" />
            Modifier
          </button>
          <div className="border-t border-gray-100" />
          <button
            onClick={handleDeleteClick}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <Trash2 size={15} className="text-red-400" />
            Supprimer
          </button>
        </div>
      )}

      {/* Confirm dialog */}
      {open && confirming && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[300]">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Supprimer l'appareil</h3>
                <p className="text-xs text-gray-400 mt-0.5">Cette action est irréversible.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Voulez-vous vraiment supprimer <strong>"{deviceName}"</strong> ? 
              Il sera définitivement retiré de cette pièce.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Supprimer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceMenu;
