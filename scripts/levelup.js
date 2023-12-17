import {ModuleName} from "./utils.js";

const ConfirmIcon = "fa-solid fa-check";
const AddIcon = "fa-solid fa-plus";
const DeleteIcon = "fa-solid fa-trash";

var defaultXPChoice = {};

class XPOptionsSettingWindow extends Application {
	constructor(optionssetting, Options = {}) {
		super(Options);
		
		this.optionssetting = optionssetting;
		
		this.XPOptions = game.settings.get(ModuleName, this.optionssetting);
	}
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			popOut: true,
			width: 800,
			height: 400,
			template: `modules/${ModuleName}/templates/defaultwindow.html`,
			jQuery: true,
			title: game.i18n.localize(ModuleName + ".Titles." + "VisionChannels"),
			resizable: true
		});
	}
	
	async getData(pOptions={}) {
		return {
			content: await this.getHTML(pOptions)
		};
	}
	
	async getHTML(pOptions={}) {
		let vEntriesHTML = `<table name = "XPentries">`;
		
		vEntriesHTML = vEntriesHTML + 	`<tr name="header" style="border: 1px solid #dddddd">
											<th style="border: 1px solid #dddddd">${game.i18n.localize(ModuleName + ".Titles.XPOption")}</th>
											<th style="border: 1px solid #dddddd"></th>
										</tr>`;
		
		for (const key of Object.keys(this.XPOptions)) {
			vEntriesHTML = vEntriesHTML + 	`	<tr name="${key}">
													<td> <input name="Name" type="text" value="${this.XPOptions[key].Name}"> </td>
													<td style="text-align: center"> <i name="delete" class="${DeleteIcon}"></i> </td>
												</tr>`;
		}
		
		vEntriesHTML = vEntriesHTML + `</table>`;
		
		//buttons	
		let vButtonsHTML = 				`<div class="form-group" style="display:flex;flex-direction:column;align-items:center;gap:1em;margin-top:1em">
											<button type="button" name="addXPOption"> <i class="${AddIcon}"></i> ${game.i18n.localize(ModuleName + ".Titles.addXPOption")} </button>
											<button type="button" name="confirmChanges"> <i class="${ConfirmIcon}"></i> ${game.i18n.localize(ModuleName + ".Titles.confirmChanges")} </button>
										</div>`;
										
		return vEntriesHTML + vButtonsHTML;
	}
	
	activateListeners(HTML) {
		const AddButton = HTML.find(`button[name="addXPOption"]`);
		
		AddButton.on("click", () => {	this.XPOptions[randomID()] = {...defaultXPChoice};
										this.render();});
											
		const channelEntries = HTML.find(`tr`);
		
		channelEntries.each((number, element) => {
			let id = $(element).attr("name");
			
			$(element).find(`i[name="delete"]`).on("click", () => {	delete this.XPOptions[id];
																	this.render()});
		});
		
		const confirmButton = HTML.find(`button[name="confirmChanges"]`);
		
		confirmButton.on("click", () => {	this.saveXPChoices();
											this.close()});
	}
	
	saveXPChoices() {
		let HTML = this.element;
		
		let XPoptions = {};
		
		let entries = HTML.find(`table`).find(`tr`);
		
		const settingKeys = Object.keys(defaultXPChoice);
		
		entries.each((number, element) => {
			let id = $(element).attr("name");
			
			if (id != "header") {
				XPoptions[id] = {};
				
				for (const key of settingKeys) {
					const input = $(element).find(`[name="${key}"]`);
					
					XPoptions[id][key] = valueofInput(input);
				}
			}
		});
		
		game.settings.set(ModuleName, this.optionssetting, XPoptions);
	}
}

