import {
  CancelOptions,
  FetchInfiniteQueryOptions,
  FetchQueryOptions,
  InfiniteData,
  InvalidateOptions,
  InvalidateQueryFilters,
  QueryKey,
  RefetchOptions,
  RefetchQueryFilters,
  ResetOptions,
  ResetQueryFilters,
  SetDataOptions,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  UseQueryOptions,
  UseQueryResult,
  QueryState,
  QueryFilters,
  Updater
} from "@tanstack/react-query";
import {
  QueryDefaultOption,
  TQueryFunction,
  UseInfiniteQueryDefaultOption,
  UseQueryDefaultOption,
} from "./query";

interface QueryToolkitBase<
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> {
  getQueryData(queryKey?: QueryKey, filters?: QueryFilters): TData | undefined;
  getQueryState(
    queryKey?: QueryKey,
    filters?: QueryFilters,
  ): QueryState<TData, TError> | undefined;
  setQueryData(
    queryKey: QueryKey,
    updater: Updater<TData | undefined, TData | undefined>,
    options?: SetDataOptions,
  ): TData;
  getQueriesData(filters?: QueryFilters): [QueryKey, TData][];
  setQueriesData(
    filters: QueryFilters,
    updater: Updater<TData | undefined, TData | undefined>,
    options?: SetDataOptions,
  ): [QueryKey, TData][];

  invalidateQueries<TPageData = unknown>(
    filters?: InvalidateQueryFilters<TPageData>,
    options?: InvalidateOptions,
  ): Promise<void>;
  refetchQueries<TPageData = unknown>(
    filters?: RefetchQueryFilters<TPageData>,
    options?: RefetchOptions,
  ): Promise<void>;
  cancelQueries(filters?: QueryFilters, options?: CancelOptions): Promise<void>;
  removeQueries(filters?: QueryFilters): void;
  resetQueries<TPageData = unknown>(
    filters?: ResetQueryFilters<TPageData>,
    options?: ResetOptions,
  ): Promise<void>;

  isFetching(filters?: QueryFilters): number;
  useIsFetching(filters?: QueryFilters): number;
}

export interface QueryToolkitQueryType<
  TQueryFnArgs extends unknown[] = [],
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> extends QueryToolkitBase<TQueryFnData, TError, TData> {
  fetchInfiniteQuery: undefined;
  prefetchInfiniteQuery: undefined;
  useInfiniteQuery: undefined;
  fetchQuery<TReturn = TData>(
    args?: TQueryFnArgs,
    options?: Omit<FetchQueryOptions<TQueryFnData, TError, TReturn>, "queryFn">,
  ): Promise<TReturn>;
  prefetchQuery(
    args?: TQueryFnArgs,
    options?: Omit<FetchQueryOptions<TQueryFnData, TError>, "queryFn">,
  ): Promise<void>;
  useQuery<TReturn = TData>(
    args?: TQueryFnArgs,
    options?: Omit<UseQueryOptions<TQueryFnData, TError, TReturn>, "queryFn">,
  ): UseQueryResult<TReturn, TError>;
}

export interface QueryToolkitInfiniteQueryType<
  TQueryFnArgs extends unknown[] = [],
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> extends QueryToolkitBase<TQueryFnData, TError, TData> {
  fetchQuery: undefined;
  prefetchQuery: undefined;
  useQuery: undefined;
  fetchInfiniteQuery<TReturn = TData>(
    args?: TQueryFnArgs,
    options?: Omit<
      FetchInfiniteQueryOptions<TQueryFnData, TError, TReturn>,
      "queryFn"
    >,
  ): Promise<InfiniteData<TReturn>>;
  prefetchInfiniteQuery(
    args?: TQueryFnArgs,
    options?: Omit<FetchQueryOptions<TQueryFnData, TError>, "queryFn">,
  ): Promise<void>;
  useInfiniteQuery<TReturn = TData>(
    args?: TQueryFnArgs,
    options?: Omit<
      UseInfiniteQueryOptions<TQueryFnData, TError, TReturn>,
      "queryFn"
    >,
  ): UseInfiniteQueryResult<TReturn, TError>;
}

export type QueryToolkit<
  TQueryFnArgs extends unknown[] = [],
  TQueryFnData = unknown,
  TError = unknown,
  TData = TQueryFnData,
> =
  | QueryToolkitQueryType<TQueryFnArgs, TQueryFnData, TError, TData>
  | QueryToolkitInfiniteQueryType<TQueryFnArgs, TQueryFnData, TError, TData>;

export interface QueryCreator {
  <TQueryFnArgs extends unknown[], TQueryFnReturn, TData = TQueryFnReturn>(
    queryKey: QueryKey,
    queryFn: TQueryFunction<TQueryFnArgs, TQueryFnReturn>,
    options?: {
      passArgsToQueryKey?: boolean;
      queryType?: "query";
      defaultOptions?: QueryDefaultOption<TQueryFnReturn, TData> &
        UseQueryDefaultOption<TQueryFnReturn, TData>;
    },
  ): Omit<
    QueryToolkitQueryType<TQueryFnArgs, TQueryFnReturn, Error, TData>,
    "useInfiniteQuery" | "fetchInfiniteQuery" | "prefetchInfiniteQuery"
  >;
  <TQueryFnArgs extends unknown[], TQueryFnReturn, TData = TQueryFnReturn>(
    queryKey: QueryKey,
    queryFn: TQueryFunction<TQueryFnArgs, TQueryFnReturn>,
    options?: {
      passArgsToQueryKey?: boolean;
      queryType?: "infiniteQuery";
      defaultOptions?: QueryDefaultOption<TQueryFnReturn, TData> &
        UseInfiniteQueryDefaultOption<TQueryFnReturn, TData>;
    },
  ): Omit<
    QueryToolkitInfiniteQueryType<TQueryFnArgs, TQueryFnReturn, Error, TData>,
    "useQuery" | "fetchQuery" | "prefetchQuery"
  >;
}
