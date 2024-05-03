"use client";

// ui
import { UserNav } from "./components/user-nav";

import { DataTable } from "./components/data-table/data-table";
import { columns } from "./components/rick-and-morty-table/columns";

import { fetchCharacters } from "./services/fetchCharacters";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <div className="hidden h-full flex-1 flex-col space-y-8 p-8 md:flex">
          <div className="flex items-center justify-between space-y-2">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Welcome back!
              </h2>
              <p className="text-muted-foreground">
                Here&apos;s a list of your tasks for this month!
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <UserNav />
            </div>
          </div>
          <DataTable
            columns={columns}
            queryKey={["rick-and-morty-characters"]}
            fetchData={fetchCharacters}
            tableId="rick-and-morty-characters-table"
          />
        </div>
      </div>
    </QueryClientProvider>
  );
};
