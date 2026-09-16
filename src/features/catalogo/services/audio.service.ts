// Som de moeda estilo Mario Bros — sintetizado via Web Audio API (sem arquivos externos)

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext()
  }
  return audioCtx
}

export function playCoinSound(): void {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Nota 1: B5 (987 Hz)
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = "square"
    osc1.frequency.setValueAtTime(987, now)
    gain1.gain.setValueAtTime(0.15, now)
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.08)

    // Nota 2: E6 (1319 Hz) — mais aguda, cria o efeito "moeda"
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = "square"
    osc2.frequency.setValueAtTime(1319, now + 0.06)
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.setValueAtTime(0.15, now + 0.06)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.06)
    osc2.stop(now + 0.18)
  } catch {
    // AudioContext pode estar bloqueado pelo browser — ignora silenciosamente
  }
}
