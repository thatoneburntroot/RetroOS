/* =========================================================
   RETROOS
========================================================= */

let topZ = 20;

const windows =
    [...document.querySelectorAll(".window")];

const minimized =
    new Set();

let computerPoweredOn = false;


/* =========================================================
   WINDOW ARRANGEMENT
========================================================= */

function arrangeWindows() {

    const desktop =
        document.getElementById("desktop");

    const width =
        desktop.clientWidth;

    const layouts = width >= 1050

        ? [
            { id: "browser", x: 105, y: 20 },
            { id: "notepad", x: 525, y: 20 },
            { id: "files", x: 945, y: 20 },
            { id: "ide", x: 200, y: 320 },
            { id: "readme", x: 730, y: 320 }
        ]

        : [
            { id: "browser", x: 100, y: 20 },
            { id: "notepad", x: 500, y: 20 },
            { id: "files", x: 100, y: 310 },
            { id: "ide", x: 500, y: 310 },
            { id: "readme", x: 250, y: 570 }
        ];


    layouts.forEach(layout => {

        const win =
            document.getElementById(
                layout.id
            );

        if (!win) return;

        if (
            win.dataset.userMoved === "1" ||
            win.dataset.maximized === "1"
        ) {
            return;
        }

        win.style.left =
            layout.x + "px";

        win.style.top =
            layout.y + "px";

    });

}


/* =========================================================
   BRING TO FRONT
========================================================= */

function bringToFront(win) {

    topZ++;

    win.style.zIndex =
        topZ;


    windows.forEach(w => {

        w.querySelector(
            ".titlebar"
        ).classList.toggle(
            "inactive",
            w !== win
        );

    });


    refreshTasks();
}


/* =========================================================
   OPEN
========================================================= */

function openWindow(id) {

    if (!computerPoweredOn) {
        return;
    }

    const win =
        document.getElementById(id);

    win.style.display =
        "block";

    minimized.delete(id);

    bringToFront(win);

    refreshTasks();
}


/* =========================================================
   CLOSE
========================================================= */

function closeWindow(id) {

    const win =
        document.getElementById(id);

    win.style.display =
        "none";

    minimized.delete(id);

    refreshTasks();
}


/* =========================================================
   MINIMIZE
========================================================= */

function minimizeWindow(id) {

    const win =
        document.getElementById(id);

    win.style.display =
        "none";

    minimized.add(id);

    refreshTasks();
}


/* =========================================================
   MAXIMIZE
========================================================= */

function maximizeWindow(id) {

    const win =
        document.getElementById(id);


    if (
        win.dataset.maximized === "1"
    ) {

        win.style.left =
            win.dataset.left;

        win.style.top =
            win.dataset.top;

        win.style.width =
            win.dataset.width;

        win.style.height =
            win.dataset.height;

        win.dataset.maximized =
            "0";

    } else {

        win.dataset.left =
            win.style.left;

        win.dataset.top =
            win.style.top;

        win.dataset.width =
            win.style.width;

        win.dataset.height =
            win.style.height;


        win.style.left =
            "5px";

        win.style.top =
            "5px";

        win.style.width =
            "calc(100% - 10px)";

        win.style.height =
            "calc(100% - 50px)";


        win.dataset.maximized =
            "1";
    }


    bringToFront(win);
}


/* =========================================================
   TASKBAR
========================================================= */

function refreshTasks() {

    const tasks =
        document.getElementById(
            "tasks"
        );

    tasks.innerHTML =
        "";


    windows.forEach(win => {

        if (
            win.style.display === "none" &&
            !minimized.has(win.id)
        ) {
            return;
        }


        const task =
            document.createElement(
                "button"
            );


        task.className =
            "task";


        task.textContent =
            win.querySelector(
                ".titlebar span"
            ).textContent;


        task.onclick =
            function() {

                if (
                    win.style.display ===
                    "none"
                ) {

                    win.style.display =
                        "block";

                    minimized.delete(
                        win.id
                    );
                }

                bringToFront(win);

            };


        if (
            parseInt(win.style.zIndex) ===
            topZ
            &&
            win.style.display !==
            "none"
        ) {

            task.classList.add(
                "active"
            );
        }


        tasks.appendChild(task);

    });
}


/* =========================================================
   DRAGGING
========================================================= */

