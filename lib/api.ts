interface DiagnoseRequest {
  problem: string
  command_output?: string
  session_id?: string
}

interface DiagnoseResponse {
  message: string
  command?: string
  next_step: 'command' | 'message'
  session_id: string
  history: Array<{
    timestamp: string
    message: string
    command?: string
    command_output?: string
  }>
}

interface HealthResponse {
  status: string
}

class DiagnosticAPI {
  private baseUrl: string
  private sessionId?: string

  constructor(baseUrl: string = 'http://localhost:8080') {
    this.baseUrl = baseUrl.replace(/\/$/, '')
  }

  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/health`)
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }
    return response.json()
  }

  async diagnose(problem: string, commandOutput?: string): Promise<DiagnoseResponse> {
    const payload: DiagnoseRequest = {
      problem,
      ...(commandOutput && { command_output: commandOutput }),
      ...(this.sessionId && { session_id: this.sessionId })
    }

    const response = await fetch(`${this.baseUrl}/diagnose`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Diagnose request failed: ${response.status}`)
    }

    const result = await response.json()
    this.sessionId = result.session_id
    return result
  }

  getSessionId(): string | undefined {
    return this.sessionId
  }

  clearSession(): void {
    this.sessionId = undefined
  }
}

export const diagnosticAPI = new DiagnosticAPI()
export type { DiagnoseResponse, HealthResponse }