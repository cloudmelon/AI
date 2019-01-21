/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from "botbuilder-core";

/**
 * Defines interface for data binding to template and rendering a string
 */
export interface ITemplateRenderer {
    /**
     * render a template to an activity or string
     * @param {TurnContext} turnContext - context
     * @param {string} language - language to render
     * @param {string} templateId - template to render
     * @param {any} data - data object to use to render
     * @returns {Promise<any>}
     */
    renderTemplate(turnContext: TurnContext, language: string, templateId: string, data: any): Promise<any>;
}
