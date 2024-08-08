// TODO: add settings here

import { Plugin, PluginSettingTab } from "obsidian";

interface QuickCardPluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: QuickCardPluginSettings = {
	mySetting: 'default'
}

export class QuickCardSetting {
    private constructor() {}

    private config: string;

    private static instance: QuickCardSetting;
    static getInstance() {
        if (!QuickCardSetting.instance) {
            QuickCardSetting.instance = new QuickCardSetting();
        }
        return QuickCardSetting.instance;
    }

    static async loadSettings(plugin: Plugin) {
        QuickCardSetting.getInstance().config = Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
    }

    static async saveSettings(plugin: Plugin) {
        await plugin.saveData(QuickCardSetting.getInstance().config);
    }

    static updateSettings(newValue: string) {
        QuickCardSetting.getInstance().config = newValue;
    }
}