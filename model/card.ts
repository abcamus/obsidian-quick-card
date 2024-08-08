import { App, TFile, Vault } from "obsidian";

export class Card {
    title: string;
    createdAt: Date;
    snippet: string;
    filePath: string;
    isOpened: boolean;

    constructor(title: string, createdAt: Date, snippet: string, filePath: string) {
        this.title = title;
        this.createdAt = createdAt;
        this.snippet = snippet;
        this.filePath = filePath;
        this.isOpened = false;
    }

    // 成员方法，例如：获取卡片的创建时间字符串
    getCreatedAtString(): string {
        return this.createdAt.toLocaleString();
    }

    toString(): string {
        return `title: ${this.title}, createdAt: ${this.getCreatedAtString()}, \
            snippet: ${this.snippet}, path: ${this.filePath}`;
    }

    open(app: App) {
        const file = app.vault.getAbstractFileByPath(this.filePath);
        if (file instanceof TFile) {
            app.workspace.getLeaf(false).openFile(file);
            this.isOpened = true;
        }
    }
}
