import { UseQueryResult } from '@tanstack/react-query'
import '@tanstack/react-table' //or vue, svelte, solid, qwik, etc.

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends RowData, TValue> {
    draggable?: boolean
  }

  interface TableMeta<TData extends RowData> {
    tableId: string
    dataQueryRef: React.MutableRefObject<UseQueryResult>
  }
}
