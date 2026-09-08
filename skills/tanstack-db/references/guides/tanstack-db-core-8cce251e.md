# Db Core

<a id="source-tanstack-db-core"></a>

Published skill · `@tanstack/db@0.8.7`.

[Topic index](../foundations.md) · [Source provenance](../SOURCES.md)

# TanStack DB — Core Concepts

TanStack DB is a reactive client-side data store. It loads data into typed
collections from any backend (REST APIs, sync engines, local storage), provides
sub-millisecond live queries via differential dataflow, and supports instant
optimistic mutations with automatic rollback.

Framework packages (`@tanstack/react-db`, `@tanstack/vue-db`, `@tanstack/svelte-db`,
`@tanstack/solid-db`) re-export everything from `@tanstack/db` plus framework-specific
hooks. In framework projects, import from the framework package directly.
`@tanstack/angular-db` is the exception -- import operators from `@tanstack/db` separately.

## Sub-Skills

| Need to...                                       | Read                                                 |
| ------------------------------------------------ | ---------------------------------------------------- |
| Create a collection, pick an adapter, add schema | ./tanstack-db-core-collection-setup-883eba1c.md#source-tanstack-db-core-collection-setup                    |
| Query data with where, join, groupBy, select     | ./tanstack-db-core-live-queries-ec3edb95.md#source-tanstack-db-core-live-queries                        |
| Insert, update, delete with optimistic UI        | ./tanstack-db-core-mutations-optimistic-9abd33bd.md#source-tanstack-db-core-mutations-optimistic                |
| Build a custom sync adapter                      | ./tanstack-db-core-custom-adapter-3b9cb5f2.md#source-tanstack-db-core-custom-adapter                      |
| Persist collections to SQLite (offline cache)    | ./tanstack-db-core-persistence-2c18441d.md#source-tanstack-db-core-persistence                         |
| Preload collections in route loaders             | ./tanstack-db-meta-framework-69f8ef80.md#source-tanstack-db-meta-framework                              |
| Add offline transaction queueing                 | ./tanstack-offline-transactions-offline-6f208742.md#source-tanstack-offline-transactions-offline (in @tanstack/offline-transactions) |

For framework-specific hooks:

| Framework | Read                |
| --------- | ------------------- |
| React     | ./tanstack-react-db-ba0ab260.md#source-tanstack-react-db   |
| Vue       | ./tanstack-vue-db-8ef80718.md#source-tanstack-vue-db     |
| Svelte    | ./tanstack-svelte-db-1541b4ae.md#source-tanstack-svelte-db  |
| Solid     | ./tanstack-solid-db-839f983b.md#source-tanstack-solid-db   |
| Angular   | ./tanstack-angular-db-3647fe7a.md#source-tanstack-angular-db |

## Quick Decision Tree

- Setting up for the first time? → db-core/collection-setup
- Building queries on collection data? → db-core/live-queries
- Writing data / handling optimistic state? → db-core/mutations-optimistic
- Using React hooks? → react-db
- Preloading in route loaders (Start, Next, Remix)? → meta-framework
- Building an adapter for a new backend? → db-core/custom-adapter
- Persisting collections to SQLite? → db-core/persistence
- Need offline transaction persistence? → offline

## Version

Targets @tanstack/db v0.6.17.
