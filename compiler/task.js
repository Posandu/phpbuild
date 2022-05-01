import chalk from "chalk";

/** The task() function */
const task = (name, fun) => {
	const startTime = performance.now();

	console.log(chalk.green(`${name} started`));

	try {
		fun();
	} catch (e) {
		console.log(chalk.red(`${name} failed`));
		console.log(e);
		return;
	}

	console.log(
		chalk.green(
			`${name} done in ${(performance.now() - startTime).toFixed(2)}ms`
		)
	);
};

export default task;
