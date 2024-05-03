import { TableFetchParams } from "@/components/data-table/data-table";
import { Character, Info } from "@/types/rick-and-morty-api";

export const fetchCharacters = async (params: TableFetchParams): Promise<Info<Character>> => {
  const baseUrl = "https://rickandmortyapi.com/api/character";

  const url = new URL(baseUrl);

  url.searchParams.append("page", params.page.toString());
  url.searchParams.append("pageSize", params.pageSize.toString());


  const response = await fetch("https://rickandmortyapi.com/api/character");

  const data = await response.json() as Info<Character>;

  return data
}