"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { DataTableViewOptions } from "../data-table/data-table-view-options";
import { DataTableFacetedFilter } from "../data-table/data-table-faceted-filter";
import { Character } from "@/types/rick-and-morty-api";

interface DataTableToolbarProps<TData extends Character> {
  table: Table<TData>;
}

export function DataTableToolbar({ table }: DataTableToolbarProps<Character>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter characters..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              {
                label: "Alive",
                value: "alive",
              },
              {
                label: "Dead",
                value: "dead",
              },
              {
                label: "Unknown",
                value: "unknown",
              },
            ]}
          />
        )}
        {table.getColumn("species") && (
          <DataTableFacetedFilter
            column={table.getColumn("species")}
            title="Species"
            options={[
              {
                label: "Human",
                value: "Human",
              },
              {
                label: "Alien",
                value: "Alien",
              },
              {
                label: "Humanoid",
                value: "Humanoid",
              },
            ]}
          />
        )}
        {table.getColumn("gender") && (
          <DataTableFacetedFilter
            column={table.getColumn("gender")}
            title="Gender"
            options={[
              {
                label: "Female",
                value: "female",
              },
              {
                label: "Male",
                value: "male",
              },
              {
                label: "Genderless",
                value: "genderless",
              },
              {
                label: "Unknown",
                value: "unknown",
              },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
