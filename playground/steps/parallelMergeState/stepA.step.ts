import { z } from 'zod'
import { FlowConfig, FlowExecutor } from 'wistro'
import { updateStateResults } from './stateManager'

type Input = typeof inputSchema

const inputSchema = z.object({})

export const config: FlowConfig<Input> = {
  name: 'stepA',
  subscribes: ['pms.start'],
  emits: ['pms.stepA.done'],
  input: inputSchema,
  flows: ['parallel-merge'],
}

export const executor: FlowExecutor<Input> = async (input, emit, { traceId, logger, state }) => {
  logger.info(`[stepA] executing - traceId: ${traceId}, input: ${JSON.stringify(input)}`)

  const partialResultA = {
    msg: 'Hello from Step A',
    timestamp: Date.now(),
  }

  // Update state
  const currentState = await updateStateResults(state, 'stepA', partialResultA)
  logger.info(`[stepA] Updated state: ${JSON.stringify(currentState)}`)

  await emit({
    type: 'pms.stepA.done',
    data: partialResultA,
  })
}
