import React, { ChangeEvent, useEffect, useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import api from "../../lib/api";
import AtomLoading from "../../assets/loading/AtomLodingIndicator";

type Item = {
  _id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  quantity: number;
  discount?: number;
  supplier?: {
    name?: string;
    contact?: string;
    costPerUnit?: number;
  };
  lastRestocked?: string;
  lastUpdated: string;
};

export type InventoryItem = Item;

const columnHelper = createColumnHelper<Item>();

const LOW_STOCK_THRESHOLD = 100;
const MEDIUM_STOCK_THRESHOLD = 200;

type FilterState = {
  search: string;
  category: string;
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
};

const filterDefaults: FilterState = {
  search: "",
  category: "all",
  priceMin: "",
  priceMax: "",
  dateFrom: "",
  dateTo: "",
};

const createDefaultFilters = (): FilterState => ({ ...filterDefaults });

const normalizeFilters = (filters: FilterState): FilterState => ({
  search: filters.search.trim(),
  category: filters.category || "all",
  priceMin: filters.priceMin.trim(),
  priceMax: filters.priceMax.trim(),
  dateFrom: filters.dateFrom,
  dateTo: filters.dateTo,
});

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

const getStockLevel = (quantity: number) => {
  if (quantity < LOW_STOCK_THRESHOLD) return "low";
  if (quantity <= MEDIUM_STOCK_THRESHOLD) return "medium";
  return "high";
};

interface InventoryTableProps {
  refreshToken?: number;
  onRowClick?: (item: InventoryItem) => void;
  onRestockClick?: (item: InventoryItem) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({
  refreshToken = 0,
  onRowClick,
  onRestockClick,
}) => {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterDraft, setFilterDraft] = useState<FilterState>(() =>
    createDefaultFilters()
  );
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() =>
    createDefaultFilters()
  );
  const [sort, setSort] = useState("name");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        setError(null);
        const res = await api.get("/api/inventory");
        const items = res.data?.items ?? [];
        setAllItems(items);
      } catch (err) {
        console.error("❌ Error fetching inventory:", err);
        setError("Unable to load inventory. Please try again later.");
        setAllItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshToken]);

  const handleSortClick = (columnId: string) => {
    if (sort === columnId) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(columnId);
      setOrder("asc");
    }
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFilterDraft((prev) => ({ ...prev, category: value }));
  };

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilterDraft((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFilterDraft((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    const defaults = createDefaultFilters();
    setFilterDraft(defaults);
    setAppliedFilters(defaults);
    setPageIndex(1);
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number(event.target.value) || 10;
    setPageSize(nextSize);
    setPageIndex(1);
  };

  const handlePrevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setPageIndex((prev) => Math.min(prev + 1, totalPages));
  };

  const categorySelectOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        allItems
          .map((item) => item.category)
          .filter((category): category is string => Boolean(category))
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...categories];
  }, [allItems]);

  const normalizedDraft = useMemo(
    () => normalizeFilters(filterDraft),
    [filterDraft]
  );

  const filtersActive =
    appliedFilters.category !== "all" ||
    appliedFilters.priceMin !== "" ||
    appliedFilters.priceMax !== "" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.search !== "";

  const hasPendingChanges =
    normalizedDraft.search !== appliedFilters.search ||
    normalizedDraft.category !== appliedFilters.category ||
    normalizedDraft.priceMin !== appliedFilters.priceMin ||
    normalizedDraft.priceMax !== appliedFilters.priceMax ||
    normalizedDraft.dateFrom !== appliedFilters.dateFrom ||
    normalizedDraft.dateTo !== appliedFilters.dateTo;

  const handleApplyFilters = () => {
    if (!hasPendingChanges) return;
    const nextFilters = normalizeFilters(filterDraft);
    setFilterDraft(nextFilters);
    setAppliedFilters(nextFilters);
    setPageIndex(1);
  };

  const handleFilterButtonClick = () => {
    if (hasPendingChanges) {
      handleApplyFilters();
    } else if (filtersActive) {
      clearFilters();
    }
  };

  useEffect(() => {
    const normalizedSearch = appliedFilters.search.toLowerCase();
    const filtered = allItems.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.name?.toLowerCase().includes(normalizedSearch) ||
        item.sku?.toLowerCase().includes(normalizedSearch) ||
        item.category?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        appliedFilters.category === "all" ||
        item.category === appliedFilters.category;

      const matchesPrice = (() => {
        const min = appliedFilters.priceMin
          ? Number(appliedFilters.priceMin)
          : undefined;
        const max = appliedFilters.priceMax
          ? Number(appliedFilters.priceMax)
          : undefined;
        if (min !== undefined && item.price < min) return false;
        if (max !== undefined && item.price > max) return false;
        return true;
      })();

      const matchesDate = (() => {
        const itemDate = item.lastUpdated
          ? new Date(item.lastUpdated)
          : item.lastRestocked
          ? new Date(item.lastRestocked)
          : null;
        if (!itemDate || Number.isNaN(itemDate.getTime())) return true;

        if (appliedFilters.dateFrom) {
          const from = new Date(appliedFilters.dateFrom);
          if (!Number.isNaN(from.getTime()) && itemDate < from) return false;
        }
        if (appliedFilters.dateTo) {
          const to = new Date(appliedFilters.dateTo);
          if (!Number.isNaN(to.getTime())) {
            to.setHours(23, 59, 59, 999);
            if (itemDate > to) return false;
          }
        }
        return true;
      })();

      return matchesSearch && matchesCategory && matchesPrice && matchesDate;
    });

    const compare = (a: Item, b: Item) => {
      const key = sort as keyof Item;
      const getValue = (item: Item) => {
        switch (key) {
          case "price":
          case "quantity":
          case "discount":
            return Number(item[key] ?? 0);
          case "lastUpdated":
          case "lastRestocked":
            return item[key] ? new Date(item[key]!).getTime() : 0;
          default:
            return (item[key] ?? "").toString().toLowerCase();
        }
      };

      const aVal = getValue(a);
      const bVal = getValue(b);
      if (aVal === bVal) return 0;
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return aVal - bVal;
      }
      return aVal > bVal ? 1 : -1;
    };

    const sorted = [...filtered].sort(compare);
    if (order === "desc") sorted.reverse();

    const total = sorted.length;
    setTotalCount(total);

    const nextTotalPages = Math.max(1, Math.ceil(total / pageSize));
    setTotalPages(nextTotalPages);

    let safePage = pageIndex;
    if (safePage > nextTotalPages) {
      safePage = nextTotalPages;
      setPageIndex(nextTotalPages);
    }

    const start = (safePage - 1) * pageSize;
    const paginated = sorted.slice(start, start + pageSize);
    setData(paginated);
  }, [allItems, appliedFilters, pageIndex, pageSize, sort, order]);

  const canPrev = pageIndex > 1;
  const canNext = pageIndex < totalPages;
  const startRow = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const endRow =
    totalCount === 0 ? 0 : Math.min(pageIndex * pageSize, totalCount);

  const tableColumns = useMemo(
    () => [
      columnHelper.accessor("sku", { header: "SKU" }),
      columnHelper.accessor("name", { header: "Item Name" }),
      columnHelper.accessor("category", { header: "Category" }),
      columnHelper.accessor("price", {
        header: "Price ($)",
        cell: (info) => `$${info.getValue().toFixed(2)}`,
      }),
      columnHelper.accessor("quantity", {
        header: "Stock",
        cell: (info) => {
          const quantity = info.getValue();
          const item = info.row.original;
          const stockLevel = getStockLevel(quantity);
          const shouldShowRestock =
            stockLevel === "low" && typeof onRestockClick === "function";

          return (
            <div className="adminInventory__stockCell">
              <span
                className={`adminInventory__stockIndicator adminInventory__stockIndicator--${stockLevel}`}
              >
                {quantity}
              </span>
              {shouldShowRestock && (
                <button
                  type="button"
                  className="adminInventory__restockBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRestockClick(item);
                  }}
                >
                  Restock
                </button>
              )}
            </div>
          );
        },
      }),
      columnHelper.accessor("discount", {
        header: "Discount (%)",
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) return "—";
          const numeric = Number(value);
          if (Number.isNaN(numeric)) return "—";
          return `${numeric.toFixed(1)}%`;
        },
      }),
      columnHelper.accessor("lastRestocked", {
        header: "Last Restocked",
        cell: (info) => formatDate(info.getValue() as string | Date | null),
      }),
      columnHelper.accessor("lastUpdated", {
        header: "Last Updated",
        cell: (info) => formatDate(info.getValue() as string | Date | null),
      }),
    ],
    [onRestockClick]
  );

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (loading) {
    return (
      <div className="adminInventory__loading">
        <AtomLoading size="large" />
      </div>
    );
  }

  if (error) {
    return <p className="adminInventory__error">{error}</p>;
  }

  if (!data.length) {
    return <p className="adminInventory__empty">No inventory items found.</p>;
  }

  return (
    <div className="adminInventory__tableWrapper">
      <div className="adminInventory__controls">
        <div className="adminInventory__searchWrapper">
          <label
            htmlFor="inventory-search"
            className="sr-only"
          >
            Search inventory items
          </label>
          <input
            type="text"
            id="inventory-search"
            placeholder="Search items..."
            value={filterDraft.search}
            onChange={(e) =>
              setFilterDraft((prev) => ({ ...prev, search: e.target.value }))
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleApplyFilters();
              }
            }}
            className="adminInventory__search"
          />
        </div>

        <div className="adminInventory__filters">
          <div className="adminInventory__filter adminInventory__filter--category">
            <label htmlFor="inventory-filter-category">Category</label>
            <select
              id="inventory-filter-category"
              value={filterDraft.category}
              onChange={handleCategoryChange}
              className="adminInventory__categorySelect"
            >
              {categorySelectOptions.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  {option === "all" ? "All categories" : option}
                </option>
              ))}
            </select>
          </div>

          <div className="adminInventory__filterGroup">
            <label>Price Range ($)</label>
            <div className="adminInventory__filterInputs">
              <label
                htmlFor="inventory-price-min"
                className="sr-only"
              >
                Minimum price
              </label>
              <input
                type="number"
                name="priceMin"
                min="0"
                placeholder="Min"
                id="inventory-price-min"
                value={filterDraft.priceMin}
                onChange={handlePriceChange}
              />
              <span aria-hidden="true">to</span>
              <label
                htmlFor="inventory-price-max"
                className="sr-only"
              >
                Maximum price
              </label>
              <input
                type="number"
                name="priceMax"
                min="0"
                placeholder="Max"
                id="inventory-price-max"
                value={filterDraft.priceMax}
                onChange={handlePriceChange}
              />
            </div>
          </div>

          <div className="adminInventory__filterGroup">
            <label>Date Range</label>
            <div className="adminInventory__filterInputs">
              <label
                htmlFor="inventory-date-from"
                className="sr-only"
              >
                Start date
              </label>
              <input
                type="date"
                name="dateFrom"
                id="inventory-date-from"
                value={filterDraft.dateFrom}
                onChange={handleDateChange}
              />
              <span aria-hidden="true">to</span>
              <label
                htmlFor="inventory-date-to"
                className="sr-only"
              >
                End date
              </label>
              <input
                type="date"
                name="dateTo"
                id="inventory-date-to"
                value={filterDraft.dateTo}
                onChange={handleDateChange}
              />
            </div>
          </div>

          <button
            type="button"
            className="adminInventory__filterReset"
            onClick={handleFilterButtonClick}
            disabled={!filtersActive && !hasPendingChanges}
          >
            {hasPendingChanges
              ? "Apply filters"
              : filtersActive
              ? "Clear filters"
              : "Apply filters"}
          </button>
        </div>
      </div>

      <table className="adminInventory__table">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  onClick={() => handleSortClick(header.column.id)}
                  className="adminInventory__tableHeader"
                >
                  <span className="adminInventory__headerContent">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {sort === header.column.id && (
                      <span className="adminInventory__sortIndicator">
                        {order === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={`adminInventory__tableRow ${
                onRowClick ? "adminInventory__tableRow--interactive" : ""
              }`}
              onClick={() => onRowClick?.(row.original)}
              tabIndex={onRowClick ? 0 : undefined}
              aria-label={
                onRowClick
                  ? `View item ${row.original.name ?? row.original.sku}`
                  : undefined
              }
              onKeyDown={(event) => {
                if (!onRowClick) return;
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onRowClick(row.original);
                }
              }}
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

      <div className="adminInventory__tableFooter">
        <div className="adminInventory__paginationInfo">
          {totalCount > 0
            ? `Showing ${startRow}-${endRow} of ${totalCount}`
            : "No results"}
        </div>

        <div className="adminInventory__paginationControls">
          <label
            htmlFor="inventory-page-size"
            className="adminInventory__pageSizeLabel"
          >
            Rows per page
          </label>
          <select
            id="inventory-page-size"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="adminInventory__pageSizeSelect"
          >
            {[10, 25, 50, 100].map((size) => (
              <option
                key={size}
                value={size}
              >
                {size}
              </option>
            ))}
          </select>

          <div className="adminInventory__pageButtons">
            <button
              type="button"
              onClick={handlePrevPage}
              className="adminInventory__pageButton"
              disabled={!canPrev}
            >
              Prev
            </button>
            <span className="adminInventory__pageStatus">
              Page {pageIndex} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              onClick={handleNextPage}
              className="adminInventory__pageButton"
              disabled={!canNext}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
