#! /usr/bin/env node

const minimist = require("minimist")
const express = require("express")
const path = require("path")
const stamp = require("jtree/products/stamp.nodejs.js")
const fse = require("fs-extra")
const fs = require("fs")

class DudPage {
	isDraft() {}
}

class DudBlog {
	constructor() {}
	fromHtmlStamp() {}
	toHtmlStamp() {}

	get publishedPages() {}
}

class DudServer {
	constructor(blogFolder = __dirname + "/sampleBlog") {
		this.folder = blogFolder
	}

	folder = ""

	get filesFolder() {
		return this.folder + "/files"
	}

	startListening(port) {
		const app = new express()

		app.use(express.static(this.filesFolder))

		app.listen(port, () => {
			console.log(`\n🌌 ​Running Dud. cmd+dblclick: http://localhost:${port}/`)
		})
	}

	toStamp() {
		const providedPathWithoutEndingSlash = this.folder.replace(/\/$/, "")
		const absPath = path.resolve(providedPathWithoutEndingSlash)
		return stamp.dirToStampWithContents(absPath)
	}
}

const CommandFnDecoratorSuffix = "Command"

const serveBlogHelp = (folder = "example.com") => `\n\ndud serveBlog ${folder} 8080\n\n`

const resolvePath = (folder = "") => (folder.startsWith("/") ? folder : path.resolve(__dirname + "/" + folder))

class DudCli {
	execute(argv) {
		console.log("\n🚀🚀🚀 WELCOME TO DUD 🚀🚀🚀")
		const command = argv[0]
		const commandName = `${command}${CommandFnDecoratorSuffix}`
		const param1 = argv[1]
		const param2 = argv[2]
		// Note: if we need a param3, we are doing it wrong. At
		// that point, we'd be better off taking an options map.
		if (this[commandName]) this[commandName](param1, param2)
		else this.helpCommand()
	}

	_getAllCommands() {
		return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
			.filter(word => word.endsWith(CommandFnDecoratorSuffix))
			.sort()
	}

	async createBlogCommand(destinationFolderName = `new-blog-${Date.now()}`) {
		const template = new DudServer().toStamp().replace(/sampleBlog/g, destinationFolderName)
		await new stamp(template).execute()
		console.log(`\n🎆 Blog created! Now you can run:${serveBlogHelp(destinationFolderName)}`)
	}

	_exit(message) {
		console.log(`\n❌ ${message}\n`)
		process.exit()
	}

	_ensureBlogExists(folder) {
		if (!fs.existsSync(folder)) this._exit(`No blog exists in folder ${folder}`)
	}

	deleteBlogCommand() {
		console.log(`\n💡 To delete a blog just use the "rm" tool\n`)
	}

	serveBlogCommand(folder, portNumber) {
		if (!folder || !portNumber) this._exit(`Folder name and port must be provided. Usage:${serveBlogHelp()}`)
		const fullPath = resolvePath(folder)
		this._ensureBlogExists(fullPath)
		const server = new DudServer(fullPath)
		server.startListening(portNumber)
	}

	helpCommand() {
		console.log(
			`\nThis is the Dud help page.\n\nAvailable commands are:\n\n${this._getAllCommands()
				.map(comm => `🏀 ` + comm.replace(CommandFnDecoratorSuffix, ""))
				.join("\n")}\n​​`
		)
	}

	exportBlogCommand(folder) {
		if (!folder) this._exit(`Folder name must be provided`)
		const fullPath = resolvePath(folder)
		this._ensureBlogExists(fullPath)
		console.log(new DudServer(fullPath).toStamp())
	}
}

if (module && !module.parent) new DudCli().execute(process.argv.slice(2))

module.exports = { DudServer, DudCli, DudBlog }
