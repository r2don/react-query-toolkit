import {
  QueryClient,
  QueryKey,
  useQuery,
  useInfiniteQuery,
  useIsFetching,
} from "react-query";
import { generateKey } from "./internal/generateKey";
import { returnByCondition } from "./internal/returnByCondition";
import {
  QueryDefaultOption,
  QueryType,
  TQueryFunction,
  UseInfiniteQueryDefaultOption,
  UseQueryDefaultOption,
} from "./types/query";
import {
  QueryToolkit,
  QueryToolkitInfiniteQueryType,
  QueryToolkitQueryType,
} from "./types/queryToolkit";

export function createQueryToolkit(queryClient: QueryClient) {
  function createQuery<
    TQueryFnArgs extends unknown[],
    TQueryFnReturn,
    TData = TQueryFnReturn,
  >(
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
  function createQuery<
    TQueryFnArgs extends unknown[],
    TQueryFnReturn,
    TData = TQueryFnReturn,
  >(
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
  function createQuery<
    TQueryFnArgs extends unknown[],
    TQueryFnReturn,
    TData = TQueryFnReturn,
  >(
    queryKey: QueryKey,
    queryFn: TQueryFunction<TQueryFnArgs, TQueryFnReturn>,
    options: {
      passArgsToQueryKey?: boolean;
      queryType?: QueryType;
      defaultOptions?: QueryDefaultOption<TQueryFnReturn, TData> &
        UseQueryDefaultOption<TQueryFnReturn, TData> &
        UseInfiniteQueryDefaultOption<TQueryFnReturn, TData>;
    } = {},
  ) {
    const {
      passArgsToQueryKey = true,
      queryType = "query",
      defaultOptions,
    } = options;

    const isInfiniteQuery = queryType === "infiniteQuery";
    const returnOnQuery = returnByCondition(!isInfiniteQuery);
    const returnOnInfiniteQuery = returnByCondition(isInfiniteQuery);

    const keyGenerator = generateKey(queryKey);
    const getKey = (queryKey?: QueryKey, args?: QueryKey) =>
      keyGenerator([
        ...(queryKey ? queryKey : []),
        ...(passArgsToQueryKey && args ? args : []),
      ]);

    const handleHooks =
      (hook: any) => (args?: TQueryFnArgs, queryOptions?: any) =>
        hook(
          getKey(queryOptions?.queryKey, args),
          queryFn(...((args || []) as TQueryFnArgs)),
          { ...defaultOptions, ...queryOptions },
        );

    const hooks: Partial<
      Pick<
        QueryToolkit<TQueryFnArgs>,
        "useQuery" | "useInfiniteQuery" | "useIsFetching"
      >
    > = {
      useQuery: returnOnQuery(handleHooks(useQuery)),
      useInfiniteQuery: returnOnInfiniteQuery(handleHooks(useInfiniteQuery)),
      useIsFetching: (filters) =>
        useIsFetching(getKey(filters?.queryKey), filters),
    };

    const handleFetchFunctions = (
      path: keyof QueryToolkit,
      conditionalReturnFunc: ReturnType<typeof returnByCondition>,
    ) =>
      conditionalReturnFunc((args: any, options: any) =>
        (queryClient as any)[path](
          getKey(options?.queryKey, args),
          queryFn(...args),
          { ...defaultOptions, ...options },
        ),
      );

    const handler = new Proxy(hooks, {
      get(target: any, path: keyof QueryToolkit) {
        if (target[path]) return target[path];
        switch (path) {
          case "fetchQuery":
          case "prefetchQuery":
            return handleFetchFunctions(path, returnOnQuery);

          case "fetchInfiniteQuery":
          case "prefetchInfiniteQuery":
            return handleFetchFunctions(path, returnOnInfiniteQuery);

          case "getQueryData":
          case "getQueryState":
          case "setQueryData":
            return (queryKey: any, ...rest: any) =>
              (queryClient as any)[path](getKey(queryKey), ...rest);

          default:
            if (!(queryClient as any)[path])
              throw new Error("unknown property is given");
            return (...args: any) => (queryClient as any)[path](...args);
        }
      },
    });

    if (isInfiniteQuery)
      return handler as Omit<
        QueryToolkitInfiniteQueryType<
          TQueryFnArgs,
          TQueryFnReturn,
          Error,
          TData
        >,
        "useQuery" | "fetchQuery" | "prefetchQuery"
      >;

    return handler as Omit<
      QueryToolkitQueryType<TQueryFnArgs, TQueryFnReturn, Error, TData>,
      "useInfiniteQuery" | "fetchInfiniteQuery" | "prefetchInfiniteQuery"
    >;
  }

  return createQuery;
}
