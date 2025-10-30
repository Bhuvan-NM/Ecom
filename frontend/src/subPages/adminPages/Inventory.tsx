import { useMemo, useState, ChangeEvent } from "react";
import api from "../../lib/api";
import InventoryTable from "../../assets/tables/InventoryTable";
import ModalBtn from "../../assets/buttons/modalBtn";

const initialFormState = {
  name: "",
  sku: "",
  quantity: "",
  price: "",
  category: "",
  costPerUnit: "",
};

const InventoryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formValues, setFormValues] = useState(initialFormState);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const isFormValid = useMemo(() => {
    return (
      formValues.name.trim() !== "" &&
      formValues.sku.trim() !== "" &&
      formValues.quantity.trim() !== "" &&
      formValues.price.trim() !== "" &&
      formValues.costPerUnit.trim() !== "" &&
      Number(formValues.quantity) >= 0 &&
      Number(formValues.price) >= 0 &&
      Number(formValues.costPerUnit) >= 0
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

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

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

  return (
    <section className="adminInventory">
      <header className="adminInventory__header">
        <h2 className="adminInventory__title">Inventory</h2>
        <p className="adminInventory__subtitle">
          Manage stock levels, pricing, and availability in real time.
        </p>
      </header>

      <InventoryTable refreshToken={refreshToken} />

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
            <p className="adminInventory_modal__error" role="alert">
              {formError}
            </p>
          )}
        </form>
      </ModalBtn>
    </section>
  );
};

export default InventoryPage;
