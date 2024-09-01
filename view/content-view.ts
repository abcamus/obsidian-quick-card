import { App, IconName, ItemView, WorkspaceLeaf, Workspace } from "obsidian";
import { CardModel } from "../model/card-model";
import { Card } from "../model/card";
import { CardView } from "./card-view";

export const VIEW_TYPE_CARDIFY = "file-cardify-view"
const VIEW_CONTENT_INDEX = 1

export class CardifyPluginView extends ItemView {
    app: App;

    constructor(leaf: WorkspaceLeaf, app: App) {
        super(leaf);
        this.app = app;
    }

    getViewType(): string {
        return VIEW_TYPE_CARDIFY;
    }

    getDisplayText(): string {
        return "File Cardify View";
    }

    getIcon(): IconName {
        return "blocks";
    }

    private buildCardsView(this: CardifyPluginView, cards: Card[], container: HTMLElement) {
        container.empty();

        if (cards.length === 0) {
            container.createEl('h3', { text: "No files found" });
            return;
        }

        let cardDivEl = container.createDiv({ cls: "card-container" });
        cards.forEach((card) => {
            cardDivEl.appendChild(new CardView(card).cardify(cardDivEl, this.app));
        });

        cardDivEl.appendChild(CardView.plusCard(cardDivEl, this.app.vault));

        const scrollPos = sessionStorage.getItem("scrollPosition");
        if (scrollPos) {
            cardDivEl.scrollTop = parseFloat(scrollPos);
        }
    }

    static onCardsChange(cards: Card[], workspace: Workspace) {
        workspace.getLeavesOfType(VIEW_TYPE_CARDIFY).forEach((leaf) => {
            if (leaf.view instanceof CardifyPluginView) {
                leaf.view.buildCardsView(cards, leaf.view.containerEl);
            }
        });
    }

    protected async onOpen(): Promise<void> {
        const container = this.containerEl.children[VIEW_CONTENT_INDEX];
        container.empty();
    }

    protected async onClose(): Promise<void> {
        // clean up
        CardModel.resetCards()
    }
}