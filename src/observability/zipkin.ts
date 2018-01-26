import {
  Tracer,
  // ExplicitContext,
  ConsoleRecorder,
  BatchRecorder,
} from 'zipkin'

import {
    AsyncContext
} from '../async-scope'

// const CLSContext = require('zipkin-context-cls');

const { HttpLogger } = require('zipkin-transport-http')
const wrapRequest = require('zipkin-instrumentation-request')
import * as request from 'request'

const ctxImpl = new AsyncContext()
const options = {
    logger: new HttpLogger({
        endpoint: `${process.env.ZIPKIN_HOST}/api/v1/spans`,
    }),
}
const recorder = process.env.ZIPKIN_HOST ? new BatchRecorder(options) : new ConsoleRecorder()

export const tracer = new Tracer({ ctxImpl, recorder, localServiceName: 'swapi-apollo' })
