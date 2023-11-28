const ModuleName = "enhancedcombathud-vaesen";

async function getTooltipDetails(item, type) {
	let title, description, effect, itemType, skill, subtitle, range, damage, bonus;
	let propertiesLabel = "GEAR.EFFECT";
	let properties = [];
	let materialComponents = "";

	let details = [];
	
	if (type == "skill") {
		title = CONFIG.DND5E.skills[item];
		description = this.hudData.skills[item].tooltip;
	} else if (type == "save") {
		title = CONFIG.DND5E.abilities[item];
		description = this.hudData.saves[item].tooltip;
	} else {
		if (!item || !item.system) return;

		title = item.name;
		description = item.system.description;
		effect = item.system.effect
		itemType = item.type;
		skill = item.system.skill;
		range = item.system?.range;
		damage = item.system?.damage;
		bonus = item.system?.bonus;
		
		properties = [];
		materialComponents = "";

		switch (itemType) {
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
		}
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