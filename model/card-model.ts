import { Vault, Notice, Workspace, TFile, TFolder } from "obsidian";
import { Card } from "./card";
import * as path from "path";

export type CardsListener = (cards: Card[], workspace: Workspace) => void;

export class CardModel {
    private static instance: CardModel;

    private constructor() {
        this.cards = [];
        this.listeners = [];
    }

    static getInstance(): CardModel {
        if (!CardModel.instance) {
            CardModel.instance = new CardModel();
        }
        return CardModel.instance;
    }

    cards: Card[];
    folderPath: string;
    listeners: CardsListener[]
    workspace: Workspace

    addOneCard(title: string, date: Date, snippet: string, filePath: string) {
        this.cards.push(new Card(title, date, snippet, filePath));
    }

    async createFile(vault: Vault) {
        const filePath = path.join(this.folderPath, "untitled.md");
        const file = await vault.create(filePath, '');
        this.workspace.getLeaf(false).openFile(file);
    }

    static notify() {
        const self = CardModel.getInstance();
        self.listeners.forEach((notifier) => notifier(self.cards, self.workspace))
    }

    // intent functions
    static setWorkspace(workspace: Workspace) {
        CardModel.getInstance().workspace = workspace;
    }

    async buildCards(folder: TFolder, vault: Vault): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const promises = folder.children.map(async (file) => {
                if (isMarkdownFile(file.path, vault)) {
                    const ctime = vault.getFileByPath(file.path)?.stat.ctime;
                    const snippet = await this.generateSummary(vault.getFileByPath(file.path)!, vault);
                    this.addOneCard(file.name, new Date(ctime!), snippet, file.path);
                }
            });
            await Promise.all(promises);
            resolve();
        });
    }

    static async setPath(newPath: string, vault: Vault): Promise<boolean> {
        let cardModel = CardModel.getInstance();

        cardModel.folderPath = newPath;

        // regenerate cards
        cardModel.cards = []
        let folder = vault.getFolderByPath(newPath);
        if (folder === null) {
            return false;
        }

        await cardModel.buildCards(folder, vault).then(() => {
            CardModel.notify();
        });

        return true;
    }

    async generateSummary(file: TFile, vault: Vault): Promise<string> {
        try {
            const content = await vault.read(file);
            return this.createSummary(content, 30);
        } catch (error) {
            new Notice('Failed to generate summary.');
            console.error(error);
        }

        return "";
    }

    // 创建摘要的函数
    createSummary(content: string, length: number): string {
        const lines = content.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
        return lines.join(' ').substring(0, length) + '...';
    }

    static resetCards() {
        CardModel.getInstance().cards = []
    }

    static addListener(listener: CardsListener) {
        CardModel.getInstance().listeners.push(listener);
    }

    static removeListener(listener: CardsListener) {
        CardModel.getInstance().listeners.remove(listener);
    }

    static async newFile(vault: Vault) {
        await CardModel.getInstance().createFile(vault);
    }
}

function isMarkdownFile(path: string, vault: Vault): boolean {
    return vault.getFolderByPath(path) === null && path.endsWith(".md");
}

// intent functions
// function getCards(): Card[] {
//     return CardModel.getInstance().cards
// }
