import { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface FetchDataParams {
  pageIndex: number;
  pageSize: number;
  filters: ColumnFiltersState;
  sort: SortingState;
}