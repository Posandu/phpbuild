/**
 * Import the stuff
 */
import fs from "fs-extra";
import path from "path";
import chalk from "chalk";

import sass from "sass";
import CleanCSS from "clean-css";
import esbuild from "esbuild";
import md5File from "md5-file";
import glob from "glob";

import task from "./task.js";

/**
 * Check if production mode
 */
const production = process.argv.slice(2)[0] === "--production" ? true : false;

/**
 * Save __dirname for later use
 */
const __dirname = "./";

/**
 * Constants
 */
const srcDir = path.join(__dirname, "src");
const distDir = path.join(__dirname, production ? "build" : "dist");

const scssDir = path.join(srcDir, "scss");
const scssFiles = fs.readdirSync(scssDir);

const jsDir = path.join(srcDir, "js");
const jsFiles = fs.readdirSync(jsDir);

/**
 * Cleans the dist directory
 * @returns {void}
 */
const clean = () => {
	fs.emptyDirSync(distDir);
};

/**
 * Hash a file
 * @param {file} file 
 * @returns {String} Hash of the file
 */
const hashFile = (file) => md5File.sync(file);

/**
 * Compile SCSS to CSS
 * @param {file} SCSS file 
 * @returns {String} CSS
 */
const css_to_scss = (file) => {
	const res = sass.compile(file);
	return res.css.toString();
};

/**
 * The Main function to compile the SCSS files
 * @returns {void}
 */
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

		let result = css_to_scss(scssFile);

		/**
		 * Minify in production
		 */
		if (production) {
			result = new CleanCSS().minify(result);
		}

		const cssFile = path.join(distDir, `${hash}.css`);

		try {
			// Create the CSS file
			fs.writeFileSync(
				cssFile,
				`/* ${hash}.css */ \n ${production ? result.styles : result}`
			);

			console.log(chalk.green(`${chalk.gray(file + " compiled")} ${hash}`));
		} catch (error) {}

		// If the file is empty, delete it
		if (result < 1) {
			console.log(chalk.yellow(`${scssFile} output is empty`));
			fs.unlinkSync(cssFile);
		}
	});
};

/**
 * Compile JS
 * @returns {void}
 */
const compile_js = () => {
	jsFiles.forEach((file) => {
		// Check if directory
		if (fs.lstatSync(path.join(jsDir, file)).isDirectory()) {
			// If the directory name is node_modules, ignore it
			if (file === "node_modules") {
				return;
			}
		}

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
				minify: production,
				sourcemap: !production,
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

/**
 * Copy the files in the public directory to the dist directory
 * @returns {void}
 */
const copy_public_to_dist = () => {
	fs.copySync(path.join(srcDir, "public"), distDir);
};

/**
 * Copy and optimize the PHP files in the src directory to the dist directory
 * @returns {void}
 */
const copy_php_to_dist = () => {
	fs.copySync(path.join(srcDir, "php"), distDir);

	glob(
		`${production ? "build" : "dist"}/**`,
		{
			dot: true,
		},
		(_, files) => {
			files.forEach((file) => {
				if (file.endsWith(".php")) {
					let split = file.split("/");
					split.shift();

					const phpFile = path.join(srcDir, "php", split.join("/"));
					const phpFileDist = file;

					const php = fs.readFileSync(phpFile, "utf8");

					let newcontent = `${php}`;

					if (production) {
						// get all js_file() calls and their values
						const js_files = newcontent.match(/js_file\((.*)\);/g);

						// replace all js_file() calls with the hash of the file
						if (js_files) {
							let newcontentI = newcontent;

							js_files.forEach((js_file) => {
								// Get all stuff inside the single quotes or double quotes
								const file = js_file.match(/'(.*)'|"(.*)"/g);
								if (file) {
									// Get the file name
									const fileName = file[0].replace(/['"]+/g, "");

									if (fileName) {
										// Replace the js_file() call with the hash of the file
										newcontentI = newcontentI.replace(
											js_file,
											`
									?><script src="${hashFile(path.join(jsDir, fileName + ".js")).substring(
										0,
										8
									)}.js"></script><?php
									`
										);
									}
								}
							});

							newcontent = newcontentI;
						}

						// get all scss_file() calls and their values
						const scss_files = newcontent.match(/scss_file\((.*)\);/g);

						// replace all scss_file() calls with the hash of the file
						if (scss_files) {
							let newcontentI = newcontent;

							scss_files.forEach((scss_file) => {
								// Get all stuff inside the single quotes or double quotes
								const file = scss_file.match(/'(.*)'|"(.*)"/g);
								if (file) {
									// Get the file name
									const fileName = file[0].replace(/['"]+/g, "");

									if (fileName) {
										// Replace the scss_file() call with the hash of the file
										newcontentI = newcontentI.replace(
											scss_file,
											`
									?><link rel="stylesheet" href="${hashFile(
										path.join(scssDir, fileName + ".scss")
									).substring(0, 8)}.css" /><?php
									`
										);
									}
								}
							});

							newcontent = newcontentI;
						}

						// Replace all content between /* @phpbuild remove */ and /* @phpbuild remove end */
						newcontent = newcontent.replace(
							/\/\*\s*@phpbuild remove\s*\*\/[\s\S]*\/\*\s*@phpbuild remove end\s*\*\//g,
							""
						);

						// Replace hot_reload() with a hash
						newcontent = newcontent.replace(/hot_reload\(\);/g, ``);

						// Replace empty <?php ?> tags
						newcontent = newcontent.replace(/<\?php\s*\?>/g, "");

						// replace ?>(Any amout of blank space chars including newline)<?php with nothing
						newcontent = newcontent.replace(/\?>\s*<\?php/g, "");

						// replace <?=(Any amout of blank space chars including newline)?> with nothing
						newcontent = newcontent.replace(/<\?=\s*\?>/g, "");
					}

					fs.writeFileSync(phpFileDist, newcontent);
				}
			});

			if (production) {
				// replace content in utils.php
				const phpFile = path.join(distDir, "utils.php");

				let newcontent = ``;

				fs.writeFileSync(phpFile, newcontent);
			}
		}
	);
};

/**
 * Runs the build process, builds the site.
 * @return {void}
 */
export function run() {
	const runReally = () => {
		task("clean", clean);
		task("compile scss", compile_scss);
		task("compile js", compile_js);
		task("copy public to dist", copy_public_to_dist);
		task("copy php to dist", copy_php_to_dist);
	};

	task("build", runReally);
}

run();
