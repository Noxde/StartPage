console.log("script was loaded!")

async function init_bookmarks_folder() {
    await browser.bookmarks.search("StartPageFolder").then((results) => {
        if (results.length > 0) {
            console.log("retrieved the bookmarks folder")
            bookmark_folder = results[0]
        }
    })
    if (!bookmark_folder) {
        await browser.bookmarks.create({
            index: 0,
            title: "StartPageFolder"
        }).then((val) => {
            if (val) {
                console.log("created a new bookmarks folder")
                bookmark_folder = val
            } else {
                console.log("failed to create a new bookmarks folder")
                console.log(err)
            }
        })
    }
}

async function create_bookmark(bm_folder, title, url) {
    let bookmark = await browser.bookmarks.create({
        parentId: bm_folder.id,
        title: title,
        url: url
    }).then((val, err) => {
        if (val) {
            console.log("successfully created a bookmark")
            console.log(val)
            return val
        } else {
            console.log("failed to create a bookmark")
            console.log(err)

        }
    })
    return bookmark
}

function open_add_bookmark_modal() {
    let modal = document.getElementById("modal")
    modal.style.display = "flex"
}

function init_modal() {
    let modal = document.getElementById("modal")

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none"
        }
    }

    let close_btn = document.getElementById("modal-close-button")
    close_btn.onclick = function () {
        modal.style.display = "none"
    }

    let confirm_btn = document.getElementById("modal-confirm-button")

    confirm_btn.onclick = function () {
        let title = document.getElementById("modal-input-title").value
        let url = document.getElementById("modal-input-url").value

        modal.style.display = "none"
        create_bookmark(bookmark_folder, title, url)
    }
}

function bookmark_onChanged_listener(id, change_info) {
    console.log(id, change_info)
    // TODO: substitute updating everything with just applying the changes.
    update_bookmarks()
}

function bookmark_onCreated_listener(id, bookmark_info) {
    if (init_finished) {
        console.log(id, bookmark_info)
        // TODO: substitute updating everything with just applying the changes.
        update_bookmarks()
    }
}

function bookmark_onRemoved_listener(id, remove_info) {
    console.log(id, remove_info)
    // TODO: substitute updating everything with just applying the changes.
    update_bookmarks()
}

function get_favicon_url(bookmark_url) {
    const best_icon_start = "https://start-page-browser-extension.herokuapp.com/icon?url="
    const best_icon_size = "&size=48..150..196"
    let url = new URL(bookmark_url)
    url = best_icon_start + url.host + best_icon_size
    return url
}

async function update_bookmarks() {
    console.log("update bookmarks")

    let old_bookmarks_inner = document.getElementById("bookmarks-inner")
    if (old_bookmarks_inner) {
        old_bookmarks_inner.remove()
    }

    let bookmarks_wrapper = document.getElementById("bookmarks-wrapper")
    let bookmarks_inner = document.createElement("div")
    bookmarks_inner.setAttribute("id", "bookmarks-inner")

    console.log("here", bookmark_folder.id)
    let bookmarks = await browser.bookmarks.getSubTree(bookmark_folder.id)
    bookmarks = bookmarks[0].children
    if (bookmarks) {
        console.log(bookmarks)

        // bookmark div
        for (let i = 0; i < bookmarks.length; i++) {
            let container = document.createElement("a")
            container.setAttribute("class", "bookmark-div")
            container.setAttribute("href", bookmarks[i].url)

            let icon = document.createElement("img")
            icon.setAttribute("class", "bookmark-icon")
            // TODO: handle missing favicon case
            let favicon_url = get_favicon_url(bookmarks[i].url)
            icon.setAttribute("src", favicon_url)
            container.appendChild(icon)

            let ref = document.createElement("span")
            ref.setAttribute("class", "bookmark-title")
            ref.innerHTML = bookmarks[i].title
            container.appendChild(ref)

            bookmarks_inner.appendChild(container)
        }
    }

    // add button div
    let add_div = document.createElement("div")
    add_div.setAttribute("class", "bookmark-div")
    add_div.addEventListener("click", open_add_bookmark_modal)

    let icon = document.createElement("img")
    icon.setAttribute("class", "bookmark-icon")
    icon.setAttribute("src", "resources/add-button.svg")
    add_div.appendChild(icon)

    let add_label = document.createElement("span")
    add_label.innerText = "add"
    add_label.setAttribute("id", "add-bookmark-label")
    add_div.appendChild(add_label)

    bookmarks_inner.appendChild(add_div)

    bookmarks_wrapper.appendChild(bookmarks_inner)
}


async function init() {
    browser.bookmarks.onChanged.addListener(bookmark_onChanged_listener)
    browser.bookmarks.onCreated.addListener(bookmark_onCreated_listener)
    browser.bookmarks.onRemoved.addListener(bookmark_onRemoved_listener)

    await init_bookmarks_folder()
    console.log(bookmark_folder);

    init_modal()
    init_finished = true

    await update_bookmarks()
}

let bookmark_folder
let init_finished = false
init()