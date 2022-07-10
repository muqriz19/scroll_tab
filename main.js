import "./style.css";
import { ScrollTab } from "./scroll_tab";

const btn = document.querySelector(".btn");
const tabContainer = document.querySelector(".tab-container");

let counter = 0;

btn.addEventListener("click", ($event) => {
  const tab = document.createElement("li");

  tab.setAttribute("class", "tab");
  tab.textContent = "Tab " + counter;
  counter++;
  tab.addEventListener("dblclick", ($event) => {
    tabContainer.removeChild($event.target);
  });

  tab.addEventListener("click", ($event) => {
    console.log(tab.textContent);
  });

  tabContainer.append(tab);
});

const scrollTabberObj = new ScrollTab(".tab-container", {
  tabClass: ".tab",
  navClass: "tab-navigation",
});
