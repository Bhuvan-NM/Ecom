import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";

type Item = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  lastUpdated: string;
};

const columnHelper = createColumnHelper<Item>();

const columns = [
  columnHelper.accessor("sku", { header: "SKU" }),
  columnHelper.accessor("name", { header: "Item Name" }),
  columnHelper.accessor("category", { header: "Category" }),
  columnHelper.accessor("price", {
    header: "Price ($)",
    cell: (info) => `$${info.getValue().toFixed(2)}`,
  }),
  columnHelper.accessor("quantity", { header: "Stock" }),
  columnHelper.accessor("lastUpdated", {
    header: "Last Updated",
    cell: (info) => new Date(info.getValue()).toLocaleDateString(),
  }),
];

const InventoryTable: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const res = await api.get("/api/inventory", {
          params: { search, sort, order },
        });
        setData(res.data.items ?? []);
      } catch (err) {
        console.error("❌ Error fetching inventory:", err);
        setError("Unable to load inventory. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [search, sort, order]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) return <p>Loading inventory...</p>;

  if (error) {
    return <p className="adminInventory__error">{error}</p>;
  }

  if (!data.length) {
    return <p className="adminInventory__empty">No inventory items found.</p>;
  }

  return (
    <div className="adminInventory__tableWrapper">
      <div className="adminInventory__controls">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="adminInventory__search"
        />
      </div>

      {/* Table */}
      <table className="adminInventory__table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={() => {
                    if (sort === header.column.id)
                      setOrder(order === "asc" ? "desc" : "asc");
                    setSort(header.column.id);
                  }}
                  className="border-b p-3 cursor-pointer select-none"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {sort === header.column.id &&
                    (order === "asc" ? " 🔼" : " 🔽")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-gray-50"
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="p-3 border-b"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
