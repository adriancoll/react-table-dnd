"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableDraggableColumnHeader } from "../data-table/data-table-draggable-column-header";
import { DataTableRowActions } from "../data-table/data-table-row-actions";
import { Character } from "@/types/rick-and-morty-api";

export const columns: ColumnDef<Character>[] = [
  {
    id: "select",
    size: 30,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      draggable: false,
    },
  },
  {
    id: "id",
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="id" />
    ),
    cell: ({ row }) => <div className="w-[80px]">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: false,
    meta: {
      draggable: true,
    },
  },
  {
    id: "name",
    size: 100,
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => <div className="w-[80px] truncate">{row.getValue("name")}</div>,
    enableSorting: false,
    enableHiding: false,
    meta: {
      draggable: true,
    },
  },
  {
    id: "species",
    accessorKey: "species",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="Specie" />
    ),
    cell: ({ row }) => <Badge variant="outline">{row.original.species}</Badge>,
    meta: {
      draggable: true,
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    size: 20,
    meta: {
      draggable: false,
    },
  },
];
