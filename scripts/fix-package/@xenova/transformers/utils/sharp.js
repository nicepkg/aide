// mock sharp
class Sharp {
  constructor(input) {
    this.input = input
    this.operations = []
  }

  resize(width, height, options = {}) {
    this.operations.push({ type: 'resize', width, height, options })
    return this
  }

  rotate(angle, options = {}) {
    this.operations.push({ type: 'rotate', angle, options })
    return this
  }

  blur(sigma = 1) {
    this.operations.push({ type: 'blur', sigma })
    return this
  }

  toBuffer() {
    return new Promise(resolve => {
      console.log('Simulated image processing:')
      console.log('Input:', this.input)
      this.operations.forEach(op => {
        console.log('Operation:', op.type, op)
      })
      resolve(Buffer.from('Simulated image buffer'))
    })
  }

  toFile(output) {
    return new Promise(resolve => {
      console.log('Simulated image processing:')
      console.log('Input:', this.input)
      this.operations.forEach(op => {
        console.log('Operation:', op.type, op)
      })
      console.log('Output:', output)
      resolve({ format: 'jpeg', width: 100, height: 100, channels: 3 })
    })
  }
}

export default function (input) {
  return new Sharp(input)
}
