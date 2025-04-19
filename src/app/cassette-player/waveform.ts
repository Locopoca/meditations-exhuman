import WaveSurfer from 'wavesurfer.js'

export function initWaveform() {
  const wavesurfer = WaveSurfer.create({
    container: '#waveform',
    waveColor: '#fff',
    progressColor: '#1B56FD',
    cursorColor: '#fff',
    barWidth: 2,
    height: 100,
    // responsive: true
  })

  return {
    load: (url: string) => wavesurfer.load(url),
    play: () => wavesurfer.play(),
    pause: () => wavesurfer.pause()
  }
}