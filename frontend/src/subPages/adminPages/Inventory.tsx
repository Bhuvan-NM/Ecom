import { useMemo, useState, ChangeEvent } from "react";
import api from "../../lib/api";
import InventoryTable, {
  InventoryItem,
} from "../../assets/tables/InventoryTable";
import ModalBtn from "../../assets/buttons/ModalBtn";

const initialFormState = {
  name: "",
  sku: "",
  quantity: "",
  price: "",
  category: "",
  costPerUnit: "",
  discount: "0",
};

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormValues, setEditFormValues] = useState(initialFormState);
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [restockError, setRestockError] = useState<string | null>(null);
  const [isRestockSubmitting, setIsRestockSubmitting] = useState(false);
  const [restockValues, setRestockValues] = useState({
    quantityAdded: "",
    costPerUnit: "",
  });

  const isFormValid = useMemo(() => {
    return (
      formValues.name.trim() !== "" &&
      formValues.sku.trim() !== "" &&
      formValues.quantity.trim() !== "" &&
      formValues.price.trim() !== "" &&
      formValues.costPerUnit.trim() !== "" &&
      formValues.discount.trim() !== "" &&
      Number(formValues.quantity) >= 0 &&
      Number(formValues.price) >= 0 &&
      Number(formValues.costPerUnit) >= 0 &&
      Number(formValues.discount) >= 0
    );
  }, [formValues]);

  const handleOpen = () => {
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setFormError(null);
    setFormValues(initialFormState);
  };

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const isEditFormValid = useMemo(() => {
    return (
      editFormValues.name.trim() !== "" &&
      editFormValues.sku.trim() !== "" &&
      editFormValues.quantity.trim() !== "" &&
      editFormValues.price.trim() !== "" &&
      editFormValues.costPerUnit.trim() !== "" &&
      editFormValues.discount.trim() !== "" &&
      Number(editFormValues.quantity) >= 0 &&
      Number(editFormValues.price) >= 0 &&
      Number(editFormValues.costPerUnit) >= 0 &&
      Number(editFormValues.discount) >= 0
    );
  }, [editFormValues]);

  const handleConfirm = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        name: formValues.name.trim(),
        sku: formValues.sku.trim(),
        quantity: Number(formValues.quantity),
        price: Number(formValues.price),
        category: formValues.category.trim() || undefined,
        supplier: {
          costPerUnit: Number(formValues.costPerUnit),
        },
        discount: Number(formValues.discount) || 0,
      };

      await api.post("/api/inventory", payload);
      setRefreshToken((token) => token + 1);
      handleClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to create item. Please try again.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestockOpen = (item: InventoryItem) => {
    setRestockItem(item);
    setRestockError(null);
    setRestockValues({
      quantityAdded: "",
      costPerUnit:
        item.supplier?.costPerUnit != null
          ? String(item.supplier.costPerUnit)
          : "",
    });
    setIsRestockModalOpen(true);
  };

  const handleRestockClose = () => {
    setIsRestockModalOpen(false);
    setRestockItem(null);
    setRestockError(null);
    setRestockValues({
      quantityAdded: "",
      costPerUnit: "",
    });
  };

  const isRestockValid = useMemo(() => {
    return (
      restockValues.quantityAdded.trim() !== "" &&
      Number(restockValues.quantityAdded) > 0 &&
      (restockValues.costPerUnit.trim() === "" ||
        Number(restockValues.costPerUnit) >= 0)
    );
  }, [restockValues]);

  const handleRestockChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setRestockValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRestockConfirm = async () => {
    if (!restockItem || !isRestockValid || isRestockSubmitting) return;

    setIsRestockSubmitting(true);
    setRestockError(null);

    try {
      const payload: Record<string, unknown> = {
        itemId: restockItem._id,
        sku: restockItem.sku,
        quantityAdded: Number(restockValues.quantityAdded),
      };

      const costPerUnit =
        restockValues.costPerUnit.trim() !== ""
          ? Number(restockValues.costPerUnit)
          : restockItem.supplier?.costPerUnit ?? 0;

      payload.costPerUnit = costPerUnit;

      payload.supplier = {
        ...(restockItem.supplier ?? {}),
        costPerUnit,
      };

      await api.post("/api/inventory/restock", payload);
      setRefreshToken((token) => token + 1);
      handleRestockClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to restock item. Please try again.";
      setRestockError(message);
    } finally {
      setIsRestockSubmitting(false);
    }
  };

  const handleEditOpen = (item: InventoryItem) => {
    setEditingItem(item);
    setEditFormError(null);
    setEditFormValues({
      name: item.name ?? "",
      sku: item.sku ?? "",
      quantity: item.quantity != null ? String(item.quantity) : "",
      price: item.price != null ? String(item.price) : "",
      category: item.category ?? "",
      costPerUnit:
        item.supplier?.costPerUnit != null
          ? String(item.supplier.costPerUnit)
          : "",
      discount: item.discount != null ? String(item.discount) : "0",
    });
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
    setEditFormError(null);
    setEditFormValues(initialFormState);
  };

  const handleEditChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setEditFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditConfirm = async () => {
    if (!editingItem || !isEditFormValid || isEditSubmitting) return;

    setIsEditSubmitting(true);
    setEditFormError(null);

    try {
      const payload = {
        name: editFormValues.name.trim(),
        sku: editFormValues.sku.trim(),
        quantity: Number(editFormValues.quantity),
        price: Number(editFormValues.price),
        category: editFormValues.category.trim() || undefined,
        supplier: {
          ...(editingItem.supplier ?? {}),
          costPerUnit: Number(editFormValues.costPerUnit),
        },
        discount: Number(editFormValues.discount) || 0,
      };

      await api.put(`/api/inventory/${editingItem._id}`, payload);
      setRefreshToken((token) => token + 1);
      handleEditClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to update item. Please try again.";
      setEditFormError(message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editingItem || isDeleteSubmitting) return;
    const confirmDelete = window.confirm(
      `Delete ${editingItem.name}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    setIsDeleteSubmitting(true);
    setEditFormError(null);

    try {
      await api.delete(`/api/inventory/${editingItem._id}`);
      setRefreshToken((token) => token + 1);
      handleEditClose();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to delete item. Please try again.";
      setEditFormError(message);
    } finally {
      setIsDeleteSubmitting(false);
    }
  };

  return (
    <section className="adminInventory">
      <header className="adminInventory__header">
        <h2 className="adminInventory__title">Inventory</h2>
        <p className="adminInventory__subtitle">
          Manage stock levels, pricing, and availability in real time.
        </p>
      </header>

      <InventoryTable
        refreshToken={refreshToken}
        onRowClick={handleEditOpen}
        onRestockClick={handleRestockOpen}
      />

      <ModalBtn
        isOpen={isModalOpen}
        onPress={handleOpen}
        onClose={handleClose}
        title="Add New Inventory Item"
        onConfirm={handleConfirm}
        confirmDisabled={!isFormValid}
        isSubmitting={isSubmitting}
      >
        <form
          className="adminInventory_modal__form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="adminInventory_modal__formGroup">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              placeholder="Wireless Mouse"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="sku">SKU</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={formValues.sku}
              onChange={handleChange}
              placeholder="WM-1001"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="0"
              value={formValues.quantity}
              onChange={handleChange}
              placeholder="50"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="price">Price ($)</label>
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              min="0"
              value={formValues.price}
              onChange={handleChange}
              placeholder="199.99"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="costPerUnit">Cost per Unit ($)</label>
            <input
              type="number"
              step="0.01"
              id="costPerUnit"
              name="costPerUnit"
              min="0"
              value={formValues.costPerUnit}
              onChange={handleChange}
              placeholder="120.00"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="discount">Discount (%)</label>
            <input
              type="number"
              step="0.01"
              id="discount"
              name="discount"
              min="0"
              value={formValues.discount}
              onChange={handleChange}
              placeholder="5"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formValues.category}
              onChange={handleChange}
              placeholder="Electronics"
            />
          </div>
          {formError && (
            <p
              className="adminInventory_modal__error"
              role="alert"
            >
              {formError}
            </p>
          )}
        </form>
      </ModalBtn>

      <ModalBtn
        hideTrigger
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        title={editingItem ? `Edit ${editingItem.name}` : "Edit Item"}
        onConfirm={handleEditConfirm}
        confirmDisabled={!isEditFormValid}
        isSubmitting={isEditSubmitting}
        confirmLabel="Update Item"
        footerLeft={
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleteSubmitting}
          >
            {isDeleteSubmitting ? "Deleting…" : "Delete Item"}
          </button>
        }
      >
        <form
          className="adminInventory_modal__form"
          onSubmit={(event) => event.preventDefault()}
        >
          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-name">Item Name</label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={editFormValues.name}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-sku">SKU</label>
            <input
              type="text"
              id="edit-sku"
              name="sku"
              value={editFormValues.sku}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-quantity">Quantity</label>
            <input
              type="number"
              id="edit-quantity"
              name="quantity"
              min="0"
              value={editFormValues.quantity}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-price">Price ($)</label>
            <input
              type="number"
              step="0.01"
              id="edit-price"
              name="price"
              min="0"
              value={editFormValues.price}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-costPerUnit">Cost per Unit ($)</label>
            <input
              type="number"
              step="0.01"
              id="edit-costPerUnit"
              name="costPerUnit"
              min="0"
              value={editFormValues.costPerUnit}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-discount">Discount (%)</label>
            <input
              type="number"
              step="0.01"
              id="edit-discount"
              name="discount"
              min="0"
              value={editFormValues.discount}
              onChange={handleEditChange}
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="edit-category">Category</label>
            <input
              type="text"
              id="edit-category"
              name="category"
              value={editFormValues.category}
              onChange={handleEditChange}
            />
          </div>

          {editFormError && (
            <p
              className="adminInventory_modal__error"
              role="alert"
            >
              {editFormError}
            </p>
          )}
        </form>
      </ModalBtn>

      <ModalBtn
        hideTrigger
        isOpen={isRestockModalOpen}
        onClose={handleRestockClose}
        title={
          restockItem ? `Restock ${restockItem.name}` : "Restock Inventory Item"
        }
        onConfirm={handleRestockConfirm}
        confirmDisabled={!isRestockValid}
        isSubmitting={isRestockSubmitting}
        confirmLabel="Apply Restock"
      >
        <form
          className="adminInventory_modal__form"
          onSubmit={(event) => event.preventDefault()}
        >
          {restockItem && (
            <p className="adminInventory_modal__hint">
              Current stock: <strong>{restockItem.quantity}</strong> units
            </p>
          )}

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="restock-quantity">Quantity to Add</label>
            <input
              type="number"
              id="restock-quantity"
              name="quantityAdded"
              min="1"
              value={restockValues.quantityAdded}
              onChange={handleRestockChange}
              placeholder="25"
              required
            />
          </div>

          <div className="adminInventory_modal__formGroup">
            <label htmlFor="restock-costPerUnit">Cost per Unit ($)</label>
            <input
              type="number"
              step="0.01"
              id="restock-costPerUnit"
              name="costPerUnit"
              min="0"
              value={restockValues.costPerUnit}
              onChange={handleRestockChange}
              placeholder="120.00"
            />
          </div>

          {restockError && (
            <p
              className="adminInventory_modal__error"
              role="alert"
            >
              {restockError}
            </p>
          )}
        </form>
      </ModalBtn>
    </section>
  );
};

export default InventoryPage;
