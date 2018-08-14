"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const chokidar_1 = require("chokidar");
const shelljs_1 = require("shelljs");
function createCompiler(compilerPath) {
    return ((contractPath) => shelljs_1.exec(compilerPath + ' ' + contractPath));
}
exports.createCompiler = createCompiler;
function startWatcher(compile, glob = '**/*.liq') {
    return chokidar_1.watch(glob)
        // For some reason the initial add isn't filtered at all. But we want to filter anyway
        // because the user could have globbed some weird stuff.
        .on('add', (file) => {
        if (path.extname(file) !== '.liq')
            return;
        console.log('Compiling new file ' + file + '.');
        compile(file);
    })
        .on('change', (file) => {
        if (path.extname(file) !== '.liq')
            return;
        console.log('Compiling changed file ' + file + '.');
        compile(file);
    });
}
exports.startWatcher = startWatcher;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNEI7QUFHNUIsdUNBQTJDO0FBRTNDLHFDQUE4QjtBQUU5QixTQUFnQixjQUFjLENBQUUsWUFBa0I7SUFDaEQsT0FBTyxDQUFDLENBQUMsWUFBa0IsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQWEsQ0FBQTtBQUN0RixDQUFDO0FBRkQsd0NBRUM7QUFFRCxTQUFnQixZQUFZLENBQUUsT0FBaUIsRUFBRSxPQUFlLFVBQVU7SUFDeEUsT0FBTyxnQkFBSyxDQUFDLElBQUksQ0FBQztRQUNoQixzRkFBc0Y7UUFDdEYsd0RBQXdEO1NBQ3ZELEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxJQUFVLEVBQUUsRUFBRTtRQUN4QixJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssTUFBTTtZQUFFLE9BQU07UUFDekMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsR0FBRyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUE7UUFDL0MsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQ2YsQ0FBQyxDQUFDO1NBQ0QsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQzNCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxNQUFNO1lBQUUsT0FBTTtRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLHlCQUF5QixHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUNuRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZixDQUFDLENBQUMsQ0FBQTtBQUNOLENBQUM7QUFkRCxvQ0FjQyJ9