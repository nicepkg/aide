import { spawn } from 'child_process'
import crypto from 'crypto'
import { promises as fs } from 'fs'
import { tmpdir } from 'os'
import * as path from 'path'
import * as vscode from 'vscode'

import { t } from './i18n'
import { logger } from './logger'

const getClipboardImageAsBase64Url = async (): Promise<string | null> => {
  const osPlatform = process.platform
  const tempDir = tmpdir()
  const randomString = crypto.randomBytes(8).toString('hex')
  let command: string
  let args: string[]
  let fileExtension: string
  let mimeType: string
  let filePath: string

  switch (osPlatform) {
    case 'win32':
      fileExtension = '.png'
      mimeType = 'image/png'
      filePath = path.win32.join(
        tempDir,
        `clipboard_image_${randomString}${fileExtension}`
      )
      command = 'powershell'
      args = [
        '-command',
        `Add-Type -AssemblyName System.Windows.Forms;
     Add-Type -AssemblyName System.Drawing;
     $img = [System.Windows.Forms.Clipboard]::GetImage();
     if ($img -ne $null) {
       $img.Save('${filePath}', [System.Drawing.Imaging.ImageFormat]::Png);
       $img.Dispose();
     } else {
       Write-Error "No image found in clipboard"
     }`
      ]
      break
    case 'darwin':
      fileExtension = '.png'
      mimeType = 'image/png'
      filePath = path.join(
        tempDir,
        `clipboard_image_${randomString}${fileExtension}`
      )
      command = 'osascript'
      args = [
        '-e',
        `set imgFile to (POSIX file "${filePath}")
         try
           set imgData to the clipboard as «class PNGf»
           set fileRef to open for access imgFile with write permission
           write imgData to fileRef
           close access fileRef
         on error
           try
             close access imgFile
           end try
           error "No image found in clipboard"
         end try`
      ]
      break
    case 'linux':
      fileExtension = '.png'
      mimeType = 'image/png'
      filePath = path.join(
        tempDir,
        `clipboard_image_${randomString}${fileExtension}`
      )
      await checkXclipInstalled()
      command = 'sh'
      args = [
        '-c',
        `xclip -selection clipboard -t image/png -o > "${filePath}"`
      ]
      break
    default:
      logger.warn(`Unsupported platform: ${osPlatform}`)
      return null
  }

  try {
    await executeCommand(command, args)
    const base64 = await readFileAsBase64(filePath)
    return `data:${mimeType};base64,${base64}`
  } catch (error) {
    logger.warn(
      'getClipboardImageAsBase64Url Failed to get clipboard image',
      error
    )
    return null
  } finally {
    await safeDeleteFile(filePath)
  }
}

const checkXclipInstalled = async (): Promise<void> => {
  try {
    await executeCommand('which', ['xclip'])
  } catch (error) {
    throw new Error(t('error.xclipNotFound'))
  }
}

const executeCommand = (command: string, args: string[]): Promise<void> =>
  new Promise((resolve, reject) => {
    const childProcess = spawn(command, args)
    let stderr = ''

    childProcess.stderr.on('data', data => {
      stderr += data.toString()
    })

    childProcess.on('close', code => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with code ${code}. Error: ${stderr}`))
      }
    })
  })

const readFileAsBase64 = async (filePath: string): Promise<string | null> => {
  try {
    const data = await fs.readFile(filePath)
    return data.toString('base64')
  } catch (error) {
    logger.warn('readFileAsBase64 Failed to read file as base64', error)
    return null
  }
}

const safeDeleteFile = async (filePath: string): Promise<void> => {
  try {
    await fs.unlink(filePath)
  } catch (error) {
    // File doesn't exist or can't be accessed, no need to do anything
  }
}

type SafeReadClipboardOptions = {
  readImg?: boolean
}

type ClipboardResult = {
  text: string
  img?: string
}

export const safeReadClipboard = async (
  options: SafeReadClipboardOptions = {}
): Promise<ClipboardResult> => {
  const clipboardResult: ClipboardResult = { text: '' }

  if (options.readImg) {
    const img = await getClipboardImageAsBase64Url()
    if (img) {
      clipboardResult.img = img
    }
  }

  try {
    const text = await vscode.env.clipboard.readText()
    if (text) {
      clipboardResult.text = text
    }
  } catch (error) {
    logger.warn('safeReadClipboard Failed to read clipboard text', error)
  }

  return clipboardResult
}
