import { Table, TableMeta } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import { BracesIcon } from "lucide-react";

interface Props<TData> {
  table: Table<TData>;
}

export const DataTableEmpty = <TData,>({ table }: Props<TData>) => {
  //get table metadata
  const { dataQueryRef } = table.options.meta as TableMeta<TData>;

  if (
    table.getRowModel().rows.length > 0 ||
    !dataQueryRef.current.isError ||
    dataQueryRef.current.isFetching ||
    dataQueryRef.current.isLoading
  ) {
    return null;
  }

  return (
    <TableRow>
      <TableCell
        rowSpan={table.getState().pagination.pageSize}
        colSpan={table.getAllColumns().length}
      >
        <div className="flex items-center flex-col gap-2 text-grey-4 tracking-wide justify-center h-40">
          <BracesIcon className="w-8 h-8 text-grey-4" />
          There are no results to show
        </div>
      </TableCell>
    </TableRow>
  );
};
