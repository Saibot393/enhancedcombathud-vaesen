const ModuleName = "enhancedcombathud-vaesen";

function Translate(pContent) {
	return pContent;
}

Hooks.on("argonInit", (CoreHUD) => {
    const ARGON = CoreHUD.ARGON;
  
    const itemTypes = {
		weapons: [""],
		gear: ["gear"]
    }
	
	VaesenECHItems = {
		Flee : {
			img: "modules/enhancedcombathud/icons/run.svg",
			name: Translate("Titles.Flee"),
			type : "base",
			system : {
				description : Translate("Descriptions.Flee")
			}
		},
		WPG : {
			img: "modules/enhancedcombathud/icons/shield-bash.svg",
			name: Translate("Titles.WPG"),
			type : "base",
			system : {
				description : Translate("Descriptions.WPG")
			}
		},
		Survey : {
			img: "icons/svg/eye.svg",
			name: Translate("Titles.Survey"),
			type : "base",
			system : {
				description : Translate("Descriptions.Survey")
			}
		},
		TreatInjuries : {
			img: "icons/svg/heal.svg",
			name: Translate("Titles.TreatInjuries"),
			type : "base",
			system : {
				description : Translate("Descriptions.TreatInjuries")
			}
		}
	}
  
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

			const ArmorText = Translate("ARMOR.NAME");

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
						label: Translate(attributes[attribute].label),
						onClick: () => console.log("Attribute Clicked " + attribute)
					},
					{
						label: attributeData.value,
						onClick: () => console.log("Attribute value Clicked" + attribute),
						style: "display: flex; justify-content: flex-end;"
					}
				]);
			});

			const skillsButtons = Object.keys(skills).map((skill) => {
				const skillData = skills[skill];
				return new ARGON.DRAWER.DrawerButton([
					{
						label: Translate(CONFIG.vaesen.skills[skill]),
						onClick: () => console.log("Skill Clicked" + skill)
					},
					{
						label: `${skillData.value}<span style="margin: 0 1rem; filter: brightness(0.8)">(+${attributes[skills[skill].attribute].value})</span>`,
						onClick: () => console.log("Skill value Clicked " + skill),
						style: "display: flex; justify-content: flex-end;"
					},
				]);
			});



			return [
				{
					gridCols: "7fr 2fr 2fr",
					captions: [
						{
							label: "Attributes",
						},
						{
							label: "", //looks nicer
						},
						{
							label: "Check",
						}
					],
					buttons: attributesButtons,
				},
				{
					gridCols: "7fr 2fr",
					captions: [
						{
							label: "Skills",
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
			return `${game.i18n.localize("enhancedcombathud.hud.saves.name")} / ${game.i18n.localize("enhancedcombathud.hud.skills.name")} / ${game.i18n.localize("enhancedcombathud.hud.tools.name")}`;
		}
	}
  
    class VaesenSlowActionPanel extends ARGON.MAIN.ActionPanel {
		constructor(...args) {
			super(...args);
		}

		get label() {
			return "Veasen.Action";
		}
		
		async _getButtons() {
			const gearitems = this.actor.items.filter(item => item.type === "gear");
			
			const specialActions = Object.values(VaesenECHItems);

			const buttons = [
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[0]), new VaesenSpecialActionButton(specialActions[1])),
			  new VaesenButtonPanelButton({type: "gear", items: gearitems, color: 0}),
			  new ARGON.MAIN.BUTTONS.SplitButton(new VaesenSpecialActionButton(specialActions[2]), new VaesenSpecialActionButton(specialActions[3]))
			];
			return buttons.filter(button => button.items == undefined || button.items.length);
		}
    }
  
  
    class VaesenItemButton extends ARGON.MAIN.BUTTONS.ItemButton {
      constructor(...args) {
        super(...args);
      }
    }
  
    class VaesenButtonPanelButton extends ARGON.MAIN.BUTTONS.ButtonPanelButton {
      constructor({type, items, color}) {
        super();
        this.type = type;
        this.items = items;
        this.color = color;
      }

      get colorScheme() {
        return this.color;
      }

      get label() {
        switch (this.type) {
          case "spell": return "enhancedcombathud.hud.castspell.name";
          case "feat": return "enhancedcombathud.hud.usepower.name";
          case "consumable": return "enhancedcombathud.hud.useitem.name";
        }
      }

      get icon() {
        switch (this.type) {
          case "spell": return "modules/enhancedcombathud/icons/spell-book.svg";
          case "feat": return "modules/enhancedcombathud/icons/mighty-force.svg";
          case "consumable": return "modules/enhancedcombathud/icons/drink-me.svg";
		  case "gear": return "modules/enhancedcombathud/icons/backpack.svg";
        }
      }
  
      async _getPanel() {
        if (this.type === "spell") {
          const spellLevels = CONFIG.DND5E.spellLevels;
          const spells = [
            {
              label: "DND5E.SpellPrepAtWill",
              buttons: this.items.filter(item => item.system.preparation.mode === "atwill").map(item => new VaesenItemButton({item})),
              uses: {max: Infinity, value: Infinity},
            },
            {
              label: "DND5E.SpellPrepInnate",
              buttons: this.items.filter(item => item.system.preparation.mode === "innate").map(item => new VaesenItemButton({item})),
              uses: {max: Infinity, value: Infinity},
            },
            {
              label: "DND5E.PactMagic",
              buttons: this.items.filter(item => item.system.preparation.mode === "pact").map(item => new VaesenItemButton({item})),
              uses: this.actor.system.spells.pact,
            }
          ];
          for (const [level, label] of Object.entries(spellLevels)) {
            const levelSpells = this.items.filter(item => item.system.level == level);
            if (!levelSpells.length) continue;
            const slots = level == 0 ? {max: Infinity, value: Infinity} : this.actor.system.spells[`spell${level}`]
            spells.push({
              label,
              buttons: levelSpells.map(item => new VaesenItemButton({item})),
              uses: slots,
            });
          }
          return new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel({accordionPanelCategories: spells.filter(spell=>spell.buttons.length).map(({label, buttons, uses}) => new ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanelCategory({label, buttons, uses}))});
        } else {
          return new ARGON.MAIN.BUTTON_PANELS.ButtonPanel({buttons: this.items.map(item => new VaesenItemButton({item}))});
        }
      }
    }
	
	class VaesenSpecialActionButton extends ARGON.MAIN.BUTTONS.ActionButton {
      constructor (specialItem) {
        super();
        this.item = new Item(specialItem);
      }

      get label() {
        return this.item.name;
      }

      get icon() {
        return this.item.img;
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
			const switchEquip = game.settings.get("enhancedcombathud", "switchEquip");
			if (!switchEquip) return;
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
			console.log(this);
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
		VaesenSlowActionPanel
    ]);  
	CoreHUD.defineMovementHud(null);
    CoreHUD.defineWeaponSets(VaesenWeaponSets);
});
