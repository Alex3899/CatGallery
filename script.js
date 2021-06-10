const base_url = "https://api.thecatapi.com/v1";
const api_key = "f264cfd1-08d0-438d-bb11-66d037e42f55";

const app = document.getElementById("app");
const breed_filter = document.getElementById("breed-filter");
const categorie_filter = document.getElementById("categorie-filter");
const search_field = document.getElementById("search-field");
const search_button = document.getElementById("search-button");
const load_button = document.getElementById("load-button");
const gallery = document.getElementById("gallery");
const image_popup = document.getElementById("image-popup");


image_popup.onclick = () => {
    app.classList.remove("popup-open");
    image_popup.classList.add("hide");
    image_popup.src = "";
}


// class to initalize a combobox as a javascript object. Object can manipulate the combobox element in dom
class CustomCombobox {
    constructor(element) {
        this.combobox = element;
        this.list_element = element.querySelector(".filter-list");
        this.display_item = element.querySelector(".filter-list-item.display span");
        this.expand_button = element.querySelector(".filter-list-expand-button");

        this.list_element.style.maxHeight = "0px";
        this.combobox.onclick = () => {
            if (this.list_element.style.maxHeight == "0px") {
                this.list_element.style.maxHeight = "250px";
                this.expand_button.classList.add("expanded");
                return;
            } 
            this.list_element.style.maxHeight = "0px";
            this.expand_button.classList.remove("expanded");
        }
    }

    add_item(name, id, set_selected=false) {
        let item = document.createElement("span");
        item.className = "filter-list-item";
        item.setAttribute("item-id", id);
        item.innerHTML = name;
        if (set_selected) item.classList.add("selected");
        item.onclick = () => {
            let selected_item = this.list_element.querySelector(".selected");
            if (selected_item) selected_item.classList.remove("selected");
            
            item.classList.add("selected");

            this.display_item.innerHTML = name;
            this.combobox.setAttribute("selected-item-id", id);
        }

        this.list_element.appendChild(item);
    }
}

function lowercase_to_uppercase(text) {
    /* a function, that converts the first letter to an uppercase-letter.
       The uppercase-letter gets concatenated with the rest of the original string */
    let first_letter = text.charAt(0);
    return first_letter.toUpperCase() + text.slice(1);
}


// function to send basic api requests
function send_request(url, method) {
    return new Promise((resolve, reject) => {
        let request = new XMLHttpRequest();
        request.open(method, url);
        request.setRequestHeader("x-api-key", api_key);
        request.setRequestHeader("Content-Type", "application/json");
        request.addEventListener("readystatechange", () => {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    resolve(JSON.parse(request.response)); 
                }
            }
        });
        request.send();
    });
}


// function that loads images into the gallery
async function load_images(amount, clear=true) {
    url = add_url_params(base_url + "/images/search", "limit", amount.toString());
    let image_request = await send_request(url, "GET");
    console.log(image_request)
    if (clear) clear_gallery();
    image_request.forEach(item => {
        let element = document.createElement("img");
        element.className = "gallery-image default";
        element.src = item.url;
        element.onclick = () => {
            app.classList.add("popup-open");
            image_popup.src = item.url;
            image_popup.classList.remove("hide");
        }
        gallery.appendChild(element);
    });
}


// function that removes every element from the gallery
function clear_gallery() {
    let current_children = Array.from(gallery.children);
    current_children.forEach(child => {
        gallery.removeChild(child);
    });
}


// function for searching images
async function search_imges(text) {
    if (text.length == 0) {
        alert("Ungültige Eingabe");
        return;
    }

    let children_list = Array.from(breed_filter_combobox.list_element.children);
    let id_list = [];

    children_list.forEach(children => {
        let id = children.getAttribute("item-id");
        if (id == "NONE") return;
        if (text.toLowerCase() == children.innerHTML.toLowerCase().slice(0, text.length)) {
            id_list.push(id);
        }
    });

    clear_gallery()
    id_list.forEach(id => {
        let url = add_url_params(base_url + "/images/search", "breed_id", id);
        load_images(url, clear=false)
    });

    if (id_list.length == 0) {
        let element = document.createElement("span");
        element.innerHTML = `Keine Ergebnisse für "${text}" gefunden`;
        element.className = "gallery-empty-text";
        gallery.appendChild(element);
    }
}

// input event, that changes the font-style, depending on the input-value
search_field.style.fontStyle = "italic";
search_field.oninput = () => {
    if (search_field.value.length == 0) {
        search_field.style.fontStyle = "italic";
    } else {
        search_field.style.fontStyle = "normal";
    }
}
search_field.onkeypress = e => e.keyCode == 13 ? search_imges(search_field.value) : null

search_button.onclick = () => search_imges(search_field.value);


// initalizing comboboxes as javascript objects
const breed_filter_combobox = new CustomCombobox(breed_filter);
breed_filter_combobox.add_item("Keine", "NONE", true);
const categorie_filter_combobox = new CustomCombobox(categorie_filter);
categorie_filter_combobox.add_item("Keine", "NONE", true);


// function that adds query parameters to url
const add_url_params = (url, key, value) => url + (url.split("?")[1] ? "&" : "?") + key + "=" + value;


load_button.onclick = () => {
    let categorie_id = categorie_filter.getAttribute("selected-item-id");
    let breed_id = breed_filter.getAttribute("selected-item-id");

    let url = base_url + "/images/search";

    if (!(categorie_id == "NONE")) url = add_url_params(url, "categorie_ids", categorie_id);
    if (!(breed_id == "NONE")) url = add_url_params(url, "breed_ids", breed_id);

    load_images(9)
}


async function setup() {
    // combobox setup for breeds
    let breeds_request = await send_request(base_url + "/breeds", "GET");
    breeds_request.forEach(item => {
        breed_filter_combobox.add_item(item.name, item.id);
    });

    // combobox setup for categories
    let categorie_request = await send_request(base_url + "/categories", "GET");
    categorie_request.forEach(item => {
        categorie_filter_combobox.add_item(lowercase_to_uppercase(item.name), item.id);
    });
}

setup()