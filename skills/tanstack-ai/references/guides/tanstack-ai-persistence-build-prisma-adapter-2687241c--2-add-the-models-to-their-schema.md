# Build Prisma Adapter — 2. Add the models to their schema

[Guide and prerequisites](./tanstack-ai-persistence-build-prisma-adapter-2687241c.md) · Published skill · `@tanstack/ai-persistence@0.5.7`.

## 2. Add the models to their schema

IDs are `String`, timestamps are `BigInt` (portable epoch ms — `Int` overflows
in 2038, `DateTime` forces a conversion at every boundary), JSON payloads are
`String`. Use `@map`/`@@map` to match the app's database naming.

```prisma
model ChatThread {
  threadId     String @id @map("thread_id")
  messagesJson String @map("messages_json")
  updatedAt    BigInt @map("updated_at")

  @@map("chat_threads")
}

model ChatRun {
  runId           String  @id @map("run_id")
  threadId        String  @map("thread_id")
  status          String
  startedAt       BigInt  @map("started_at")
  finishedAt      BigInt? @map("finished_at")
  error           String?
  errorCode       String? @map("error_code")
  usageJson       String? @map("usage_json")
  sandboxKey      String? @map("sandbox_key")
  detachedSince   BigInt? @map("detached_since")
  cancelRequested Boolean? @map("cancel_requested")
  driverEpoch     Int?     @map("driver_epoch")

  @@index([threadId, status])
  @@index([threadId, startedAt])
  // Powers listReclaimable: status = 'running' AND detachedSince <= cutoff.
  @@index([status, detachedSince])
  @@map("chat_runs")
}

model ChatInterrupt {
  interruptId  String  @id @map("interrupt_id")
  runId        String  @map("run_id")
  threadId     String  @map("thread_id")
  status       String
  requestedAt  BigInt  @map("requested_at")
  resolvedAt   BigInt? @map("resolved_at")
  payloadJson  String  @map("payload_json")
  responseJson String? @map("response_json")

  @@index([threadId, requestedAt])
  @@map("chat_interrupts")
}

model ChatMetadata {
  namespace String
  key       String
  valueJson String @map("value_json")

  @@id([namespace, key])
  @@map("chat_metadata")
}
```

Rename models freely to fit the app — the store code below is the only thing
that references them. Extra app-owned fields (a `userId`, audit columns) are
fine as long as they are optional or defaulted, so the stores' creates still
succeed. `namespace` is the `MetadataStore` first argument; the stock SQL in
the guide calls the same column `scope`.

`RunRecord.error` is a structured `RunError` (`{ message: string, code?: string }`),
so it gets two columns rather than one JSON blob: `error` for the provider's
prose and `errorCode` for the stable classification an operator filters and
groups by. `error` and `errorCode` always move together in `update`, so a
later code-less failure can never leave a stale `code` from an earlier one
behind.

On **Postgres or MySQL** you can switch the `*Json` fields to Prisma's `Json`
type and drop the `JSON.stringify`/`parse` in the mappers below. Keep `String`
if the app targets SQLite or if it is multi-provider.
