/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from "botbuilder-core";
import { Activity, ActivityTypes } from "botframework-schema";
import { ITemplateRenderer } from "./ITemplateRenderer";

export class TemplateManager {
    private _templateRenderers: ITemplateRenderer[] = [];
    private _languageFallback: string[] = [];

    /**
     * Add a template engine for binding templates
     * @param {ITemplateRenderer} renderer
     */
    public register(renderer: ITemplateRenderer): TemplateManager {
        if (!this._templateRenderers.some((x) => x === renderer)) {
            this._templateRenderers.push(renderer);
        }

        return this;
    }

    /**
     * List registered template engines
     */
    public list(): ITemplateRenderer[] {
        return this._templateRenderers;
    }

    public setLanguagePolicy(languageFallback: string[]): void {
        this._languageFallback = languageFallback;
    }

    public getLanguagePolicy(): string[] {
        return this._languageFallback;
    }

    /**
     * Send a reply with the template
     * @param {TurnContext} turnContext
     * @param {string} templateId
     * @param {any} [data]
     */
    public async replyWith(turnContext: TurnContext, templateId: string, data?: any): Promise<void> {
        if (!turnContext) { throw new Error("turnContext is null"); }

        // apply template
        const boundActivity: Activity | undefined = await this.renderTemplate(turnContext, templateId, turnContext.activity.locale, data);
        if (boundActivity != null) {
            await turnContext.sendActivity(boundActivity);
            return;
        }

        return;
    }

    /**
     * Render the template
     * @param {TurnContext} turnContext
     * @param {string} templateId
     * @param {string} [language]
     * @param {any} data
     */
    public async renderTemplate(turnContext: TurnContext, templateId: string, language?: string, data?: any): Promise<Activity | undefined> {
        const fallbackLocales = this._languageFallback;

        if (language) {
            fallbackLocales.push(language);
        }

        fallbackLocales.push("default");

        // try each locale until successful
        for (const locale of fallbackLocales) {
            for (const renderer of this._templateRenderers) {
                const templateOutput = await renderer.renderTemplate(turnContext, locale, templateId, data);
                if (templateOutput) {
                    if (typeof templateOutput === "string" || templateOutput instanceof String) {
                        return { type: ActivityTypes.Message, text: templateOutput as string } as Activity;
                    } else {
                        return templateOutput as Activity;
                    }
                }
            }
        }

        return undefined;
    }
}
