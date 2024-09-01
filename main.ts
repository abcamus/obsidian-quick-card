import { Notice, Plugin, Workspace, WorkspaceLeaf } from 'obsidian';
import { CardifyPluginView, VIEW_TYPE_CARDIFY } from "./view/content-view";
import { CardModel } from "./model/card-model";

export default class QuickCardPlugin extends Plugin {
	async onload() {
		// add file menu item
		this.registerEvent(
			this.app.workspace.on("file-menu", async (menu, file) => {
				menu.addItem((item) => {
					item.setTitle("cardify")
						.setIcon("blocks")
						.onClick(async () => {
							const { workspace } = this.app;
							await CardModel.setPath(file.path, file.vault) ? this.activateView(workspace) : new Notice("Invalid Path: " + file.path);
						})
				})
			})
		);

		this.registerEvent(
			this.app.workspace.on("file-open", (file) => {
				if (file !== null && file.parent !== null) {
					CardModel.setPath(file?.parent?.path, file?.vault);
				}
			})
		);

		this.addCommand({
			id: "show-card-view",
			name: "Show Card View",
			callback: () => {
				const { workspace } = this.app;
				this.activateView(workspace);
			},
		});

		this.registerView(
			VIEW_TYPE_CARDIFY,
			(leaf) => new CardifyPluginView(leaf, this.app)
		);

		CardModel.setWorkspace(this.app.workspace);
		CardModel.addListener(CardifyPluginView.onCardsChange);
	}

	async activateView(workspace: Workspace) {
		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_CARDIFY);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getLeftLeaf(false);
			await leaf?.setViewState({ type: VIEW_TYPE_CARDIFY, active: true })
		}

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {
		CardModel.removeListener(CardifyPluginView.onCardsChange);
	}
}
