/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

import Event from 'vs/base/common/event';
//import cp = require('child_process');
import platform = require('vs/base/common/platform');
import processes = require('vs/base/node/processes');
import {Builder, Dimension} from 'vs/base/browser/builder';
import {TPromise} from 'vs/base/common/winjs.base';
import {createDecorator} from 'vs/platform/instantiation/common/instantiation';
import {RawContextKey, ContextKeyExpr} from 'vs/platform/contextkey/common/contextkey';
import {TerminalConfigHelper, ITerminalFont} from 'vs/workbench/parts/terminal/electron-browser/terminalConfigHelper';

export const TERMINAL_PANEL_ID = 'workbench.panel.terminal';

export const TERMINAL_SERVICE_ID = 'terminalService';

export const TERMINAL_DEFAULT_SHELL_LINUX = !platform.isWindows ? (process.env.SHELL || 'sh') : 'sh';
export const TERMINAL_DEFAULT_SHELL_OSX = !platform.isWindows ? (process.env.SHELL || 'sh') : 'sh';
export const TERMINAL_DEFAULT_SHELL_WINDOWS = processes.getWindowsShell();

/**
 * A context key that is set when the integrated terminal has focus.
 */
export const KEYBINDING_CONTEXT_TERMINAL_FOCUS = new RawContextKey<boolean>('terminalFocus', undefined);
export const KEYBINDING_CONTEXT_TERMINAL_NOT_FOCUSED:ContextKeyExpr = KEYBINDING_CONTEXT_TERMINAL_FOCUS.toNegated();

export const ITerminalService = createDecorator<ITerminalService>(TERMINAL_SERVICE_ID);

export interface ITerminalConfiguration {
	terminal: {
		integrated: {
			shell: {
				linux: string,
				osx: string,
				windows: string
			},
			shellArgs: {
				linux: string[],
				osx: string[]
			},
			cursorBlinking: boolean,
			fontFamily: string,
			fontLigatures: boolean,
			fontSize: number,
			lineHeight: number,
			setLocaleVariables: boolean,
			commandsToSkipShell: string[]
		}
	};
}

// export interface ITerminalProcess {
// 	title: string;
// 	process: cp.ChildProcess;
// }

// export interface ITerminalService {
// 	_serviceBrand: any;
// 	onActiveInstanceChanged: Event<string>;
// 	onInstancesChanged: Event<string>;
// 	onInstanceTitleChanged: Event<string>;

// 	close(): TPromise<any>;
// 	copySelection(): TPromise<any>;
// 	createNew(name?: string): TPromise<number>;
// 	focusNext(): TPromise<any>;
// 	focusPrevious(): TPromise<any>;
// 	hide(): TPromise<any>;
// 	hideTerminalInstance(terminalId: number): TPromise<any>;
// 	paste(): TPromise<any>;
// 	runSelectedText(): TPromise<any>;
// 	scrollDown(): TPromise<any>;
// 	scrollUp(): TPromise<any>;
// 	show(focus: boolean): TPromise<ITerminalPanel>;
// 	setActiveTerminal(index: number): TPromise<any>;
// 	setActiveTerminalById(terminalId: number): void;
// 	toggle(): TPromise<any>;

// 	getActiveTerminalIndex(): number;
// 	getTerminalInstanceTitles(): string[];
// 	initConfigHelper(panelContainer: Builder): void;
// 	killTerminalProcess(terminalProcess: ITerminalProcess): void;
// }

// export interface ITerminalPanel {
// 	closeTerminalById(terminalId: number): TPromise<void>;
// 	focus(): void;
// 	sendTextToActiveTerminal(text: string, addNewLine: boolean): void;
// }

export interface ITerminalService {
	_serviceBrand: any;

	activeTerminalInstanceIndex: number;
	configHelper: TerminalConfigHelper;
	onActiveInstanceChanged: Event<string>;
	onInstancesChanged: Event<string>;
	onInstanceTitleChanged: Event<string>;
	terminalInstances: ITerminalInstance[];

	createInstance(name?: string, shellPath?: string): ITerminalInstance;
	getInstanceFromId(terminalId: number): ITerminalInstance;
	getInstanceLabels(): string[];
	getActiveInstance(): ITerminalInstance;
	setActiveInstance(terminalInstance: ITerminalInstance): void;
	setActiveInstanceByIndex(terminalIndex: number): void;
	setActiveInstanceToNext(): void;
	setActiveInstanceToPrevious(): void;

	showPanel(focus?: boolean): TPromise<void>;
	hidePanel(): void;
	togglePanel(): TPromise<void>;
	setContainers(panelContainer: Builder, terminalContainer: HTMLElement): void;
}

export interface ITerminalInstance {
	id: number;
	onTitleChanged: Event<string>;
	title: string;

	/**
	 * Dispose the terminal instance, removing it from the panel/service and freeing up resources.
	 */
	dispose(): void;

	/**
	 * Copies the terminal selection to the clipboard.
	 */
	copySelection(): void;

	/**
	 * Focuses the terminal instance.
	 *
	 * @param focus Force focus even if there is a selection.
	 */
	focus(force?: boolean): void;

	/**
	 * Focuses and pastes the contents of the clipboard into the terminal instance.
	 */
	paste(): void;

	/**
	 * Send text to the terminal instance. The text is written to the stdin of the underlying pty
	 * process (shell) of the terminal instance.
	 *
	 * @param text The text to send.
	 * @param addNewLine Whether to add a new line to the text being sent, this is normally
	 * required to run a command in the terminal. The character(s) added are \n or \r\n
	 * depending on the platform. This defaults to `true`.
	 */
	sendText(text: string, addNewLine: boolean): void;

	/**
	 * Scroll the terminal buffer down 1 line.
	 */
	scrollDown(): void;

	/**
	 * Scroll the terminal buffer up 1 line.
	 */
	scrollUp(): void;

	attachToElement(container: HTMLElement): void;
	layout(dimension: Dimension): void;
	setCursorBlink(blink: boolean): void;
	setCommandsToSkipShell(commands: string[]): void;
	setFont(font: ITerminalFont): void;
	setVisible(visible: boolean): void;
}
