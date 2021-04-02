const i2c = require('i2c-bus')
const Gpio = require("pigpio").Gpio

i2c.openPromisified(1)
  .then(i2c1 => {
    const printInfo = () => {
      Promise.all([
        i2c1.readByte(0x36, 0x02),
        i2c1.readByte(0x36, 0x03),
        i2c1.readByte(0x36, 0x04),
        i2c1.readByte(0x36, 0x05),
      ])
        .then(([
          byte2,
          byte3,
          byte4,
          byte5,
        ]) => {
          const voltage = (((byte2 << 8) + byte3) >> 4) * 1.25 / 1000
          const capacity = byte4 + byte5 / 256
          console.log('++++++++++++++++++++')
          console.log(`Voltage: ${voltage.toFixed(2)}V`)
          console.log(`capacity: ${Math.round(capacity)}%`)
          if (capacity >= 100) {
                  console.log('Battery FULL')
          } else if (capacity < 20) {
                  console.log( 'Battery LOW')
          }
          console.log( '++++++++++++++++++++')
          console.log()

          setTimeout(printInfo, 2000)
        })
        .catch(err => console.log(err))
    }
    printInfo()
  })
  .catch(err => console.log(err))
  
  

const button = new Gpio(4, {
  mode: Gpio.INPUT,
  pullUpDown: Gpio.PUD_DOWN,
  edge: Gpio.EITHER_EDGE,
})

button.on("interrupt", () => {
  const level = button.digitalRead()
  if (level === 0) {
    console.log("stop charge")
  } else if (level === 1) {
    console.log("start charge")
  }
})

setInterval(() => {
  const level = button.digitalRead()
  if (level === 0) {
    console.log("no charging")
  } else if (level === 1) {
    console.log("is charging")
  }
}, 2000)