ModuleName = ""

function openNewInput(type, title, question, options = {}, callback, argonstyle = false) {
	let content = `<label>${question}</label>`;
	
	switch (type) {
		case "number" :
		case "text" :
			content = content + `
				<input type="${type}" id="inputresult">
			`;
			break;
		case "choice" :
			content = content + `<select id="inputresult">`;
								
			for (key of Object.keys(options.options)) {
				content = content + `<option value="${key}">${options.options[key].label}</option>`;
			}
			
			content = content + `</select>`;
			
			break;
	}
	
	let internalcallback = (html) => {
		switch (type) {
			case "number" :
			case "text" :
				callback(html.find("input#inputresult").val());
				break;
			case "choice" :
				callback(html.find("select#inputresult").val());
				break;
		}
	};
	
	const dialog = new Dialog({
		title: title,
		content: content,
		buttons: {
			accept: {
			  label: game.i18n.localize(ModuleName + "Titles.accept"),
			  callback: internalcallback,
			  icon: `<i class="fas fa-check"></i>`
			},
			abbort: {
			  label: game.i18n.localize(ModuleName + "Titles.accept"),
			  callback: () => {},
			  icon: `<i class="fas fa-times"></i>`
			}
		},
		default: "accept"
	});
	
	if (argonstyle) {
		const hookId = Hooks.once("renderDialog", (dialog, html) => { 
			html.classList.add("ech-highjack-window");
		});
	  
		setTimeout(() => {
			Hooks.off("renderDialog", hookId)
		}, 200);
	}
	
	dialog.render(true);
}