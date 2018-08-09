"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
function createCompiler(compilerPath) {
    return ((contractPath) => shelljs_1.exec(compilerPath + ' ' + contractPath));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSxxQ0FBOEI7QUFDOUIsdUNBQWdDO0FBRWhDLFNBQWdCLGNBQWMsQ0FBRSxZQUFrQjtJQUNoRCxPQUFPLENBQUMsQ0FBQyxZQUFrQixFQUFFLEVBQUUsQ0FBQyxjQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsR0FBRyxZQUFZLENBQUMsQ0FBYSxDQUFBO0FBQ3RGLENBQUM7QUFGRCx3Q0FFQztBQUVELFNBQWdCLFlBQVksQ0FBRSxPQUFpQjtJQUM3QyxPQUFPLGdCQUFLLENBQUMsVUFBVSxFQUFFLEVBQUUsYUFBYSxFQUFFLElBQUksRUFBRSxDQUFDO1NBQzlDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxRQUFjLEVBQUUsRUFBRTtRQUM1QixPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLFFBQVEsR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUNuRCxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUE7SUFDbkIsQ0FBQyxDQUFDO1NBQ0QsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQWMsRUFBRSxFQUFFO1FBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEdBQUcsUUFBUSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ3ZELE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTtJQUNuQixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFWRCxvQ0FVQyJ9