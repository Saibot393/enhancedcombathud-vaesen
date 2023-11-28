import {registerVaesenECHSItems, VaesenECHSlowItems, VaesenECHFastItems, VaesenECHReactionItems} from "./specialItems.js";
import {getTooltipDetails} from "./utils.js";
import {buildChatCard} from "/systems/vaesen/script/util/chat.js"

const ModuleName = "enhancedcombathud-vaesen";

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
	registerVaesenECHSItems();
  
    class VaesenPortraitPanel extends ARGON.PORTRAIT.PortraitPanel {
		constructor(...args) {
			super(...args);

			Hooks.on("deleteActiveEffect", this.onEffectUpdate.bind(this));
			Hooks.on("createActiveEffect", this.onEffectUpdate.bind(this));
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
			return false;
		}
		
		async getConditionIcons() {
			const Conditions = this.actor.system.condition;
			
			const PhysicalConditions = Object.keys(Conditions.physical.states).filter(Key => Conditions.physical.states[Key].isChecked);
			const MentalConditions = Object.keys(Conditions.mental.states).filter(Key => Conditions.mental.states[Key].isChecked);
			
			const LeftIcons = PhysicalConditions.map((Condition) => {const ConditionInfo = CONFIG.vaesen.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
			
																	return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition}});
																	
			const RightIcons = MentalConditions.map((Condition) => {const ConditionInfo = CONFIG.vaesen.allConditions.find(ConditionInfo => ConditionInfo.id == Condition);
			
																	return {img : ConditionInfo.icon, description : ConditionInfo.label, key : Condition}});
						
			return {left : LeftIcons, right : RightIcons}
		}

		async getStatBlocks() {
			const ActiveArmor = this.actor.items.find(Item => Item.type == "armor" && Item.system.isFav); //serach for favoured armor

			const ArmorText = game.i18n.localize("ARMOR.NAME");

			let Blocks = [];
			
			if (ActiveArmor) {
				Blocks.push([
								{
									text: ArmorText,
								},
								{
									text: ActiveArmor.system.protection,
									color: "var(--ech-movement-baseMovement-background)",
								},
							]);
			}
			
			return Blocks;
		}
		
		async _renderInner(data) {
			await super._renderInner(data);
			const ConditionIcons = await this.getConditionIcons();
			
			if (ConditionIcons) {
				for (const Side of ["left", "right"]) {
					const SideIcons = ConditionIcons[Side];
					
					if (SideIcons) {
						const SideIconsBar = document.createElement("div");
						SideIconsBar.classList.add("status-effects");
						//top:50%;transform:translateY(-50%)
						SideIconsBar.setAttribute("style", `position:absolute;${Side}:0;display:flex;flex-direction:column;bot:0`);
						
						for (const Icon of SideIcons) {
							const IconImage =  document.createElement("img");
							IconImage.classList.add("effect-control");
							
							IconImage.setAttribute("src", Icon.img);
							IconImage.setAttribute("style", "width: 50px;border-width:0px");
							IconImage.onclick = () => {this.removeCondtion(Icon.key)};
							
							SideIconsBar.appendChild(IconImage);
						}
						
						this.element.appendChild(SideIconsBar);
					}
				}
			}
			
			this.element.querySelector(".player-buttons").style.right = "0%";
		}
		
		async removeCondtion(ConditionKey) {
			const currentEffect = this.actor.effects.find(Effect => Effect.name == ConditionKey.toUpperCase());
			
			if (currentEffect) {
				this.actor.deleteEmbeddedDocuments('ActiveEffect', [currentEffect.id]);
			}
		}
		
		async onEffectUpdate(Effect) {
			if (this.actor == Effect.parent) {
				this.render();
			}
		}
	}
	
	class VaesenDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
		}

		get categories() {
			const attributes = this.actor.system.attribute;
			const skills = this.actor.system.skill;

			const attributesButtons = Object.keys(attributes).map((attribute) => {
				const attributeData = attributes[attribute];
				
				return new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize(attributes[attribute].label),
						onClick: () => {this.actor.sheet.rollAttribute(attribute)}
					},
					{
						label: attributeData.value,
						onClick: () => {this.actor.sheet.rollAttribute(attribute)},
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});

			const skillsButtons = Object.keys(skills).map((skill) => {
				const skillData = skills[skill];
				return new ARGON.DRAWER.DrawerButton([
					{
						label: game.i18n.localize(CONFIG.vaesen.skills[skill]),
						onClick: () => {this.actor.sheet.rollSkill(skill)}
					},
					{
						label: `${skillData.value}<span style="margin: 0 1rem; filter: brightness(0.8)">(+${attributes[skills[skill].attribute].value})</span>`,
						onClick: () => {this.actor.sheet.rollSkill(skill)},
						style: "display: flex; justify-content: flex-end;"
					},
				]);
			});



			return [
				{
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
						}
					],
					buttons: attributesButtons,
				},
				{
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
				},
			];
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
			return "Veasen.SlowAction";
		}
		
		get hasAction() {
            return true;
        }
		
		async _getButtons() {
			const specialActions = Object.values(VaesenECHSlowItems);

			const buttons = [
				new VaesenItemButton({ item: null, isWeaponSet: true, isPrimary: true }),
				new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[0]), new VaesenSpecialActionButton(specialActions[1])),
				new VaesenButtonPanelButton({type: "gear", color: 0}),
				new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[2]), new VaesenSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
	
    class VaesenFastActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return "Veasen.FastAction";
		}
		
		get hasAction() {
            return true;
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
			return "Veasen.ReactionAction";
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
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			if (this.item.type == "weapon") {
				used = true;
				
				this.actor.sheet.rollWeapon(this.item.id)
			}
			
			if (this.item.type == "gear") {
				const data = this.item.data;
				const type = data.type;
				
				let chatData = buildChatCard(type, data);
				ChatMessage.create(chatData, {});;
			}			
			
			if (used) {
				VaesenItemButton.consumeActionEconomy(this.item);
			}
		}

		static consumeActionEconomy(item) {
			if (item.type == "weapon") {
				ui.ARGON.components.main[0].isActionUsed = true;
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
			}
		}

		get icon() {
			switch (this.type) {
				case "gear": return "modules/enhancedcombathud/icons/backpack.svg";
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

		async getTooltipData() {
			const tooltipData = await getTooltipDetails(this.item);
			return tooltipData;
		}

		async _onLeftClick(event) {
			var used = false;
			
			VaesenSpecialActionButton.consumeActionEconomy(this.item);
		}

		static consumeActionEconomy(item) {
			
			switch (item.flags[ModuleName].actiontype) {
				case "slow":
					ui.ARGON.components.main[0].isActionUsed = true;
					break;
				case "fast":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
					}
					break;
				case "react":
					if (ui.ARGON.components.main[1].isActionUsed) {
						ui.ARGON.components.main[0].isActionUsed = true;
					}
					else {
						ui.ARGON.components.main[1].isActionUsed = true;
					}
					break;
			}
		}
    }
	
	class VaesenWeaponSets extends ARGON.WeaponSets {
		async getDefaultSets() {
			const sets = await super.getDefaultSets();
			if (this.actor.type !== "npc") return sets;
			const actions = this.actor.items.filter((item) => item.type === "weapon" && item.system.activation?.type === "action");
			const bonus = this.actor.items.filter((item) => item.type === "weapon" && item.system.activation?.type === "bonus");
			return {
				1: {
					primary: actions[0]?.uuid ?? null,
					secondary: bonus[0]?.uuid ?? null,
				},
				2: {
					primary: actions[1]?.uuid ?? null,
					secondary: bonus[1]?.uuid ?? null,
				},
				3: {
					primary: actions[2]?.uuid ?? null,
					secondary: bonus[2]?.uuid ?? null,
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
				slots.secondary = slots.secondary ? await this.actor.items.get(slots.secondary) : null;
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
				console.log(data);
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
