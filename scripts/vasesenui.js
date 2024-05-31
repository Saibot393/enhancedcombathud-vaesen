import {registerVaesenECHSItems, VaesenECHSlowItems, VaesenECHFastItems, VaesenECHReactionItems} from "./specialItems.js";
import {ModuleName, getTooltipDetails, rollArmor, innerHTMLselector} from "./utils.js";
import {buildChatCard} from "/systems/vaesen/script/util/chat.js";
import {prepareRollNewDialog} from "/systems/vaesen/script/util/roll.js";
import {gainXPWindow, spendXPWindow, xpThreshholdReached} from "./levelup.js";

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	registerVaesenECHSItems();
  
    class VaesenPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);

			Hooks.on("deleteActiveEffect", this.onEffectUpdate.bind(this));
			Hooks.on("createActiveEffect", this.onEffectUpdate.bind(this));
			
			this.wasDead = false;
			this.activeArmor = null;
		}

		get description() {
			const { type, system } = this.actor;
			const actor = this.actor;
			
			switch (type) {
				case "player":
					return `${system.bio.archetype}`;
					break;
				case "npc":
					break;
				case "vaesen":
					break;
				case "headquater":
					return `${system.bio.building}, ${system.bio.location}`;
					break;
				default:
					return "";
					break;
			}
		}

		get isDead() {
			let isDead = false;
			
			let mental = false;
			let physical = false;
			
			if (this.actor.type == "player") {
				mental = this.actor.system.condition.mental?.isBroken;
				physical = this.actor.system.condition.physical?.isBroken;
			}
			
			if (this.actor.type == "npc") {
				mental = this.actor.system.condition.mental?.value == 0;
				physical = this.actor.system.condition.physical?.value == 0;
			}
			
			isDead = mental || physical;
			
			if (isDead && !this.wasDead) {
				if (game.settings.get(ModuleName, "AutoRollInjuries")) {
					if (mental) {
						this.rollMental();
					}
					
					if (physical) {
						this.rollPhysical();
					}
				}
			}
			
			this.wasDead = isDead;
			
			return isDead;
		}
		
		async getConditions() {
			let LeftIcons = [];
			let RightIcons = [];
			
			switch (this.actor.type) {
				case "player":
					const playerConditions = this.actor.system.condition;
					
					const PhysicalConditions = Object.keys(playerConditions.physical.states).filter(Key => playerConditions.physical.states[Key].isChecked);
					if (playerConditions.physical.isBroken) {
						PhysicalConditions.push("physical");
					}
					const MentalConditions = Object.keys(playerConditions.mental.states).filter(Key => playerConditions.mental.states[Key].isChecked);
					if (playerConditions.mental.isBroken) {
						MentalConditions.push("mental");
					}
			
					LeftIcons = PhysicalConditions.map((Condition) => {	const ConditionInfo = CONFIG.vaesen.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
					
																		return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition, lclick : () => {this.removeCondtion(Condition)}, large : Condition == "physical"}});
																			
					RightIcons = MentalConditions.map((Condition) => {	const ConditionInfo = CONFIG.vaesen.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
					
																		return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition, lclick : () => {this.removeCondtion(Condition)}, large : Condition == "mental"}});
												
					/*
					if (game.settings.get(ModuleName, "AutoApplyBroken")) {
						if (MentalConditions.length == 3) {
							if (!this.actor.system.condition.mental.isBroken) {
								this.actor.createEmbeddedDocuments("ActiveEffect", [CONFIG.vaesen.allConditions.find(condition => condition.id == "mental")]);
							}
						}
						
						if (PhysicalConditions.length == 3) {
							if (!this.actor.system.condition.physical.isBroken) {
								this.actor.createEmbeddedDocuments("ActiveEffect", [CONFIG.vaesen.allConditions.find(condition => condition.id == "physical")]);
							}
						}
					}
					*/
					break;
				case "vaesen":
					const vaesenConditions = this.actor.items.filter(item => item.type == "condition" && item.system.active);
					
					let ConditionImages = []
					
					for (let i = 0; i < vaesenConditions.length; i++) {
						if (vaesenConditions[i].img == "icons/svg/item-bag.svg" && i <= 10) {
							ConditionImages[i] = `systems/vaesen/asset/counter_tokens/${i+1}.png`; //nicer than a simple bag
						}
						else {
							ConditionImages[i] = vaesenConditions[i].img;
						}
					}
					
					LeftIcons = vaesenConditions.map((Condition, i) => {return {
						img : ConditionImages[i], 
						description : Condition.name + " (" + (Condition.system.bonus>0 ? "+" : "") + Condition.system.bonus + ")", 
						key : Condition.id, 
						lclick : async () => {
							await this.changeCondition(-1)
							this.render()
						},
						rclick : async () => {
							await this.changeCondition(+1)
							this.render()
						}}});
					break;
			}
						
			return {left : LeftIcons, right : RightIcons}
		}

		async getStatBlocks() {
			switch (this.actor.type) {
				case "player" :
					this.activeArmor = this.actor.items.find(Item => Item.type == "armor" && Item.system.isFav); //serach for favoured armor
					break;
				case "npc" :
				case "vaesen" :
					this.activeArmor = this.actor.items.find(Item => Item.type == "armor"); //serach for favoured armor
					break;				
			}

			const ArmorText = game.i18n.localize("ARMOR.NAME");
			
			let physical;
			let mental;
			
			if (this.actor.type == "npc") {
				physical = this.actor.system.condition.physical;
				
				mental = this.actor.system.condition.mental;
			}
			
			let Blocks = [];
			
			if (physical) {
				Blocks.push([
					{
						text: game.i18n.localize("CONDITION.PHYSICAL"),
					},
					{
						text: physical.value,
					},
					{
						text: "/",
					},
					{
						text: physical.max
					},
				]);				
			}
			
			if (this.activeArmor) {
				Blocks.push([
					{
						text: ArmorText,
					},
					{
						text: this.activeArmor.system.protection,
						color: "var(--ech-movement-baseMovement-background)",
					},
				]);
			}
			
			if (mental) {
				Blocks.push([
					{
						text: game.i18n.localize("CONDITION.MENTAL"),
					},
					{
						text: mental.value,
					},
					{
						text: "/",
					},
					{
						text: mental.max
					},
				]);				
			}
			
			return Blocks;
		}
		
		async getLevelUPIcon() {
			if ((this.actor?.getFlag(ModuleName, "levelup") || xpThreshholdReached(this.actor)) && game.settings.get(ModuleName, "useXPautomation")) {
				let levelupicon = document.createElement("div");
				
				levelupicon.style.backgroundImage = `url("modules/${ModuleName}/icons/upgrade.svg")`;
				levelupicon.style.width = "30px";
				levelupicon.style.height = "30px";
				levelupicon.setAttribute("data-tooltip", game.i18n.localize(ModuleName + ".Titles.OpenXPMenu"));
				
				levelupicon.onclick = () => {
					if (this.actor?.getFlag(ModuleName, "levelup")) {
						new gainXPWindow(this.actor).render(true)
					}
					else {
						if (xpThreshholdReached(this.actor)) {
							new spendXPWindow(this.actor).render(true);
						}
						else {
							//something didn't update correctly, rerender and hope for the best
							this.render();
						}
					}
				}
				
				return levelupicon;
			}
			
			return;
		}
		
		async _renderInner(data) {
			await super._renderInner(data);
			
			const armorBlock = innerHTMLselector(this.element, "span", game.i18n.localize("ARMOR.NAME"))?.parentElement;

			if (armorBlock) {
				armorBlock.onclick = () => {rollArmor(this.activeArmor)};
			}
			
			const ConditionIcons = await this.getConditions();
			
			if (ConditionIcons) {
				for (const Side of ["left", "right"]) {
					const otherSide = ["left", "right"].find(word => word != Side);
					const SideIcons = ConditionIcons[Side];
					
					if (SideIcons) {
						const SideIconsBar = document.createElement("div");
						SideIconsBar.classList.add("status-effects");
						//top:50%;transform:translateY(-50%)
						SideIconsBar.setAttribute("style", `position:absolute;${Side}:0;display:flex;flex-direction:column`);
						
						for (const Icon of SideIcons) {
							const IconImage =  document.createElement("img");
							IconImage.classList.add("effect-control");
							
							IconImage.setAttribute("src", Icon.img);
							IconImage.setAttribute("style", `width: ${Icon.large ? 75 : 50}px;border-width:0px;margin-${Side}:0;margin-${otherSide}:auto`);
							IconImage.onclick = () => {Icon.lclick()};
							IconImage.oncontextmenu = () => {if (Icon.rclick) Icon.rclick()}
							IconImage.setAttribute("data-tooltip", Icon.description);
							
							SideIconsBar.appendChild(IconImage);
						}
						
						this.element.appendChild(SideIconsBar);
					}
				}
			}
			
			this.element.querySelector(".player-buttons").style.right = "0%";
			
			
			const CornerIcons = document.createElement("div");
			CornerIcons.style.position = "absolute";
			CornerIcons.style.right = "0";
			CornerIcons.style.top = "0";
			CornerIcons.style.zIndex = 100;
			let levelupicon = await this.getLevelUPIcon();
			
			if (levelupicon) {
				CornerIcons.appendChild(levelupicon);
			}
			this.element.appendChild(CornerIcons);
		}
		
		async removeCondtion(ConditionKey) {
			const currentEffect = this.actor.effects.find(Effect => Effect.statuses.has(ConditionKey));
			
			if (currentEffect) {
				this.actor.deleteEmbeddedDocuments('ActiveEffect', [currentEffect.id]);
			}
		}
		
		async changeCondition(change, type = "") {
			switch(this.actor.type) {
				case "player":
					const conditions = this.actor.system.condition[type];
					
					if (conditions) {
						let toggleKey;
						let setresult;
						
						if (change > 0) {
							toggleKey = Object.keys(conditions.states).find(key => !conditions.states[key].isChecked);
							setresult = true;
						}
						
						if (change < 0) {
							if (!conditions.isBroken) {
								toggleKey = Object.keys(conditions.states).reverse().find(key => conditions.states[key].isChecked);
							}
							setresult = false;
						}
						
						if (toggleKey) {
							await this.actor.update({system : {condition : {[type] : {states : {[toggleKey] : {isChecked : setresult}}}}}});
						}
						else {
							await this.actor.update({system : {condition : {[type] : {isBroken : setresult}}}});
						}
					}
					break;
				case "vaesen":
					const conditionitems = this.actor.items.filter(item => item.type == "condition");
					
					let tochange;
					let setresult;

					if (change > 0) {
						tochange = conditionitems.find(condition => !condition.system.active);
						setresult = true;
					}
					
					if (change < 0) {
						tochange = conditionitems.reverse().find(condition => condition.system.active);
						setresult = false;
					}
					
					if (tochange) {
						await tochange.update({system : {active : setresult}});
					}
					break;
			}
		}
		
		async onEffectUpdate(Effect) {
			if (this.actor == Effect.parent) {
				this.render();
			}
		}
		
		async rollMental() {
			let table = await fromUuid("RollTable." + game.settings.get(ModuleName, "MentalInjurieTable"));
			if (table) {
				table.draw({roll: true, displayChat: true});
			}
		}
		
		async rollPhysical() {
			let table = await fromUuid("RollTable." + game.settings.get(ModuleName, "PhysicalInjurieTable"));
			if (table) {
				table.draw({roll: true, displayChat: true});
			}
		}
	}
	
	class VaesenDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			const attributes = {...this.actor.system.attribute};
			const skills = this.actor.system.skill;
			
			var allowedattributes = [];
			
			switch (this.actor.type) {
				case "player":
					allowedattributes = Object.keys(attributes).filter(key => key != "magic");
					break;
				default:
					allowedattributes = Object.keys(attributes);
					break;
			}
			
			for (let key of Object.keys(attributes)) {
				if (!allowedattributes.includes(key)) {
					delete attributes[key];
				}
			}
			
			let maxAttribute = Math.max(...Object.values(attributes).map(content => content.value));

			const attributesButtons = Object.keys(attributes).map((attribute) => {
				const attributeData = attributes[attribute];
				
				let valueLabel = attributeData.value;
				
				if (game.settings.get(ModuleName, "UseDiceCircles")) {
					valueLabel = "";
					
					valueLabel = valueLabel + `<div style="display:flex">`;
					
					valueLabel = valueLabel + "</div>";
					
					valueLabel = valueLabel + `<div style="display:flex">`;
					
					for (let i = 0; i < attributeData.value; i++) {
						valueLabel = valueLabel + `<i class="fa-regular fa-circle"></i>`;
					}
					
					valueLabel = valueLabel + "</div>";
				}
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize(attributes[attribute].label),
						onClick: () => {this.actor.sheet.rollAttribute(attribute)}
					},
					{
						label: valueLabel,
						onClick: () => {this.actor.sheet.rollAttribute(attribute)},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});
			
			let skillsButtons = [];
			
			if (skills) {
				skillsButtons = Object.keys(skills).map((skill) => {
					const skillData = skills[skill];
					
					let valueLabel = `${skillData.value}<span style="margin: 0 1rem; filter: brightness(0.8)">(+${attributes[skills[skill].attribute].value})</span>`;
					
					
					if (game.settings.get(ModuleName, "UseDiceCircles")) {
						valueLabel = "";
						
						valueLabel = valueLabel + `<div style="display:flex">`;
						
						for (let i = 0; i < skillData.value; i++) {
							valueLabel = valueLabel + `<i class="fa-solid fa-circle"></i>`;
						}
						
						valueLabel = valueLabel + "</div>";
						
						valueLabel = valueLabel + `<div style="display:flex">`;
						
						for (let i = 0; i < maxAttribute; i++) {
							if (i < attributes[skills[skill].attribute].value) {
								valueLabel = valueLabel + `<i class="fa-regular fa-circle"></i>`;
							}
							else {
								valueLabel = valueLabel + `<i class="fa-regular fa-circle" style="visibility:hidden"></i>`;
							}
						}
						
						valueLabel = valueLabel + "</div>";
					}
					
					return new ARGON.DRAWER.DrawerButton([
						{
							label: game.i18n.localize(CONFIG.vaesen.skills[skill]),
							onClick: () => {this.actor.sheet.rollSkill(skill)}
						},
						{
							label: valueLabel,
							onClick: () => {this.actor.sheet.rollSkill(skill)},
							style: "display: flex; justify-content: flex-end;"
						},
					]);
				});
			}

			let returncategories = [];

			if (attributesButtons.length) {
				if (!game.settings.get(ModuleName, "UseDiceCircles")) {
					returncategories.push({
						gridCols: "7fr 2fr 2fr",
						captions: [
							{
								label: game.i18n.localize("HEADER.ATTRIBUTES"),
							},
							{
								label: "", //looks nicer
							},
							{
								label: game.i18n.localize("ROLL.ROLL"),
							},
						],
						buttons: attributesButtons
					});
				}
				else {
					returncategories.push({
						gridCols: "7fr 2fr",
						captions: [
							{
								label: game.i18n.localize("HEADER.ATTRIBUTES"),
							},
							{
								label: game.i18n.localize("ROLL.ROLL"),
							},
						],
						buttons: attributesButtons
					});
				}
			}
			
			if (skillsButtons.length) {
				returncategories.push({
					gridCols: "7fr 2fr",
					captions: [
						{
							label: game.i18n.localize("HEADER.SKILLS"),
						},
						{
							label: "",
						}
					],
					buttons: skillsButtons,
				});
			}
			
			return returncategories;
		}

		get title() {
			return `${game.i18n.localize("HEADER.ATTRIBUTES")} & ${game.i18n.localize("HEADER.SKILLS")}`;
		}
	}
  
    class VaesenSlowActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.SlowAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(VaesenECHSlowItems);

			let buttons = [];
			
			buttons.push(new VaesenItemButton({ item: null, isWeaponSet: true, isPrimary: true }));
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[0]), new VaesenSpecialActionButton(specialActions[1])));
			
			if (this.actor.type == "vaesen" || this.actor.type == "npc" && this.actor.items.find(item => item.type == "magic")) {
				buttons.push(new VaesenButtonPanelButton({type: "magic", color: 0}));
			}
			
			buttons.push(new VaesenButtonPanelButton({type: "gear", color: 0}));
			
			if (this.actor.type == "player" && this.actor.items.find(item => item.type == "talent") && game.settings.get(ModuleName, "ShowTalents")) {
				buttons.push(new VaesenButtonPanelButton({type: "talent", color: 0}));
			}
			
			buttons.push(new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[2]), new VaesenSpecialActionButton(specialActions[3])));
			
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
    class VaesenFastActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.FastAction";
		}
		
		get maxActions() {
            return 1;
        }
		
		get currentActions() {
			return this.isActionUsed ? 0 : 1;
		}
		
		_onNewRound(combat) {
			this.isActionUsed = false;
			this.updateActionUse();
		}
		
		async _getButtons() {
			const specialActions = Object.values(VaesenECHFastItems);

			const buttons = [
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[0]), new VaesenSpecialActionButton(specialActions[1])),
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[2]), new VaesenSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
    class VaesenReactionActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return ModuleName+".Titles.ReAction";
		}
		
		async _getButtons() {
			const specialActions = Object.values(VaesenECHReactionItems);

			const buttons = [
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[0]), new VaesenSpecialActionButton(specialActions[1])),
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[2]), new VaesenSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
	class VaesenItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
		constructor(...args) {
			super(...args);
		}

		get hasTooltip() {
			return true;
		}

		get targets() {
			return null;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item, this.actor.type);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			if (this.item.type == "weapon") {
				this.actor.sheet.rollWeapon(this.item.id);
				
				used = true;
			}
			
			if (this.item.type == "attack") {
				const testName = this.item.name;
				let bonus = this.actor.sheet.computeInfoFromConditions();
				let attribute = this.actor.system.attribute[this.item.system.attribute];

				let info = [
				  { name: game.i18n.localize(attribute.label + "_ROLL"), value: attribute.value },
				  bonus
				];

				prepareRollNewDialog(this.actor.sheet, testName, info, this.item.system.damage, null, null);
				
				used = true;
			}
			
			if (this.item.type == "gear" || this.item.type == "magic" || this.item.type == "talent") {
				const data = this.item;
				const type = this.item.type;
				/*
				const skill = this.item.system.skill;
				
				if (skill instanceof Array) {
					if (skill.length == 1) {
						skill = skill[0];
					}
					else {
						skill = undefined;
					}
				}
				*/
				
				let chatData = buildChatCard(type, data);
				ChatMessage.create(chatData, {});;
			}			
			
			if (used) {
				VaesenItemButton.consumeActionEconomy(this.item);
			}
		}

		static consumeActionEconomy(item) {
			if (item.type == "weapon" || item.type == "attack") {
				ui.ARGON.components.main[0].isActionUsed = true;
				ui.ARGON.components.main[0].updateActionUse();
			}
		}

		async render(...args) {
			await super.render(...args);
			if (this.item?.system.consumableType === "ammo") {
				const weapons = this.actor.items.filter((item) => item.system.consume?.target === this.item.id);
				ui.ARGON.updateItemButtons(weapons);
			}
		}
	}
  
    class VaesenButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
		constructor({type, color}) {
			super();
			this.type = type;
			this.color = color;
		}

		get colorScheme() {
			return this.color;
		}

		get label() {
			switch (this.type) {
				case "gear": return "GEAR.NAME";
				case "magic": return "MAGIC.NAME";
				case "talent": return "TALENT.NAME";
			}
		}

		get icon() {
			switch (this.type) {
				case "gear": return "modules/enhancedcombathud/icons/svg/backpack.svg";
				case "magic": return "modules/enhancedcombathud/icons/svg/spell-book.svg";
				case "talent": return "icons/svg/book.svg";
			}
		}
  
		async _getPanel() {
			return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.actor.items.filter(item => item.type == this.type).map(item => new VaesenItemButton({item}))});
		}
    }
	
	class VaesenSpecialActionButton extends ARGON.MAIN.BUTTONS.ActionButton {
        constructor(specialItem) {
			super();
			this.item = new CONFIG.Item.documentClass(specialItem, {
				parent: this.actor,
			});
		}

		get label() {
			return this.item.name;
		}

		get icon() {
			return this.item.img;
		}

		get hasTooltip() {
			return true;
		}
		

		get colorScheme() {
			switch (this.item?.flags[ModuleName]?.actiontype) {
				case "slow":
					return 0;
					break;
				case "fast":
					return 1;
					break;
				case "react":
					return 3;
					break;
			}
			return 0;
		}

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item, this.actor.type);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = true;
			
			const item = this.item;
			
			switch(this.actor.type) {
				case "player" :
				case "npc" :
					let skill = item.system.skill;
					
					if (skill instanceof Array) {
						const activeSet = await ui.ARGON.components.weaponSets?.getactiveSet();
						
						if (activeSet?.primary?.system.skill) {
							skill = skill.find(key => key == activeSet.primary.system.skill);
						}
						
						if (skill instanceof Array) {
							skill = undefined;
						}
					}
					
					if (skill) {
						this.actor.sheet.rollSkill(skill);
					}
					break;
				case "vaesen" : 
					let attribute = item.system.vaesenattribute;
					
					if (attribute) {
						this.actor.sheet.rollAttribute(attribute);
					}
					break;					
			}
			
			if (used) {
				VaesenSpecialActionButton.consumeActionEconomy(this.item);
			}
		}

		static consumeActionEconomy(item) {
			switch (item.flags[ModuleName].actiontype) {
				case "slow":
					ui.ARGON.components.main[0].isActionUsed = true;
					ui.ARGON.components.main[0].updateActionUse();
					break;
				case "fast":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
						ui.ARGON.components.main[0].updateActionUse();
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
						ui.ARGON.components.main[1].updateActionUse()
					}
					break;
				case "react":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
						ui.ARGON.components.main[0].updateActionUse()
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
						ui.ARGON.components.main[1].updateActionUse()
					}
					break;
			}
		}
    }
	
	class VaesenWeaponSets extends ARGON.WeaponSets {
		async getDefaultSets() {
			let attacks;

			switch (this.actor.type) {
				case "player" :
					attacks = this.actor.items.filter((item) => item.type === "weapon" && item.system.isFav);
					break;
				case "npc" : 
					attacks = this.actor.items.filter((item) => item.type === "weapon");
					break;
				case "vaesen" :
					attacks = this.actor.items.filter((item) => item.type === "attack");
					break;					
			}
			
			return {
				1: {
					primary: attacks[0]?.id ?? null,
					secondary: null,
				},
				2: {
					primary: attacks[1]?.id ?? null,
					secondary: null,
				},
				3: {
					primary: attacks[2]?.id ?? null,
					secondary: null,
				},
			};
		}

		async _onSetChange({sets, active}) {
			const updates = [];
			const activeSet = sets[active];
			const activeItems = Object.values(activeSet).filter((item) => item);
			const inactiveSets = Object.values(sets).filter((set) => set !== activeSet);
			const inactiveItems = inactiveSets.flatMap((set) => Object.values(set)).filter((item) => item);
			activeItems.forEach((item) => {
				if(!item.system?.equipped) updates.push({_id: item.id, "system.equipped": true});
			});
			inactiveItems.forEach((item) => {
				if(item.system?.equipped) updates.push({_id: item.id, "system.equipped": false});
			});
			return await this.actor.updateEmbeddedDocuments("Item", updates);
		}

		async _getSets() { //overwrite because slots.primary/secondary contains id, not uuid
			const sets = mergeObject(await this.getDefaultSets(), deepClone(this.actor.getFlag("enhancedcombathud", "weaponSets") || {}));

			for (const [set, slots] of Object.entries(sets)) {
				slots.primary = slots.primary ? await this.actor.items.get(slots.primary) : null;
				slots.secondary = null;
			}
			return sets;
		}
		
		async _onDrop(event) {
			try {      
				event.preventDefault();
				event.stopPropagation();
				const data = JSON.parse(event.dataTransfer.getData("text/plain"));
				if(data?.type !== "weapon") return;
				const set = event.currentTarget.dataset.set;
				const slot = event.currentTarget.dataset.slot;
				const sets = this.actor.getFlag("enhancedcombathud", "weaponSets") || {};
				sets[set] = sets[set] || {};
				sets[set][slot] = data.itemId;

				await this.actor.setFlag("enhancedcombathud", "weaponSets", sets);
				await this.render();
			} catch (error) {
				
			}
		}
		
		get template() {
			return `modules/${ModuleName}/templates/VaesenWeaponSets.hbs`;
		}
		
		async getactiveSet() {
			const sets = await this._getSets();
			return sets[this.actor.getFlag("enhancedcombathud", "activeWeaponSet")];
		}
    }
  
    /*
    class VaesenEquipmentButton extends ARGON.MAIN.BUTTONS.EquipmentButton {
		constructor(...args) {
			super(...args);
		}
    }
	*/
  
    CoreHUD.definePortraitPanel(VaesenPortraitPanel);
    CoreHUD.defineDrawerPanel(VaesenDrawerPanel);
    CoreHUD.defineMainPanels([
		VaesenSlowActionPanel,
		VaesenFastActionPanel,
		VaesenReactionActionPanel,
		ARGON.PREFAB.PassTurnPanel
    ]);  
	CoreHUD.defineMovementHud(null);
    CoreHUD.defineWeaponSets(VaesenWeaponSets);
	CoreHUD.defineSupportedActorTypes(["player", "npc", "vaesen"]);
});
