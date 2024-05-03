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
import { DataTableViewOptions } from "./data-table-view-options";
import { QueryKey, useQuery } from "@tanstack/react-query";

export interface TableFetchParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
}

interface WithStanstackQueryFetcher {
  fetcher: (params: TableFetchParams) => void;
  queryKey: QueryKey;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data?: TData[];
  tableId: string;
  fetchData: (p: TableFetchParams) => void;
  queryKey: QueryKey;
}

export function DataTable<TData, TValue>({
  data,
  columns,
  tableId,
  fetchData,
  queryKey
}: DataTableProps<TData, TValue> & WithStanstackQueryFetcher) {
  const {
    tables,
    setColumnOrder: setGlobalColumnOrder,
    setColumnVisibility: setGlobalColumnVisibility,
  } = useDataTableStore((state) => ({
    tables: state.tables,
    setColumnOrder: state.setColumnOrder,
    setColumnVisibility: state.setColumnVisibility,
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
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

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

  const { data: queryData } = useQuery({
    queryKey: [queryKey, pagination, sorting, columnFilters],
    queryFn: () =>
      fetchData({
        page: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        columnFilters,
      }),
  });

  const table = useReactTable({
    data: queryData || data || [],
    columns,
    meta: {
      tableId,
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      columnOrder,
      pagination: {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      },
    },
    enableRowSelection: true,
    onColumnOrderChange: updateColumnOrder,
    onColumnVisibilityChange: (o) => updateColumnVisibility(o),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange: setPagination,
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
        <div className="flex justify-end">
          <DataTableViewOptions table={table} />
        </div>
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
            </TableBody>
          </Table>
        </div>
      </div>
    </DndContext>
  );
}
