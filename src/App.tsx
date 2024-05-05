"use client";

// ui
import { UserNav } from "./components/user-nav";

import { RickAndMortyDataTable } from "./components/rick-and-morty/data-table";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { columns } from "./components/rick-and-morty/columns";
import { fetchCharacters } from "./services/fetchCharacters";

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
          <RickAndMortyDataTable
            columns={columns}
            queryKey={["rick-and-morty-characters"]}
            tableResultsFn={fetchCharacters}
            tableId="rick-and-morty-characters-table"
          />
        </div>
      </div>
    </QueryClientProvider>
  );
};
