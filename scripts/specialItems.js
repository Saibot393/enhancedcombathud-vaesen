const ModuleName = "enhancedcombathud-vaesen";

var VaesenECHSlowItems = {};

var VaesenECHFastItems = {};

var VaesenECHReactionItems = {};

function registerVaesenECHSItems () {
	VaesenECHSlowItems = {
		groupflags : {
			actiontype : "slow"
		},
		Flee : {
			img: "modules/enhancedcombathud/icons/run.svg",
			name: game.i18n.localize(ModuleName+".Titles.Flee"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Flee")
			}
		},
		WPG : {
			img: "modules/enhancedcombathud/icons/shield-bash.svg",
			name: game.i18n.localize(ModuleName+".Titles.WPG"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.WPG")
			}
		},
		Survey : {
			img: "icons/svg/eye.svg",
			name: game.i18n.localize(ModuleName+".Titles.Survey"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Survey")
			}
		},
		TreatInjuries : {
			img: "icons/svg/heal.svg",
			name: game.i18n.localize(ModuleName+".Titles.TreatInjuries"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.TreatInjuries")
			}
		}
	}
	
	VaesenECHFastItems = {
		groupflags : {
			actiontype : "fast"
		},
		DrawWeapon : {
			img: "icons/svg/sword.svg",
			name: game.i18n.localize(ModuleName+".Titles.DrawWeapon"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.DrawWeapon")
			}
		},
		Standup : {
			img: "icons/svg/up.svg",
			name: game.i18n.localize(ModuleName+".Titles.Standup"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Standup")
			}
		},
		Move : {
			img: "modules/enhancedcombathud/icons/journey.svg",
			name: game.i18n.localize(ModuleName+".Titles.Move"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Move")
			}
		},
		TakeCover : {
			img: "modules/enhancedcombathud/icons/armor-upgrade.svg",
			name: game.i18n.localize(ModuleName+".Titles.TakeCover"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.TakeCover")
			}
		}
	}
	
	VaesenECHReactionItems = {
		groupflags : {
			actiontype : "react"
		},
		Dodge : {
			img: "modules/enhancedcombathud/icons/dodging.svg",
			name: game.i18n.localize(ModuleName+".Titles.Dodge"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Dodge")
			}
		},
		Parry : {
			img: "modules/enhancedcombathud/icons/crossed-swords.svg",
			name: game.i18n.localize(ModuleName+".Titles.Parry"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Parry")
			}
		},
		BreakFree : {
			img: "modules/enhancedcombathud/icons/mighty-force.svg",
			name: game.i18n.localize(ModuleName+".Titles.BreakFree"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.BreakFree")
			}
		},
		Chase : {
			img: "modules/enhancedcombathud/icons/walking-boot.svg",
			name: game.i18n.localize(ModuleName+".Titles.Chase"),
			type : "base",
			system : {
				description : game.i18n.localize(ModuleName+".Descriptions.Chase")
			}
		}
	}
	
	//some preparation
	for (let itemset of [VaesenECHSlowItems, VaesenECHFastItems, VaesenECHReactionItems]) {
		for (let itemkey of Object.keys(itemset)) {
			if (itemkey != "groupflags") {
				itemset[itemkey].flags = {};
				itemset[itemkey].flags[ModuleName] = {...itemset.groupflags, ...itemset[itemkey].flags[ModuleName]};
			}
		}
		
		delete itemset.groupflags;
	}
}

export {registerVaesenECHSItems, VaesenECHSlowItems, VaesenECHFastItems, VaesenECHReactionItems}