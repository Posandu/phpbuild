import fs from "fs-extra";
import path from "path";
import chalk from "chalk";
import { dirname } from "path";
import { fileURLToPath } from "url";

import sass from "sass";
import CleanCSS from "clean-css";
import esbuild from "esbuild";
import md5File from "md5-file";

const __dirname = dirname(fileURLToPath(import.meta.url));

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

const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, "dist");

const scssDir = path.join(srcDir, "scss");
const scssFiles = fs.readdirSync(scssDir);

const jsDir = path.join(srcDir, "js");
const jsFiles = fs.readdirSync(jsDir);

// delete all files in the dist directory
const clean = () => {
	fs.emptyDirSync(distDir);
};

const hashFile = (file) => md5File.sync(file);

const compile_scss = () => {
	scssFiles.forEach((file) => {
		// Ignore files that don't end in .scss
		if (!file.endsWith(".scss")) {
			console.log(chalk.yellow(`Ignoring ${file}`));
			return;
		}
		// If the file name starts with an underscore, ignore it
		if (file.charAt(0) === "_") {
			return;
		}

		// Compile the SCSS file and create the CSS file in the dist directory
		const scssFile = path.join(scssDir, file);

		const hash = hashFile(scssFile).substring(0, 8);

		let result = sass.compile(scssFile);
		result = new CleanCSS().minify(result.css);

		const cssFile = path.join(distDir, `${hash}.css`);

		try {
			// Create the CSS file
			fs.writeFileSync(cssFile, `/* ${hash}.css */ \n ${result.styles}`);

			console.log(chalk.green(`${chalk.gray(file + " compiled")} ${hash}`));
		} catch (error) {}

		// If the file is empty, delete it
		if (result.styles.length === 0) {
			console.log(chalk.yellow(`${scssFile} output is empty`));
			fs.unlinkSync(cssFile);
		}
	});
};

const compile_js = () => {
	jsFiles.forEach((file) => {
		// Ignore files that don't end in .js
		if (!file.endsWith(".js")) {
			console.log(chalk.yellow(`Ignoring ${file}`));
			return;
		}

		// If the file name starts with an underscore, ignore it
		if (file.charAt(0) === "_") {
			return;
		}

		// Compile the JS file and create the JS file in the dist directory
		const jsFile = path.join(jsDir, file);

		const hash = hashFile(jsFile).substring(0, 8);

		const jsFileDist = path.join(distDir, `${hash}.js`);

		try {
			// Create the JS file bundle
			esbuild.build({
				bundle: true,
				outfile: jsFileDist,
				minify: true,
				sourcemap: false,
				entryPoints: [jsFile],
			});

			console.log(chalk.green(`${chalk.gray(file + " compiled")} ${hash}`));
		} catch (error) {}

		// If the file is empty, delete it
		if (fs.readFileSync(jsFile).length === 0) {
			console.log(chalk.yellow(`${jsFile} output is empty`));
			fs.unlinkSync(jsFileDist);
		}
	});
};

const copy_public_to_dist = () => {
	fs.copySync(path.join(srcDir, "public"), distDir);
};

const copy_php_to_dist = () => {
	fs.copySync(path.join(srcDir, "php"), distDir);
	const files = fs.readdirSync(path.join(srcDir, "php"));
	files.forEach((file) => {
		if (file.endsWith(".php")) {
			// Minify the PHP file
			const phpFile = path.join(srcDir, "php", file);
			const phpFileDist = path.join(distDir, file);

			const php = fs.readFileSync(phpFile, "utf8");
			const hash = hashFile(phpFile);

			let newcontent = `<?php /* ${hash} */ ?> \n ${php}`;

			fs.writeFileSync(phpFileDist, newcontent);
		}
	});
};

task("clean", clean);
task("compile scss", compile_scss);
task("compile js", compile_js);
task("copy public to dist", copy_public_to_dist);
task("copy php to dist", copy_php_to_dist);