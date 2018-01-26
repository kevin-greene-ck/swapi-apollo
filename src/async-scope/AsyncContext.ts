import { asyncScope } from './async-scope'
import { Context, TraceId } from 'zipkin'

export class AsyncContext implements Context<TraceId> {
  setContext(ctx: TraceId): void {
    asyncScope.set('traceId', ctx);
  }

  getContext(): TraceId {
    const currentCtx = asyncScope.get<TraceId>('traceId')
    if (currentCtx != null) {
      return currentCtx
    } else {
      return null
    }
  }

  scoped<V>(callable: () => V): V {
    return callable()
  }

  letContext<V>(ctx: TraceId, callable: () => V): V {
    return this.scoped(() => {
      this.setContext(ctx)
      return callable()
    })
  }
}