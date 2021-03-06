const superagent = require('superagent')
const cherrio = require('cheerio')
const schedule = require('node-schedule')
const fs = require('fs')
const url = 'http://fast.ishadow.online/'
const select = '.portfolio-items .portfolio-item'
const splitStr = '\r\n'
// const select = '#free .container .row:nth-child(2) > .col-sm-4'
const translator= {
  'IP Address': 'server',
  'Port': 'server_port',
  'Password': 'password',
  'Method': 'method'
}

function parseServer (str) {
  let server = {}
  str.split('\r\n').forEach(function (s) {
    let kv = s.split(':')
    if (kv.length === 1) {
      kv = s.split('：')
    }
    if (kv.length > 1) {
      let key = kv[0].trim()
      let val = kv[1].trim()
      let trueKey = translator[key]
      if (trueKey) {
        server[trueKey] = val
      }
    }
  })
  return server
}

function loadFreeShadowsocks () {
  let freeShadowsocks = []
  return superagent.get(url).then(function (res){
    let $ = cherrio.load(res.text)
    $(select).each(function(i, elem) {
      freeShadowsocks.push(
        parseServer(
          $(this).text().trim()
        )
      )
    })
    return Promise.resolve(freeShadowsocks)
  })
}

module.exports = loadFreeShadowsocks

if (require.main === module) {
    loadFreeShadowsocks().then(function (freeShadowsocks) {
      fs.writeFile('data/ishadow.js',`module.exports = ${JSON.stringify(freeShadowsocks)}`,"utf8",(err) =>{
        if (err) throw err
        console.log('It\'s saved!')
      })
      console.log(freeShadowsocks)
    }, function (err) {
      console.error(err)
    })
  // schedule.scheduleJob('0 5,30 0,6,12,24 * * *', function(){
  //   console.log('scheduleCronstyle:' + new Date());
  //   loadFreeShadowsocks().then(function (freeShadowsocks) {
  //     console.log(freeShadowsocks)
  //   }, function (err) {
  //     console.error(err)
  //   })
  // })
}
