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
		}
    }
  
    class VaesenDrawerPanel extends ARGON.DRAWER.DrawerPanel {
		constructor(...args) {
			super(...args);
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
  
    /*
    class VaesenEquipmentButton extends ARGON.MAIN.BUTTONS.EquipmentButton {
		constructor(...args) {
			super(...args);
		}
    }
	*/

    class VaesenSpellAccordion extends ARGON.MAIN.BUTTON_PANELS.ACCORDION.AccordionPanel { }
  
    CoreHUD.definePortraitPanel(VaesenPortraitPanel);
    CoreHUD.defineDrawerPanel(VaesenDrawerPanel);
    CoreHUD.defineMainPanels([
		VaesenSlowActionPanel
    ]);
  
  
  
  
});
