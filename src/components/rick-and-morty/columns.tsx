"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { DataTableDraggableColumnHeader } from "../data-table/data-table-draggable-column-header";
import { Character } from "@/types/rick-and-morty-api";
import { DataTableActions } from "./data-table-row-actions";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export const columns: ColumnDef<Character>[] = [
  {
    id: "select",
    size: 20,
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
    size: 10,
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="id" />
    ),
    cell: ({ row }) => <div>#{row.getValue("id")}</div>,
    enableSorting: true,
    enableHiding: false,
    meta: {
      draggable: false,
    },
  },
  {
    id: "name",
    size: 100,
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarImage src={row.original.image} alt={row.original.name} />
          <AvatarFallback>
            {row.original.name[0]} {row.original.name[1]}
          </AvatarFallback>
        </Avatar>
        <div className="ml-2">{row.original.name}</div>
      </div>
    ),
    enableSorting: true,
    enableHiding: true,
    meta: {
      draggable: true,
    },
  },
  {
    id: "species",
    size: 30,
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
    id: "gender",
    size: 30,
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="Gender" />
    ),
    cell: ({ row }) => <Badge variant="outline">{row.original.gender}</Badge>,
    meta: {
      draggable: true,
    },
  },
  {
    id: "status",
    size: 100,
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableDraggableColumnHeader column={column} title="Status" />
    ),
    meta: {
      draggable: true,
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableActions row={row} />,
    size: 20,
    enableHiding: false,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    enableGrouping: false,
    enableMultiSort: false,
    enablePinning: false,
    enableResizing: false,
    meta: {
      draggable: false,
    },
  },
];
