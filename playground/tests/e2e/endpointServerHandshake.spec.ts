import { test, expect } from '@playwright/test'
import { Event } from 'wistro'

test.describe('endpointServerHandshake + Redis E2E', () => {
  let collectedEvents: Array<Event<unknown>> = []

  test.beforeEach(async () => {
    // Reset our array for each test
    collectedEvents = []
  })

  test('Verifies handshake flow & Redis events are published', async ({ page }) => {
    // 1) Go to the Playground UI
    await page.goto('http://localhost:3000')
    // Wait for the flow selection sidebar to appear
    await expect(page.locator('text=Endpoint Server Handshake')).toBeVisible()

    // 2) Select 'endpointServerHandshake' in the dropdown (from config)
    const workflowSelect = page.getByTestId('flow-link-handshake')
    await workflowSelect.click()

    // Wait for some node label to appear, e.g. "Node Starter"
    await expect(page.getByTestId('subscribes__handshake.initiate')).toBeVisible()

    // 3) Trigger the flow by calling the inbound route
    const response = await fetch('http://localhost:3000/api/endpoint-server-handshake', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Optionally pass some JSON data to your flow
      body: JSON.stringify({
        message: 'Hello from endpointServerHandshake test',
      }),
    })
    const { traceId } = await response.json()

    expect(response.status).toBe(200)

    // Wait a bit for the events to propagate
    await page.waitForTimeout(1000)

    const allEvents = globalThis.__ALL_EVENTS__ || []
    const eventTypes = allEvents.filter((ev) => ev.traceId === traceId)

    // We expect handshake.initiate => handshake.callApi => handshake.apiResponse
    // Possibly the flow might skip some if there's a direct route, adjust as needed
    // We'll just check that at least these show up somewhere.
    expect(eventTypes).toEqual(
      expect.arrayContaining(['handshake.initiate', 'handshake.callApi', 'handshake.apiResponse']),
    )

    // (Optional) Check the final event's data
    const finalEvent = collectedEvents.find((e) => e.type === 'handshake.apiResponse')
    expect(finalEvent).toBeDefined()
    // If you want to confirm shape:
    // expect(finalEvent.data).toHaveProperty("externalTodo");
    // expect(finalEvent.data).toHaveProperty("userMessage");

    // 5) (Optional) Confirm final node label or UI text
    await expect(page.getByTestId('subscribes__handshake.apiResponse').last()).toBeVisible()
  })
})
