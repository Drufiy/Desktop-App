interface CommandResult {
  success: boolean
  output: string
  error: string
  exitCode?: number
}

class CommandExecutor {
  async executeCommand(command: string): Promise<CommandResult> {
    try {
      // In Electron, we can use Node.js child_process
      if (typeof window !== 'undefined' && (window as any).electronAPI) {
        return await (window as any).electronAPI.executeCommand(command)
      }
      
      // Fallback for development/web environment
      console.log(`Would execute: ${command}`)
      return {
        success: true,
        output: `Mock execution of: ${command}`,
        error: ''
      }
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

export const commandExecutor = new CommandExecutor()
export type { CommandResult }