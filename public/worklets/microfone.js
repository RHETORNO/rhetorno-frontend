class Microfone extends AudioWorkletProcessor {
  constructor() {
    super()
    this.passo = sampleRate / 24000
    this.posicao = 0
    this.saida = []
  }

  process(entradas) {
    const canal = entradas[0]?.[0]
    if (!canal) return true

    for (; this.posicao < canal.length; this.posicao += this.passo) {
      const i = Math.floor(this.posicao)
      const fracao = this.posicao - i
      const a = canal[i]
      const b = canal[i + 1] ?? a
      this.saida.push(a + (b - a) * fracao)
    }
    this.posicao -= canal.length

    if (this.saida.length >= 2400) {
      const pcm = new Int16Array(this.saida.length)
      for (let i = 0; i < pcm.length; i++) {
        const s = Math.max(-1, Math.min(1, this.saida[i]))
        pcm[i] = s < 0 ? s * 32768 : s * 32767
      }
      this.port.postMessage(pcm.buffer, [pcm.buffer])
      this.saida = []
    }

    return true
    
  }
}

registerProcessor("microfone", Microfone)