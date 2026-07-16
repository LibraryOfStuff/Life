const STYLE = `
#ejs_list {
    li {
        list-style-type: none;
        position: relative;
    }

    li::before {
        content: "•";
        position: absolute;
        left: -1.5em;
        font-size: 1em;
        font-family: "Press Start 2P";
    }
}
`;

function get_esms() {
    if (!localStorage.ejs_loaded_esms) {
        localStorage.ejs_loaded_esms = "[]";
    }

    return JSON.parse(localStorage.ejs_loaded_esms);
}

function create_li(url) {
    const li = document.createElement("li");
    li.innerHTML = `<a href="${url}">${url.split("/").pop()}</a> `;

    const remove_btn = document.createElement("span");
    remove_btn.innerText = "X";
    remove_btn.classList.add("removeModX");
    remove_btn.onclick = (url) => {
        localStorage.ejs_loaded_esms = JSON.stringify(
            get_esms().filter((x) => x != url),
        );
        li.remove()
    };
    li.append(remove_btn);

    return li;
}

function patch() {
    const style_div = document.createElement("style");
    style_div.innerHTML = STYLE;
    document.head.appendChild(style_div);

    const ul = document.createElement("ul");
    ul.id = "ejs_list";

    for (const url of get_esms()) {
        ul.append(create_li(
            url
                .replace('"', '\\"')
                .replace("'", "\\'"),
        ));
    }

    document
        .getElementById("modManagerList")
        .insertAdjacentElement("afterend", ul)
        .insertAdjacentHTML("beforebegin", "<span>Modules</span>");
}

function rip_esms() {
    const esms = get_esms();
    const old_len = enabledMods.length;
    esms.push(...enabledMods.filter((x) => x.endsWith(".mjs")));
    localStorage.ejs_loaded_esms = JSON.stringify(esms);

    enabledMods = enabledMods.filter((x) => !x.endsWith(".mjs"));
    localStorage.enabledMods = JSON.stringify(enabledMods);

    if (esms.length > old_len) {
        modManagerList = document.getElementById("modManagerList");
        modManagerList.innerHTML = "";

        for (var i = 0; i < enabledMods.length; i++) {
            var mod = enabledMods[i];
            var modName = mod.split("/").pop();
            let url = mod;
            if (url.startsWith("mods/") && !isLocalFile) {
                url = "https://mods.r74n.com/" + url;
            }
            modManagerList.innerHTML += `<li>
                <a href="${url.replaceAll('"', "")}" target="_blank">${modName}</a>
                <span
                    class="removeModX"
                    onclick='removeMod("${mod.replaceAll('"', '\\"')}")'
                >X</span>
            </li>`;
        }
    }
}

function load() {
    for (const mod of get_esms()) {
        const elem = document.createElement("script");
        elem.src = mod;
        elem.setAttribute("type", "module");
        document.head.appendChild(elem);

        console.log(elem);
    }
}

function addMod(url, noMessage) {
    let split = url.split(/ ?; ?/g);

    if (split.length > 1) {
        split.forEach(addMod);
        return;
    }

    while (url.charAt(url.length - 1) == "/") {
        url = url.substring(0, url.length - 1);
    }
    url = url.replaceAll(/['‘’“”"\$\{\}\\]/g, "");

    if (url.indexOf("/") == -1 && url.indexOf(".") == -1 && !noMessage) {
        promptText(
            "Invalid mod URL.\n\nYou usually want something like 'survival.js' (without the quotes)",
            showModManager,
            "Error",
        );
        return;
    }
    // if the url doesn't start with http, add "mods/" to the beginning
    if (url.indexOf("http") == -1 && url.indexOf("mods/") == -1) {
        url = "mods/" + url;
        if (standalone) url = "https://mods.r74n.com/" + url;
    }

    if (url.startsWith("mods/") && !isLocalFile) {
        url = "https://mods.r74n.com/" + url;
    }
    // if the mod is in enabledMods, return
    for (var i = 0; i < enabledMods.length; i++) {
        if (enabledMods[i] == url) return;
    }

    if (url.endsWith(".mjs")) {
        localStorage.ejs_loaded_esms = JSON.stringify([...get_esms(), url]);

        const list = document.getElementById("ejs_list");
        list.append(create_li(url));
    } else {
        // add it to enabledMods and set the localStorage
        enabledMods.push(url);
        localStorage.setItem("enabledMods", JSON.stringify(enabledMods));

        // add to modManagerList
        var modManagerList = document.getElementById("modManagerList");
        var modName = url.split("/").pop();
        modManagerList.innerHTML += `<li>
            <a href="${url.replaceAll('"', "")}" target="_blank">${modName}</a>
            <span class="removeModX" onclick='removeMod("${
            url.replaceAll('"', '\\"')
        }")'>X</span>
        </li>`;
    }

    document.getElementById("noMods").style.display = "none";
    document.getElementById("modManagerRefresh").style.display = "block";

    if (!noMessage) {
        changedMods = true;
        promptText(
            (standalone ? "Reset the canvas" : "Refresh the page") +
                " to apply changes.",
            showModManager,
            "Added Mod",
        );
    }

    return url;
}

rip_esms();
load();
runAfterLoad(() => patch());