windows.forEach(win => {

    const titlebar =
        win.querySelector(
            ".titlebar"
        );


    titlebar.addEventListener(
        "mousedown",
        function(e) {

            if (
                e.target.classList.contains(
                    "wbtn"
                )
            ) {
                return;
            }


            bringToFront(win);


            if (
                win.dataset.maximized ===
                "1"
            ) {
                return;
            }


            win.dataset.userMoved =
                "1";


            const startX =
                e.clientX;

            const startY =
                e.clientY;

            const startLeft =
                win.offsetLeft;

            const startTop =
                win.offsetTop;


            function move(event) {

                const desktop =
                    document.getElementById(
                        "desktop"
                    );


                const maxLeft =
                    desktop.clientWidth -
                    win.offsetWidth -
                    2;


                const maxTop =
                    desktop.clientHeight -
                    40 -
                    win.offsetHeight -
                    2;


                let newLeft =
                    startLeft +
                    event.clientX -
                    startX;


                let newTop =
                    startTop +
                    event.clientY -
                    startY;


                newLeft =
                    Math.max(
                        0,
                        Math.min(
                            maxLeft,
                            newLeft
                        )
                    );


                newTop =
                    Math.max(
                        0,
                        Math.min(
                            maxTop,
                            newTop
                        )
                    );


                win.style.left =
                    newLeft + "px";

                win.style.top =
                    newTop + "px";

            }


            function stop() {

                document.removeEventListener(
                    "mousemove",
                    move
                );

                document.removeEventListener(
                    "mouseup",
                    stop
                );

            }


            document.addEventListener(
                "mousemove",
                move
            );

            document.addEventListener(
                "mouseup",
                stop
            );

        }
    );


    win.addEventListener(
        "mousedown",
        () => bringToFront(win)
    );

});


/* =========================================================
   START MENU
========================================================= */

function toggleStart() {

    if (!computerPoweredOn) {
        return;
    }

    document
        .getElementById(
            "startMenu"
        )
        .classList.toggle(
            "open"
        );
}


document.addEventListener(
    "mousedown",
    function(e) {

        if (
            !e.target.closest(
                "#startMenu"
            )
            &&
            !e.target.closest(
                ".start"
            )
        ) {

            document
                .getElementById(
                    "startMenu"
                )
                .classList.remove(
                    "open"
                );

        }

    }
);


/* =========================================================
   INTERNET
========================================================= */

function searchWebsite() {

    const value =
        document
            .getElementById(
                "url"
            )
            .value
            .trim();


    document
        .getElementById(
            "browserPage"
        )
        .innerHTML = `

            <div class="unavailable">

                <h2>
                    Website unavailable
                </h2>

                <p>
                    The website is down
                    or unavailable.
                </p>

                <p style="
                    font-size:11px;
                ">

                    ${escapeHtml(value)}

                </p>

            </div>

        `;
}


function escapeHtml(text) {

    return text.replace(
        /[&<>"']/g,

        function(character) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"

            }[character];

        }
    );

}


/* =========================================================
   IDE
========================================================= */

