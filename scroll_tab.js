export function ScrollTab(containerElem, options = {}) {
  // query the tab container
  this.tabContainerElem = document.querySelector(containerElem);
  this.options = options;
  this.tabClass = "";
  this.tabClassNoSymbol = "";
  this.tabContainerMaxWidth = 0;
  this.totalWidthOfAllTab = 0;
  this.hasExceedContainerWidth = false;
  this.possibleElementSymbols = [".", "#"];
  this.wrapperTab = null;
  this.averageOfAllTabWidth = 0;
  this.navClass = "";

  this.mouseEventObject = {
    mouseDown: null,
    mouseMove: null,
    mouseUp: null,
    mouseLeave: null,
  };

  this.position = {
    x: 0,
    left: 0,
  };

  // init the app
  this.init(containerElem);
}

// init for the library
ScrollTab.prototype.init = function (containerElem) {
  if (!this.tabContainerElem) {
    throw new Error("Missing a tab container element");
  }

  // set the tab container elem width and others
  this.tabContainerMaxWidth = this.tabContainerElem.clientWidth;
  this.tabContainerElem.style.cursor = "grab";

  // wrap the container element with an wrapper element in where the nav - container - nav sit next to each other
  const wrapper = document.createElement("div");
  wrapper.setAttribute("class", "tab-scroll-wrapper");
  // set default wrapper style
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  this.tabContainerElem.replaceWith(wrapper);
  wrapper.appendChild(this.tabContainerElem);
  this.wrapperTab = wrapper;
  // set the grabing ui style

  // check if tab class exist
  if (this.options.hasOwnProperty("tabClass")) {
    //   if it does split at the symbol found in the class provided
    // and set it as a reference for later to use
    this.tabClass = this.options.tabClass ? this.options.tabClass : "";
    this.navClass = this.options.navClass ? this.options.navClass : "";

    //   if tab class has a value
    if (this.tabClass && typeof this.tabClass === "string") {
      // find the symbol at first possition for split later
      let theSymbol = "";
      for (let pes = 0; pes < this.possibleElementSymbols.length; pes++) {
        if (this.possibleElementSymbols[pes] === this.tabClass.charAt(0)) {
          theSymbol = this.possibleElementSymbols[pes];
          break;
        }
      }

      //   if symbol is found split the word and only store the class value without the symbol
      if (theSymbol !== "") {
        this.tabClassNoSymbol =
          this.tabClass.split(theSymbol)[
            this.tabClass.split(theSymbol).length - 1
          ];
      } else {
        //   just set the tab class as is
        this.tabClassNoSymbol = this.tabClass;
      }
    } else {
      // if no tab class was not provided then add default and hope it runs
      console.warn(
        "No tab class provided, possible this library may not function as intended"
      );

      this.tabClass = ".tab-item";
      this.tabClassNoSymbol = "tab-item";
    }
  }

  this.listenToIncomingTabs(this.tabContainerElem, this.tabClassNoSymbol);
};

// listen to incoming tabs
ScrollTab.prototype.listenToIncomingTabs = function (
  tabContainerElem,
  tabClassNoSymbol
) {
  const _this = this;

  const mutation = new MutationObserver(function (mutationRecords) {
    console.log(mutationRecords);

    for (let mr = 0; mr < mutationRecords.length; mr++) {
      const addedNodes = mutationRecords[mr].addedNodes;

      // tab added
      if (mutationRecords[mr].addedNodes.length > 0) {
        for (let an = 0; an < addedNodes.length; an++) {
          //   check if added tab was of tab class provided
          if (addedNodes[an].className.includes(tabClassNoSymbol)) {
            const diffWidth =
              addedNodes[an].offsetWidth - addedNodes[an].clientWidth;
            const eachTabWidth = addedNodes[an].offsetWidth + diffWidth;

            const id = generateRandomID();
            addedNodes[an].dataset.id = id;
            addedNodes[an].dataset.tabWidth = eachTabWidth;

            _this.averageOfAllTabWidth = _this.calculateAverageOfAllTabWidths();

            _this.totalUpTabWidth(eachTabWidth, "add");
          }
        }
      }

      // tab removed
      if (mutationRecords[mr].removedNodes.length > 0) {
        const removedNodes = mutationRecords[mr].removedNodes;

        for (let rn = 0; rn < removedNodes.length; rn++) {
          const eachTabWidth = Number(removedNodes[rn].dataset.tabWidth);

          _this.averageOfAllTabWidth = _this.calculateAverageOfAllTabWidths();

          _this.totalUpTabWidth(eachTabWidth, "minus");
        }
      }
    }
  });

  mutation.observe(tabContainerElem, {
    childList: true,
  });
};

ScrollTab.prototype.totalUpTabWidth = function (tabWidth, operation) {
  if (operation === "add") {
    this.totalWidthOfAllTab += tabWidth;
  }

  if (operation === "minus") {
    this.totalWidthOfAllTab -= tabWidth;
  }

  console.log(tabWidth);
  console.log("Total Tab Width ", this.totalWidthOfAllTab);
  console.log("Total Container Width ", this.tabContainerMaxWidth);
  console.log("HAS EXCEED ", this.hasExceedContainerWidth);

  // if exceed add buttons
  if (
    this.totalWidthOfAllTab > this.tabContainerMaxWidth &&
    this.hasExceedContainerWidth === false
  ) {
    // add the left and right buttons at end of container
    this.addScrollTabButtons();
    this.hasExceedContainerWidth = true;
  }

  // if below remove buttons
  if (
    this.totalWidthOfAllTab <= this.tabContainerMaxWidth &&
    this.hasExceedContainerWidth === true
  ) {
    this.reset();
    this.hasExceedContainerWidth = false;
  }
};

