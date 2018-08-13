"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const shelljs_1 = require("shelljs");
const chokidar_1 = require("chokidar");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYnVpbGQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSw2QkFBNEI7QUFJNUIscUNBQThCO0FBQzlCLHVDQUFnQztBQUVoQyxTQUFnQixjQUFjLENBQUUsWUFBa0I7SUFDaEQsT0FBTyxDQUFDLENBQUMsWUFBa0IsRUFBRSxFQUFFLENBQUMsY0FBSSxDQUFDLFlBQVksR0FBRyxHQUFHLEdBQUcsWUFBWSxDQUFDLENBQWEsQ0FBQTtBQUN0RixDQUFDO0FBRkQsd0NBRUM7QUFFRCxTQUFnQixZQUFZLENBQUUsT0FBaUIsRUFBRSxJQUFJLEdBQUcsVUFBVTtJQUNoRSxPQUFPLGdCQUFLLENBQUMsSUFBSSxDQUFDO1FBQ2hCLHNGQUFzRjtRQUN0Rix3REFBd0Q7U0FDdkQsRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDLElBQVUsRUFBRSxFQUFFO1FBQ3hCLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxNQUFNO1lBQUUsT0FBTTtRQUN6QyxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQTtRQUMvQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDZixDQUFDLENBQUM7U0FDRCxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBVSxFQUFFLEVBQUU7UUFDM0IsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLE1BQU07WUFBRSxPQUFNO1FBQ3pDLE9BQU8sQ0FBQyxHQUFHLENBQUMseUJBQXlCLEdBQUcsSUFBSSxHQUFHLEdBQUcsQ0FBQyxDQUFBO1FBQ25ELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQTtJQUNmLENBQUMsQ0FBQyxDQUFBO0FBQ04sQ0FBQztBQWRELG9DQWNDIn0=