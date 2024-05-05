import { TableFetchParams } from "@/components/data-table/data-table";
import { Character, Info } from "@/types/rick-and-morty-api";

export const fetchCharacters = async (params: TableFetchParams): Promise<Info<Character[]>> => {
  const { columnFilters, page, pageSize } = params
  const baseUrl = "https://rickandmortyapi.com/api/character";

  const url = new URL(baseUrl);

  url.searchParams.append("page", page.toString());
  url.searchParams.append("pageSize", pageSize.toString());

  for (const { id, value } of columnFilters) {
    url.searchParams.append(id, String(value));
  }

  console.log(url.toString());

  const response = await fetch(url.toString(), { method: "GET" });

  const data = await response.json()

  return data
}