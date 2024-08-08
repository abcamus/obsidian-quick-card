import { App, Notice, Plugin, PluginSettingTab, Setting, Workspace, WorkspaceLeaf } from 'obsidian';
import { CardifyPluginView, VIEW_TYPE_CARDIFY } from "./view/content-view";
import { CardModel } from "./model/card-model";
import { QuickCardSetting } from './view/setting';

export default class QuickCardPlugin extends Plugin {
	async onload() {
		await QuickCardSetting.loadSettings(this);

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new QuickCardSettingTab(this.app, this));

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

		let cardifyView = leaf?.view as CardifyPluginView;

		if (leaf) {
			workspace.revealLeaf(leaf);
		}
	}

	onunload() {

	}
}

class QuickCardSettingTab extends PluginSettingTab {
	plugin: QuickCardPlugin;

	constructor(app: App, plugin: QuickCardPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Setting #1')
			.setDesc('It\'s a secret')
			.addText(text => text
				.setPlaceholder('Enter your secret')
				.onChange(async (value) => {
					await QuickCardSetting.saveSettings(this.plugin);
				}));
	}
}
