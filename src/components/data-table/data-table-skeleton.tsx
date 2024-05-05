import { Table, TableMeta } from "@tanstack/react-table";
import { TableCell, TableRow } from "../ui/table";
import { Skeleton } from "../ui/skeleton";

interface Props<TData> {
  table: Table<TData>;
}

export const DataTableSkeleton = <TData,>({ table }: Props<TData>) => {
  //get table metadata
  const { dataQueryRef } = table.options.meta as TableMeta<TData>;

  if (
    !dataQueryRef.current.isFetching ||
    !dataQueryRef.current.isLoading ||
    dataQueryRef.current.isError ||
    table.getRowModel().rows.length !== 0
  ) {
    return null;
  }

  return (
    <>
      {Array.from({ length: table.getState().pagination.pageSize }).map(
        (_, index) => (
          <TableRow key={index}>
            {table.getAllColumns().map((column) => (
              <TableCell key={column.id}>
                <Skeleton className="w-full h-6 opacity-50" />
              </TableCell>
            ))}
          </TableRow>
        )
      )}
    </>
  );
};
