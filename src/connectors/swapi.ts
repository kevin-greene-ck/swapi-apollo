import * as fs from 'fs'
import * as hapi from 'hapi'
import * as request from 'request'
import { tracer } from '../observability/zipkin'
const DataLoader = require('dataloader')

const wrapRequest = require('zipkin-instrumentation-request')
const zipkinRequest = wrapRequest(request, {tracer, remoteServiceName: 'swapi'})

export interface IFetcher {
  (resource: string): Promise<any>
}

export const getFetcher = (rootURL?: string): IFetcher => {
  const apiRoot = rootURL || 'https://swapi.co/api'

  return (resource: string): Promise<any> => {
    const url = resource.indexOf(apiRoot) === 0 ? resource : apiRoot + resource

    return new Promise<any>((resolve, reject) => {
      zipkinRequest.get(url, (err, resp, body) => {
        err ? reject(err) : resolve(JSON.parse(body))
      })
    })
  }
}

export const getLoader = (fetch: IFetcher) => {
  return new DataLoader((urls) => {
      const promises = urls.map((url) => fetch(url))
      return Promise.all(promises)
    }, {batch: false})
}

export const getPageFetcher = (fetch: IFetcher, request?: hapi.Request) => (resource: string, offset?: number, limit?: number) => {
  let results = []
  let index = 0
  const size = limit || 0

  function pagination(pageURL: string) {
    return new Promise<any>((resolve, reject) => {
        console.log('traceId: ', request.plugins.zipkin)
        tracer.setId(request.plugins.zipkin.traceId)
      fetch(pageURL).then((data) => {
        // fast forward until offset is reached
        if (offset && results.length === 0) {
          if (index + data.results.length > offset) {
            results = data.results.slice(offset - index)
          }
          if (data.next) {
            index = index + data.results.length
            pagination(data.next).then(resolve)
          } else {
            resolve(results)
          }
        } else {
          if (size > 0 && size - results.length - data.results.length < 0) {
            results = results.concat(data.results.slice(0, size - results.length))
          } else {
            results = results.concat(data.results)
          }
          if (data.next && (size === 0 || size - results.length > 0)) {
            pagination(data.next).then(resolve)
          } else {
            resolve(results)
          }
        }
      })
    })
  }

  return pagination(resource)
}

