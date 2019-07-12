const { DeviceDiscovery } = require('sonos')
const listener = require('sonos').Listener

const request = require('request');

var isPlaying
var isOn
var powerTimeout = null
var changingPowerState = null

DeviceDiscovery((device) => {
  console.log('found device at ' + device.host)
    

    device.on('PlayState', state => {
        displayState(device, state)
    })

    device.on('CurrentTrack', track => {
        console.log('Track changed to %s by %s', track.title, track.artist)
        console.log(`Image at ${JSON.stringify(track)}`)
    })

//   if (device.host === '192.168.102.56') {
    
//     // set listener on main device...
//     device.on('PlayState', state => {
//         handleState(device, state)
//     })
//   }
})

function displayState(device,state) {
    console.log(`Device ${device.host} has following state: ${state}`)
}

function handleState(device,state) {
    if (state === 'transitioning' || state === 'playing') {
        if ((isOn === false || isOn === null || isOn === undefined) && (changingPowerState !== true)) {
            console.log('Now transitioning or playing')
            controlPower('on');
        }

        if (powerTimeout !== null) {
            clearTimeout(powerTimeout);
            powerTimeout = null
            console.log('cleared timeout')
        }
    } 
    else if (state === 'stopped' || state === 'paused') {
        if (isOn === true) {
            console.log('Music stopped or paused & receiver is on, setting timeout')
            powerTimeout = setTimeout(() => {
                console.log('Timeout executing')
                if (changingPowerState !== true){
                    controlPower('off')
                }
                powerTimeout = null
            }, 15*60*1000);
        } 
    }  
}

function controlPower(state,callback) {
    changingPowerState = true
    // console.log(`Setting power to ${state}`)
    if (state === 'on') {
        request('http://192.168.102.55:8080/mac6700on', function (error, response, body) {
            if (!error && response && response.statusCode === 200) {
                isOn = true
                endPowerChange()
            }
        });  
    }
    else if (state === 'off') {
        request('http://192.168.102.55:8080/mac6700off', function (error, response, body) {
            if (!error && response && response.statusCode === 200) {
                isOn = false
                endPowerChange()
            }
        }); 
    }

    function endPowerChange() {
        console.log(`Power is on: ${isOn}`)
        changingPowerState = false
    }
}

process.on('SIGINT', () => {
    console.log('Hold-on cancelling all subscriptions')
    listener.stopListener().then(result => {
      console.log('Cancelled all subscriptions')
      process.exit()
    }).catch(err => {
      console.log('Error cancelling subscriptions, exit in 3 seconds  %s', err)
      setTimeout(() => {
        process.exit(1)
      }, 2500)
    })
  })