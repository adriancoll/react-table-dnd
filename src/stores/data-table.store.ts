import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cookieStorage } from './storages/cookies-storage';
import { ColumnOrderState, VisibilityState } from '@tanstack/react-table';

interface DataTableState {
  columnOrder: ColumnOrderState;
  columnVisibility: VisibilityState;
}

interface DataTableStoreState {
  tables: Record<string, DataTableState>;
}

interface DataTableStoreActions {
  setColumnOrder: (tableId: string, columnOrder: string[]) => void;
  setColumnVisibility: (tableId: string, columnVisibility: Record<string, boolean>) => void;
}


const useDataTableStore = create<DataTableStoreState & DataTableStoreActions>()(
  persist((set, get) => ({
    tables: {},

    setColumnOrder: (tableId, columnOrder) => {
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
      console.log({
        oldState: get().tables[tableId].columnVisibility,
        newState: columnVisibility
      });

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
  }), {
    name: 'table-settings',
    getStorage: () => cookieStorage
  })
);

export default useDataTableStore;
