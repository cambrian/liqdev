"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
function createCompiler(compilerPath) {
    return (contractPath) => shelljs_1.exec(compilerPath + ' ' + contractPath);
}
exports.createCompiler = createCompiler;
function startWatcher(compile) {
    return chokidar_1.watch('**/*.liq', { ignoreInitial: true })
        .on('add', (filePath) => {
        console.log('Compiling new file ' + filePath + '.');
        compile(filePath);
    })
        .on('change', (filePath) => {
        console.log('Compiling changed file ' + filePath + '.');
        compile(filePath);
    });
}
exports.startWatcher = startWatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxxQ0FBOEI7QUFDOUIsdUNBQWdDO0FBRWhDLFNBQWdCLGNBQWMsQ0FBRSxZQUFrQjtJQUNoRCxPQUFPLENBQUMsWUFBa0IsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQUE7QUFDeEUsQ0FBQztBQUZELHdDQUVDO0FBRUQsU0FBZ0IsWUFBWSxDQUFFLE9BQWlCO0lBQzdDLE9BQU8sZ0JBQUssQ0FBQyxVQUFVLEVBQUUsRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDOUMsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQWMsRUFBRSxFQUFFO1FBQzVCLE9BQU8sQ0FBQyxHQUFHLENBQUMscUJBQXFCLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNuQixDQUFDLENBQUM7U0FDRCxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBYyxFQUFFLEVBQUU7UUFDL0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsR0FBRyxRQUFRLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDdkQsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ25CLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQVZELG9DQVVDIn0=