// adds the scroll tab nav buttons
ScrollTab.prototype.addScrollTabButtons = function () {
  const leftTabNav = document.createElement("button");
  const rightTabNav = document.createElement("button");

  let defaultClass = "tab-scroll-btn";

  if (this.navClass && this.navClass !== "") {
    defaultClass += " " + this.navClass;
  }

  // add class to buttons
  leftTabNav.setAttribute("class", defaultClass);
  rightTabNav.setAttribute("class", defaultClass);

  // set basic style
  leftTabNav.style.height = "fit-content";
  rightTabNav.style.height = "fit-content";
  leftTabNav.style.marginLeft = "5px";
  leftTabNav.style.marginRight = "5px";
  rightTabNav.style.marginLeft = "5px";
  rightTabNav.style.marginRight = "5px";

  leftTabNav.addEventListener("click", this.scrollLeft.bind(this));
  rightTabNav.addEventListener("click", this.scrollRight.bind(this));

  this.mouseEventObject.mouseDown = this.mouseDown.bind(this);
  this.mouseEventObject.mouseLeave = this.mouseLeave.bind(this);

  // when user mouse down
  this.tabContainerElem.addEventListener(
    "mousedown",
    this.mouseEventObject.mouseDown
  );

  // when leaves the tab container area
  this.tabContainerElem.addEventListener(
    "mouseleave",
    this.mouseEventObject.mouseLeave
  );

  // the simple icon for left/right nav
  leftTabNav.textContent = "<";
  rightTabNav.textContent = ">";

  // attach to tab container elem
  this.tabContainerElem.parentElement.prepend(leftTabNav);
  this.tabContainerElem.parentElement.append(rightTabNav);
};

// removes the scroll tab nav button and any events created
ScrollTab.prototype.reset = function () {
  // removes scroll tab
  this.wrapperTab.querySelectorAll(".tab-scroll-btn").forEach((node) => {
    this.wrapperTab.removeChild(node);
  });

  // removes the container events
  this.tabContainerElem.removeEventListener(
    "mousedown",
    this.mouseEventObject.mouseDown
  );
  this.tabContainerElem.removeEventListener(
    "mouseup",
    this.mouseEventObject.mouseUp
  );
  this.tabContainerElem.removeEventListener(
    "mousemove",
    this.mouseEventObject.mouseMove
  );
  this.tabContainerElem.removeEventListener(
    "mouseleave",
    this.mouseEventObject.mouseLeave
  );
};

// scroll to the right
ScrollTab.prototype.scrollRight = function () {
  this.tabContainerElem.scrollLeft += this.averageOfAllTabWidth;
};
// scroll to the left
ScrollTab.prototype.scrollLeft = function () {
  this.tabContainerElem.scrollLeft -= this.averageOfAllTabWidth;
};

ScrollTab.prototype.mouseDown = function (event) {
  console.log("MOUSE DOWN");
  // set the position for x horizontal
  this.position.x = event.clientX;
  this.position.left = this.tabContainerElem.scrollLeft;

  this.tabContainerElem.style.cursor = "grabbing";
  this.tabContainerElem.style.userSelect = "none";

  this.mouseEventObject.mouseMove = this.mouseMove.bind(this);
  this.mouseEventObject.mouseUp = this.mouseUp.bind(this);

  this.tabContainerElem.addEventListener(
    "mousemove",
    this.mouseEventObject.mouseMove
  );
  this.tabContainerElem.addEventListener(
    "mouseup",
    this.mouseEventObject.mouseUp
  );
};

ScrollTab.prototype.mouseMove = function (e) {
  console.log(e);
  this.tabContainerElem.style.cursor = "grabbing";
  this.tabContainerElem.style.userSelect = "none";

  const dx = e.clientX - this.position.x;
  this.tabContainerElem.scrollLeft = this.position.left - dx;
};

ScrollTab.prototype.mouseUp = function () {
  console.log("MOUSE UP");
  this.tabContainerElem.style.cursor = "grab";
  this.tabContainerElem.style.removeProperty("user-select");

  this.tabContainerElem.removeEventListener(
    "mousemove",
    this.mouseEventObject.mouseMove
  );

  this.tabContainerElem.removeEventListener(
    "mouseup",
    this.mouseEventObject.mouseUp
  );
};

ScrollTab.prototype.mouseLeave = function () {
  this.tabContainerElem.style.cursor = "grab";
  this.tabContainerElem.style.removeProperty("user-select");

  this.tabContainerElem.removeEventListener(
    "mousemove",
    this.mouseEventObject.mouseMove
  );

  this.tabContainerElem.removeEventListener(
    "mouseup",
    this.mouseEventObject.mouseUp
  );
};

// calculates the average value for scrolling left / right operations
ScrollTab.prototype.calculateAverageOfAllTabWidths = function () {
  const allTabs = this.tabContainerElem.querySelectorAll(this.tabClass);
  let average = 0;
  const total = allTabs.length;
  let totalValue = 0;

  allTabs.forEach((tab) => {
    totalValue += tab.clientWidth;
  });

  average = totalValue / total;

  return Math.ceil(average);
};

function generateRandomID() {
  const possible =
    "ABCDEFGHIFKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$";

  let random = "";

  for (let l = 0; l < 50; l++) {
    const rand = Math.floor(Math.random() * possible.length);
    random += possible.charAt(rand);
  }

  return random;
}
