import {
  QueryFunction,
  QueryOptions,
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";

export type QueryType = "query" | "infiniteQuery";
export type TQueryFunction<TQueryFnArgs extends unknown[], TQueryFnReturn> = (
  ...args: TQueryFnArgs
) => QueryFunction<TQueryFnReturn>;

export type QueryDefaultOption<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = unknown,
> = Omit<QueryOptions<TQueryFnData, TError, TData>, "queryKey" | "queryFn">;

export type UseQueryDefaultOption<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = unknown,
> = Omit<UseQueryOptions<TQueryFnData, TError, TData>, "queryKey" | "queryFn">;

export type UseInfiniteQueryDefaultOption<
  TQueryFnData = unknown,
  TData = TQueryFnData,
  TError = unknown,
> = Omit<
  UseInfiniteQueryOptions<TQueryFnData, TError, TData>,
  "queryKey" | "queryFn"
>;
