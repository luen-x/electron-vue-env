const exec = require("child_process").exec;

console.log(process.argv, "index----------");

if (process.argv.includes(".")) {
	console.log('dev------')
	require("./main.dev");
} else {
	console.log('prod------')
	require("./main.prod");
}