function runIDE() {

    const code =
        document
            .getElementById(
                "codeEditor"
            )
            .value;


    const blob =
        new Blob(
            [code],
            {
                type: "text/html"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    window.open(
        url,
        "_blank"
    );
}


function saveIDE() {

    const code =
        document
            .getElementById(
                "codeEditor"
            )
            .value;


    localStorage.setItem(
        "retroos-ide",
        code
    );
}


const savedCode =
    localStorage.getItem(
        "retroos-ide"
    );


if (savedCode) {

    document
        .getElementById(
            "codeEditor"
        )
        .value =
        savedCode;
}


/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

    document
        .getElementById(
            "clock"
        )
        .textContent =
        new Date()
            .toLocaleTimeString();
}

setInterval(
    updateClock,
    1000
);

updateClock();


/* =========================================================
   BOOT
========================================================= */

function bootComputer() {

    const boot =
        document.getElementById(
            "bootScreen"
        );

    const bootText =
        document.getElementById(
            "bootText"
        );


    computerPoweredOn =
        false;


    /*
       Hide everything behind
       the boot screen.
    */

    windows.forEach(win => {

        win.style.display =
            "none";

    });


    boot.classList.remove(
        "hidden"
    );

    boot.classList.remove(
        "powered-off"
    );

    boot.classList.remove(
        "crt-off"
    );

    boot.classList.add(
        "crt-on"
    );


    boot.style.transform =
        "";


    boot.style.color =
        "#00ff66";


    bootText.innerHTML =
        "";


    const lines = [

        "RETROOS BIOS v1.98",

        "",

        "Memory Test ............ OK",

        "Checking Keyboard ...... OK",

        "Detecting Hard Drive ... OK",

        "Checking System ........ OK",

        "",

        "Loading RETROOS ........ OK",

        "",

        "Starting system..."

    ];


    lines.forEach(
        (line, index) => {

            setTimeout(
                () => {

                    const div =
                        document.createElement(
                            "div"
                        );

                    div.className =
                        "boot-line";

                    div.textContent =
                        line;

                    bootText.appendChild(
                        div
                    );

                },

                450 +
                index * 220

            );

        }
    );


    /*
       Flicker right before
       the desktop appears.
    */

    setTimeout(
        () => {

            boot.classList.add(
                "crt-flicker"
            );

        },

        2800
    );


    /*
       IMPORTANT:

       The boot screen isn't hidden
       until AFTER the desktop has
       already been prepared.

       This prevents the tiny flash
       of desktop you were seeing.
    */

    setTimeout(
        () => {

            windows.forEach(win => {

                win.style.display =
                    "block";

            });


            arrangeWindows();


            windows.forEach(win => {

                win.style.zIndex =
                    "10";

            });


            topZ = 20;


            refreshTasks();


            bringToFront(
                document.getElementById(
                    "browser"
                )
            );


            computerPoweredOn =
                true;


            /*
               Now remove the boot screen.
            */

            boot.classList.add(
                "hidden"
            );

            boot.classList.remove(
                "crt-on"
            );

            boot.classList.remove(
                "crt-flicker"
            );

        },

        3200
    );

}


/* =========================================================
   POWER OFF
========================================================= */

function powerOff() {

    if (!computerPoweredOn) {
        return;
    }


    const boot =
        document.getElementById(
            "bootScreen"
        );


    const bootText =
        document.getElementById(
            "bootText"
        );


    computerPoweredOn =
        false;


    /*
       Close Start menu.
    */

    document
        .getElementById(
            "startMenu"
        )
        .classList.remove(
            "open"
        );


    /*
       Immediately put the black
       boot layer ABOVE everything.

       This means the desktop can
       never remain visible during
       shutdown.
    */

    boot.classList.remove(
        "hidden"
    );

    boot.classList.remove(
        "powered-off"
    );

    boot.classList.remove(
        "crt-on"
    );


    boot.style.transform =
        "scaleY(1)";


    boot.style.color =
        "#00ff66";


    bootText.innerHTML = `

        <div class="boot-line">
            Shutting down RETROOS...
        </div>

        <div class="boot-line">
            Saving system settings... OK
        </div>

        <div class="boot-line">
            Closing applications... OK
        </div>

        <div class="boot-line">
            Powering off...
        </div>

    `;


    /*
       Hide applications behind
       the black CRT screen.
    */

    windows.forEach(win => {

        win.style.display =
            "none";

    });


    /*
       CRT collapses.
    */

    void boot.offsetWidth;

    boot.classList.add(
        "crt-off"
    );


    /*
       Once collapsed, convert it
       into a completely black
       powered-off screen.
    */

    setTimeout(
        () => {

            boot.classList.remove(
                "crt-off"
            );


            boot.classList.add(
                "powered-off"
            );


            boot.style.transform =
                "scaleY(1)";


            bootText.innerHTML = `

                <div class="off-power">
                    ⏻
                </div>

            `;

        },

        900
    );

}


/* =========================================================
   CLICK BLACK SCREEN TO TURN ON
========================================================= */

document
    .getElementById(
        "bootScreen"
    )
    .addEventListener(
        "click",
        function() {

            if (
                !computerPoweredOn &&
                this.classList.contains(
                    "powered-off"
                )
            ) {

                this.classList.remove(
                    "powered-off"
                );

                bootComputer();

            }

        }
    );


/* =========================================================
   RESIZE
========================================================= */

window.addEventListener(
    "resize",
    function() {

        if (computerPoweredOn) {

            arrangeWindows();

        }

    }
);


/* =========================================================
   START RETROOS
========================================================= */

/*
   This runs immediately.

   All windows are hidden BEFORE
   the boot sequence starts.
*/

windows.forEach(win => {

    win.style.display =
        "none";

});


/*
   The boot screen is already
   visible from CSS.

   This means there is NO moment
   where the desktop can flash
   before the BIOS animation.
*/

bootComputer();