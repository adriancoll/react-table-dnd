import * as React from "react";

import {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  PaginationState,
  SortingState,
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

import { AnimatePresence, motion } from "framer-motion";

import { Table, TableBody, TableHeader, TableRow } from "@/components/ui/table";

import { DataTableDragAlongCell } from "./data-table-drag-along-cell";
import { DataTableDraggableColumnHead } from "./data-table-draggable-column-head";

// drag and drop
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToFirstScrollableAncestor,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import useDataTableStore from "@/stores/data-table.store";
import { QueryKey, useQuery } from "@tanstack/react-query";
import { Info } from "@/types/rick-and-morty-api";
import { DataTablePagination } from "./data-table-pagination";
import { ReloadIcon } from "@radix-ui/react-icons";
import { DataTableToolbar } from "./data-table-toolbar";
import { Skeleton } from "../ui/skeleton";
import { cn } from "@/lib/utils";

export interface TableFetchParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
}

interface WithStanstackQueryFetcher<TData> {
  tableResultsFn: (p: TableFetchParams) => Promise<Info<TData>>;
  queryKey: QueryKey;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  tableId: string;
  queryKey: QueryKey;
}

export function DataTable<TData, TValue>({
  columns,
  tableId,
  tableResultsFn,
  queryKey,
}: DataTableProps<TData, TValue> & WithStanstackQueryFetcher<TData>) {
  const {
    tables,
    setColumnOrder: setGlobalColumnOrder,
    setColumnVisibility: setGlobalColumnVisibility,
    setPagination: setGlobalPagination,
  } = useDataTableStore((state) => ({
    tables: state.tables,
    setColumnOrder: state.setColumnOrder,
    setColumnVisibility: state.setColumnVisibility,
    setPagination: state.setPagination,
  }));

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

  const fetchDataOptions: TableFetchParams = {
    page: pagination.pageIndex,
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

  const { data: queryData, isLoading, isFetching } = resultsQuery;

  const showLoadingQueryPanel = isFetching || isLoading;

  const table = useReactTable({
    data: (queryData?.rows as TData[]) ?? [],
    columns,
    manualPagination: true,
    pageCount: queryData?.pageCount ?? 1,
    rowCount: queryData?.total || 0,
    meta: {
      tableId,
      dataQueryRef,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnOrder,
      pagination,
    },
    enableRowSelection: true,
    onPaginationChange: updateTablePagination,
    onColumnOrderChange: updateColumnOrder,
    onColumnVisibilityChange: updateColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over.id as string);
      const newOrder = arrayMove<string>(columnOrder, oldIndex, newIndex); //this is just a splice util

      updateColumnOrder(newOrder);
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

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
        <div className="rounded-md border">
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
            <TableBody>
              <AnimatePresence mode="wait">
                {showLoadingQueryPanel && (
                  <motion.div
                    key="data-table-loading-panel"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center bg-white/20 backdrop-blur-[3px] z-50 justify-center"
                  >
                    <div className="flex items-center justify-center">
                      <ReloadIcon className="animate-spin h-5 w-5 text-primary mr-2" />
                      <span>Loading</span>
                    </div>
                  </motion.div>
                )}
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
                {isLoading &&
                  Array.from({
                    length: table.getState().pagination.pageSize,
                  })
                    .map((_, index) => index)
                    .map(() => (
                      <TableRow>
                        {table.getAllColumns().map((column) => {
                          return (
                            <motion.tr
                              key={column.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={cn(
                                "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]"
                              )}
                            >
                              <Skeleton className="w-full h-6" />
                            </motion.tr>
                          );
                        })}
                      </TableRow>
                    ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
        <div className="h-4" />
        <DataTablePagination table={table} />
        <div className="h-4" />
        <pre>
          {/* <code>{JSON.stringify(table.getState(), null, 2)}</code> */}
        </pre>
      </div>
    </DndContext>
  );
}
