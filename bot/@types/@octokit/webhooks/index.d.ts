declare module '@octokit/webhooks' {
  import { Application } from 'express'

  interface Options {
    path: string,
    secret: string
  }

  export interface PayloadRepository {
    [key: string]: any
    full_name?: string
    name: string
    owner: {
      [key: string]: any
      login: string
      name?: string
    }
    html_url?: string
  }

  export interface WebhookPayloadWithRepository {
    [key: string]: any
    ref: string
    repositories?: Array<{
      id: number
      node_id: string
      name: string
      full_name: string
      html_url: string
      private: boolean
    }>
    repositories_added?: Array<{
      id: number
      node_id: string
      name: string
      full_name: string
      html_url: string
      private: boolean
    }>
    repositories_removed?: Array<{
      id: number
      node_id: string
      name: string
      full_name: string
      html_url: string
      private: boolean
    }>
    repository?: PayloadRepository
    issue?: {
      [key: string]: any
      number: number
      html_url?: string
      body?: string
    }
    pull_request?: {
      [key: string]: any
      number: number
      html_url?: string
      body?: string
    }
    sender?: {
      [key: string]: any
      type: string
      login: string
    }
    action?: string
    installation?: {
      id: number
      account: {
        [key: string]: any
        login: string
      }
      [key: string]: any
    }
    commits?: Array<{
      [key: string]: any
      distinct: boolean
      message: string
      author: {
        name: string
      }
      id: string
    }>
    review?: {
      [key: string]: any
      state: string
    }
  }

   export interface WebhookEvent {
      id: string
      name: string
      payload: WebhookPayloadWithRepository
      protocol?: 'http' | 'https'
      host?: string
      url?: string
    }

  class Webhooks {
    public middleware: Application

    constructor (options: Options)

    public on (event: string, callback: (event: WebhookEvent) => Promise<void>): void
    public on (event: 'error', callback: (err: Error) => void): void
    public sign (data: WebhookPayloadWithRepository): string
  }

  export default Webhooks
}
