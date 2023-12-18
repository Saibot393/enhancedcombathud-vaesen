import { ModuleName } from "./utils.js";
import { fixXPoptionSetting, XPOptionsSettingWindow } from "./levelup.js";

Hooks.once("init", () => {  // game.settings.get(cModuleName, "")
  //Settings
  //world
  game.settings.register(ModuleName, "XPoptions", {
	scope: "world",
	config: false,
	type: Object,
	default: {}
  });
  
  game.settings.register(ModuleName, "ShowLevelUpButton", {
	name: game.i18n.localize(ModuleName+".Settings.ShowLevelUpButton.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowLevelUpButton.descrp"),
	scope: "world",
	config: true,
	type: Boolean,
	default: true,
	requiresReload: true
  });
  
  game.settings.register(ModuleName, "MentalInjurieTable", {
	name: game.i18n.localize(ModuleName+".Settings.MentalInjurieTable.name"),
	hint: game.i18n.localize(ModuleName+".Settings.MentalInjurieTable.descrp"),
	scope: "world",
	config: true,
	type: String,
	default: "dwAyC3ED1v2Uo7Ha"
  });
  
  game.settings.register(ModuleName, "PhysicalInjurieTable", {
	name: game.i18n.localize(ModuleName+".Settings.PhysicalInjurieTable.name"),
	hint: game.i18n.localize(ModuleName+".Settings.PhysicalInjurieTable.descrp"),
	scope: "world",
	config: true,
	type: String,
	default: "D4QOf1Mj4NL2ke7C"
  });
  
  //client
  game.settings.register(ModuleName, "TreatType", {
	name: game.i18n.localize(ModuleName+".Settings.TreatType.name"),
	hint: game.i18n.localize(ModuleName+".Settings.TreatType.descrp"),
	scope: "client",
	config: true,
	type: String,
	choices: {
		"physical" : game.i18n.localize("CONDITION.PHYSICAL"),
		"mental" : game.i18n.localize("CONDITION.MENTAL")
	},
	default: "physical",
	requiresReload: true
  });
  
  game.settings.register(ModuleName, "ShowTalents", {
	name: game.i18n.localize(ModuleName+".Settings.ShowTalents.name"),
	hint: game.i18n.localize(ModuleName+".Settings.ShowTalents.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false,
	requiresReload: true
  });
  
  game.settings.register(ModuleName, "UseDiceCircles", {
	name: game.i18n.localize(ModuleName+".Settings.UseDiceCircles.name"),
	hint: game.i18n.localize(ModuleName+".Settings.UseDiceCircles.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false,
	requiresReload: true
  });
  
  game.settings.register(ModuleName, "AutoRollInjuries", {
	name: game.i18n.localize(ModuleName+".Settings.AutoRollInjuries.name"),
	hint: game.i18n.localize(ModuleName+".Settings.AutoRollInjuries.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false
  });
  
  /*
  game.settings.register(ModuleName, "AutoApplyBroken", {
	name: game.i18n.localize(ModuleName+".Settings.AutoApplyBroken.name"),
	hint: game.i18n.localize(ModuleName+".Settings.AutoApplyBroken.descrp"),
	scope: "client",
	config: true,
	type: Boolean,
	default: false
  });
  */
});

Hooks.once("ready", () => {
	fixXPoptionSetting("XPoptions");
});

//Hooks
Hooks.on("renderSettingsConfig", (pApp, pHTML, pData) => {
	pHTML.find(`div.form-group[data-setting-id="${ModuleName}.ShowLevelUpButton"]`).after(`<button name="openXPoptionsmenu"> ${game.i18n.localize(ModuleName + ".Titles.openXPoptionsmenu")}</button>`)
	pHTML.find(`button[name="openXPoptionsmenu"]`).on("click", () => {new XPOptionsSettingWindow().render(true);});
});  