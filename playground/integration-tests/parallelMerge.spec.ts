import { createWistroTester, CapturedEvent, Log } from '@wistro/test'

describe('parallelMerge', () => {
  // process.env.LOG_LEVEL = 'debug'
  let server: ReturnType<typeof createWistroTester>

  beforeEach(async () => (server = createWistroTester()))
  afterEach(async () => server.close())

  it('should run steps concurrently', async () => {
    const timestamp = expect.any(Number)
    const joinComplete = await server.watch('pms.join.complete')

    const response = await server.post('/api/parallel-merge', {
      body: { message: 'Start parallel merge test' },
    })
    expect(response.status).toBe(200)
    expect(response.body).toEqual({ message: 'Started parallel merge' })

    await joinComplete.pullEvents(1, { timeout: 2000 })

    expect(joinComplete.getCapturedEvents()).toHaveLength(1)
    expect(joinComplete.getLastCapturedEvent()).toEqual({
      traceId: expect.any(String),
      type: 'pms.join.complete',
      flows: ['parallel-merge'],
      data: {
        mergedAt: expect.any(String),
        stepA: { msg: 'Hello from Step A', timestamp },
        stepB: { msg: 'Hello from Step B', timestamp },
        stepC: { msg: 'Hello from Step C', timestamp },
      },
    })
  })
})
