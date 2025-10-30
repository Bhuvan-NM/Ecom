// assets/buttons/modalBtn.tsx
import React from "react";

interface ModalBtnProps {
  isOpen: boolean;
  onPress: () => void;
  onClose: () => void;
  title: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLabel?: string;
  isSubmitting?: boolean;
  triggerLabel?: string;
  className?: string;
  modalOpenClass?: string;
  modalContentClass?: string;
  children: React.ReactNode;
}

const ModalBtn: React.FC<ModalBtnProps> = ({
  isOpen,
  onPress,
  onClose,
  title,
  onConfirm,
  confirmDisabled = false,
  confirmLabel = "Save Item",
  isSubmitting = false,
  triggerLabel = title,
  className,
  modalOpenClass,
  modalContentClass,
  children,
}) => {
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <>
      <button
        type="button"
        onClick={onPress}
        className={`adminInventory_modal__trigger ${className ?? ""}`.trim()}
        aria-expanded={isOpen}
        aria-controls="adminInventoryModal"
      >
        <span aria-hidden="true">+</span>
        <span className="sr-only">{triggerLabel}</span>
      </button>

      {isOpen && (
        <div
          id="adminInventoryModal"
          role="dialog"
          aria-modal="true"
          className={`adminInventory_modal adminInventory_modal--open ${modalOpenClass ?? ""}`.trim()}
          onClick={onClose}
        >
          <div
            className={`adminInventory_modal__content ${modalContentClass ?? ""}`.trim()}
            onClick={handleContainerClick}
          >
            <button
              type="button"
              className="adminInventory_modal__close"
              aria-label="Close add item form"
              onClick={onClose}
            >
              ×
            </button>

            <h2 className="adminInventory_modal__title">{title}</h2>
            {children}

            <div className="adminInventory_modal__actions">
              <button
                type="button"
                className="adminInventory_modal__actions-cancel"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="adminInventory_modal__actions-confirm"
                onClick={onConfirm}
                disabled={confirmDisabled || isSubmitting}
              >
                {isSubmitting ? "Saving…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalBtn;