class gainXPWindow extends Application {
	constructor(actor, optionssetting, Options = {}) {
		super(Options);
		
		this.actor = actor;
		this.optionssetting = optionssetting;
		
		this.XPOptions = game.settings.get(ModuleName, this.optionssetting);
		
		if (!this.actor) {
			this.close();
		}
	}
	
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			popOut: true,
			width: 800,
			height: 400,
			template: `modules/${ModuleName}/templates/defaultwindow.html`,
			jQuery: true,
			title: game.i18n.localize(ModuleName + ".Titles." + "VisionChannels"),
			resizable: true
		});
	}
	
	async getData(pOptions={}) {
		return {
			content: await this.getHTML(pOptions)
		};
	}
	
	async getHTML(pOptions={}) {
		let vEntriesHTML = ``;
		
		for (const key of Object.keys(this.XPOptions)) {
			vEntriesHTML = vEntriesHTML + 	`<div class="XPoption" name="${key}">
												<input type="checkbox" id="${key}">
												<span>${this.XPOptions[key].Name}</span>
											</div>`;
		}
		
		//buttons	
		let vButtonsHTML = 				`<div class="form-group" style="display:flex;flex-direction:column;align-items:center;gap:1em;margin-top:1em">
											<button type="button" name="confirmXP"> <i class="${ConfirmIcon}"></i> ${game.i18n.localize(ModuleName + ".Titles.confirmXP")} </button>
										</div>`;
										
		return vEntriesHTML + vButtonsHTML;
	}
	
	activateListeners(HTML) {
		const confirmButton = HTML.find(`button[name="confirmChanges"]`);
		
		confirmButton.on("click", () => {	this.applyXP();
											this.close()});
	}
	
	applyXP() {
		let HTML = this.element;
		
		let gainedXP = 0;
		
		let entries = HTML.find(`div.XPoption`);
		
		const settingKeys = Object.keys(defaultXPChoice);
		
		entries.each((number, element) => {
			let id = $(element).attr("name");
			
			if (id != "header") {
				if (valueofInput(element.find(`input[type="checkbox"]`))) {
					gainedXP = gainedXP + 1;
				}
			}
		});
		
		let targetvalue = this.actor.system.exp + gainedXP;
		
		this.actor.update({system : {exp : targetvalue}})
	}
}

function valueofInput(input) {
	switch (input.prop("type")) {
		case "checkbox":
			return input.prop("checked");
			break;
		default:
			return input.val();
			break;
	}		
} 

function fixXPoptionSetting(setting) {
	defaultXPChoice = {
		Name : game.i18n.localize(ModuleName + ".Titles.XPOption")
	}

	let options = game.settings.get(ModuleName, setting);
	
	for (let key of Object.keys(options)) {
		for (let settingkey of Object.keys(defaultXPChoice)) {
			if (!options[key].hasOwnProperty(settingkey)) {
				options[key][settingkey] = defaultXPChoice[settingkey];
			}
		}
	}
	
	game.settings.set(ModuleName, setting, options);
}

//ui
function addBuilderButton(app, html, infos) {
	if (game.user.isGM) {
		const xpbutton = document.createElement("li");
		xpbutton.classList.add("control-tool");
		xpbutton.setAttribute("data-tool", "levelup");
		xpbutton.setAttribute("data-tooltip", game.i18n.localize(ModuleName+".Titles.LevelUP"));
		
		const icon = document.createElement("i");
		icon.classList.add("fa-solid", "fa-arrow-up");
		
		xpbutton.appendChild(icon);
		
		xpbutton.onclick = () => {game.socket.emit("module." + ModuleName, {functionname : "levelup", data : {}});}

		ui.controls.element[0].querySelector('[id="tools-panel-token"]').lastElementChild.after(xpbutton);
	}
}

Hooks.once("ready", () => {
	game.socket.on("module." + ModuleName, async ({functionname, data} = {}) => {
		switch(functionname) {
			case "levelup": 
				await game.user.character.setFlag(ModuleName, "levelup", true);
				
				ui.ARGON?.render();
				break;
		}
	});
});

Hooks.on("renderSceneControls", (app, html, infos) => {addBuilderButton(app, html, infos);});

export {fixXPoptionSetting, XPOptionsSettingWindow, gainXPWindow};