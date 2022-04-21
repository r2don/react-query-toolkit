# react-query-toolkit
[![codecov](https://codecov.io/gh/lifeisegg123/react-query-toolkit/branch/main/graph/badge.svg?token=YQ37N8E2R3)](https://codecov.io/gh/lifeisegg123/react-query-toolkit)
> note: This library is in WIP stage. I would not recommend using it in production.

## Introduction
This library helps you to use [React-Query](https://react-query.tanstack.com/) much easier.
It provides two functions. `createQueryToolkit` for queries, `createMutationToolkit` for mutations.
These functions allows you to less concern about how to manage query key or api functions, and prevent you from writing same code(`eg. give same options to useQuery & prefetchQuery`) for queries or mutations.

Any type of contribution(pr, issue, etc...) is welcome.

## Installation

```sh
# with npm
npm i react-query-toolkit

# with yarn
yarn add react-query-toolkit

# with pnpm
pnpm add react-query-toolkit
```

## Usage

Before you start, make sure you have installed [React-Query](https://react-query.tanstack.com/).

### Create toolkit

```js
// queryClient.js
import { QueryClient } from 'react-query'
import { createQueryToolkit, createMutationToolkit } from 'react-query-toolkit';

export const queryClient = new QueryClient();

export const queryToolkit = createQueryToolkit(queryClient);

export const mutationToolkit = createMutationToolkit(queryToolkit)
```

> createQueryToolkit and createMutationToolkit require queryClient instance as a parameter.

### Create query and mutation

```js
// example.js
import { queryToolkit, mutationToolkit } from './queryClient';

export const exampleQuery = queryToolkit(['exampleQuery'], mockQueryApi);

export const exampleMutation = mutationToolkit(['exampleMutation'], mockMutationApi);
```

By making query and mutation like this, it will handle all react-query api with same key and api function `(useQuery, useIsFetching, prefetchQuery, getQueryData, etc...)`.

### Basic usage

```js
// ExampleComponent.js
import {exampleQuery, exampleMutation} from './example';

function ExampleComponent () {
  const { data, error, isLoading } = exampleQuery.useQuery();
  const { isLoading: isMutationLoading, mutate } = exampleMutation.useMutation();

  return (
    <div>
      <div>{isLoading ? 'Loading...' : data}</div>
      <button onClick={() => mutate()}>
        {isMutationLoading ? 'Loading...' : 'Click me'}
      </button>
    </div>
  );
}
```

> note: useQuery takes arguments of api function as an array.  
> if you need to pass additional options to useQuery without any arguments, pass an empty array.

### Use query from other component

```js
// AnotherExampleComponent.js
import {exampleQuery, exampleMutation} from './example';

function AnotherExampleComponent () {
  const isFetching = exampleQuery.useIsFetching();
  const isMutating = exampleMutation.useIsMutating();
  if(isFetching || isMutating) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* return something here */}
    </div>
  );
}
```

## API Reference

### createQueryToolkit

#### parameters

- `queryClient: QueryClient`
  - **Required**
  - queryClient instance

#### returns

- `createQuery: (queryKey, queryFn, options) => QueryToolkit`
  - returns a function that will return a instance of `QueryToolkit`

***
<br>

### createQuery

#### parameters

- `queryKey: QueryKey`
  - **Required**
  - query's key(needs to be Array)

- `queryFn: (...args: TQueryFnArgs[]) => (context: QueryFunctionContext) => Promise<TData> | TData`
  - **Required**
  - query's api function
  - args needs to be given by parameter of `useQuery`, `fetchQuery`, `prefetchQuery`, etc...

- `options: { passArgsToQueryKey: boolean, queryType: 'query' | 'infiniteQuery' }`
  - **Optional**
  - `passArgsToQueryKey: boolean` 
    - Defaults to `true`
    - if set to `true`, queries arguments will be passed to queryKey.
  - `queryType: 'query' | 'infiniteQuery'`
    - Defaults to `'query'`
    - if set to `'query'`, `QueryToolkit` will have `useQuery`, `fetchQuery`, `prefetchQuery` methods.
    - if set to `'infiniteQuery'`, `QueryToolkit` will have `useInfiniteQuery`, `fetchInfiniteQuery`, `prefetchInfiniteQuery` methods.
  - `defaultOptions: QueryOptions & UseQueryOptions & UseInfiniteQueryOptions`
    - same option as react-query's query options [check out here](https://react-query.tanstack.com/reference/useQuery)

#### returns

- `QueryToolkit`
  - will Return a instance of `QueryToolkit`

***
<br>

### createMutationToolkit

#### parameters

- `queryClient: QueryClient`
  - **Required**
  - queryClient instance

#### returns
- `createMutation: (queryKey, queryFn, options) => MutationToolkit`
  - returns a function that will return a instance of `MutationToolkit` 


***
<br>

### createMutation

#### parameters

- `mutationKey: MutationKey`
  - **Required**
  - mutation's key(needs to be Array)

- `mutationFn: (variables: TVariables) => Promise<TData>`
  - **Required**
  - mutation's api function

- `defaultOptions: UseMutationOptions`
  - **Optional**
  - same option as react-query's mutation options [check out here](https://react-query.tanstack.com/reference/useMutation)
  
#### returns
- `MutationToolkit`
  - return a instance of `MutationToolkit`