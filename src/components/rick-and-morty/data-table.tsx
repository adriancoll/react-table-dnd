import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  PaginationState,
  RowSelectionState,
  SortingState,
  TableState,
  Updater,
  VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";

// drag and drop
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import useDataTableStore from "@/stores/data-table.store";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { Character, Info } from "@/types/rick-and-morty-api";
// table ui
import { DataTablePagination } from "./data-table-pagination";
import { DataTableDraggableColumnHead } from "../data-table/data-table-draggable-column-head";
import { DataTableDragAlongCell } from "../data-table/data-table-drag-along-cell";
import { DataTableToolbar } from "./data-table-toolbar";
import { useTableDraggableHeader } from "../data-table/hooks/use-table-draggable-header";
import { DataTableEmpty } from "../data-table/data-table-empty";
import { DataTableSkeleton } from "../data-table/data-table-skeleton";

export interface TableFetchParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
}

interface WithStanstackQueryFetcher<TData> {
  tableResultsFn: (p: TableFetchParams) => Promise<Info<TData[]>>;
  queryKey: QueryKey;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  tableId: string;
  queryKey: QueryKey;
}

export function RickAndMortyDataTable({
  columns,
  tableId,
  tableResultsFn,
  queryKey,
}: DataTableProps<Character, Character> &
  WithStanstackQueryFetcher<Character>) {
  const {
    tables,
    setColumnOrder: setGlobalColumnOrder,
    setColumnVisibility: setGlobalColumnVisibility,
    setPagination: setGlobalPagination,
    setRowSelection: setGlobalRowSelection,
    setTableState: setGlobalTableState,
  } = useDataTableStore((state) => ({
    tables: state.tables,
    setColumnOrder: state.setColumnOrder,
    setColumnVisibility: state.setColumnVisibility,
    setPagination: state.setPagination,
    setRowSelection: state.setRowSelection,
    setTableState: state.setStableState,
  }));

  const [tableState, setTableState] = React.useState(
    tables[tableId]?.tableState || {}
  );

  const [rowSelection, setRowSelection] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnOrder, setColumnOrder] = React.useState<string[]>(
    tables[tableId]?.columnOrder || columns.map((c) => c.id)
  );
  const [columnVisibility, setColumnVisibility] = React.useState<
    Record<string, boolean>
  >(tables[tableId]?.columnVisibility || {});

  const [pagination, setPagination] = React.useState<PaginationState>(
    tables[tableId]?.pagination || {
      pageIndex: 0,
      pageSize: 10,
    }
  );

  // Sincronizar el estado local con el global
  const updateColumnOrder = (updater: Updater<ColumnOrderState>) => {
    setColumnOrder((old) => {
      const newColumnOrder =
        updater instanceof Function ? updater(old) : updater;

      // Update global state inside this callback to ensure consistency
      setGlobalColumnOrder(tableId, newColumnOrder);
      return newColumnOrder;
    });
  };

  const updateColumnVisibility = (updater: Updater<VisibilityState>) => {
    // Update local state
    setColumnVisibility((old) => {
      const newVisibilityValue =
        updater instanceof Function ? updater(old) : updater;

      // Update global state inside this callback to ensure consistency
      setGlobalColumnVisibility(tableId, newVisibilityValue);

      return newVisibilityValue;
    });
  };

  const updateTablePagination = (updater: Updater<PaginationState>) => {
    setPagination((old) => {
      const newPaginationValue =
        updater instanceof Function ? updater(old) : updater;

      // Update global state inside this callback to ensure consistency
      setGlobalPagination(tableId, newPaginationValue);

      return newPaginationValue;
    });
  };

  const updateTableRowSelection = (updater: Updater<RowSelectionState>) => {
    setRowSelection((old) => {
      const newRowSelectionValue =
        updater instanceof Function ? updater(old) : updater;

      // Update global state inside this callback to ensure consistency
      setGlobalRowSelection(tableId, newRowSelectionValue);

      return newRowSelectionValue;
    });
  };

  const updateTableState = (updater: Updater<TableState>) => {
    // reset pagination when sorting or filtering
    table.setPageIndex(0);

    setTableState((old) => {
      const state = updater instanceof Function ? updater(old) : updater;
      setGlobalTableState(tableId, state);

      return state;
    });
  };

  const fetchDataOptions: TableFetchParams = {
    page: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    columnFilters,
    sorting,
  };

  async function fetchData(options: TableFetchParams) {
    const result = await tableResultsFn(options);

    const { info, results: rows } = result;

    const { pages: pageCount, count: total } = info!;

    return {
      total,
      rows,
      pageCount,
    };
  }

  const resultsQuery = useQuery({
    queryKey: [queryKey, tableId, fetchDataOptions],
    queryFn: () => fetchData(fetchDataOptions),
    refetchOnWindowFocus: true,
  });

  const dataQueryRef = React.useRef(resultsQuery);

  const { data: queryData } = resultsQuery;

  const table = useReactTable({
    data: queryData?.rows ?? [],
    columns,
    autoResetPageIndex: false,
    manualPagination: true,
    manualFiltering: true,
    pageCount: queryData?.pageCount ?? 1,
    meta: {
      tableId,
      dataQueryRef,
    },
    state: {
      ...tableState,
      columnOrder,
      columnFilters,
      columnVisibility,
      pagination,
      rowSelection,
    },
    enableRowSelection: true,
    onStateChange: updateTableState,
    onPaginationChange: updateTablePagination,
    onColumnOrderChange: updateColumnOrder,
    onColumnVisibilityChange: updateColumnVisibility,
    onRowSelectionChange: updateTableRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  React.useEffect(() => {
    table.setPageIndex(0);
  }, [table, columnFilters]);

  const { handleDragEnd, sensors } = useTableDraggableHeader({
    onReorder: updateColumnOrder,
    columnOrder,
  });

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis, restrictToFirstScrollableAncestor]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="p-2">
        <div className="h-4" />
        <DataTableToolbar table={table} />
        <div className="h-4" />
        <div className="rounded-md border h-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                    disabled={
                      headerGroup.id === "actions" ||
                      headerGroup.id === "selection"
                    }
                  >
                    {headerGroup.headers.map((header) => (
                      <DataTableDraggableColumnHead
                        key={header.id}
                        header={header}
                      />
                    ))}
                  </SortableContext>
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="relative">
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <SortableContext
                      key={cell.id}
                      disabled={!cell.column.columnDef.meta?.draggable}
                      items={columnOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      <DataTableDragAlongCell key={cell.id} cell={cell} />
                    </SortableContext>
                  ))}
                </TableRow>
              ))}
              <DataTableEmpty table={table} />
              <DataTableSkeleton table={table} />
            </TableBody>
          </Table>
        </div>
        <div className="h-4" />
        <DataTablePagination table={table} />
        <div className="h-4" />
        <pre>
          <code>{JSON.stringify(table.getState(), null, 2)}</code>
        </pre>
      </div>
    </DndContext>
  );
}
