# Customize Shortcuts

You can customize the keyboard shortcuts for the commands of this extension to streamline your workflow. Follow these steps to set your preferred shortcuts:

1. Open the Keyboard Shortcuts editor:

   - Press `Ctrl+K Ctrl+S` (Windows/Linux) or `Cmd+K Cmd+S` (Mac)
   - Alternatively, go to `Code > Settings > Keyboard Shortcuts`

2. In the Keyboard Shortcuts editor, search for the command you want to customize:

   - `Aide: Copy As AI Prompt`
   - `Aide: Ask AI`
   - `Aide: Code Convert`
   - `Aide: Code Viewer Helper`
   - `Aide: Rename Variable`
   - `Aide: Smart Paste`
   - ...and possibly more

3. Click the plus icon next to the command you want to assign a shortcut to.

4. Press the desired key combination for your new shortcut.

5. If there is a conflict with an existing shortcut, ==VSCode== will notify you. You can choose to overwrite the existing shortcut or try another combination.

Here are the default commands you can customize:

- `aide.copyAsPrompt`: Copy as AI Prompt
- `aide.askAI`: Ask AI
- `aide.codeConvert`: Code Convert
- `aide.codeViewerHelper`: Code Viewer Helper
- `aide.renameVariable`: Rename Variable
- `aide.smartPaste`: Smart Paste
- ...and possibly more, you can find the corresponding commands in each feature documentation.

<br/>
<Video src="/videos/aide-customize-shortcuts.mp4"/>
<br/>

**Example:**

To set `Ctrl+Shift+A` (Windows/Linux) or `Cmd+Shift+A` (Mac) for the `Ask AI` command:

1. Search for `Aide: Ask AI` in the Keyboard Shortcuts editor
2. Click the plus icon next to the `aide.askAI` command
3. Press `Ctrl+Shift+A` or `Cmd+Shift+A`
4. The new shortcut will be saved automatically

Repeat this process for any other commands you wish to customize.

Note: If you prefer to edit the `keybindings.json` file directly, you can add the following entry:

```json
{
  "key": "ctrl+shift+a",
  "command": "aide.askAI",
  "when": "editorTextFocus"
}
```

Replace `"ctrl+shift+a"` with your desired key combination and `"aide.askAI"` with the command you want to assign.

By customizing these shortcuts, you can quickly access the features of the extension and boost your productivity in ==VSCode==.
