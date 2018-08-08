"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
exports.commandName = 'liqdev';
exports.compilerPath = '~/.liqdev/liquidity/_obuild/liquidity/liquidity.asm';
exports.defaultProvider = 'http://127.0.0.1:18731';
exports.unitTestExtension = '.utest.json';
exports.integrationTestExtension = '.itest.json';
exports.seed = 0;
exports.bootstrapAccounts = {
    bootstrap1: {
        sk: 'edskRuR1azSfboG86YPTyxrQgosh5zChf5bVDmptqLTb5EuXAm9rsnDYfTKhq7rDQujdn5WWzwUMeV3agaZ6J2vPQT58jJAJPi',
        pk: 'edpkuBknW28nW72KG6RoHtYW7p12T6GKc7nAbwYX5m8Wd9sDVC9yav',
        pkh: 'tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx'
    }
};
exports.bootstrapRegistry = {
    accounts: immutable_1.Map(exports.bootstrapAccounts),
    contracts: immutable_1.Map()
};
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUErQjtBQUdsQixRQUFBLFdBQVcsR0FBRyxRQUFRLENBQUE7QUFDdEIsUUFBQSxZQUFZLEdBQUcscURBQXFELENBQUE7QUFDcEUsUUFBQSxlQUFlLEdBQUcsd0JBQXdCLENBQUE7QUFFMUMsUUFBQSxpQkFBaUIsR0FBRyxhQUFhLENBQUE7QUFDakMsUUFBQSx3QkFBd0IsR0FBRyxhQUFhLENBQUE7QUFDeEMsUUFBQSxJQUFJLEdBQUcsQ0FBQyxDQUFBO0FBRVIsUUFBQSxpQkFBaUIsR0FBRztJQUMvQixVQUFVLEVBQUU7UUFDVixFQUFFLEVBQUUsb0dBQW9HO1FBQ3hHLEVBQUUsRUFBRSx3REFBd0Q7UUFDNUQsR0FBRyxFQUFFLHNDQUFzQztLQUM1QztDQUNGLENBQUE7QUFFWSxRQUFBLGlCQUFpQixHQUFhO0lBQ3pDLFFBQVEsRUFBRSxlQUFHLENBQUMseUJBQWlCLENBQUM7SUFDaEMsU0FBUyxFQUFFLGVBQUcsRUFBRTtDQUNqQixDQUFBO0FBRVksUUFBQSxTQUFTLEdBQUc7SUFDdkIsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixNQUFNLEVBQUUsY0FBYztDQUN2QixDQUFBO0FBRVksUUFBQSxTQUFTLEdBQUc7SUFDdkIsS0FBSyxFQUFFLGdCQUFnQjtJQUN2QixNQUFNLEVBQUUsY0FBYztDQUN2QixDQUFBO0FBRVksUUFBQSxVQUFVLEdBQUc7SUFDeEIsS0FBSyxFQUFFLGlCQUFpQjtJQUN4QixNQUFNLEVBQUUsZUFBZTtDQUN4QixDQUFBO0FBRVksUUFBQSxRQUFRLEdBQUc7SUFDdEIsS0FBSyxFQUFFLGVBQWU7SUFDdEIsTUFBTSxFQUFFLGFBQWE7Q0FDdEIsQ0FBQTtBQUVZLFFBQUEsVUFBVSxHQUFHO0lBQ3hCLEtBQUssRUFBRSxpQkFBaUI7SUFDeEIsTUFBTSxFQUFFLGVBQWU7Q0FDeEIsQ0FBQTtBQUVZLFFBQUEsU0FBUyxHQUFHO0lBQ3ZCLEtBQUssRUFBRSxnQkFBZ0I7SUFDdkIsTUFBTSxFQUFFLGNBQWM7Q0FDdkIsQ0FBQSJ9