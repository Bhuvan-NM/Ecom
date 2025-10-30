import React from "react";

interface FilterModalBtnProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  className?: string;
  modalClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

const FilterModalBtn: React.FC<FilterModalBtnProps> = ({
  isOpen,
  onToggle,
  onClose,
  title,
  confirmLabel = "Apply",
  cancelLabel = "Cancel",
  confirmDisabled = false,
  onConfirm,
  className,
  modalClassName,
  contentClassName,
  children,
}) => {
  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="filterModalBtn">
      <button
        type="button"
        onClick={onToggle}
        className={`filterModalBtn__trigger ${className ?? ""}`.trim()}
        aria-expanded={isOpen ? "true" : "false"}
        aria-controls="inventoryFilterModal"
      >
        <span aria-hidden="true">⚙</span>
        <span className="sr-only">Open filters</span>
      </button>
      <span className="filterModalBtn__label">Filters</span>

      {isOpen && (
        <div
          id="inventoryFilterModal"
          role="dialog"
          aria-modal="true"
          className={`filterModalBtn__overlay ${modalClassName ?? ""}`.trim()}
          onClick={onClose}
        >
          <div
            className={`filterModalBtn__content ${contentClassName ?? ""}`.trim()}
            onClick={handleContainerClick}
          >
            <header className="filterModalBtn__header">
              <h2>{title}</h2>
              <button
                type="button"
                className="filterModalBtn__close"
                aria-label="Close filters"
                onClick={onClose}
              >
                ×
              </button>
            </header>

            <div className="filterModalBtn__body">{children}</div>

            <footer className="filterModalBtn__footer">
              <button
                type="button"
                className="filterModalBtn__cancel"
                onClick={onClose}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="filterModalBtn__apply"
                onClick={onConfirm}
                disabled={confirmDisabled}
              >
                {confirmLabel}
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterModalBtn;
