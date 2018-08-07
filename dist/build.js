"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
exports.createCompiler = (compilerPath) => (contractPath) => shelljs_1.exec(compilerPath + ' ' + contractPath);
exports.startWatcher = (compile) => chokidar_1.watch('**/*.liq', { ignoreInitial: true })
    .on('add', (filePath) => {
    console.log('Compiling new file ' + filePath + '.');
    compile(filePath);
})
    .on('change', (filePath) => {
    console.log('Compiling changed file ' + filePath + '.');
    compile(filePath);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxxQ0FBOEI7QUFDOUIsdUNBQWdDO0FBRW5CLFFBQUEsY0FBYyxHQUFHLENBQUMsWUFBa0IsRUFBWSxFQUFFLENBQzdELENBQUMsWUFBa0IsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUE7QUFFcEQsUUFBQSxZQUFZLEdBQUcsQ0FBQyxPQUFpQixFQUFFLEVBQUUsQ0FDaEQsZ0JBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUM7S0FDdkMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQWMsRUFBRSxFQUFFO0lBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQ25ELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtBQUNuQixDQUFDLENBQUM7S0FDRCxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBYyxFQUFFLEVBQUU7SUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDdkQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQ25CLENBQUMsQ0FBQyxDQUFBIn0=