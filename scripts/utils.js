import { prepareRollNewDialog } from "/systems/vaesen/script/util/roll.js";

const ModuleName = "enhancedcombathud-vaesen";

async function getTooltipDetails(item, actortype) {
	let title, description, effect, itemType, skill, vaesenattribute, category, subtitle, range, damage, bonus, bonusType;
	let propertiesLabel;
	let properties = [];
	let materialComponents = "";

	let details = [];
	
	if (!item || !item.system) return;

	title = item.name;
	description = item.system.description;
	effect = item.system.effect
	itemType = item.type;
	skill = item.system.skill;
	vaesenattribute = item.system.vaesenattribute;
	category = item.system.category;
	range = item.system?.range;
	damage = item.system?.damage;
	bonus = item.system?.bonus;
	bonusType = item.system?.bonusType;
	
	if (bonusType == "none") {
		bonusType = undefined;
	}
	
	properties = [];
	materialComponents = "";

	switch (itemType) {
		case "base":
			switch (actortype) {
				case "player" :
				case "npc" :
					if (!(skill instanceof Array)) {
						skill = [skill];
					}
				
					subtitle = skill.map(key => game.i18n.localize(CONFIG.vaesen.skills[key])).join("/");
					break;
				case "vaesen" : 
					if (vaesenattribute) {
						subtitle = game.i18n.localize("ATTRIBUTE." + vaesenattribute.toUpperCase());
						
						if (vaesenattribute == "bodyControl") {
							subtitle = game.i18n.localize("ATTRIBUTE." + "BODY_CONTROL");
						}
					}
					break;
			}
			break;
		case "weapon":
			subtitle = game.i18n.localize(CONFIG.vaesen.skills[skill]);
			details.push({
				label: "ATTACK.DAMAGE",
				value: damage
			});
			details.push({
				label: "ATTACK.RANGE",
				value: range
			});
			break;
		case "magic":
			subtitle = game.i18n.localize("MAGIC." + category.toUpperCase());
			break;
		case "gear":
		case "talent":
			if (!(skill instanceof Array)) {
				skill = [skill];
			}
		
			subtitle = skill.map(key => game.i18n.localize(CONFIG.vaesen.skills[key])).join("/");
			break;
	}

	if (description) description = await TextEditor.enrichHTML(description);
	
	if (bonus) {
		details.push({
			label: "CONDITION.BONUS",
			value: bonus
		});
	}
	
	if (effect) {
		propertiesLabel = "GEAR.EFFECT";
		properties.push({ label: effect });
	}
	
	if (bonusType) {
		propertiesLabel = "BONUS_TYPE.HEADER";
		
		switch (bonusType) {
			case "ignoreConditionSkill":
				bonusType = "IGNORE_CONDITIONS_SKILL";
				break;
			case "ignoreConditionPhysical":
				bonusType = "IGNORE_CONDITIONS_PHYSICAL"; 
				break;
			case "ignoreConditionMental":
				bonusType = "IGNORE_CONDITIONS_MENTAL";
				break;
		}
		
		properties.push({ label: "BONUS_TYPE." + bonusType.toUpperCase() });
	}

	return { title, description, subtitle, details, properties , propertiesLabel, footerText: materialComponents };
}

function rollArmor(armorItem) {
    const item = armorItem;
    const testName = item.name;

    let info = [{ name: testName, value: item.system.protection }];

	prepareRollNewDialog(armorItem.parent.sheet, testName, info);
}

function innerHTMLselector(html, selector, innerHTML) {
	let returnElement;
	
	html.querySelectorAll(selector).forEach((element) => {if (element.innerHTML == innerHTML) returnElement = element});
	
	return returnElement;
}

function replacewords(text, words = {}){
	let localtext = text;
	
	for (let word of Object.keys(words)) {
		localtext = localtext.replace("{" + word + "}", words[word]);
	}
		
	return localtext;
}

export { getTooltipDetails, ModuleName, rollArmor, innerHTMLselector, replacewords }