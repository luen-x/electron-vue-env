// const exec = require("child_process").exec;
// exec("npm run start", function(error, stdout, stderr) {
// 	console.log(error, stdout, stderr);
// });

// #!/usr/bin/env node

const { semver, error } = require("@vue/cli-shared-utils");
// const requiredVersion = require('../package.json').engines.node

// if (!semver.satisfies(process.version, requiredVersion, { includePrerelease: true })) {
//   error(
//     `You are using Node ${process.version}, but vue-cli-service ` +
//     `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
//   )
//   process.exit(1)
// }

const Service = require("@vue/cli-service/lib/Service");
const devRuner = require("./dev-runer");
const service = new Service(process.env.VUE_CLI_CONTEXT || process.cwd());

// const rawArgv = process.argv.slice(2)
// const args = require('minimist')(rawArgv, {
//   boolean: [
//     // build
//     'modern',
//     'report',
//     'report-json',
//     'inline-vue',
//     'watch',
//     // serve
//     'open',
//     'copy',
//     'https',
//     // inspect
//     'verbose'
//   ]
// })
// const command = args._[0]

service
	.run("serve", {}, [])
	.then(() => {
		console.log("over");
		setTimeout(() => {
			devRuner.startElectron();
		}, 100);
	})
	.catch(err => {
		error(err);
		process.exit(1);
	});
