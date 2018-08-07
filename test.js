const fs = require('fs')
const init = fs.readFileSync('helloworld.liq.init.tz', 'utf8')
const code = fs.readFileSync('helloworld.liq.tz', 'utf8')
console.log(init)
console.log(code)

const eztz = require('eztz').eztz
eztz.node.setProvider('http://127.0.0.1:18731')
const sk = 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh'
const keys = eztz.crypto.extractKeys(sk);

eztz.contract.originate(keys, 2000, code, init, false, false, null, 500)
  .then(console.log).catch(console.error)

// originate: function (keys, amount, code, init, spendable, delegatable, delegate, fee, gasLimit, storageLimit) {
//   if (typeof gasLimit == 'undefined') gasLimit = '10000';
//   if (typeof storageLimit == 'undefined') storageLimit = '10000';
//   return rpc.originate(keys, amount, code, init, spendable, delegatable, delegate, fee, gasLimit, storageLimit);
// }
