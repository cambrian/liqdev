"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commandName = 'liqdev';
exports.compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm';
exports.defaultProvider = 'http://127.0.0.1:18731';
exports.unitTestExtension = '.utest.json';
exports.integrationTestExtension = '.itest.json';
exports.seed = 0;
exports.setupPath = {
    local: './lib/setup.sh',
    global: 'liqdev-setup'
};
exports.bakerPath = {
    local: './lib/baker.sh',
    global: 'liqdev-baker'
};
exports.clientPath = {
    local: './lib/client.sh',
    global: 'liqdev-client'
};
exports.killPath = {
    local: './lib/kill.sh',
    global: 'liqdev-kill'
};
exports.deployPath = {
    local: './lib/deploy.sh',
    global: 'liqdev-deploy'
};
exports.whichPath = {
    local: './lib/which.sh',
    global: 'liqdev-which'
};
// Bootstrap 1 in the sandbox.
exports.testAccount = {
    pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
    pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx',
    sk: 'edsk3gUfUPyBSfrS9CCgmCiQsTCHGkviBDusMxDJstFtojtc1zcpsh'
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFhLFFBQUEsV0FBVyxHQUFHLFFBQVEsQ0FBQTtBQUN0QixRQUFBLFlBQVksR0FBRyxxREFBcUQsQ0FBQTtBQUNwRSxRQUFBLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQTtBQUUxQyxRQUFBLGlCQUFpQixHQUFHLGFBQWEsQ0FBQTtBQUNqQyxRQUFBLHdCQUF3QixHQUFHLGFBQWEsQ0FBQTtBQUN4QyxRQUFBLElBQUksR0FBRyxDQUFDLENBQUE7QUFFUixRQUFBLFNBQVMsR0FBRztJQUN2QixLQUFLLEVBQUUsZ0JBQWdCO0lBQ3ZCLE1BQU0sRUFBRSxjQUFjO0NBQ3ZCLENBQUE7QUFFWSxRQUFBLFNBQVMsR0FBRztJQUN2QixLQUFLLEVBQUUsZ0JBQWdCO0lBQ3ZCLE1BQU0sRUFBRSxjQUFjO0NBQ3ZCLENBQUE7QUFFWSxRQUFBLFVBQVUsR0FBRztJQUN4QixLQUFLLEVBQUUsaUJBQWlCO0lBQ3hCLE1BQU0sRUFBRSxlQUFlO0NBQ3hCLENBQUE7QUFFWSxRQUFBLFFBQVEsR0FBRztJQUN0QixLQUFLLEVBQUUsZUFBZTtJQUN0QixNQUFNLEVBQUUsYUFBYTtDQUN0QixDQUFBO0FBRVksUUFBQSxVQUFVLEdBQUc7SUFDeEIsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixNQUFNLEVBQUUsZUFBZTtDQUN4QixDQUFBO0FBRVksUUFBQSxTQUFTLEdBQUc7SUFDdkIsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixNQUFNLEVBQUUsY0FBYztDQUN2QixDQUFBO0FBRUQsOEJBQThCO0FBQ2pCLFFBQUEsV0FBVyxHQUFHO0lBQ3pCLEVBQUUsRUFBRSx3REFBd0Q7SUFDNUQsR0FBRyxFQUFFLHNDQUFzQztJQUMzQyxFQUFFLEVBQUUsd0RBQXdEO0NBQzdELENBQUEifQ==