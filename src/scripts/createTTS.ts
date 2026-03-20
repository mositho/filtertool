import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js"
import fs from "fs"
import path from "path"

const API_KEY = process.env.ELEVENLABS_API_KEY || ""
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "CwhRBWXzGAHq8TQ4Fs17"
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2"

const elevenlabs = new ElevenLabsClient({ apiKey: API_KEY })

async function createFromElevenLabs(filename: string): Promise<boolean> {
  if (!API_KEY) {
    console.error("Missing ELEVENLABS_API_KEY in .env for ElevenLabs TTS.")
    return false
  }

  const target = filename.endsWith(".mp3") ? filename : `${filename}.mp3`
  const text = path.basename(target, path.extname(target))
  const fileBase = `${Date.now()}_${text.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "")}`
  const tempOutput = `${fileBase}.mp3`

  console.log(`[TTS] Request text: ${text}`)
  console.log(`[TTS] Using voice ID: ${VOICE_ID}, model: ${MODEL_ID}`)
  console.log(`[TTS] Temp file: ${tempOutput}`)
  console.log(`[TTS] Final output: ${target}`)

  try {
    const audio = await elevenlabs.textToSpeech.convert(VOICE_ID, {
      text,
      voiceSettings: {
        speed: 1.2,
      },
      modelId: MODEL_ID,
      outputFormat: "mp3_44100_128",
    })

    const reader = audio.getReader()
    const chunks: Uint8Array[] = []
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }

    fs.writeFileSync(tempOutput, Buffer.concat(chunks.map((c) => Buffer.from(c))))

    const dir = path.dirname(filename)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const target = filename.endsWith(".mp3") ? filename : `${filename}.mp3`
    try {
      fs.renameSync(tempOutput, target)
    } catch (renameError) {
      fs.copyFileSync(tempOutput, target)
      fs.unlinkSync(tempOutput)
    }
    console.log(`[TTS] Created ${target} via ElevenLabs TTS`)
    return true
  } catch (error) {
    console.error(`ElevenLabs TTS failed:`, error)
    if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput)
    return false
  }
}

export async function createTTSFile(filename: string): Promise<void> {
  if (fs.existsSync(filename)) {
    return
  }

  const ok = await createFromElevenLabs(filename)
  if (ok) return

  console.error("ElevenLabs TTS generation failed. Ensure ELEVENLABS_API_KEY and valid voice ID in .env.")
}
