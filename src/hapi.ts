import * as hapi from 'hapi'
import {graphiqlHapi, graphqlHapi} from 'apollo-server-hapi'
import {tracer} from './observability/zipkin'
import './async-storage'

const hapiPort = process.env.HAPI_PORT || 8000

const zipkinMiddleware = require('zipkin-instrumentation-hapi').hapiMiddleware

export function startHapi(graphqlOptions) {
    const server = new hapi.Server()

    server.connection({
        host: 'localhost',
        port: hapiPort,
    })

    // Add the Zipkin middleware
    if (process.env.ZIPKIN || process.env.ZIPKIN_HOST) {
        console.log('Zipkin Enabled')
        server.register({
            register: zipkinMiddleware,
            options: { tracer },
        })
    }

    server.register({
        options: {
            graphqlOptions,
            path: '/graphql',
        },
        register: graphqlHapi,
    })

    server.register({
        options: {
            graphiqlOptions: {
                endpointURL: '/graphql',
            },
            path: '/',
        },
        register: graphiqlHapi,
    })

    server.start(() => {
      console.log(`HAPI server is listen on ${hapiPort}`)
      console.log(`open browser to http://localhost:${hapiPort}`)
    })
  }
