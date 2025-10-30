import InventoryTable from "../../assets/tables/InventoryTable";

const InventoryPage = () => (
  <section className="adminInventory">
    <header className="adminInventory__header">
      <h2 className="adminInventory__title">Inventory</h2>
      <p className="adminInventory__subtitle">
        Manage stock levels, pricing, and availability in real time.
      </p>
    </header>
    <InventoryTable />
  </section>
);

export default InventoryPage;
