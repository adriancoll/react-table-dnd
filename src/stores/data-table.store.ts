import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cookieStorage } from './storages/cookies-storage';
import { ColumnOrderState, PaginationState, RowSelectionState, TableState, VisibilityState } from '@tanstack/react-table';

interface DataTableState {
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
  pagination: PaginationState;
  rowSelection: RowSelectionState

  tableState: TableState
}

type TableId = string

interface DataTableStoreState {
  tables: Record<TableId, DataTableState>;
}

interface DataTableStoreActions {
  setColumnOrder: (tableId: string, columnOrder: string[]) => void;
  setColumnVisibility: (tableId: string, columnVisibility: Record<string, boolean>) => void;
  setPagination: (tableId: string, pagination: PaginationState) => void;
  setRowSelection: (tableId: string, rowSelection: RowSelectionState) => void;

  setStableState: (tableId: string, tableState: TableState) => void;
}


const useDataTableStore = create<DataTableStoreState & DataTableStoreActions>()(
  persist((set) => ({
    tables: {},

    setStableState: (tableId, tableState) => {
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            ...tableState
          }
        }
      }));
    },

    setColumnOrder: (tableId, columnOrder) => {
      // put the action header if exists always at the end of the array 
      if (columnOrder.includes('actions')) {
        columnOrder = columnOrder.filter(c => c !== 'actions');
        columnOrder.push('actions');
      }

      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            columnOrder
          }
        }
      }));
    },

    setColumnVisibility: (tableId, columnVisibility) => {
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            columnVisibility
          }
        }
      }));
    },

    setPagination: (tableId, pagination) => {
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            pagination
          }
        }
      }));
    },

    setRowSelection: (tableId, rowSelection) => {
      set(state => ({
        tables: {
          ...state.tables,
          [tableId]: {
            ...state.tables[tableId],
            rowSelection
          }
        }
      }));
    }
  }), {
    name: 'table-settings',
    getStorage: () => cookieStorage
  })
);

export default useDataTableStore;
