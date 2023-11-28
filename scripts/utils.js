const ModuleName = "enhancedcombathud-vaesen";

async function getTooltipDetails(item, actortype) {
	let title, description, effect, itemType, skill, vaesenattribute, category, subtitle, range, damage, bonus;
	let propertiesLabel = "GEAR.EFFECT";
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
		properties.push({ label: effect })
	}

	return { title, description, subtitle, details, properties , propertiesLabel, footerText: materialComponents };
}

export { getTooltipDetails }