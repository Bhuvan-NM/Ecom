import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import api from "../../lib/api";
import AtomLoading from "../../assets/loading/AtomLodingIndicator";
import FilterModalBtn from "../../assets/buttons/FilterModalBtn";

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
  stockLevel: "all" | "low" | "medium" | "high";
  priceMin: string;
  priceMax: string;
  dateFrom: string;
  dateTo: string;
};

const filterDefaults: FilterState = {
  search: "",
  category: "all",
  stockLevel: "all",
  priceMin: "",
  priceMax: "",
  dateFrom: "",
  dateTo: "",
};

const createDefaultFilters = (): FilterState => ({ ...filterDefaults });

const normalizeFilters = (filters: FilterState): FilterState => ({
  search: filters.search.trim(),
  category: filters.category || "all",
  stockLevel: filters.stockLevel || "all",
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
  const [rows, setRows] = useState<Item[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
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
  const [pageIndex, setPageIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (filtersOpen) {
      setFilterDraft(appliedFilters);
    }
  }, [filtersOpen, appliedFilters]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    try {
      setError(null);

  const params: Record<string, string | number> = {
    page: pageIndex + 1,
    limit: pageSize,
    sort,
    order,
  };

      const { search, category, stockLevel, priceMin, priceMax, dateFrom, dateTo } =
        appliedFilters;

      if (search) params.search = search;
      if (category && category !== "all") params.category = category;
      if (stockLevel && stockLevel !== "all") params.stockLevel = stockLevel;
      if (priceMin) params.priceMin = priceMin;
      if (priceMax) params.priceMax = priceMax;
      if (dateFrom) params.dateFrom = dateFrom;
      if (dateTo) params.dateTo = dateTo;

      const res = await api.get("/api/inventory", { params });
      const items: Item[] = Array.isArray(res.data?.items)
        ? res.data.items
        : [];
      const nextTotalCount = Number(res.data?.totalCount ?? items.length);
      const rawTotalPages = Number(res.data?.totalPages);
      const computedTotalPages =
        Number.isFinite(rawTotalPages) && rawTotalPages > 0
          ? rawTotalPages
          : nextTotalCount === 0
          ? 1
          : Math.max(Math.ceil(nextTotalCount / pageSize), 1);

      if (computedTotalPages > 0 && pageIndex + 1 > computedTotalPages) {
        setTotalCount(nextTotalCount);
        setTotalPages(computedTotalPages);
        setAvailableCategories(res.data?.categories ?? []);
        setRows(items);
        setPageIndex(Math.max(computedTotalPages - 1, 0));
        return;
      }

      setRows(items);
      setTotalCount(nextTotalCount);
      setTotalPages(computedTotalPages);
      setAvailableCategories(res.data?.categories ?? []);
    } catch (err) {
      console.error("❌ Error fetching inventory:", err);
      setError("Unable to load inventory. Please try again later.");
      setRows([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [
    appliedFilters,
    order,
    pageIndex,
    pageSize,
    sort,
    refreshToken,
  ]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSortClick = (columnId: string) => {
    if (sort === columnId) {
      setOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSort(columnId);
      setOrder("asc");
    }
    setPageIndex(0);
  };

  const handleCategoryChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFilterDraft((prev) => ({ ...prev, category: value }));
  };

  const handleStockLevelChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setFilterDraft((prev) => ({ ...prev, stockLevel: value as FilterState["stockLevel"] }));
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
    setPageIndex(0);
    setFiltersOpen(false);
  };

  const handlePageSizeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextSize = Number(event.target.value) || 10;
    setPageSize(nextSize);
    setPageIndex(0);
  };

  const handlePrevPage = () => {
    setPageIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setPageIndex((prev) => {
      const maxIndex = Math.max(totalPages - 1, 0);
      return Math.min(prev + 1, maxIndex);
    });
  };

  const normalizedDraft = useMemo(
    () => normalizeFilters(filterDraft),
    [filterDraft]
  );

  const filtersActive =
    appliedFilters.category !== "all" ||
    appliedFilters.stockLevel !== "all" ||
    appliedFilters.priceMin !== "" ||
    appliedFilters.priceMax !== "" ||
    appliedFilters.dateFrom !== "" ||
    appliedFilters.dateTo !== "" ||
    appliedFilters.search !== "";

  const hasPendingChanges =
    normalizedDraft.search !== appliedFilters.search ||
    normalizedDraft.category !== appliedFilters.category ||
    normalizedDraft.stockLevel !== appliedFilters.stockLevel ||
    normalizedDraft.priceMin !== appliedFilters.priceMin ||
    normalizedDraft.priceMax !== appliedFilters.priceMax ||
    normalizedDraft.dateFrom !== appliedFilters.dateFrom ||
    normalizedDraft.dateTo !== appliedFilters.dateTo;

  const handleApplyFilters = () => {
    if (!hasPendingChanges) return;
    const nextFilters = normalizeFilters(filterDraft);
    setFilterDraft(nextFilters);
    setAppliedFilters(nextFilters);
    setPageIndex(0);
    setFiltersOpen(false);
  };

  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(pageIndex + 1, safeTotalPages);
  const canPrev = currentPage > 1;
  const canNext = totalCount > 0 && currentPage < safeTotalPages;
  const startRow =
    totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow =
    totalCount === 0
      ? 0
      : Math.min(startRow + rows.length - 1, totalCount);
  const displayPage = totalCount === 0 ? 1 : currentPage;

  const categorySelectOptions = useMemo(() => {
    const base = availableCategories
      .filter(Boolean)
      .map((category) => category.toString())
      .sort((a, b) => a.localeCompare(b));

    if (
      appliedFilters.category &&
      appliedFilters.category !== "all" &&
      !base.includes(appliedFilters.category)
    ) {
      base.push(appliedFilters.category);
      base.sort((a, b) => a.localeCompare(b));
    }

    return ["all", ...base];
  }, [availableCategories, appliedFilters.category]);

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
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
          <FilterModalBtn
            isOpen={filtersOpen}
            onToggle={() => setFiltersOpen((prev) => !prev)}
            onClose={() => {
              setFiltersOpen(false);
              setFilterDraft(appliedFilters);
            }}
            title="Inventory Filters"
            confirmLabel={hasPendingChanges ? "Apply" : "Close"}
            confirmDisabled={false}
            onConfirm={hasPendingChanges ? handleApplyFilters : () => setFiltersOpen(false)}
            className={filtersActive ? "filterModalBtn__trigger--active" : undefined}
          >
            <div className="adminInventory__filtersModal">
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

              <div className="adminInventory__filter adminInventory__filter--stock">
                <label htmlFor="inventory-filter-stock">Stock Level</label>
                <select
                  id="inventory-filter-stock"
                  value={filterDraft.stockLevel}
                  onChange={handleStockLevelChange}
                  className="adminInventory__categorySelect"
                >
                  <option value="all">All stock levels</option>
                  <option value="low">Low (&lt; 100)</option>
                  <option value="medium">Medium (100-200)</option>
                  <option value="high">High (&gt; 200)</option>
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
                onClick={clearFilters}
                disabled={!filtersActive && !hasPendingChanges}
              >
                {filtersActive || hasPendingChanges ? "Clear filters" : "No filters applied"}
              </button>
            </div>
          </FilterModalBtn>
        </div>
      </div>

      <div className="adminInventory__tableScroll">
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
            {!table.getRowModel().rows.length && (
              <tr>
                <td
                  colSpan={table.getVisibleFlatColumns().length}
                  className="adminInventory__emptyRow"
                >
                  No inventory items found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
              Page {displayPage} of {Math.max(totalPages, 1)}
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
