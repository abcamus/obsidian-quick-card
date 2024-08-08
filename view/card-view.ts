import { App, Vault } from "obsidian";
import { Card } from "../model/card";
import { CardModel } from "model/card-model";

export class CardView {
    private card: Card;

    constructor(card: Card) {
        this.card = card;
    }

    static plusCard(parent: HTMLElement, vault: Vault): HTMLElement {
        let plusButton = parent.createDiv({
            cls: "plus",
            text: "+",
        });
        plusButton.addEventListener("click", async (evt) => {
            await CardModel.newFile(vault);
        });

        return plusButton;
    }

    cardify(parent: Element, app: App): HTMLElement {
        let aElement = parent.createEl('a', { href: this.card.filePath, cls: "card" });
        aElement.appendChild(parent.createDiv({
            cls: "title",
            text: this.card.title.split('.')[0],
        }));

        aElement.appendChild(parent.createDiv({
            cls: "date",
            text: "createdAt: " + this.card.getCreatedAtString(),
        }));

        aElement.appendChild(parent.createDiv({
            cls: "snippet",
            text: this.card.snippet,
        }));

        aElement.addEventListener('click', async (event) => {
            event.preventDefault();
            sessionStorage.setItem("scrollPosition", parent.scrollTop.toString());
            console.log("set scroll position to: ", parent.scrollTop.toString());
            this.card.open(app);
        });

        return aElement;
    }
}